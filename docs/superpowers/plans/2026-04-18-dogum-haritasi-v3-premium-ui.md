# Doğum Haritası v3 Premium UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite all 5 doğum haritası tabs to ultra-premium quality — planet photo thumbnails, element/modality explanations with contributing-planet chips, professional Gemini prompt (no "canım benim"), individual Astro-Seek-style transit cards, and full i18n compliance across all 5 locales.

**Architecture:** Single-file approach — all changes live in `src/app/dogum-haritasi/page.tsx` (1101 lines) plus the interpret API route and 5 locale files. Data layer (`src/lib/astrology.ts`, API calculate routes, Supabase) is untouched. Tasks run sequentially because Tasks 3–7 all edit the same page.tsx.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, `useTranslation` i18n hook, `getPlanetById` from `src/data/planets.ts`, `ZodiacIcon` component.

---

## File Map

| File | Action | What Changes |
|------|--------|--------------|
| `src/locales/tr.ts` | Modify | ~30 new `chart.*` keys |
| `src/locales/en.ts` | Modify | Same keys in English |
| `src/locales/de.ts` | Modify | Same keys in German |
| `src/locales/fr.ts` | Modify | Same keys in French |
| `src/locales/ar.ts` | Modify | Same keys in Arabic |
| `src/app/api/birth-chart/interpret/route.ts` | Modify | Rewrite prompt string only |
| `src/app/dogum-haritasi/page.tsx` | Modify | 5 separate tab sections (Tasks 3–7) |

---

## Key Constants (used in Tasks 3–7, define once at top of component)

These two constants need to be added **once** at module level in page.tsx, just before the component function definition. Every subsequent task references them.

```tsx
// Add after imports, before DogumHaritasiPage function
const PLANET_ID_MAP: Record<string, string> = {
  sun: "gunes", moon: "ay", mercury: "merkur", venus: "venus",
  mars: "mars", jupiter: "jupiter", saturn: "saturn",
  uranus: "uranus", neptune: "neptun", pluto: "pluton",
};

const ELEMENT_OF_SIGN: Record<string, "fire" | "earth" | "air" | "water"> = {
  koc: "fire", aslan: "fire", yay: "fire",
  boga: "earth", basak: "earth", oglak: "earth",
  ikizler: "air", terazi: "air", kova: "air",
  yengec: "water", akrep: "water", balik: "water",
};
```

Also update the `planets.ts` import on line 14 to include `getPlanetById`:
```tsx
// Before (line 14)
import { planets } from "@/data/planets";
// After
import { planets, getPlanetById } from "@/data/planets";
```

---

## Task 1: i18n — Add new keys to all 5 locale files

**Files:**
- Modify: `src/locales/tr.ts`
- Modify: `src/locales/en.ts`
- Modify: `src/locales/de.ts`
- Modify: `src/locales/fr.ts`
- Modify: `src/locales/ar.ts`

- [ ] **Step 1: Add keys to Turkish locale (`src/locales/tr.ts`)**

Find the line `"chart.yours": "Doğum Haritanız",` and **insert the following block immediately after it**:

```ts
  // v3 premium UI keys
  "chart.element_balance": "Unsur Dengesi",
  "chart.element_balance.desc": "Her gezegenin bulunduğu burç, belirli bir unsura ait enerjiyi aktive eder.",
  "chart.element.fire.desc": "Ateş enerjisi: Vizyon, cesaret, ilham ve harekete geçme gücü.",
  "chart.element.earth.desc": "Toprak enerjisi: Pratiklik, sabır, güvenilirlik ve somut inşa etme kapasitesi.",
  "chart.element.air.desc": "Hava enerjisi: Zeka, iletişim, sosyal bağ ve fikir üretme.",
  "chart.element.water.desc": "Su enerjisi: Sezgi, derin duygusallık, empati ve dönüşüm.",
  "chart.modality_balance": "Nitelik Dengesi",
  "chart.modality_balance.desc": "Gezegenlerinin bulunduğu burçların nitelikleri, enerji tarzını ortaya koyar.",
  "chart.modality.cardinal.desc": "Öncü: Başlatır, harekete geçirir, yol açar.",
  "chart.modality.fixed.desc": "Sabit: Kararlı kalır, derinleşir, sonuna kadar götürür.",
  "chart.modality.mutable.desc": "Değişken: Uyum sağlar, dönüşür, köprü kurar.",
  "chart.dominant_planet": "Dominant Gezegen",
  "chart.dominant_planet.desc": "Haritanda en fazla etkiye sahip gezegen — burcu, evi ve yaptığı açılar bu kişinin temel dinamiğini şekillendirir.",
  "chart.stellium.of_sign": "{sign} Stelliumu",
  "chart.stellium.desc": "Bu burçta 3 veya daha fazla gezegen — yoğun ve odaklanmış enerji alanı.",
  "chart.retrograde_planets": "Retrograde Gezegenler",
  "chart.retrograde.explanation": "Retrograde gezegenler içe dönük çalışır — ilgili konularda yeniden değerlendirme ve derinleşme enerjisi taşır.",
  "chart.filter.all": "Tümü",
  "chart.filter.harmonious": "Uyumlu",
  "chart.filter.challenging": "Zorlu",
  "chart.filter.neutral": "Nötr",
  "chart.aspect.applying": "Yaklaşıyor",
  "chart.aspect.separating": "Uzaklaşıyor",
  "chart.aspect.orb": "orb",
  "chart.planet.in_house": "{n}. Ev",
  "chart.planet.retrograde_badge": "Retrograde",
  "chart.interpretation.personal_title": "Kişisel Harita Yorumu",
  "chart.interpretation.personal_desc": "Tüm gezegen, ev ve açı verilerin analiz edilip sana özel kapsamlı bir yorum hazırlanır.",
  "chart.interpretation.general_title": "Genel Karakter Analizi",
  "chart.interpretation.strengths_title": "Güçlü Yönler",
  "chart.interpretation.challenges_title": "Dikkat Alanları",
  "chart.interpretation.advice_title": "Kişisel Öneriler",
  "chart.interpretation.regenerate": "Yeniden yorumla",
  "chart.interpretation.generate_btn": "Haritamı Yorumla",
  "chart.transit.transit_planet": "Transit",
  "chart.transit.natal_planet": "Natal",
  "chart.transit.applying": "Yaklaşıyor",
  "chart.transit.separating": "Uzaklaşıyor",
  "chart.house.ruler": "Yönetici",
  "chart.house.empty": "Bu ev şu an boş.",
```

- [ ] **Step 2: Add keys to English locale (`src/locales/en.ts`)**

Find the line containing `"chart.yours":` and insert after it:

