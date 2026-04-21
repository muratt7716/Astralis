# Lemon Squeezy Premium Abonelik Sistemi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Astralis'e Lemon Squeezy ile aylık (150 TL) + ömür boyu kurucu üyelik sistemi kurmak; webhook ile Supabase `profiles.is_premium` güncelleme ve `PremiumGate` komponentiyle içerik kilitleme.

**Architecture:** Kullanıcı `/premium` sayfasından checkout başlatır → Lemon Squeezy ödemeyi alır → Webhook `/api/webhooks/lemonsqueezy`'ye POST atar → HMAC doğrulama + Supabase admin ile profil güncelleme. Client tarafında `PremiumGate` komponenti `useAuth()` üzerinden `profile.is_premium`'u okur.

**Tech Stack:** Next.js 15 (App Router), Supabase (supabase-admin mevcut), `@lemonsqueezy/lemonsqueezy.js`, TailwindCSS v4, Lucide React, `framer-motion` (mevcut), `GlassButton` (mevcut)

**Spec:** `docs/superpowers/specs/2026-04-21-lemon-squeezy-premium-design.md`

---

## Dosya Haritası

| Dosya | Aksiyon | Sorumluluk |
|-------|---------|------------|
| `.env.local` | Değişir | LS env değişkenleri |
| `supabase/migrations/001_premium_columns.sql` | Yeni | DB şema güncellemesi |
| `src/app/premium/page.tsx` | Yeni | Pricing UI sayfası |
| `src/app/premium/actions.ts` | Yeni | `createCheckout` server action |
| `src/app/api/webhooks/lemonsqueezy/route.ts` | Yeni | Webhook handler |
| `src/components/PremiumGate.tsx` | Yeni | Premium içerik koruması |
| `src/app/horary/page.tsx` | Değişir | PremiumGate sarmalı |
| `src/app/mistik-rehber/chat/[guideId]/page.tsx` | Değişir | PremiumGate sarmalı |
| `src/components/Navbar.tsx` | Değişir | Premium CTA badge |

---

## Task 1: Paket Kurulumu ve Ortam Değişkenleri

**Files:**
- Modify: `package.json` (npm install)
- Modify: `.env.local`

- [ ] **Step 1: Lemon Squeezy paketini kur**

```bash
cd "c:/Users/Administrator/Desktop/Falcı Bacı"
npm install @lemonsqueezy/lemonsqueezy.js
```

Beklenen çıktı: `added 1 package` veya benzeri, hata yok.

- [ ] **Step 2: `.env.local` dosyasını oku ve değişkenleri ekle**

`.env.local` dosyasının sonuna şunları ekle:

```env
# Lemon Squeezy
LEMON_SQUEEZY_API_KEY=your_api_key_here
LEMON_SQUEEZY_STORE_ID=your_store_id_here
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
LEMON_SQUEEZY_MONTHLY_VARIANT_ID=your_monthly_variant_id
LEMON_SQUEEZY_LIFETIME_VARIANT_ID=your_lifetime_variant_id

# Supabase (yoksa ekle — supabase-admin.ts için zorunlu)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Önemli:** `SUPABASE_SERVICE_ROLE_KEY` gerçek service role key olmalı (anon key değil). RLS bypass için şart.

- [ ] **Step 3: Build kontrolü**

```bash
npm run build 2>&1 | tail -20
```

Beklenen: Hata yok. Varsa pakete bağlı import hatası olabilir — sonraki tasklarda çözülür.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install @lemonsqueezy/lemonsqueezy.js"
```

---

## Task 2: Veritabanı Migration

**Files:**
- Create: `supabase/migrations/001_premium_columns.sql`

- [ ] **Step 1: Migration dosyasını oluştur**

`supabase/migrations/001_premium_columns.sql`:

```sql
-- Lemon Squeezy premium subscription columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_type TEXT,
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_order_id TEXT;

-- is_premium zaten var, emin olmak için:
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN profiles.subscription_type IS 'monthly | lifetime | NULL';
COMMENT ON COLUMN profiles.subscription_end_date IS 'monthly abonelik bitiş tarihi; lifetime için NULL';
```

