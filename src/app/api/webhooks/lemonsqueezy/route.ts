import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// HMAC-SHA256 imza doğrulama
function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hash = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  // Constant-time comparison (timing attack önlemi)
  if (hash.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < hash.length; i++) {
    mismatch |= hash.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
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

  console.log(`[LS Webhook] Event: ${eventName}, User: ${userId}`);

  try {
    if (eventName === "order_created") {
      // Ömür boyu tek seferlik satın alma
      const orderId: string = payload?.data?.id ?? "";

      // Idempotency: aynı order daha önce işlendiyse atla
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("lemon_squeezy_order_id")
        .eq("id", userId)
        .single();

      if (existing?.lemon_squeezy_order_id === orderId) {
        return NextResponse.json({ ok: true, duplicate: true });
      }

      await supabaseAdmin
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

    } else if (eventName === "subscription_created") {
      // Aylık abonelik başlangıcı
      const subId: string = payload?.data?.id ?? "";
      const renewsAt: string | null = payload?.data?.attributes?.renews_at ?? null;

      await supabaseAdmin
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

    } else if (eventName === "subscription_renewed") {
      // Aylık yenileme — bitiş tarihini güncelle
      const renewsAt: string | null = payload?.data?.attributes?.renews_at ?? null;

      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_end_date: renewsAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    } else if (eventName === "subscription_cancelled") {
      // İptal edildi — süre sonuna kadar premium kalır
      const endsAt: string | null = payload?.data?.attributes?.ends_at ?? null;

      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_end_date: endsAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

    } else if (eventName === "subscription_expired") {
      // Abonelik sona erdi — premium kaldır
      await supabaseAdmin
        .from("profiles")
        .update({
          is_premium: false,
          subscription_type: null,
          subscription_end_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
    // Diğer eventler → 200 dön, bir şey yapma

  } catch (err) {
    console.error("[LS Webhook] DB güncelleme hatası:", err);
    // 500 dön → Lemon Squeezy retry yapar
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
