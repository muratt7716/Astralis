import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// ─── Shopier HMAC-SHA256 İmza Doğrulama ───
function verifyShopierSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const hash = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

// ─── Ürün başlığından plan tipi belirle ───
function determinePlanType(lineItems: any[]): "monthly" | "lifetime" {
  const monthlyKeywords = ["aylık", "aylik", "monthly", "1 ay"];
  const title = (lineItems?.[0]?.title ?? "").toLowerCase();

  for (const keyword of monthlyKeywords) {
    if (title.includes(keyword)) return "monthly";
  }
  return "lifetime";
}

// ─── Ana Webhook Handler ───
export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIER_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Shopier Webhook] SHOPIER_WEBHOOK_SECRET eksik");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  // 1. Raw body al (imza doğrulama için JSON parse öncesi gerekli)
  const rawBody = await req.text();

  // 2. Header'ları oku
  const shopierSignature = req.headers.get("shopier-signature") ?? "";
  const shopierEvent = req.headers.get("shopier-event") ?? "";
  const shopierAccountId = req.headers.get("shopier-account-id") ?? "";

  // 3. İmza doğrula
  if (!verifyShopierSignature(rawBody, shopierSignature, secret)) {
    console.warn("[Shopier Webhook] Geçersiz imza — reddedildi");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  // 4. Body'yi parse et
  let data: any;
  try {
    data = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log(
    `[Shopier Webhook] Event: ${shopierEvent}, Order: ${data?.id}, Account: ${shopierAccountId}`
  );

  // 5. Sadece order.created eventini işle
  if (shopierEvent !== "order.created") {
    console.log(`[Shopier Webhook] Event ${shopierEvent} — atlanıyor`);
    return NextResponse.json({ ok: true });
  }

  // 6. Sipariş verisinden bilgileri çıkar
  const orderId: string = data?.id ?? "";
  const buyerEmail: string = (
    data?.shippingInfo?.email ??
    data?.billingInfo?.email ??
    ""
  ).toLowerCase().trim();
  const orderNote: string = data?.orderNote ?? "";
  const lineItems: any[] = data?.lineItems ?? [];

  if (!orderId) {
    console.error("[Shopier Webhook] order.created: orderId eksik");
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  if (!buyerEmail) {
    console.error("[Shopier Webhook] order.created: buyer email eksik");
    return NextResponse.json({ error: "Missing buyer email" }, { status: 400 });
  }

  // 7. Plan tipini belirle
  const planType = determinePlanType(lineItems);

  try {
    // 8. Kullanıcıyı e-posta ile bul
    // Önce sipariş notunda UUID var mı kontrol et (öncelikli eşleştirme)
    const UUID_RE =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const noteMatch = orderNote.match(UUID_RE);
    let userId: string | null = null;

    if (noteMatch) {
      // Sipariş notundaki UUID ile doğrudan eşleştir
      const { data: profileByNote } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", noteMatch[0])
        .single();
      if (profileByNote) userId = profileByNote.id;
    }

    if (!userId) {
      // E-posta ile Supabase auth.users tablosunda ara
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const matchedUser = authUsers?.users?.find(
        (u) => u.email?.toLowerCase().trim() === buyerEmail
      );

      if (!matchedUser) {
        console.error(
          `[Shopier Webhook] Kullanıcı bulunamadı: ${buyerEmail}`
        );
        // 200 döndür ki Shopier retry yapmasın — kullanıcı eşleşmedi
        return NextResponse.json({
          ok: false,
          reason: "User not found by email",
          email: buyerEmail,
        });
      }
      userId = matchedUser.id;
    }

    // 9. Idempotency: aynı sipariş daha önce işlendiyse atla
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("shopier_order_id")
      .eq("id", userId)
      .single();

    if (existing?.shopier_order_id === orderId) {
      console.log(
        `[Shopier Webhook] Duplicate sipariş atlandı: ${orderId}`
      );
      return NextResponse.json({ ok: true, duplicate: true });
    }

    // 10. Supabase profiles güncelle
    const subscriptionEndDate =
      planType === "monthly"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null; // Lifetime → sonsuz

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        is_premium: true,
        subscription_type: planType,
        subscription_end_date: subscriptionEndDate,
        shopier_order_id: orderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("[Shopier Webhook] DB güncelleme hatası:", updateError);
      // 500 → Shopier retry yapar
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    console.log(
      `[Shopier Webhook] ✅ Premium aktif: User=${userId}, Plan=${planType}, Order=${orderId}`
    );
  } catch (err) {
    console.error("[Shopier Webhook] Beklenmeyen hata:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }

  // 11. Shopier'a 200 OK döndür (5 saniye kuralı!)
  return NextResponse.json({ ok: true });
}