- [ ] **Step 2: Migration'ı Supabase'e uygula**

Supabase Dashboard → SQL Editor'de bu SQL'i çalıştır veya CLI kullanıyorsan:

```bash
npx supabase db push
```

Supabase Dashboard'da `profiles` tablosunda yeni kolonları doğrula:
- `subscription_type` TEXT
- `subscription_end_date` TIMESTAMPTZ
- `lemon_squeezy_customer_id` TEXT
- `lemon_squeezy_subscription_id` TEXT
- `lemon_squeezy_order_id` TEXT

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/001_premium_columns.sql
git commit -m "feat: add subscription columns to profiles table"
```

---

## Task 3: Webhook Route Handler

**Files:**
- Create: `src/app/api/webhooks/lemonsqueezy/route.ts`

Bu task en kritik — önce yazılıyor çünkü diğer her şeyden bağımsız test edilebilir.

- [ ] **Step 1: Route dosyasını oluştur**

`src/app/api/webhooks/lemonsqueezy/route.ts`:

```typescript
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
    // Diğer eventler (subscription_updated vs.) → 200 dön, bir şey yapma

  } catch (err) {
    console.error("[LS Webhook] DB güncelleme hatası:", err);
    // 500 dön → Lemon Squeezy retry yapar
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Build kontrolü**

```bash
npm run build 2>&1 | grep -E "error|Error|✓" | head -20
```

Beklenen: `src/app/api/webhooks/lemonsqueezy/route.ts` hatası yok.

- [ ] **Step 3: Manuel webhook testi (opsiyonel, ngrok varsa)**

```bash
# Geliştirme ortamında test etmek için:
curl -X POST http://localhost:3000/api/webhooks/lemonsqueezy \
  -H "Content-Type: application/json" \
  -H "x-signature: invalid" \
  -d '{"meta":{"event_name":"order_created"}}'
# Beklenen: 403 Invalid signature
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks/lemonsqueezy/route.ts
git commit -m "feat: add Lemon Squeezy webhook handler with HMAC verification"
```

---

## Task 4: Checkout Server Action

**Files:**
- Create: `src/app/premium/actions.ts`

- [ ] **Step 1: Server action dosyasını oluştur**

`src/app/premium/actions.ts`:

```typescript
"use server";

import { redirect } from "next/navigation";
import { lemonSqueezySetup, createCheckout as lsCreateCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

function initLemonSqueezy() {
  lemonSqueezySetup({
    apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
    onError: (error) => {
      console.error("[LemonSqueezy]", error);
    },
  });
}

export type PlanType = "monthly" | "lifetime";

export async function createCheckout(planType: PlanType) {
  // Kullanıcı session kontrolü
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/onboarding");
  }

  // Variant ID seç
  const variantId =
    planType === "lifetime"
      ? process.env.LEMON_SQUEEZY_LIFETIME_VARIANT_ID!
      : process.env.LEMON_SQUEEZY_MONTHLY_VARIANT_ID!;

  const storeId = process.env.LEMON_SQUEEZY_STORE_ID!;

  if (!variantId || !storeId) {
    throw new Error("Lemon Squeezy environment variables eksik");
  }

  initLemonSqueezy();

  const { data, error } = await lsCreateCheckout(storeId, variantId, {
    checkoutData: {
      custom: {
        user_id: user.id,
      },
    },
    checkoutOptions: {
      // Kullanıcının e-posta adresi varsa prefill et
      prefill: user.email
        ? { email: user.email }
        : undefined,
    },
  });

  if (error || !data?.data?.attributes?.url) {
    console.error("[createCheckout] Hata:", error);
    throw new Error("Checkout oluşturulamadı");
  }

  redirect(data.data.attributes.url);
}
```

- [ ] **Step 2: Build kontrolü**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

Beklenen: Hata yok.

- [ ] **Step 3: Commit**

```bash
git add src/app/premium/actions.ts
git commit -m "feat: add Lemon Squeezy checkout server action"
```

---

## Task 5: PremiumGate Komponenti

**Files:**
- Create: `src/components/PremiumGate.tsx`

- [ ] **Step 1: Komponenti oluştur**

`src/components/PremiumGate.tsx`:

```typescript
"use client";

import { useAuth } from "@/lib/auth-helpers";
import { useRouter } from "next/navigation";
import { Crown, Lock } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

interface PremiumGateProps {
  children: React.ReactNode;
  /** Özelliğin adı — overlay mesajında gösterilir */
  featureName?: string;
}

export default function PremiumGate({ children, featureName }: PremiumGateProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Auth yükleniyorsa skeleton göster
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  // Giriş yapılmamış
  if (!user) {
    router.replace("/onboarding");
    return null;
  }

  // Premium değil → overlay göster
  if (!profile?.is_premium) {
    return (
      <div className="relative min-h-screen bg-[#050508] flex items-center justify-center px-4">
        {/* Blur arka plan — içeriğin ipucu olarak */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
        </div>

        {/* Premium gate kartı */}
        <div className="relative z-10 max-w-md w-full">
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 text-center shadow-[0_0_60px_rgba(168,85,247,0.1)]">
            {/* İkon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 mx-auto">
              <Lock className="w-7 h-7 text-purple-400" />
            </div>

            {/* Başlık */}
            <h2 className="font-serif text-2xl font-semibold text-white mb-3">
              {featureName ? `${featureName} Premium'a Özel` : "Bu İçerik Premium'a Özel"}
            </h2>

            {/* Açıklama */}
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Bu özelliğe erişmek için Astralis Premium üyeliği gerekiyor. Evrenin tüm kapılarını bir adımda aç.
            </p>

            {/* CTA */}
            <div className="flex flex-col gap-3">
              <GlassButton
                onClick={() => router.push("/premium")}
                className="w-full hover:border-purple-500/30"
                size="lg"
              >
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Premium'a Geç
                </span>
              </GlassButton>

              <button
                onClick={() => router.back()}
                className="text-white/30 text-xs hover:text-white/50 transition-colors py-2"
              >
                Geri dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Premium ✓ — içeriği göster
  return <>{children}</>;
}
```

- [ ] **Step 2: Build kontrolü**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PremiumGate.tsx
git commit -m "feat: add PremiumGate component for premium content protection"
```

