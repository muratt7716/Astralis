# Lansman Hazırlığı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Auth loop fix, i18n tam uyum (5 dil), tool çıktıları dil uyumu, yasal sayfalar — lansmanı bloke eden tüm teknik borçları kapatmak.

**Architecture:** 4 bağımsız konu: (1) Auth bug fix, (2) Prompt dil uyumu, (3) i18n sync, (4) Yasal sayfalar. TR dil dosyası referans kaynak; diğer diller buna tam senkronize edilir. Legal sayfalar Next.js App Router ile `/app/(legal)/` altında.

**Tech Stack:** Next.js 14 App Router, Supabase, Gemini AI, TypeScript, i18n custom context (src/lib/i18n.tsx), Tailwind CSS

---

## Task 1: Auth Loop Fix — mistik-rehber handleSelect

**Files:**
- Modify: `src/app/mistik-rehber/page.tsx` (lines 146-151)

- [ ] handleSelect'e try/catch/finally + 8sn timeout ekle:

```tsx
const handleSelect = async () => {
  if (!user || selecting) return;
  setSelecting(true);

  const timeout = setTimeout(() => {
    setSelecting(false);
  }, 8000);

  try {
    await updateProfile({ selected_guide_id: guide.id });
    router.push(`/mistik-rehber/chat/${guide.id}`);
  } catch {
    setSelecting(false);
  } finally {
    clearTimeout(timeout);
  }
};
```

- [ ] Commit: `fix(auth): prevent Bağlanıyor loop with try/finally + timeout`

---

## Task 2: Prompt Dil Uyumu — I Ching & Runes

**Files:**
- Modify: `src/lib/gemini.ts` — `_generateIChingReading` ve `_generateRuneReading`

Problem: Yeni promptlar tamamen Türkçe yazıldı, langName parametresi görmezden geliniyor.
Fix: Talimatlar İngilizce, çıktı dili `langName` değişkeninden alınsın.

- [ ] Her iki fonksiyonda Türkçe prompt → İngilizce talimatlar + `RESPONSE LANGUAGE: ${langName}` inject

- [ ] Commit: `fix(i18n): I Ching & Runes prompts respect selected language`

---

## Task 3: i18n — TR Dosyasına Eksik Keyleri Ekle

**Files:**
- Modify: `src/locales/tr.ts`

Mistik-rehber page.tsx'de hardcoded Türkçe stringler var (satır 379 vd.). Bunlar i18n'e taşınacak.

- [ ] Şu keyleri tr.ts'e ekle (mevcut `mistik.*` bloğunun sonuna):

```ts
"mistik.start_chat": "Konuşmaya Başla",
"mistik.connecting": "Bağlanıyor…",
"mistik.explore_guide": "Rehberi Keşfet",
"mistik.all_guides": "Tüm Rehberler",
"mistik.daily_insight": "Günlük İçgörü",
"mistik.session_count": "Seans",
"mistik.warmth.stranger": "Yeni Tanışma",
"mistik.warmth.acquaintance": "Tanıdık",
"mistik.warmth.friend": "Dost",
```

- [ ] mistik-rehber/page.tsx'de hardcoded stringleri `t("mistik.start_chat")` vb. ile değiştir

- [ ] Commit: `feat(i18n): add mistik-rehber page translation keys to TR`

---

## Task 4: i18n — EN Dosyasına Eksik Keyleri Ekle

**Files:**
- Modify: `src/locales/en.ts`

Eksik kategoriler: zodiac detail sections, planet traits, common actions, planets status.

- [ ] zodiac detail keyleri ekle (12 burç × 6 alan = 72 key)
- [ ] planet trait keyleri ekle
- [ ] common.error / common.save / common.success ekle
- [ ] planets.* status keyleri ekle
- [ ] mistik.* yeni keyleri ekle
- [ ] Commit: `feat(i18n): sync EN locale with TR reference`

---

## Task 5: i18n — AR/DE/FR Dosyalarına Eksik Keyleri Ekle

**Files:**
- Modify: `src/locales/ar.ts`, `src/locales/de.ts`, `src/locales/fr.ts`

AR/DE/FR EN'de olan ama bunlarda olmayan keyleri + TR'de olup bunlarda olmayan keyleri ekle.

- [ ] AR: zodiac detail, planet traits, common, planets.*, mistik.* yeni keyler
- [ ] DE: aynı
- [ ] FR: aynı
- [ ] Commit: `feat(i18n): sync AR/DE/FR locales with TR reference`

---

## Task 6: Yasal Sayfalar

**Files:**
- Create: `src/app/gizlilik/page.tsx` (Privacy Policy + KVKK)
- Create: `src/app/kullanim-kosullari/page.tsx` (Terms of Service)
- Create: `src/app/cerez-politikasi/page.tsx` (Cookie Policy)
- Modify: `src/components/Footer.tsx` (legal links ekle)
- Modify: `src/locales/tr.ts` (legal nav keys)

- [ ] 3 yasal sayfa oluştur (Türkçe + İngilizce içerik, cosmic style)
- [ ] Footer'a yasal linkler ekle
- [ ] Commit: `feat(legal): add privacy policy, terms of service, cookie policy pages`
