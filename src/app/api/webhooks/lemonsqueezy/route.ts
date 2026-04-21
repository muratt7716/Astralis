import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// HMAC-SHA256 imza doğrulama
function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hash = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    // timingSafeEqual throws if buffers differ in length
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[LS Webhook] LEMON_SQUEEZY_WEBHOOK_SECRET eksik");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // Raw body al (imza doğrulama için JSON parse öncesi gerekli)
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn("[LS Webhook] Geçersiz imza");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName: string = payload?.meta?.event_name ?? "";
  const customData = payload?.meta?.custom_data ?? {};
  const userId: string | undefined = customData?.user_id;

  if (!userId) {
    console.warn("[LS Webhook] user_id bulunamadı, event:", eventName);
    return NextResponse.json({ ok: true }); // Lemon Squeezy'ye 200 dön (retry'ı engelle)
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(userId ?? "")) {
    console.warn("[LS Webhook] Geçersiz user_id formatı:", userId);
    return NextResponse.json({ ok: true }); // retry etme
  }

  console.log(`[LS Webhook] Event: ${eventName}, User: ${userId}`);

  try {
    if (eventName === "order_created") {
      // Ömür boyu tek seferlik satın alma
      const orderId: string = payload?.data?.id ?? "";
      if (!orderId) {
        console.error("[LS Webhook] order_created: payload.data.id eksik");
        return NextResponse.json({ error: "Missing order id" }, { status: 400 });
      }

      // Idempotency: aynı order daha önce işlendiyse atla
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("lemon_squeezy_order_id")
        .eq("id", userId)
        .single();

      if (existing?.lemon_squeezy_order_id === orderId) {
        return NextResponse.json({ ok: true, duplicate: true });
      }

      const { error: updateError1 } = await supabaseAdmin
        .from("profiles")
        .update({
          is_premium: true,
          subscription_type: "lifetime",
          subscription_end_date: null,
          lemon_squeezy_order_id: orderId,
          lemon_squeezy_customer_id: String(payload?.data?.attributes?.customer_id ?? ""),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (updateError1) throw new Error(updateError1.message);

    } else if (eventName === "subscription_created") {
      // Aylık abonelik başlangıcı
      const subId: string = payload?.data?.id ?? "";
      const renewsAt: string | null = payload?.data?.attributes?.renews_at ?? null;

      const { error: updateError2 } = await supabaseAdmin
        .from("profiles")
        .update({
          is_premium: true,
          subscription_type: "monthly",
          subscription_end_date: renewsAt,
          lemon_squeezy_subscription_id: subId,
          lemon_squeezy_customer_id: String(payload?.data?.attributes?.customer_id ?? ""),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (updateError2) throw new Error(updateError2.message);

    } else if (eventName === "subscription_renewed") {
      // Aylık yenileme — bitiş tarihini güncelle
      const renewsAt: string | null = payload?.data?.attributes?.renews_at ?? null;

      const { error: updateError3 } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_end_date: renewsAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (updateError3) throw new Error(updateError3.message);

    } else if (eventName === "subscription_cancelled") {
      // İptal edildi — süre sonuna kadar premium kalır
      const endsAt: string | null = payload?.data?.attributes?.ends_at ?? null;

      const { error: updateError4 } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_end_date: endsAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (updateError4) throw new Error(updateError4.message);

    } else if (eventName === "subscription_expired") {
      // Abonelik sona erdi — premium kaldır
      const { error: updateError5 } = await supabaseAdmin
        .from("profiles")
        .update({
          is_premium: false,
          subscription_type: null,
          subscription_end_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (updateError5) throw new Error(updateError5.message);
    }
    // Diğer eventler → 200 dön, bir şey yapma

  } catch (err) {
    console.error("[LS Webhook] DB güncelleme hatası:", err);
    // 500 dön → Lemon Squeezy retry yapar
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