---

## Task 6: Premium Pricing Sayfası

**Files:**
- Create: `src/app/premium/page.tsx`

- [ ] **Step 1: Sayfayı oluştur**

`src/app/premium/page.tsx`:

```typescript
"use client";

import { useTransition } from "react";
import { useAuth } from "@/lib/auth-helpers";
import { createCheckout } from "./actions";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Crown, BanIcon, Video, Sparkles, Star, Telescope,
  Brain, Check, Loader2, Shield, Zap
} from "lucide-react";

const FEATURES = [
  { icon: Crown,     text: "Premium özelliklerin tamamına sınırsız eriş" },
  { icon: BanIcon,   text: "Hiçbir zaman reklam görme" },
  { icon: Video,     text: "Özel astrolog canlı yayınlarına katılım hakkı" },
  { icon: Sparkles,  text: "Sınırsız Mistik Rehber AI konuşması" },
  { icon: Star,      text: "Horary — anlık soru astrolojisi" },
  { icon: Telescope, text: "Kozmik Pusula ve tüm araçlara erişim" },
  { icon: Brain,     text: "Öncelikli yapay zeka yanıt süresi" },
];

function PricingCard({
  badge,
  title,
  price,
  period,
  description,
  highlight,
  glowColor,
  borderColor,
  onBuy,
  loading,
  isCurrentPlan,
}: {
  badge?: string;
  title: string;
  price: string;
  period: string;
  description: string;
  highlight?: boolean;
  glowColor: string;
  borderColor: string;
  onBuy: () => void;
  loading: boolean;
  isCurrentPlan: boolean;
}) {
  return (
    <div
      className={`
        relative backdrop-blur-xl bg-white/[0.04] rounded-2xl p-8
        border transition-all duration-300
        ${borderColor}
        ${highlight ? `shadow-[0_0_40px_${glowColor}]` : "shadow-[0_4px_24px_rgba(0,0,0,0.3)]"}
        hover:shadow-[0_0_60px_${glowColor}] hover:scale-[1.02]
      `}
    >
      {/* Badge */}
      {badge && (
        <div className={`
          absolute -top-3.5 left-1/2 -translate-x-1/2
          px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase
          ${highlight
            ? "bg-amber-500 text-black"
            : "bg-purple-600 text-white"
          }
        `}>
          {badge}
        </div>
      )}

      {/* Başlık */}
      <h3 className="font-serif text-xl font-semibold text-white mb-1">{title}</h3>
      <p className="text-white/40 text-sm mb-6">{description}</p>

      {/* Fiyat */}
      <div className="mb-8">
        <span className="font-serif text-5xl font-bold text-white">{price}</span>
        <span className="text-white/40 text-sm ml-2">{period}</span>
      </div>

      {/* CTA */}
      {isCurrentPlan ? (
        <div className="flex items-center justify-center gap-2 py-4 rounded-full bg-white/5 border border-white/10 text-white/50 text-sm">
          <Shield className="w-4 h-4" />
          Aktif Planın
        </div>
      ) : (
        <GlassButton
          onClick={onBuy}
          disabled={loading}
          className={`w-full ${highlight ? "hover:border-amber-500/40" : "hover:border-purple-500/30"}`}
          size="lg"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Hemen Başla
            </span>
          )}
        </GlassButton>
      )}
    </div>
  );
}

export default function PremiumPage() {
  const { profile } = useAuth();
  const [monthlyPending, startMonthly] = useTransition();
  const [lifetimePending, startLifetime] = useTransition();

  const isPremium = profile?.is_premium ?? false;
  const isMonthly = isPremium && profile?.subscription_type === "monthly";
  const isLifetime = isPremium && profile?.subscription_type === "lifetime";

  function handleMonthly() {
    startMonthly(async () => {
      await createCheckout("monthly");
    });
  }

  function handleLifetime() {
    startLifetime(async () => {
      await createCheckout("lifetime");
    });
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white pb-24 overflow-x-hidden">
      {/* Arka plan efektleri */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-600/8 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium tracking-wider uppercase mb-6">
            <Crown className="w-3.5 h-3.5" />
            Astralis Premium
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-semibold text-white mb-5 leading-tight">
            Evrenin Tüm{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
              Kapılarını Aç
            </span>
          </h1>

          <p className="text-white/40 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Mistik rehberler, anlık soru astrolojisi ve çok daha fazlası — sınırsız, reklamsız, öncelikli.
          </p>
        </div>

        {/* Kartlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <PricingCard
            badge="Lansmana Özel"
            title="Aylık Üyelik"
            price="₺150"
            period="/ ay"
            description="Tüm premium özelliklere aylık erişim"
            glowColor="rgba(168,85,247,0.2)"
            borderColor="border-purple-500/30"
            onBuy={handleMonthly}
            loading={monthlyPending}
            isCurrentPlan={isMonthly}
          />

          <PricingCard
            badge="En Popüler"
            title="Ömür Boyu Kurucu Üyelik"
            price="₺999"
            period="tek seferlik"
            description="Bir kez öde, sonsuza kadar kazan"
            highlight
            glowColor="rgba(245,158,11,0.2)"
            borderColor="border-amber-500/40"
            onBuy={handleLifetime}
            loading={lifetimePending}
            isCurrentPlan={isLifetime}
          />
        </div>

        {/* Özellik listesi */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          <h2 className="font-serif text-xl font-semibold text-white mb-6 text-center">
            Her İki Planda Dahil
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm pt-1.5">
                  <Check className="w-3 h-3 text-purple-400 flex-shrink-0" />
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Güven notu */}
        <p className="text-center text-white/20 text-xs mt-8">
          Güvenli ödeme — Lemon Squeezy ile işlenir. İstediğin zaman iptal et.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build kontrolü**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

Beklenen: Hata yok.

- [ ] **Step 3: Dev sunucusunda görsel kontrol**

```bash
npm run dev
```

`http://localhost:3000/premium` aç. Kontrol et:
- [ ] İki kart görünüyor (aylık + ömür boyu)
- [ ] Kartlar glassmorphism efektiyle render oluyor
- [ ] Özellik listesi Lucide ikonlarıyla görünüyor
- [ ] "Hemen Başla" butonuna basınca giriş yapılmamışsa `/onboarding`'e yönleniyor