```ts
  // v3 premium UI keys
  "chart.element_balance": "Element Balance",
  "chart.element_balance.desc": "Each planet's sign activates the energy of a specific element.",
  "chart.element.fire.desc": "Fire energy: Vision, courage, inspiration, and the drive to act.",
  "chart.element.earth.desc": "Earth energy: Practicality, patience, reliability, and building tangible results.",
  "chart.element.air.desc": "Air energy: Intellect, communication, social connections, and idea generation.",
  "chart.element.water.desc": "Water energy: Intuition, deep emotion, empathy, and transformation.",
  "chart.modality_balance": "Modality Balance",
  "chart.modality_balance.desc": "The modalities of your planets' signs reveal your energy style.",
  "chart.modality.cardinal.desc": "Cardinal: Initiates, drives action, leads the way.",
  "chart.modality.fixed.desc": "Fixed: Stays determined, deepens, sees things through.",
  "chart.modality.mutable.desc": "Mutable: Adapts, transforms, bridges transitions.",
  "chart.dominant_planet": "Dominant Planet",
  "chart.dominant_planet.desc": "The planet with the most influence in your chart — its sign, house, and aspects shape the core dynamic of this person.",
  "chart.stellium.of_sign": "{sign} Stellium",
  "chart.stellium.desc": "3 or more planets in this sign — an intense, focused energy field.",
  "chart.retrograde_planets": "Retrograde Planets",
  "chart.retrograde.explanation": "Retrograde planets work inward — carrying energy for reassessment and deepening in related areas.",
  "chart.filter.all": "All",
  "chart.filter.harmonious": "Harmonious",
  "chart.filter.challenging": "Challenging",
  "chart.filter.neutral": "Neutral",
  "chart.aspect.applying": "Applying",
  "chart.aspect.separating": "Separating",
  "chart.aspect.orb": "orb",
  "chart.planet.in_house": "House {n}",
  "chart.planet.retrograde_badge": "Retrograde",
  "chart.interpretation.personal_title": "Personal Chart Interpretation",
  "chart.interpretation.personal_desc": "All your planet, house, and aspect data is analyzed to create a comprehensive reading.",
  "chart.interpretation.general_title": "General Character Analysis",
  "chart.interpretation.strengths_title": "Strengths",
  "chart.interpretation.challenges_title": "Areas to Watch",
  "chart.interpretation.advice_title": "Personal Guidance",
  "chart.interpretation.regenerate": "Re-interpret",
  "chart.interpretation.generate_btn": "Interpret My Chart",
  "chart.transit.transit_planet": "Transit",
  "chart.transit.natal_planet": "Natal",
  "chart.transit.applying": "Applying",
  "chart.transit.separating": "Separating",
  "chart.house.ruler": "Ruler",
  "chart.house.empty": "This house is currently empty.",
```

- [ ] **Step 3: Add keys to German locale (`src/locales/de.ts`)**

Find `"chart.yours":` and insert after it:

```ts
  // v3 premium UI keys
  "chart.element_balance": "Elementegleichgewicht",
  "chart.element_balance.desc": "Das Zeichen jedes Planeten aktiviert die Energie eines bestimmten Elements.",
  "chart.element.fire.desc": "Feuerenergie: Vision, Mut, Inspiration und Tatendrang.",
  "chart.element.earth.desc": "Erdenergie: Pragmatismus, Geduld, Zuverlässigkeit und greifbare Ergebnisse.",
  "chart.element.air.desc": "Luftenergie: Intellekt, Kommunikation, soziale Verbindungen und Ideenfindung.",
  "chart.element.water.desc": "Wasserenergie: Intuition, tiefe Emotionen, Empathie und Transformation.",
  "chart.modality_balance": "Qualitätengleichgewicht",
  "chart.modality_balance.desc": "Die Qualitäten der Zeichen deiner Planeten enthüllen deinen Energiestil.",
  "chart.modality.cardinal.desc": "Kardinal: Initiiert, treibt an, führt den Weg.",
  "chart.modality.fixed.desc": "Fix: Bleibt entschlossen, vertieft, zieht Dinge durch.",
  "chart.modality.mutable.desc": "Veränderlich: Passt sich an, wandelt sich, überbrückt Übergänge.",
  "chart.dominant_planet": "Dominierender Planet",
  "chart.dominant_planet.desc": "Der einflussreichste Planet in deinem Horoskop — sein Zeichen, Haus und Aspekte prägen die Kerndynamik.",
  "chart.stellium.of_sign": "{sign}-Stellium",
  "chart.stellium.desc": "3 oder mehr Planeten in diesem Zeichen — intensives, fokussiertes Energiefeld.",
  "chart.retrograde_planets": "Rückläufige Planeten",
  "chart.retrograde.explanation": "Rückläufige Planeten wirken nach innen — sie tragen Energie für Neubewertung und Vertiefung.",
  "chart.filter.all": "Alle",
  "chart.filter.harmonious": "Harmonisch",
  "chart.filter.challenging": "Herausfordernd",
  "chart.filter.neutral": "Neutral",
  "chart.aspect.applying": "Zunehmend",
  "chart.aspect.separating": "Abnehmend",
  "chart.aspect.orb": "Orb",
  "chart.planet.in_house": "Haus {n}",
  "chart.planet.retrograde_badge": "Rückläufig",
  "chart.interpretation.personal_title": "Persönliche Horoskop-Deutung",
  "chart.interpretation.personal_desc": "Alle Planeten-, Haus- und Aspektdaten werden analysiert, um eine umfassende Deutung zu erstellen.",
  "chart.interpretation.general_title": "Allgemeine Charakteranalyse",
  "chart.interpretation.strengths_title": "Stärken",
  "chart.interpretation.challenges_title": "Aufmerksamkeitsbereiche",
  "chart.interpretation.advice_title": "Persönliche Hinweise",
  "chart.interpretation.regenerate": "Neu deuten",
  "chart.interpretation.generate_btn": "Mein Horoskop deuten",
  "chart.transit.transit_planet": "Transit",
  "chart.transit.natal_planet": "Natal",
  "chart.transit.applying": "Zunehmend",
  "chart.transit.separating": "Abnehmend",
  "chart.house.ruler": "Herrscher",
  "chart.house.empty": "Dieses Haus ist derzeit leer.",
```

- [ ] **Step 4: Add keys to French locale (`src/locales/fr.ts`)**

Find `"chart.yours":` and insert after it:

```ts
  // v3 premium UI keys
  "chart.element_balance": "Équilibre des Éléments",
  "chart.element_balance.desc": "Le signe de chaque planète active l'énergie d'un élément spécifique.",
  "chart.element.fire.desc": "Énergie Feu : Vision, courage, inspiration et drive pour agir.",
  "chart.element.earth.desc": "Énergie Terre : Pragmatisme, patience, fiabilité et construction tangible.",
  "chart.element.air.desc": "Énergie Air : Intellect, communication, liens sociaux et génération d'idées.",
  "chart.element.water.desc": "Énergie Eau : Intuition, émotions profondes, empathie et transformation.",
  "chart.modality_balance": "Équilibre des Modalités",
  "chart.modality_balance.desc": "Les modalités des signes de vos planètes révèlent votre style énergétique.",
  "chart.modality.cardinal.desc": "Cardinal : Initie, entraîne l'action, montre la voie.",
  "chart.modality.fixed.desc": "Fixe : Reste déterminé, approfondit, mène à terme.",
  "chart.modality.mutable.desc": "Mutable : S'adapte, se transforme, fait le pont.",
  "chart.dominant_planet": "Planète Dominante",
  "chart.dominant_planet.desc": "La planète la plus influente de votre thème — son signe, maison et aspects façonnent la dynamique centrale.",
  "chart.stellium.of_sign": "Stellium en {sign}",
  "chart.stellium.desc": "3 planètes ou plus dans ce signe — un champ énergétique intense et concentré.",
  "chart.retrograde_planets": "Planètes Rétrogrades",
  "chart.retrograde.explanation": "Les planètes rétrogrades travaillent vers l'intérieur — elles portent une énergie de réévaluation et d'approfondissement.",
  "chart.filter.all": "Tous",
  "chart.filter.harmonious": "Harmonieux",
  "chart.filter.challenging": "Difficile",
  "chart.filter.neutral": "Neutre",
  "chart.aspect.applying": "Appliquant",
  "chart.aspect.separating": "Séparant",
  "chart.aspect.orb": "orbe",
  "chart.planet.in_house": "Maison {n}",
  "chart.planet.retrograde_badge": "Rétrograde",
  "chart.interpretation.personal_title": "Interprétation Personnelle",
  "chart.interpretation.personal_desc": "Toutes vos données de planètes, maisons et aspects sont analysées pour créer une lecture complète.",
  "chart.interpretation.general_title": "Analyse du Caractère Général",
  "chart.interpretation.strengths_title": "Points Forts",
  "chart.interpretation.challenges_title": "Points d'Attention",
  "chart.interpretation.advice_title": "Conseils Personnels",
  "chart.interpretation.regenerate": "Réinterpréter",
  "chart.interpretation.generate_btn": "Interpréter mon Thème",
  "chart.transit.transit_planet": "Transit",
  "chart.transit.natal_planet": "Natal",
  "chart.transit.applying": "Appliquant",
  "chart.transit.separating": "Séparant",
  "chart.house.ruler": "Maître",
  "chart.house.empty": "Cette maison est actuellement vide.",
```

