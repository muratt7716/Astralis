# Premium Abonelik Sistemi — Tasarım Speci
**Tarih:** 2026-04-21
**Proje:** Astralis
**Kapsam:** Lemon Squeezy entegrasyonu ile aylık + ömür boyu premium üyelik sistemi

---

## 1. Genel Mimari

```
Kullanıcı → /premium sayfası → "Satın Al" butonu
  → createCheckout Server Action → Lemon Squeezy Checkout URL'si
  → Ödeme tamamlanır → Lemon Squeezy → POST /api/webhooks/lemonsqueezy
  → HMAC doğrulama → Supabase profiles tablosu güncelleme (is_premium = true)
  → Kullanıcı premium içeriklere erişir
```

### Kritik Bağımlılıklar (Mevcut Projeden)
| Kaynak | Konum | Durum |
|--------|-------|-------|
| `supabaseAdmin` | `src/lib/supabase-admin.ts` | **Mevcut** — yeniden yazılmayacak |
| `profiles.is_premium` | Supabase DB | **Mevcut** — kullanımda |
| Premium gate (mistik-rehber) | `src/app/api/mistik-rehber/chat/route.ts` | **Mevcut** — standardize edilecek |
| `GlassButton` | `src/components/ui/glass-button.tsx` | **Mevcut** — pricing'de kullanılacak |
| `AuthProvider` / `useAuth` | `src/providers/AuthProvider.tsx` | **Mevcut** — `profile.is_premium` verir |

---

## 2. Ortam Değişkenleri

`.env.local` dosyasına eklenecekler:
```env
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=
LEMON_SQUEEZY_MONTHLY_VARIANT_ID=      # Aylık 150 TL plan variant ID
LEMON_SQUEEZY_LIFETIME_VARIANT_ID=     # Ömür boyu kurucu üyelik variant ID
# SUPABASE_SERVICE_ROLE_KEY zaten .env.local'da olmalı (supabase-admin.ts kullanıyor)
```

**Not:** `supabase-admin.ts` şu an `SUPABASE_SERVICE_ROLE_KEY || NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback yapıyor.
Webhook'ta RLS bypass için `SUPABASE_SERVICE_ROLE_KEY` **zorunlu** — `.env.local`'da gerçek service role key olmalı.

### Kurulacak Paket
```bash
npm install @lemonsqueezy/lemonsqueezy.js
```

---

## 3. Veritabanı Şema Güncellemesi

`profiles` tablosuna eklenecek kolonlar (Supabase migration):
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_type TEXT,          -- 'monthly' | 'lifetime' | NULL
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_order_id TEXT;
```

---

## 4. Pricing Page — Tasarım Speci (`/premium`)

### Tasarım Sistemi (Projeye Uyarlanmış)

UI UX Pro Max analizi "Liquid Glass + Modern Dark Cinema" stilini öneriyor. Projenin mevcut estetiğiyle tam uyumlu:

| Token | Değer | Açıklama |
|-------|-------|----------|
| `--bg-deep` | `#050508` | Ana sayfa bg (projeyle aynı) |
| `--surface-glass` | `rgba(255,255,255,0.04)` | Kart arka planı |
| `--border-glass` | `rgba(255,255,255,0.08)` | Kart border |
| `--accent-purple` | `#a855f7` | Vurgu rengi (projeyle aynı) |
| `--accent-gold` | `#f59e0b` | İkincil vurgu (projeyle aynı) |
| `--glow-purple` | `rgba(168,85,247,0.25)` | Kart glow efekti |
| `--font-heading` | Playfair Display | Mevcut heading fontu |
| `--font-brand` | Aref Ruqaa Ink | Mevcut buton fontu |

**Neden mevcut fontlar:** Bodoni Moda önerildi ama `font-brand: Aref Ruqaa Ink` projenin kimliğinin çekirdeği. Yeni font eklemek LCP'yi bozar ve tutarsızlık yaratır. YAGNI prensibi — yeni font eklenmeyecek.

### Sayfa Yapısı