- [ ] **Step 4: Commit**

```bash
git add src/app/premium/page.tsx src/app/premium/actions.ts
git commit -m "feat: add premium pricing page with Lemon Squeezy checkout"
```

---

## Task 7: Horary Sayfasına PremiumGate Uygula

**Files:**
- Modify: `src/app/horary/page.tsx`

- [ ] **Step 1: Dosyayı oku — mevcut export default'u bul**

`src/app/horary/page.tsx` dosyasını oku. `export default function HoraryPage()` satırını bul.

- [ ] **Step 2: PremiumGate'i import et ve sarmala**

Dosyanın import bölümünün sonuna ekle:

```typescript
import PremiumGate from "@/components/PremiumGate";
```

Sonra `export default function HoraryPage()` fonksiyonunun return ifadesini şu şekilde sar:

```typescript
// Eski:
return (
  <div className="...">
    {/* horary içeriği */}
  </div>
);

// Yeni:
return (
  <PremiumGate featureName="Horary Astrolojisi">
    <div className="...">
      {/* horary içeriği — değişmez */}
    </div>
  </PremiumGate>
);
```

**Dikkat:** Sadece en dıştaki return değeri değişiyor. İçerideki JSX'e dokunma.

- [ ] **Step 3: Build kontrolü**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/app/horary/page.tsx
git commit -m "feat: gate Horary page behind PremiumGate"
```

---

## Task 8: Mistik Rehber Sayfasına PremiumGate Uygula

**Files:**
- Modify: `src/app/mistik-rehber/chat/[guideId]/page.tsx`

- [ ] **Step 1: Dosyayı oku — yapısını anla**

`src/app/mistik-rehber/chat/[guideId]/page.tsx` dosyasını oku.

- [ ] **Step 2: PremiumGate import ve sarmala**

Horary'de yapıldığı gibi:

```typescript
import PremiumGate from "@/components/PremiumGate";
```

Return'ü sar:

```typescript
return (
  <PremiumGate featureName="Mistik Rehber">
    {/* mevcut içerik — değişmez */}
  </PremiumGate>
);
```

- [ ] **Step 3: API tarafı kontrolü**

`src/app/api/mistik-rehber/chat/route.ts` dosyasındaki 5-mesaj limiti **silinmez** — bu çift güvenlik katmanı olarak kalır. Sadece UI katmanı PremiumGate ile korunmuş oldu.

- [ ] **Step 4: Build kontrolü**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

- [ ] **Step 5: Commit**

```bash
git add "src/app/mistik-rehber/chat/[guideId]/page.tsx"
git commit -m "feat: gate Mistik Rehber chat page behind PremiumGate"
```

---

## Task 9: Navbar'a Premium CTA Badge Ekle

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Navbar.tsx dosyasını oku — `user` ve `profile` kullanılan kısımları bul**

`src/components/Navbar.tsx` dosyasını oku. Kullanıcı giriş yapmışsa profil menüsü gösterilen kısmı bul (`profile` değişkeninin kullanıldığı satırları bul).

- [ ] **Step 2: Crown import et**

Import satırlarında `{ User, LogOut }` yanına `Crown` ekle:

```typescript
import { User, LogOut, Crown } from "lucide-react";
```

- [ ] **Step 3: Premium badge ekle**

Navbar'da kullanıcı giriş yapmış ve `!profile?.is_premium` ise premium badge göster. Desktop navbar'da profil menüsü açıkken veya profil ikonunun yanında:

```typescript
{/* Premium badge — sadece premium olmayanlara */}
{user && !profile?.is_premium && (
  <Link
    href="/premium"
    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full
      bg-gradient-to-r from-purple-600/20 to-amber-500/20
      border border-purple-500/30 text-purple-300 text-xs
      hover:border-purple-500/60 hover:text-purple-200
      transition-all duration-200 font-medium"
    aria-label="Premium üyeliğe geç"
  >
    <Crown className="w-3 h-3" />
    Premium
  </Link>
)}
```

Bu kodu profil ikonu linkinin hemen soluna, navbar'ın sağ aksiyonlar bölümüne ekle.

- [ ] **Step 4: Build kontrolü**

```bash
npm run build 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: add premium CTA badge to navbar for non-premium users"
```

---

## Task 10: Son Build ve Lint Kontrolü

**Files:** Değişmez

- [ ] **Step 1: Full build**

```bash
npm run build 2>&1
```

Beklenen: `✓ Compiled successfully` veya uyarılar olmaksızın tamamlanma.

- [ ] **Step 2: Lint**

```bash
npm run lint 2>&1 | grep -E "error|Error" | head -20
```

Beklenen: Kritik hata yok.

- [ ] **Step 3: Env doğrulama checklist**

Supabase Dashboard'da kontrol et:
- [ ] `profiles` tablosunda `subscription_type`, `subscription_end_date`, `lemon_squeezy_*` kolonları görünüyor
- [ ] `is_premium` kolonu mevcut (varsa)

Lemon Squeezy Dashboard'da kontrol et:
- [ ] Aylık plan variant ID doğru
- [ ] Ömür boyu plan variant ID doğru
- [ ] Webhook URL: `https://yourdomain.com/api/webhooks/lemonsqueezy` ekli
- [ ] Webhook events: `order_created`, `subscription_created`, `subscription_renewed`, `subscription_cancelled`, `subscription_expired` seçili