- [ ] **Step 5: Add keys to Arabic locale (`src/locales/ar.ts`)**

Find `"chart.yours":` and insert after it:

```ts
  // v3 premium UI keys
  "chart.element_balance": "توازن العناصر",
  "chart.element_balance.desc": "يُنشّط كل كوكب طاقة عنصر معين من خلال برجه.",
  "chart.element.fire.desc": "طاقة النار: الرؤية والشجاعة والإلهام والدافع للتصرف.",
  "chart.element.earth.desc": "طاقة الأرض: العملية والصبر والموثوقية وبناء النتائج الملموسة.",
  "chart.element.air.desc": "طاقة الهواء: الذكاء والتواصل والروابط الاجتماعية وتوليد الأفكار.",
  "chart.element.water.desc": "طاقة الماء: الحدس والعاطفة العميقة والتعاطف والتحول.",
  "chart.modality_balance": "توازن النوعيات",
  "chart.modality_balance.desc": "تكشف نوعيات أبراج كواكبك عن أسلوب طاقتك.",
  "chart.modality.cardinal.desc": "كاردينال: يبادر، يدفع نحو العمل، يفتح الطريق.",
  "chart.modality.fixed.desc": "ثابت: يبقى حازماً، يتعمق، يُتمّ الأمور.",
  "chart.modality.mutable.desc": "متحول: يتكيف، يتحول، يجسر الانتقالات.",
  "chart.dominant_planet": "الكوكب المهيمن",
  "chart.dominant_planet.desc": "الكوكب الأكثر تأثيراً في خريطتك — يشكّل برجه وبيته وتربيعاته الديناميكية الجوهرية.",
  "chart.stellium.of_sign": "تجمع {sign}",
  "chart.stellium.desc": "3 كواكب أو أكثر في هذا البرج — حقل طاقة مكثف ومركّز.",
  "chart.retrograde_planets": "الكواكب الراجعة",
  "chart.retrograde.explanation": "الكواكب الراجعة تعمل نحو الداخل — تحمل طاقة إعادة التقييم والتعمق.",
  "chart.filter.all": "الكل",
  "chart.filter.harmonious": "متناغم",
  "chart.filter.challenging": "تحدّي",
  "chart.filter.neutral": "محايد",
  "chart.aspect.applying": "مقترب",
  "chart.aspect.separating": "مبتعد",
  "chart.aspect.orb": "مدى",
  "chart.planet.in_house": "البيت {n}",
  "chart.planet.retrograde_badge": "راجع",
  "chart.interpretation.personal_title": "تفسير الخريطة الشخصية",
  "chart.interpretation.personal_desc": "يتم تحليل جميع بيانات الكواكب والبيوت والتربيعات لإنشاء قراءة شاملة.",
  "chart.interpretation.general_title": "تحليل الشخصية العام",
  "chart.interpretation.strengths_title": "نقاط القوة",
  "chart.interpretation.challenges_title": "مجالات الانتباه",
  "chart.interpretation.advice_title": "التوجيه الشخصي",
  "chart.interpretation.regenerate": "إعادة التفسير",
  "chart.interpretation.generate_btn": "فسّر خريطتي",
  "chart.transit.transit_planet": "عابر",
  "chart.transit.natal_planet": "ميلادي",
  "chart.transit.applying": "مقترب",
  "chart.transit.separating": "مبتعد",
  "chart.house.ruler": "الحاكم",
  "chart.house.empty": "هذا البيت فارغ حالياً.",
```

- [ ] **Step 6: Verify TypeScript compilation**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors related to locale files (they are plain TS object literals).

- [ ] **Step 7: Commit**

```bash
git add src/locales/tr.ts src/locales/en.ts src/locales/de.ts src/locales/fr.ts src/locales/ar.ts
git commit -m "feat(i18n): add v3 premium UI translation keys to all 5 locales

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Rewrite Gemini interpret prompt (professional 3rd-person style)

**Files:**
- Modify: `src/app/api/birth-chart/interpret/route.ts`

- [ ] **Step 1: Replace the prompt string (line 29)**

Current line 29:
```ts
    const prompt = `Kullanıcının doğum haritasını Türkçe yorumla. Astrolojik terimleri kullan ama her birini açıkla. Kişisel ve samimi bir dil kullan.
```

Replace the entire `prompt` template literal (lines 29–54) with:

```ts
    const prompt = `Doğum haritasını profesyonel bir astrolog bakış açısıyla Türkçe yorumla.

Üslup kuralları:
- Üçüncü şahıs analitik dil kullan: "Bu kişi", "Güneş Akrep burcunun 1. evinde yer almaktadır", "Bu konumlama..."
- "Canım", "Sevgilim", "Seni", "Sen", "Sana" gibi hitap ve ikinci şahıs ifadeleri KULLANMA
- Astro-Seek benzeri profesyonel astrolog üslubu: psikolojik analiz, davranış kalıpları, hayat temaları
- Astrolojik terimleri kullan, her birini kısa ve öz açıkla
- Spekülatif değil analitik: "Bu kişinin X eğilimi taşıdığı görülmektedir" gibi ifadeler kullan

Doğum Haritası:
- Güneş: ${chart.sunSign.name} ${chart.sunSign.degree.toFixed(1)}°
- Ay: ${chart.moonSign.name} ${chart.moonSign.degree.toFixed(1)}°
- Yükselen: ${chart.risingSign.name} ${chart.risingSign.degree.toFixed(1)}°

Gezegenler:
${planetLines}

Önemli Açılar (orb ≤5°):
${aspectLines}

Unsur Dengesi: Ateş %${chart.elementBalance.fire}, Toprak %${chart.elementBalance.earth}, Hava %${chart.elementBalance.air}, Su %${chart.elementBalance.water} — Dominant: ${elementLabels[chart.elementBalance.dominant]}
Nitelik Dengesi: Öncü %${chart.modalBalance.cardinal}, Sabit %${chart.modalBalance.fixed}, Değişken %${chart.modalBalance.mutable} — Dominant: ${modalLabels[chart.modalBalance.dominant]}
Dominant Gezegen: ${dp?.planet || chart.dominantPlanet} (${dp?.sign || ""})
${chart.stelliums.length > 0 ? `Stellium: ${chart.stelliums.map((s) => `${s.signName} (${s.planets.join(", ")})`).join("; ")}` : ""}
Retrograde Gezegen Sayısı: ${chart.retrogradeCount}