```
/premium
  ├── HeroBanner         — "Evrenin Kapılarını Aç" başlık, yıldız bg animasyonu
  ├── PricingCards       — 2 kart: Aylık + Ömür Boyu
  │     ├── MonthlyCard  — 150 TL/ay, "Lansmana Özel" badge, GlassButton
  │     └── LifetimeCard — Ömür Boyu Kurucu, altın glow border, "En Popüler" badge
  ├── FeatureList        — Lucide ikonlarla özellik listesi
  ├── ActiveStatus       — Kullanıcı zaten premium ise "Aktif Üyeliğin Var" durumu
  └── FAQ                — 3-4 soru (opsiyonel, scope'da tutulacak)
```

### Kart Tasarım Kuralları (UI UX Pro Max §4 — Style)
- **Glassmorphism:** `backdrop-blur-xl`, `bg-white/[0.04]`, `border border-white/[0.08]`
- **Yükseltilmiş kart (Lifetime):** `border-amber-500/40` + `shadow-[0_0_40px_rgba(245,158,11,0.15)]`
- **"Most Popular" kart (Monthly):** `border-purple-500/40` + `shadow-[0_0_40px_rgba(168,85,247,0.15)]`
- **Buton:** Mevcut `GlassButton` — lifetime için `contentClassName="text-amber-400"`, monthly için default
- **Kart border-radius:** `rounded-2xl` (16px — design system ile uyumlu)
- **Touch target:** Tüm butonlar min 44px yükseklik (§2 Touch & Interaction)
- **Animasyon:** 200–300ms ease-out, `transform` ve `opacity` only — layout shift yok (§7)
- **Primary action:** Her kart 1 CTA (§4 primary-action kuralı)

### Feature List İkonları (Lucide)
```
✓ Crown      — "Premium özelliklerin tamamına eriş"
✓ BanIcon    — "Hiçbir zaman reklam görme"
✓ Video      — "Özel astrolog canlı yayınlarına katılım"
✓ Sparkles   — "Sınırsız Mistik Rehber konuşması"
✓ Star       — "Horary (Anlık Soru Astrolojisi)"
✓ Telescope  — "Kozmik Pusula erişimi"
✓ Brain      — "Öncelikli AI yanıt"
```