- [ ] **Step 4: Final commit**

```bash
git add -A
git status  # beklenmedik dosya olup olmadığını kontrol et
git commit -m "feat: complete Lemon Squeezy premium subscription system"
```

---

## Self-Review

### Spec Coverage
| Spec Gereksinimi | Task |
|-----------------|------|
| Paket kurulumu + env değişkenleri | Task 1 |
| DB şema güncellemesi | Task 2 |
| Webhook + HMAC doğrulama | Task 3 |
| `order_created` → `is_premium = true` | Task 3 |
| `subscription_*` event'leri | Task 3 |
| Service Role Key kullanımı | Task 1 (env) + Task 3 (supabaseAdmin import) |
| Pricing UI — glassmorphism, mistik tema | Task 6 |
| Lucide ikonlar + feature listesi | Task 6 |
| GlassButton kullanımı | Task 6 |
| Checkout server action | Task 4 |
| `custom_data.user_id` | Task 4 |
| PremiumGate komponenti | Task 5 |
| Horary sayfasına gate | Task 7 |
| Mistik Rehber sayfasına gate | Task 8 |
| Navbar premium CTA | Task 9 |

**Eksik yok.**

### Placeholder Scan
- Tüm code bloklarında gerçek kod var
- "TBD", "TODO" yok
- Tüm type/method isimleri tutarlı: `createCheckout`, `PremiumGate`, `PlanType`

### Type Consistency
- `createCheckout(planType: PlanType)` → Task 4'te tanımlandı, Task 6'da `createCheckout("monthly")` ve `createCheckout("lifetime")` olarak çağrılıyor ✓
- `PremiumGate` props: `children` + `featureName` → Task 5'te tanımlandı, Task 7 ve 8'de `featureName` ile çağrılıyor ✓
- `supabaseAdmin` → Task 3'te `@/lib/supabase-admin` importu ✓