Sadece şu JSON'ı döndür, başka bir şey yazma:
{
  "general": "Genel karakter analizi, 3-4 paragraf — üçüncü şahıs analitik üslup",
  "strengths": "Güçlü yönler, 2-3 paragraf",
  "challenges": "Dikkat alanları, 2 paragraf, büyüme fırsatı olarak sun",
  "advice": "Kişisel öneriler, 1-2 paragraf"
}`;
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/birth-chart/interpret/route.ts
git commit -m "fix(ai): rewrite Gemini prompt to professional 3rd-person astrological style

Replace 'Kişisel ve samimi dil' instruction that caused 'canım benim' output
with professional analytical style matching Astro-Seek standards.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Overview tab — element/modality cards, dominant planet photo, compact chips

**Files:**
- Modify: `src/app/dogum-haritasi/page.tsx` (lines ~14, ~43–46, ~492–746)

**Context:** The Overview tab currently renders: Element Balance → Modality Balance → Dominant Planet → Stelliums → Retrograde → Wheel → Planet Table → Aspect Summary. We keep the same order but upgrade visuals, fix all hardcoded Turkish strings, add `ELEMENT_OF_SIGN` contributing-planet chips, and use `getPlanetById`.

- [ ] **Step 1: Read the full file before editing**

Read `src/app/dogum-haritasi/page.tsx` to confirm current line numbers match expectations (the file is 1101 lines).

- [ ] **Step 2: Add `getPlanetById` to the planets import (line 14)**

```tsx
// Old
import { planets } from "@/data/planets";
// New
import { planets, getPlanetById } from "@/data/planets";
```

- [ ] **Step 3: Add module-level constants before the component (after imports, before `const useIsClient`)**

Insert the two constants right before `const useIsClient = () => {` (currently around line 43):

```tsx
const PLANET_ID_MAP: Record<string, string> = {
  sun: "gunes", moon: "ay", mercury: "merkur", venus: "venus",
  mars: "mars", jupiter: "jupiter", saturn: "saturn",
  uranus: "uranus", neptune: "neptun", pluto: "pluton",
};

const ELEMENT_OF_SIGN: Record<string, "fire" | "earth" | "air" | "water"> = {
  koc: "fire", aslan: "fire", yay: "fire",
  boga: "earth", basak: "earth", oglak: "earth",
  ikizler: "air", terazi: "air", kova: "air",
  yengec: "water", akrep: "water", balik: "water",
};

```

- [ ] **Step 4: Replace the Element Balance section**

Find and replace the entire Element Balance card (from `{/* Element Balance */}` to just before `{/* Modal Balance */}`):

**Find (current code):**
```tsx
                {/* Element Balance */}
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Flame size={16} className="text-orange-400" />
                    Unsur Dengesi
                  </h3>
                  {([
                    { key: "fire" as const,  label: "Ateş",   color: "bg-orange-500", text: "text-orange-400", icon: "🔥" },
                    { key: "earth" as const, label: "Toprak",  color: "bg-green-500",  text: "text-green-400",  icon: "🌍" },
                    { key: "air" as const,   label: "Hava",    color: "bg-sky-400",    text: "text-sky-400",    icon: "💨" },
                    { key: "water" as const, label: "Su",      color: "bg-blue-500",   text: "text-blue-400",   icon: "🌊" },
                  ]).map((el) => {
                    const pct = result.elementBalance[el.key];
                    return (
                      <div key={el.key} className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={el.text}>{el.icon} {el.label}</span>
                          <span className="text-gray-400">%{pct}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${el.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-gray-400 mt-3">
                    Dominant: <span className="text-orange-400 font-medium">
                      {{"fire":"Ateş","earth":"Toprak","air":"Hava","water":"Su"}[result.elementBalance.dominant]}
                    </span>
                  </p>
                </div>
```

**Replace with:**
```tsx
                {/* Element Balance */}
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                    <Flame size={16} className="text-orange-400" />
                    {t("chart.element_balance")}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">{t("chart.element_balance.desc")}</p>
                  {([
                    { key: "fire" as const,  text: "text-orange-400", bar: "bg-orange-500", bg: "bg-white/[0.02]",     bgActive: "bg-orange-500/10",  border: "border-orange-500/20" },
                    { key: "earth" as const, text: "text-emerald-400", bar: "bg-emerald-500", bg: "bg-white/[0.02]",   bgActive: "bg-emerald-500/10", border: "border-emerald-500/20" },
                    { key: "air" as const,   text: "text-sky-400",    bar: "bg-sky-400",    bg: "bg-white/[0.02]",     bgActive: "bg-sky-400/10",     border: "border-sky-400/20" },
                    { key: "water" as const, text: "text-blue-400",   bar: "bg-blue-500",   bg: "bg-white/[0.02]",     bgActive: "bg-blue-500/10",    border: "border-blue-500/20" },
                  ]).map((el) => {
                    const pct = result.elementBalance[el.key];
                    const isDominant = result.elementBalance.dominant === el.key;
                    const contributing = result.planetPositions.filter(
                      (p) => ELEMENT_OF_SIGN[p.signId] === el.key
                    );
                    return (
                      <div key={el.key} className={`mb-3 p-3 rounded-xl border ${isDominant ? `${el.bgActive} ${el.border}` : "bg-white/[0.02] border-white/5"}`}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className={el.text}>{t(`astrology.element.${el.key}`)}</span>
                          <span className={`font-mono font-bold ${isDominant ? el.text : "text-gray-400"}`}>
                            %{pct}{isDominant ? " ★" : ""}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                          <div className={`h-full rounded-full ${el.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-500 mb-1">{t(`chart.element.${el.key}.desc`)}</p>
                        {contributing.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contributing.map((p) => {
                              const pd = getPlanetById(PLANET_ID_MAP[p.planetId] || p.planetId);
                              return (
                                <span key={p.planetId} className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                                  {pd?.imageUrl && (
                                    <img src={pd.imageUrl} alt={p.planet} className="w-3 h-3 rounded-full object-cover" />
                                  )}
                                  {p.planet}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
```

- [ ] **Step 5: Replace the Modality Balance section**

Find and replace the Modality Balance card (from `{/* Modal Balance */}` to just before `{/* Dominant Planet */}`):

**Find:**
```tsx
                {/* Modal Balance */}
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 size={16} className="text-purple-400" />
                    Nitelik Dengesi
                  </h3>
                  {([
                    { key: "cardinal" as const, label: "Öncü",     color: "bg-red-500",    text: "text-red-400",    desc: "Başlatıcı, lider, eylem odaklı" },
                    { key: "fixed" as const,    label: "Sabit",    color: "bg-purple-500", text: "text-purple-400", desc: "Kararlı, inatçı, güvenilir" },
                    { key: "mutable" as const,  label: "Değişken", color: "bg-teal-500",   text: "text-teal-400",   desc: "Esnek, uyumlu, çok yönlü" },
                  ]).map((m) => {
                    const pct = result.modalBalance[m.key];
                    return (
                      <div key={m.key} className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={m.text}>{m.label}</span>
                          <span className="text-gray-400">%{pct}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${m.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                      </div>
                    );
                  })}
                </div>
```

**Replace with:**
```tsx
                {/* Modal Balance */}
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                    <BarChart3 size={16} className="text-purple-400" />
                    {t("chart.modality_balance")}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">{t("chart.modality_balance.desc")}</p>
                  {([
                    { key: "cardinal" as const, color: "bg-red-500",    text: "text-red-400" },
                    { key: "fixed" as const,    color: "bg-purple-500", text: "text-purple-400" },
                    { key: "mutable" as const,  color: "bg-teal-500",   text: "text-teal-400" },
                  ]).map((m) => {
                    const pct = result.modalBalance[m.key];
                    const isDominant = result.modalBalance.dominant === m.key;
                    return (
                      <div key={m.key} className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={`${m.text}${isDominant ? " font-bold" : ""}`}>
                            {t(`astrology.modality.${m.key}`)}
                            {isDominant ? " ★" : ""}
                          </span>
                          <span className="text-gray-400 font-mono">%{pct}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full ${m.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-500">{t(`chart.modality.${m.key}.desc`)}</p>
                      </div>
                    );
                  })}
                </div>
```

> **Note:** Check that `astrology.modality.cardinal`, `astrology.modality.fixed`, `astrology.modality.mutable` exist in tr.ts. Grep for `astrology.modality` to verify. If they don't exist, use the `t("astrology.modality.{key}")` pattern with a fallback or add them. Looking at the existing code, `modalLabels` in the interpret route uses `{ cardinal: "Öncü", fixed: "Sabit", mutable: "Değişken" }` — check if locale keys exist. If not, add them to all 5 locales.

- [ ] **Step 6: Replace the Dominant Planet section**

Find and replace the Dominant Planet card:

**Find:**
```tsx
                {/* Dominant Planet */}
                {(() => {
                  const dp = result.planetPositions.find(p => p.planetId === result.dominantPlanet);
                  if (!dp) return null;
                  const dpHouse = Object.entries(result.planetsByHouse).find(([, ps]) => ps.includes(dp.planetId));
                  return (
                    <div className="glass-card p-5 rounded-2xl border border-yellow-500/20">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Star size={16} className="text-yellow-400" />
                        Dominant Gezegen
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{dp.emoji}</div>
                        <div>
                          <div className="text-yellow-300 font-bold text-lg">{dp.planet}</div>
                          <div className="text-gray-300 text-sm">
                            {dp.sign} · {dpHouse ? `${dpHouse[0]}. Ev` : ""}
                            {dp.retrograde ? " · ℞ Retrograde" : ""}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">{dp.meaning}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
```

**Replace with:**
```tsx
                {/* Dominant Planet */}
                {(() => {
                  const dp = result.planetPositions.find(p => p.planetId === result.dominantPlanet);
                  if (!dp) return null;
                  const dpHouse = Object.entries(result.planetsByHouse).find(([, ps]) => ps.includes(dp.planetId));
                  const dpData = getPlanetById(PLANET_ID_MAP[dp.planetId] || dp.planetId);
                  return (
                    <div className="glass-card p-5 rounded-2xl border border-yellow-500/20 flex items-center gap-5">
                      <div
                        className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10"
                        style={{ boxShadow: `0 0 24px ${dpData?.glow || "rgba(255,200,0,0.15)"}` }}
                      >
                        {dpData?.imageUrl ? (
                          <img src={dpData.imageUrl} alt={dp.planet} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">{dp.emoji}</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-yellow-400/60 mb-0.5">
                          {t("chart.dominant_planet")}
                        </p>
                        <h4 className="text-xl font-bold text-yellow-300">{dp.planet}</h4>
                        <p className="text-gray-400 text-xs">
                          {dp.sign} · {dpHouse ? t("chart.planet.in_house", { n: dpHouse[0] }) : ""}
                          {dp.retrograde ? " · ℞" : ""}
                        </p>
                        <p className="text-gray-500 text-[11px] mt-1">{t("chart.dominant_planet.desc")}</p>
                      </div>
                    </div>
                  );
                })()}
```

- [ ] **Step 7: Replace the Stelliums section (fix hardcoded strings)**

**Find:**
```tsx
                {/* Stelliums */}
                {result.stelliums.length > 0 && (
                  <div className="glass-card p-5 rounded-2xl border border-purple-500/20">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="size-4 text-purple-400" />
                      Stellium
                    </h3>
                    {result.stelliums.map((s) => (
                      <div key={s.signId} className="mb-3">
                        <div className="text-purple-300 font-medium">{s.signName} Stelliumu</div>
                        <div className="text-gray-400 text-sm mt-1">
                          {s.planets.map(pid => {
                            const pp = result.planetPositions.find(p => p.planetId === pid);
                            return pp ? `${pp.emoji} ${pp.planet}` : pid;
                          }).join(" · ")}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          Bu burçta 3+ gezegen — yoğun ve odaklanmış enerji alanı
                        </div>
                      </div>
                    ))}
                  </div>
                )}
```

**Replace with:**
```tsx
                {/* Stelliums */}
                {result.stelliums.length > 0 && (
                  <div className="glass-card p-5 rounded-2xl border border-purple-500/20">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="size-4 text-purple-400" />
                      Stellium
                    </h3>
                    {result.stelliums.map((s) => (
                      <div key={s.signId} className="mb-3">
                        <div className="text-purple-300 font-medium">
                          {t("chart.stellium.of_sign", { sign: s.signName })}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {s.planets.map(pid => {
                            const pp = result.planetPositions.find(p => p.planetId === pid);
                            const ppd = getPlanetById(PLANET_ID_MAP[pid] || pid);
                            return pp ? (
                              <span key={pid} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                                {ppd?.imageUrl && (
                                  <img src={ppd.imageUrl} alt={pp.planet} className="w-3.5 h-3.5 rounded-full object-cover" />
                                )}
                                {pp.planet}
                              </span>
                            ) : null;
                          })}
                        </div>
                        <p className="text-gray-500 text-[10px] mt-1.5">{t("chart.stellium.desc")}</p>
                      </div>
                    ))}
                  </div>
                )}
```

- [ ] **Step 8: Replace the Retrograde section (fix hardcoded strings)**

**Find:**
```tsx
                {/* Retrograde Summary */}
                {result.retrogradeCount > 0 && (
                  <div className="glass-card p-5 rounded-2xl">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <RefreshCcw size={16} className="text-amber-400" />
                      Retrograde Gezegenler ({result.retrogradeCount})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.planetPositions.filter(p => p.retrograde).map(p => (
                        <span key={p.planetId} className="px-3 py-1 rounded-full text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300">
                          {p.emoji} {p.planet} ℞
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Retrograde gezegenler içe dönük çalışır — ilgili konularda yeniden değerlendirme ve derinleşme enerjisi taşır.
                    </p>
                  </div>
                )}
```

**Replace with:**
```tsx
                {/* Retrograde Summary */}
                {result.retrogradeCount > 0 && (
                  <div className="glass-card p-5 rounded-2xl">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <RefreshCcw size={16} className="text-amber-400" />
                      {t("chart.retrograde_planets")} ({result.retrogradeCount})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.planetPositions.filter(p => p.retrograde).map(p => {
                        const pd = getPlanetById(PLANET_ID_MAP[p.planetId] || p.planetId);
                        return (
                          <span key={p.planetId} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300">
                            {pd?.imageUrl && (
                              <img src={pd.imageUrl} alt={p.planet} className="w-3.5 h-3.5 rounded-full object-cover" />
                            )}
                            {p.planet} ℞
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">{t("chart.retrograde.explanation")}</p>
                  </div>
                )}
```

- [ ] **Step 9: TypeScript check**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors (or errors unrelated to this task).

- [ ] **Step 10: Commit**

```bash
git add src/app/dogum-haritasi/page.tsx
git commit -m "feat(chart): upgrade Overview tab — element/modality cards with planet chips, dominant planet photo, i18n fixes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Planets tab — add house badge, fix hardcoded strings

**Files:**
- Modify: `src/app/dogum-haritasi/page.tsx` (planets tab section, ~lines 749–835)

**Context:** The planets tab already has photos and desc/traits structure. Changes: (1) add a house badge after the planet name, (2) fix `"℞ Retrograde"` to use i18n badge, (3) change `"(RE)"/"(DIR)"` labels to `"(℞)"/"(D)"`.

- [ ] **Step 1: Replace the planet name + retrograde line in the planets tab**

Find this line inside the planets tab (inside the `result.planetPositions.map` block):
```tsx
                            {t(`astrology.planet.${pos.planetId}`)}
                              {pos.retrograde && <span className="text-amber-400 text-sm" title="Retrograde">℞</span>}
```

Replace with:
```tsx
                            {t(`astrology.planet.${pos.planetId}`)}
                            {pos.retrograde && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
                                ℞ {t("chart.planet.retrograde_badge")}
                              </span>
                            )}
                            {(() => {
                              const houseEntry = Object.entries(result.planetsByHouse).find(([, ps]) => ps.includes(pos.planetId));
                              return houseEntry ? (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                                  {t("chart.planet.in_house", { n: houseEntry[0] })}
                                </span>
                              ) : null;
                            })()}
```

- [ ] **Step 2: Fix the longitude footer labels**

Find in the planets tab:
```tsx
                        <span>{pos.fullDegree}° {pos.retrograde ? "(RE)" : "(DIR)"}</span>
```

Replace with:
```tsx
                        <span className="font-mono">{pos.fullDegree}° {pos.retrograde ? "(℞)" : "(D)"}</span>
```

- [ ] **Step 3: TypeScript check**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dogum-haritasi/page.tsx
git commit -m "feat(chart): upgrade Planets tab — house badge, retrograde badge, i18n fixes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Houses tab — add planet photos for ruler and planets-in-house

**Files:**
- Modify: `src/app/dogum-haritasi/page.tsx` (houses tab section, ~lines 838–898)

**Context:** The houses tab already shows ruler planet name and planets-in-house chip list. We need to add tiny photo thumbnails (w-6 h-6) to both the ruler and the in-house chips, fix the hardcoded "Yönetici:" string, and add an empty-house message.

- [ ] **Step 1: Replace the ruler + planets-in-house section**

Find this block inside the houses tab (inside `result.houses.map`):

```tsx
                      {/* Ruler info and planets in house */}
                      {(() => {
                        const rulership = result.houseRulerships[house.house - 1];
                        const rulerPlanet = rulership ? result.planetPositions.find(p => p.planetId === rulership.rulerPlanetId) : null;
                        const planetsInHouse = result.planetsByHouse[house.house] || [];
                        return (
                          <>
                            {rulerPlanet && (
                              <div className="text-xs text-gray-500 mt-1">
                                Yönetici: <span className="text-purple-300">{rulerPlanet.emoji} {rulerPlanet.planet}</span>
                                {" "}({rulership.rulerHouse}. Ev{rulership.rulerRetrograde ? " ℞" : ""})
                              </div>
                            )}
                            {planetsInHouse.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {planetsInHouse.map(pid => {
                                  const pp = result.planetPositions.find(p => p.planetId === pid);
                                  return pp ? (
                                    <span key={pid} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                                      {pp.emoji} {pp.planet}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </>
                        );
                      })()}
```

**Replace with:**
```tsx
                      {/* Ruler info and planets in house */}
                      {(() => {
                        const rulership = result.houseRulerships[house.house - 1];
                        const rulerPlanet = rulership ? result.planetPositions.find(p => p.planetId === rulership.rulerPlanetId) : null;
                        const rulerPd = rulerPlanet ? getPlanetById(PLANET_ID_MAP[rulerPlanet.planetId] || rulerPlanet.planetId) : null;
                        const planetsInHouse = result.planetsByHouse[house.house] || [];
                        return (
                          <>
                            {rulerPlanet && (
                              <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                                <div
                                  className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 shrink-0"
                                  style={{ boxShadow: `0 0 8px ${rulerPd?.glow || "transparent"}` }}
                                >
                                  {rulerPd?.imageUrl && (
                                    <img src={rulerPd.imageUrl} alt={rulerPlanet.planet} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-500">{t("chart.house.ruler")}:</span>
                                <span className="text-[11px] text-purple-300 font-medium">{rulerPlanet.planet}</span>
                                <span className="text-[10px] text-gray-500">
                                  {t("chart.planet.in_house", { n: String(rulership.rulerHouse) })}
                                  {rulership.rulerRetrograde ? " ℞" : ""}
                                </span>
                              </div>
                            )}
                            {planetsInHouse.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {planetsInHouse.map(pid => {
                                  const pp = result.planetPositions.find(p => p.planetId === pid);
                                  const ppd = getPlanetById(PLANET_ID_MAP[pid] || pid);
                                  return pp ? (
                                    <span key={pid} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                                      {ppd?.imageUrl && (
                                        <img src={ppd.imageUrl} alt={pp.planet} className="w-3.5 h-3.5 rounded-full object-cover" />
                                      )}
                                      {pp.planet}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              <p className="text-[10px] text-white/20 italic mt-2">{t("chart.house.empty")}</p>
                            )}
                          </>
                        );
                      })()}
```

- [ ] **Step 2: TypeScript check**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dogum-haritasi/page.tsx
git commit -m "feat(chart): upgrade Houses tab — planet photos for ruler and occupants, i18n fixes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Aspects tab — planet photos on both sides, i18n filter labels

**Files:**
- Modify: `src/app/dogum-haritasi/page.tsx` (aspects tab section, ~lines 900–966)

**Context:** Each aspect card gets a planet photo on both sides (w-10 h-10). Filter buttons and applying/separating labels switch from hardcoded Turkish to i18n keys.

- [ ] **Step 1: Replace the filter buttons block**

Find:
```tsx
                  <div className="flex gap-2 flex-wrap">
                    {([
                      { id: "all" as const,      label: "Tümü" },
                      { id: "positive" as const, label: "Uyumlu" },
                      { id: "negative" as const, label: "Zorlu" },
                      { id: "neutral" as const,  label: "Nötr" },
                    ]).map(f => (
                      <button
                        key={f.id}
                        onClick={() => setAspectFilter(f.id)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all ${aspectFilter === f.id ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{filteredAspects.length} açı</span>
```

**Replace with:**
```tsx
                  <div className="flex gap-2 flex-wrap">
                    {([
                      { id: "all" as const,      labelKey: "chart.filter.all" },
                      { id: "positive" as const, labelKey: "chart.filter.harmonious" },
                      { id: "negative" as const, labelKey: "chart.filter.challenging" },
                      { id: "neutral" as const,  labelKey: "chart.filter.neutral" },
                    ] as const).map(f => (
                      <button
                        key={f.id}
                        onClick={() => setAspectFilter(f.id)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all ${aspectFilter === f.id ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}
                      >
                        {t(f.labelKey)}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{filteredAspects.length}</span>
```

- [ ] **Step 2: Replace individual aspect card rendering (add planet photos)**

Find the aspect card block (inside `filteredAspects.map`):

```tsx
                  filteredAspects.map((aspect, i) => (
                    <div key={i} className={`glass-card p-4 border ${harmonyColor(aspect.harmony).split(" ").filter(c => c.startsWith("border-")).join(" ")}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg ${harmonyColor(aspect.harmony).split(" ").filter(c => c.startsWith("text-")).join(" ")}`}>
                            {aspect.typeEmoji}
                          </span>
                          <span className="text-white text-sm font-medium">{t(`astrology.planet.${aspect.planet1Id}`)} — {t(`astrology.planet.${aspect.planet2Id}`)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${harmonyColor(aspect.harmony)}`}>
                            {t(`astrology.aspect.${aspect.typeId}`)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs border ${
                            aspect.applying
                              ? "border-green-500/30 bg-green-500/10 text-green-400"
                              : "border-gray-500/30 bg-gray-500/10 text-gray-400"
                          }`}>
                            {aspect.applying ? "↗ Yaklaşıyor" : "↘ Uzaklaşıyor"}
                          </span>
                         </div>
                      </div>
                      <p className="text-gray-500 text-xs">
                        {t(`astrology.planet.${aspect.planet1Id}`)} {aspect.typeEmoji} {t(`astrology.planet.${aspect.planet2Id}`)}: {t(`astrology.aspect.${aspect.typeId}.desc`)}
                      </p>
                    </div>
                  ))
```

**Replace with:**
```tsx
                  filteredAspects.map((aspect, i) => {
                    const p1d = getPlanetById(PLANET_ID_MAP[aspect.planet1Id] || aspect.planet1Id);
                    const p2d = getPlanetById(PLANET_ID_MAP[aspect.planet2Id] || aspect.planet2Id);
                    const harmonyBorderClass =
                      aspect.harmony === "positive" ? "border-green-500/20" :
                      aspect.harmony === "negative" ? "border-red-500/20" : "border-blue-500/20";
                    const harmonyTextClass =
                      aspect.harmony === "positive" ? "text-green-400" :
                      aspect.harmony === "negative" ? "text-red-400" : "text-blue-400";
                    return (
                      <div key={i} className={`glass-card p-4 border ${harmonyBorderClass}`}>
                        <div className="flex items-center gap-3">
                          {/* Planet 1 photo */}
                          <div
                            className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10"
                            style={{ boxShadow: `0 0 12px ${p1d?.glow || "transparent"}` }}
                          >
                            {p1d?.imageUrl && <img src={p1d.imageUrl} alt={aspect.planet1Id} className="w-full h-full object-cover" />}
                          </div>
                          {/* Aspect symbol */}
                          <div className="flex flex-col items-center gap-0.5 shrink-0 min-w-[56px]">
                            <span className={`text-xl ${harmonyTextClass}`}>{aspect.typeEmoji}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${harmonyTextClass}`}>
                              {t(`astrology.aspect.${aspect.typeId}`)}
                            </span>
                            <span className="text-[8px] font-mono text-gray-500">{aspect.orb}° {t("chart.aspect.orb")}</span>
                          </div>
                          {/* Planet 2 photo */}
                          <div
                            className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10"
                            style={{ boxShadow: `0 0 12px ${p2d?.glow || "transparent"}` }}
                          >
                            {p2d?.imageUrl && <img src={p2d.imageUrl} alt={aspect.planet2Id} className="w-full h-full object-cover" />}
                          </div>
                          {/* Names + applying badge */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {t(`astrology.planet.${aspect.planet1Id}`)} — {t(`astrology.planet.${aspect.planet2Id}`)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                                aspect.applying
                                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                                  : "border-gray-500/30 bg-gray-500/10 text-gray-400"
                              }`}>
                                {aspect.applying ? `↗ ${t("chart.aspect.applying")}` : `↘ ${t("chart.aspect.separating")}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-500 text-[11px] mt-3 pl-1 leading-relaxed">
                          {t(`astrology.aspect.${aspect.typeId}.desc`)}
                        </p>
                      </div>
                    );
                  })
```

- [ ] **Step 3: TypeScript check**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dogum-haritasi/page.tsx
git commit -m "feat(chart): upgrade Aspects tab — planet photos on both sides, i18n filter labels

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Harita Yorumu tab — i18n strings, individual transit cards

**Files:**
- Modify: `src/app/dogum-haritasi/page.tsx` (ai-yorumu tab section, ~lines 968–1087)

**Context:** Fix all hardcoded Turkish strings in the interpret section, and replace the simple transit list with individual Astro-Seek-style cards (transit planet photo | aspect symbol | natal planet photo).

- [ ] **Step 1: Replace the "no interpretation yet" panel**

Find:
```tsx
                {!chartInterpretation ? (
                  <div className="glass-card p-8 rounded-2xl text-center">
                    <Brain size={48} className="mx-auto mb-4 text-purple-400 opacity-60" />
                    <h3 className="text-white font-semibold text-lg mb-2">Kişisel Harita Yorumu</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                      Tüm gezegen, ev ve açı verilerin analiz edilip sana özel kapsamlı bir yorum hazırlanır.
                    </p>
                    {interpretError && <p className="text-red-400 text-sm mb-4">{interpretError}</p>}
                    <GlassButton onClick={handleInterpret} disabled={interpretLoading} fullWidth>
                      {interpretLoading ? t("chart.calculating") : (
                        <><Sparkles className="size-4 mr-2 inline-block" />Haritamı Yorumla</>
                      )}
                    </GlassButton>
                  </div>
```

**Replace with:**
```tsx
                {!chartInterpretation ? (
                  <div className="glass-card p-8 rounded-2xl text-center">
                    <Brain size={48} className="mx-auto mb-4 text-purple-400 opacity-60" />
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {t("chart.interpretation.personal_title")}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                      {t("chart.interpretation.personal_desc")}
                    </p>
                    {interpretError && <p className="text-red-400 text-sm mb-4">{interpretError}</p>}
                    <GlassButton onClick={handleInterpret} disabled={interpretLoading} fullWidth>
                      {interpretLoading ? t("chart.calculating") : (
                        <><Sparkles className="size-4 mr-2 inline-block" />{t("chart.interpretation.generate_btn")}</>
                      )}
                    </GlassButton>
                  </div>
```

- [ ] **Step 2: Replace the interpretation sections + regenerate button**

Find:
```tsx
                ) : (
                  <div className="space-y-4">
                    {([
                      { key: "general",    title: "Genel Karakter Analizi",  icon: <Star size={16} className="text-yellow-400" /> },
                      { key: "strengths",  title: "Güçlü Yönler",            icon: <Zap size={16} className="text-green-400" /> },
                      { key: "challenges", title: "Dikkat Alanları",          icon: <Info size={16} className="text-amber-400" /> },
                      { key: "advice",     title: "Kişisel Öneriler",         icon: <Lightbulb size={16} className="text-blue-400" /> },
                    ] as const).map(section => (
                      <div key={section.key} className="glass-card p-5 rounded-2xl">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          {section.icon}
                          {section.title}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                          {chartInterpretation[section.key]}
                        </p>
                      </div>
                    ))}
                    <button
                      onClick={() => { setChartInterpretation(null); setInterpretError(""); }}
                      className="text-xs text-gray-500 hover:text-gray-400 transition-colors block mx-auto"
                    >
                      Yeniden yorumla
                    </button>
                  </div>
                )}
```

**Replace with:**
```tsx
                ) : (
                  <div className="space-y-4">
                    {([
                      { key: "general" as const,    titleKey: "chart.interpretation.general_title",    icon: <Star size={16} className="text-yellow-400" /> },
                      { key: "strengths" as const,  titleKey: "chart.interpretation.strengths_title",  icon: <Zap size={16} className="text-green-400" /> },
                      { key: "challenges" as const, titleKey: "chart.interpretation.challenges_title", icon: <Info size={16} className="text-amber-400" /> },
                      { key: "advice" as const,     titleKey: "chart.interpretation.advice_title",     icon: <Lightbulb size={16} className="text-blue-400" /> },
                    ]).map(section => (
                      <div key={section.key} className="glass-card p-5 rounded-2xl">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          {section.icon}
                          {t(section.titleKey)}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                          {chartInterpretation[section.key]}
                        </p>
                      </div>
                    ))}
                    <button
                      onClick={() => { setChartInterpretation(null); setInterpretError(""); }}
                      className="text-xs text-gray-500 hover:text-gray-400 transition-colors block mx-auto"
                    >
                      {t("chart.interpretation.regenerate")}
                    </button>
                  </div>
                )}
```

- [ ] **Step 3: Replace the transit list with individual cards**

Find the transit list block (from `{result.transits && result.transits.length > 0 ? (` to just before the transit interpretation button section):

```tsx
                  {result.transits && result.transits.length > 0 ? (
                    <div className="space-y-4 mb-8">
                      {result.transits.map((transit: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{transit.transitEmoji}</span>
                              <div>
                                <p className="text-white font-medium text-sm">Transit {t(`astrology.planet.${transit.transitPlanetId}`)}</p>
                                <p className="text-gray-400 text-xs">{t(`astrology.aspect.${transit.typeId}`)} ({transit.typeEmoji})</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-white font-medium text-sm">Natal {t(`astrology.planet.${transit.natalPlanetId}`)}</p>
                                <p className="text-gray-400 text-xs">{t("chart.yours")}</p>
                              </div>
                              <span className="text-2xl text-purple-400">{transit.natalEmoji}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-gray-500 mb-8">
                      {t("chart.transits.none")}
                    </div>
                  )}
```

**Replace with:**
```tsx
                  {result.transits && result.transits.length > 0 ? (
                    <div className="space-y-3 mb-8">
                      {result.transits.map((transit: any, idx: number) => {
                        const tpd = getPlanetById(PLANET_ID_MAP[transit.transitPlanetId] || transit.transitPlanetId);
                        const npd = getPlanetById(PLANET_ID_MAP[transit.natalPlanetId] || transit.natalPlanetId);
                        const harmonyColor =
                          transit.harmony === "positive" ? "#4ade80" :
                          transit.harmony === "negative" ? "#f87171" : "#60a5fa";
                        return (
                          <div key={idx} className="glass-card p-4">
                            <div className="flex items-center gap-3">
                              {/* Transit planet */}
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <div
                                  className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10"
                                  style={{ boxShadow: `0 0 16px ${tpd?.glow || "transparent"}` }}
                                >
                                  {tpd?.imageUrl && (
                                    <img src={tpd.imageUrl} alt={transit.transitPlanetId} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <span className="text-[8px] text-gray-500 uppercase tracking-wider">
                                  {t("chart.transit.transit_planet")}
                                </span>
                                <span className="text-[10px] text-white font-medium">
                                  {t(`astrology.planet.${transit.transitPlanetId}`)}
                                </span>
                              </div>
                              {/* Aspect center */}
                              <div className="flex flex-col items-center gap-1 flex-1">
                                <span className="text-2xl">{transit.typeEmoji}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: harmonyColor }}>
                                  {t(`astrology.aspect.${transit.typeId}`)}
                                </span>
                                {transit.applying !== undefined && (
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                                    transit.applying
                                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                                      : "border-gray-500/30 bg-gray-500/10 text-gray-400"
                                  }`}>
                                    {transit.applying
                                      ? `↗ ${t("chart.transit.applying")}`
                                      : `↘ ${t("chart.transit.separating")}`}
                                  </span>
                                )}
                              </div>
                              {/* Natal planet */}
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <div
                                  className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10"
                                  style={{ boxShadow: `0 0 16px ${npd?.glow || "transparent"}` }}
                                >
                                  {npd?.imageUrl && (
                                    <img src={npd.imageUrl} alt={transit.natalPlanetId} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <span className="text-[8px] text-gray-500 uppercase tracking-wider">
                                  {t("chart.transit.natal_planet")}
                                </span>
                                <span className="text-[10px] text-white font-medium">
                                  {t(`astrology.planet.${transit.natalPlanetId}`)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-gray-500 mb-8">
                      {t("chart.transits.none")}
                    </div>
                  )}
```

- [ ] **Step 4: TypeScript check**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/dogum-haritasi/page.tsx
git commit -m "feat(chart): upgrade Harita Yorumu tab — i18n strings, individual transit cards with planet photos

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

### Spec Coverage

| Spec Requirement | Task | Status |
|---|---|---|
| Planet photo thumbnails (Unsplash URLs) | T3, T4, T5, T6, T7 | ✓ planned |
| Element balance — contributing planet chips | T3 | ✓ planned |
| Element balance — explanation text | T3 | ✓ planned |
| Modality balance — description per modality | T3 | ✓ planned |
| Dominant planet — photo card | T3 | ✓ planned |
| Retrograde chips — inline row with photos | T3 | ✓ planned |
| Planets tab — house badge | T4 | ✓ planned |
| Houses tab — ruler photo | T5 | ✓ planned |
| Houses tab — empty house message | T5 | ✓ planned |
| Aspects tab — planet photos both sides | T6 | ✓ planned |
| Aspects tab — filter labels i18n | T6 | ✓ planned |
| Aspects tab — applying/separating i18n | T6 | ✓ planned |
| Gemini prompt — no "canım benim" | T2 | ✓ planned |
| Interpret sections — i18n titles | T7 | ✓ planned |
| Individual transit cards | T7 | ✓ planned |
| All 5 locales | T1 | ✓ planned |
| Hardcoded Turkish strings fixed | T3–T7 | ✓ planned |
| `PLANET_ID_MAP` + `ELEMENT_OF_SIGN` constants | T3 | ✓ planned |
| `getPlanetById` import | T3 | ✓ planned |

### Potential Issues to Watch

1. **`astrology.modality.*` keys in tr.ts** — Task 3 uses `t("astrology.modality.cardinal")` etc. Verify these keys exist in tr.ts before Task 3. If they don't exist, add them to all 5 locales in Task 1.
2. **`astrology.aspect.typeId` values** — The aspect `typeId` values (e.g. `"conjunction"`, `"trine"`) must match the locale key prefix `astrology.aspect.{typeId}`. These already exist in tr.ts from prior work.
3. **`transit.applying` may be undefined** — The transit objects from the calculate API may or may not have an `applying` field. Task 7 guards with `transit.applying !== undefined`.
4. **`getPlanetById` export** — Spec says it's exported from `src/data/planets.ts`. Verify before Task 3 by grepping: `grep "export.*getPlanetById" src/data/planets.ts`.