### Erişilebilirlik (§1 Accessibility)
- Tüm kartlar `role="article"` + `aria-label`
- CTA butonları `aria-label="150 TL aylık plan satın al"` gibi açıklayıcı
- Kontrast: Gold (#f59e0b) on dark (#050508) → 8.1:1 ✓ WCAG AAA
- Kontrast: Purple (#a855f7) on dark → 5.2:1 ✓ WCAG AA
- `prefers-reduced-motion`: bg animasyonu durur, kart hover glow anlık

---

## 5. Checkout Server Action

**Dosya:** `src/app/premium/actions.ts`
**Tip:** Next.js 15 Server Action (`"use server"`)

**Akış:**
1. `getUser()` ile Supabase session doğrula — oturum yoksa `/onboarding`'e redirect
2. `variantId` parametresini al (monthly veya lifetime)
3. `@lemonsqueezy/lemonsqueezy.js` ile checkout URL oluştur
4. `custom_data: { user_id: user.id }` checkout'a ekle
5. Oluşan checkout URL'sine `redirect()`

**Neden Server Action:** Projede API routes çoğunlukla veri okuma için. Checkout bir form action'ı — Next.js 15'in `<form action={createCheckout}>` pattern'ı ile form submit güvenli çalışır. CSRF koruması built-in.

---

## 6. Webhook Route

**Dosya:** `src/app/api/webhooks/lemonsqueezy/route.ts`

### Güvenlik
- `crypto.createHmac("sha256", secret)` ile HMAC-SHA256 imza doğrulama
- Raw body için `req.text()` (JSON parse öncesi)
- Doğrulama başarısız → `403 Forbidden`
- **Idempotency:** `lemon_squeezy_order_id` / `subscription_id` zaten DB'de varsa tekrar güncelleme yapma

### Desteklenen Eventler
| Event | Aksiyon |
|-------|---------|
| `order_created` | `is_premium = true`, `subscription_type = 'lifetime'`, `lemon_squeezy_order_id` yaz |
| `subscription_created` | `is_premium = true`, `subscription_type = 'monthly'`, `subscription_end_date` hesapla |
| `subscription_renewed` | `subscription_end_date` güncelle |
| `subscription_cancelled` | `subscription_end_date` set et (hemen iptal değil, süre sonunda) |
| `subscription_expired` | `is_premium = false`, `subscription_type = null` |

**Neden bu eventler:** Orijinal plan sadece `order_created` ve `subscription_created`'ı yakaldı. `subscription_expired` olmadan kullanıcılar iptal sonrası sonsuz premium kalır — bu kritik bir eksik.

### Supabase Kullanımı
Mevcut `supabaseAdmin`'i import et: `import { supabaseAdmin } from "@/lib/supabase-admin"` — yeniden yazmaya gerek yok.

---

## 7. Premium Kısıtlama Mekanizması

### Yaklaşım: `PremiumGate` Client Component

HOC yerine basit bir composable component. Neden:
- Proje App Router kullanıyor, HOC pattern eski Pages Router'da daha yaygın
- `useAuth()` hook zaten `profile.is_premium` veriyor
- Server component içi kontrol `cookies()` + `supabaseAdmin` gerektirir — her sayfayı server component yapmak zorunda kalınır; oysa horary, kozmik pusula vs. hepsi `"use client"`

**Kullanım:**
```tsx
// Herhangi bir sayfanın başında:
<PremiumGate>
  <AsıllçerikBuraya />
</PremiumGate>
```

**Davranış:**
- `loading` ise → skeleton
- `!is_premium` ise → mistik tasarımlı overlay + "/premium'a git" butonu
- `is_premium` ise → children render

### Hangi Sayfalara Uygulanacak
- `src/app/horary/page.tsx` — Horary (Anlık Soru Astrolojisi)
- `src/app/mistik-rehber/chat/[guideId]/page.tsx` — Mistik Rehber (5 mesaj limiti kaldırılır, gate ile)
- İleride eklenebilecekler: Kozmik Pusula, özel yorumlar

### Mevcut Mistik Rehber API Gate'i
`src/app/api/mistik-rehber/chat/route.ts`'deki 5-mesaj limiti `PremiumGate` ile UI tarafı kapandıktan sonra API tarafında da `is_premium` hard-check olarak bırakılabilir (çift güvenlik).

---

## 8. Navbar ve Profil Entegrasyonu

- **Navbar:** Kullanıcı giriş yapmışsa ve `!is_premium` ise bir "✨ Premium'a Geç" badge/link göster
- **Profil Sayfası:** `ProfileHero` altına `subscription_type` ve `subscription_end_date` bilgisini gösteren bir "Üyelik Durumu" kartı ekle

---

## 9. Kapsam Dışı (Bu Spec İçin)

- Fatura yönetimi paneli (Lemon Squeezy customer portal linki yeterli)
- Kupon/indirim sistemi
- Takım/kurumsal plan
- Detaylı analytics dashboard
- E-posta bildirimleri (Lemon Squeezy bunu otomatik yapar)

---

## 10. Dosya Listesi (Oluşturulacak/Değiştirilecek)

| Dosya | Aksiyon |
|-------|---------|
| `.env.local` | LS değişkenleri eklenir |
| `src/app/premium/page.tsx` | **Yeni** — pricing UI |
| `src/app/premium/actions.ts` | **Yeni** — checkout server action |
| `src/app/api/webhooks/lemonsqueezy/route.ts` | **Yeni** — webhook handler |
| `src/components/PremiumGate.tsx` | **Yeni** — premium guard component |
| `src/app/horary/page.tsx` | **Değişir** — PremiumGate sarılır |
| `src/app/mistik-rehber/chat/[guideId]/page.tsx` | **Değişir** — PremiumGate sarılır |
| `src/components/Navbar.tsx` | **Değişir** — premium CTA badge |
| `supabase/migrations/` | **Yeni** — schema migration |
