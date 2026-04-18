# Doğum Haritası v2 Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to execute this plan task-by-task.

**Goal:** Upgrade the birth chart engine and UI to Astro-Seek level quality, add automatic Mistik Rehber sync.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase, Google Gemini (`callGeminiWithFallback`), Tailwind CSS, Lucide React.

---

## File Map

| File | Action |
|------|--------|
| `src/lib/astrology.ts` | Extend — new interfaces, constants, functions |
| `src/app/api/birth-chart/interpret/route.ts` | Create — Gemini AI chart interpretation |
| `src/app/api/birth-chart/sync/route.ts` | Create — saves birth_chart_summary + memories |
| `src/lib/guide-prompts.ts` | Modify — add birth_chart_summary to Layer 2 |
| `sql/schema.sql` | Modify — add `birth_chart_summary JSONB` to profiles |
| `src/app/dogum-haritasi/page.tsx` | Complete rewrite — 5 tabs |

---

## Task 1: astrology.ts — New Interfaces, Constants, and Basic Helper

**File:** `src/lib/astrology.ts`

- [ ] **Step 1: Add new interfaces**

After the existing `Aspect` interface, add:

```ts
export interface HouseRulership {
  house: number;
  signId: string;
  rulerPlanetId: string;
  rulerHouse: number;
  rulerSign: string;
  rulerRetrograde: boolean;
}

export interface ElementBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
  dominant: "fire" | "earth" | "air" | "water";
}

export interface ModalBalance {
  cardinal: number;
  fixed: number;
  mutable: number;
  dominant: "cardinal" | "fixed" | "mutable";
}

export interface Stellium {
  signId: string;
  signName: string;
  planets: string[];
}
```

Extend the existing `BirthChart` interface to add new fields after `transits`:

```ts
  planetsByHouse: Record<number, string[]>;
  houseRulerships: HouseRulership[];
  elementBalance: ElementBalance;
  modalBalance: ModalBalance;
  dominantPlanet: string;
  stelliums: Stellium[];
  retrogradeCount: number;
```

Extend the existing `Aspect` interface to add:
```ts
  applying: boolean;
```

- [ ] **Step 2: Add constants after the `signList` array**

```ts
const SIGN_RULERS: Record<string, string> = {
  koc: "mars", boga: "venus", ikizler: "mercury", yengec: "moon",
  aslan: "sun", basak: "mercury", terazi: "venus", akrep: "pluto",
  yay: "jupiter", oglak: "saturn", kova: "uranus", balik: "neptune",
};

const ELEMENT_MAP: Record<string, "fire" | "earth" | "air" | "water"> = {
  koc: "fire", aslan: "fire", yay: "fire",
  boga: "earth", basak: "earth", oglak: "earth",
  ikizler: "air", terazi: "air", kova: "air",
  yengec: "water", akrep: "water", balik: "water",
};

const MODAL_MAP: Record<string, "cardinal" | "fixed" | "mutable"> = {
  koc: "cardinal", yengec: "cardinal", terazi: "cardinal", oglak: "cardinal",
  boga: "fixed", aslan: "fixed", akrep: "fixed", kova: "fixed",
  ikizler: "mutable", basak: "mutable", yay: "mutable", balik: "mutable",
};
```

- [ ] **Step 3: Add `getPlanetHouse` helper after `longitudeToSign`**

```ts
function getPlanetHouse(fullDegree: number, houses: HousePosition[]): number {
  const signIds = ["koc","boga","ikizler","yengec","aslan","basak","terazi","akrep","yay","oglak","kova","balik"];
  const cusps = houses.map((h) => {
    const signIdx = signIds.indexOf(h.signId);
    return safeMod(signIdx * 30 + h.degree, 360);
  });
  const norm = safeMod(fullDegree, 360);
  for (let i = 0; i < 12; i++) {
    const curr = cusps[i];
    const next = cusps[(i + 1) % 12];
    if (curr <= next) {
      if (norm >= curr && norm < next) return i + 1;
    } else {
      if (norm >= curr || norm < next) return i + 1;
    }
  }
  return 1;
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/astrology.ts
git commit -m "feat(astrology): add v2 interfaces, SIGN_RULERS/ELEMENT_MAP/MODAL_MAP constants, getPlanetHouse helper"
```

---

## Task 2: astrology.ts — Core Calculation Functions

**File:** `src/lib/astrology.ts`

- [ ] **Step 1: Add `buildPlanetsByHouse`**

```ts
function buildPlanetsByHouse(planetPositions: PlanetPosition[], houses: HousePosition[]): Record<number, string[]> {
  const result: Record<number, string[]> = {};
  for (let i = 1; i <= 12; i++) result[i] = [];
  for (const p of planetPositions) {
    const h = getPlanetHouse(p.fullDegree, houses);
    result[h].push(p.planetId);
  }
  return result;
}
```

- [ ] **Step 2: Add `calculateHouseRulerships`**

```ts
function calculateHouseRulerships(houses: HousePosition[], planetPositions: PlanetPosition[]): HouseRulership[] {
  return houses.map((h) => {
    const rulerPlanetId = SIGN_RULERS[h.signId] || "sun";
    const rulerPlanet = planetPositions.find((p) => p.planetId === rulerPlanetId);
    const rulerHouse = rulerPlanet ? getPlanetHouse(rulerPlanet.fullDegree, houses) : 1;
    return {
      house: h.house,
      signId: h.signId,
      rulerPlanetId,
      rulerHouse,
      rulerSign: rulerPlanet?.signId || "koc",
      rulerRetrograde: rulerPlanet?.retrograde || false,
    };
  });
}
```

- [ ] **Step 3: Add `calculateElementBalance`**

```ts
function calculateElementBalance(planetPositions: PlanetPosition[]): ElementBalance {
  const counts = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const p of planetPositions) {
    const el = ELEMENT_MAP[p.signId];
    if (el) counts[el]++;
  }
  const total = planetPositions.length || 1;
  const pct = {
    fire:  Math.round((counts.fire  / total) * 100),
    earth: Math.round((counts.earth / total) * 100),
    air:   Math.round((counts.air   / total) * 100),
    water: Math.round((counts.water / total) * 100),
  };
  const dominant = (Object.keys(counts) as Array<keyof typeof counts>).reduce(
    (a, b) => (counts[a] >= counts[b] ? a : b)
  );
  return { ...pct, dominant };
}
```

- [ ] **Step 4: Add `calculateModalBalance`**

```ts
function calculateModalBalance(planetPositions: PlanetPosition[]): ModalBalance {
  const counts = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const p of planetPositions) {
    const m = MODAL_MAP[p.signId];
    if (m) counts[m]++;
  }
  const total = planetPositions.length || 1;
  const pct = {
    cardinal: Math.round((counts.cardinal / total) * 100),
    fixed:    Math.round((counts.fixed    / total) * 100),
    mutable:  Math.round((counts.mutable  / total) * 100),
  };
  const dominant = (Object.keys(counts) as Array<keyof typeof counts>).reduce(
    (a, b) => (counts[a] >= counts[b] ? a : b)
  );
  return { ...pct, dominant };
}
```

- [ ] **Step 5: Add `calculateDominantPlanet`**

```ts
function calculateDominantPlanet(
  planetPositions: PlanetPosition[],
  aspects: Aspect[],
  houses: HousePosition[],
  risingSignId: string
): string {
  const scores: Record<string, number> = {};
  for (const p of planetPositions) scores[p.planetId] = 0;
  for (const a of aspects) {
    scores[a.planet1Id] = (scores[a.planet1Id] || 0) + 1;
    scores[a.planet2Id] = (scores[a.planet2Id] || 0) + 1;
  }
  for (const p of planetPositions) {
    const h = getPlanetHouse(p.fullDegree, houses);
    if ([1, 4, 7, 10].includes(h)) scores[p.planetId] += 2;
  }
  const chartRuler = SIGN_RULERS[risingSignId];
  if (chartRuler && scores[chartRuler] !== undefined) scores[chartRuler] += 3;
  return Object.keys(scores).reduce((a, b) => (scores[a] >= scores[b] ? a : b), "sun");
}
```

- [ ] **Step 6: Add `detectStelliums`**

```ts
function detectStelliums(planetPositions: PlanetPosition[]): Stellium[] {
  const bySign: Record<string, string[]> = {};
  const signNameMap: Record<string, string> = {};
  for (const p of planetPositions) {
    if (!bySign[p.signId]) bySign[p.signId] = [];
    bySign[p.signId].push(p.planetId);
    signNameMap[p.signId] = p.sign;
  }
  return Object.entries(bySign)
    .filter(([, planets]) => planets.length >= 3)
    .map(([signId, planets]) => ({ signId, signName: signNameMap[signId], planets }));
}
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/astrology.ts
git commit -m "feat(astrology): add buildPlanetsByHouse, houseRulerships, element/modal balance, dominantPlanet, detectStelliums"
```

---

## Task 3: astrology.ts — Wire Into calculateBirthChart + Applying Detection

**File:** `src/lib/astrology.ts`

- [ ] **Step 1: Update `calculateAspects` signature to accept `jd` and detect applying**

Replace the function signature `function calculateAspects(positions: Record<string, number>): Aspect[]` with `function calculateAspects(positions: Record<string, number>, jd: number): Aspect[]`.

At the start of the function body, add:
```ts
const futurePositions = calculateAllPlanetLongitudes(jd + 1);
```

Inside the inner aspect-match block, after `const orb = Math.abs(angle - type.angle);` and before `aspects.push(...)`, add:
```ts
const futureDiff = Math.abs(futurePositions[p1] - futurePositions[p2]);
const futureAngle = futureDiff > 180 ? 360 - futureDiff : futureDiff;
const futureOrb = Math.abs(futureAngle - type.angle);
const applying = futureOrb < orb;
```

Add `applying,` to the `aspects.push({...})` call.

- [ ] **Step 2: Update `calculateBirthChart` return value**

In the `calculateBirthChart` function body, update the `calculateAspects` call to pass `jd`:
```ts
const aspects = calculateAspects(allPositions, jd);
```

Add these after `aspects`:
```ts
const planetsByHouse   = buildPlanetsByHouse(planetPositions, houses);
const houseRulerships  = calculateHouseRulerships(houses, planetPositions);
const elementBalance   = calculateElementBalance(planetPositions);
const modalBalance     = calculateModalBalance(planetPositions);
const dominantPlanet   = calculateDominantPlanet(planetPositions, aspects, houses, risingData.id);
const stelliums        = detectStelliums(planetPositions);
const retrogradeCount  = planetPositions.filter((p) => p.retrograde).length;
```

Add these new fields to the return object:
```ts
planetsByHouse,
houseRulerships,
elementBalance,
modalBalance,
dominantPlanet,
stelliums,
retrogradeCount,
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/astrology.ts
git commit -m "feat(astrology): wire new fields into calculateBirthChart, add applying detection to aspects"
```

---

## Task 4: Database Schema + Birth Chart Sync API

**Files:** `sql/schema.sql`, `src/app/api/birth-chart/sync/route.ts`

- [ ] **Step 1: Add column to schema.sql**

After the `is_premium` ALTER TABLE line, add:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_chart_summary JSONB DEFAULT NULL;
```

- [ ] **Step 2: Run migration in Supabase SQL Editor**

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_chart_summary JSONB DEFAULT NULL;
```

- [ ] **Step 3: Create `src/app/api/birth-chart/sync/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { BirthChart } from "@/lib/astrology";

const ALL_GUIDE_IDS = ["melisa", "aras", "umut", "hekate", "selin"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chart, userId }: { chart: BirthChart; userId: string } = body;
    if (!chart || !userId) return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });

    const dominantPlanetInfo = chart.planetPositions.find((p) => p.planetId === chart.dominantPlanet);
    const notableAspects = chart.aspects
      .filter((a) => a.orb <= 3).slice(0, 5)
      .map((a) => `${a.planet1} ${a.typeEmoji} ${a.planet2}`);
    const retrogradePlanets = chart.planetPositions.filter((p) => p.retrograde).map((p) => p.planetId);

    const summary = {
      calculatedAt: new Date().toISOString(),
      sunSign: chart.sunSign.id,
      moonSign: chart.moonSign.id,
      risingSign: chart.risingSign.id,
      dominantPlanet: chart.dominantPlanet,
      dominantElement: chart.elementBalance.dominant,
      stelliums: chart.stelliums.map((s) => `${s.signName}: ${s.planets.join(", ")}`),
      notableAspects,
      retrogradePlanets,
    };

    await supabaseAdmin.from("profiles").update({ birth_chart_summary: summary }).eq("id", userId);

    // Delete old astrology memories for this user
    await supabaseAdmin.from("memories").delete().eq("user_id", userId).eq("category", "astroloji");

    const elementLabels: Record<string, string> = { fire: "Ateş", earth: "Toprak", air: "Hava", water: "Su" };
    const facts = [
      `Dominant element: ${elementLabels[chart.elementBalance.dominant] || chart.elementBalance.dominant}`,
      `Dominant gezegen: ${dominantPlanetInfo?.planet || chart.dominantPlanet} (${dominantPlanetInfo?.sign || ""})`,
      ...chart.stelliums.map((s) => `${s.signName} stelliumu: ${s.planets.join(", ")}`),
    ];

    const memories = ALL_GUIDE_IDS.flatMap((guideId) =>
      facts.map((fact) => ({
        user_id: userId,
        guide_id: guideId,
        category: "astroloji",
        fact,
        importance: 4,
        tags: ["doğum-haritası"],
      }))
    );

    if (memories.length > 0) await supabaseAdmin.from("memories").insert(memories);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Birth chart sync error:", error);
    return NextResponse.json({ error: "Senkronizasyon hatası." }, { status: 500 });
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add sql/schema.sql src/app/api/birth-chart/sync/route.ts
git commit -m "feat: add birth_chart_summary schema column and birth-chart/sync API route"
```

---

## Task 5: AI Interpretation API Route

**File:** `src/app/api/birth-chart/interpret/route.ts`

- [ ] **Step 1: Create the route**

```ts
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithFallback } from "@/lib/gemini";
import type { BirthChart } from "@/lib/astrology";

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { chart }: { chart: BirthChart } = body;
    if (!chart) return NextResponse.json({ error: "Harita verisi eksik." }, { status: 400 });

    const planetLines = chart.planetPositions.map((p) => {
      const houseEntry = Object.entries(chart.planetsByHouse).find(([, ps]) => ps.includes(p.planetId));
      return `- ${p.planet}: ${p.sign}, ${houseEntry?.[0] || "?"} Ev${p.retrograde ? " ℞" : ""}`;
    }).join("\n");

    const aspectLines = chart.aspects
      .filter((a) => a.orb <= 5).slice(0, 10)
      .map((a) => `- ${a.planet1} ${a.typeEmoji} ${a.planet2} (orb ${a.orb}°, ${a.applying ? "yaklaşıyor" : "uzaklaşıyor"})`)
      .join("\n");

    const elementLabels: Record<string, string> = { fire: "Ateş", earth: "Toprak", air: "Hava", water: "Su" };
    const modalLabels: Record<string, string> = { cardinal: "Öncü", fixed: "Sabit", mutable: "Değişken" };
    const dp = chart.planetPositions.find((p) => p.planetId === chart.dominantPlanet);

    const prompt = `Kullanıcının doğum haritasını Türkçe yorumla. Astrolojik terimleri kullan ama her birini açıkla. Kişisel ve samimi bir dil kullan.

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
  "general": "Genel karakter analizi, 3-4 paragraf",
  "strengths": "Güçlü yönler, 2-3 paragraf",
  "challenges": "Dikkat alanları, 2 paragraf, büyüme fırsatı olarak sun",
  "advice": "Kişisel öneriler, 1-2 paragraf"
}`;

    const raw = await callGeminiWithFallback(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "AI yanıtı işlenemedi." }, { status: 500 });

    return NextResponse.json({ success: true, data: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    console.error("Birth chart interpret error:", error);
    return NextResponse.json({ error: "Yorum oluşturulamadı." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/birth-chart/interpret/route.ts
git commit -m "feat: add birth-chart/interpret API route with Gemini prompt"
```

---

## Task 6: guide-prompts.ts — Add birth_chart_summary to Layer 2

**File:** `src/lib/guide-prompts.ts`

- [ ] **Step 1: Read the file first**

Read `src/lib/guide-prompts.ts` to find the exact structure of `SystemPromptParams` and `buildSystemPrompt`.

- [ ] **Step 2: Extend `SystemPromptParams.profile` interface**

Add `birth_chart_summary` to the `profile` field:
```ts
birth_chart_summary?: {
  dominantElement?: string;
  dominantPlanet?: string;
  stelliums?: string[];
  notableAspects?: string[];
  retrogradePlanets?: string[];
} | null;
```

- [ ] **Step 3: Add birth_chart_summary block to the cosmicProfile template string in `buildSystemPrompt`**

Before the `cosmicProfile` template literal, add:
```ts
const elementLabels: Record<string, string> = { fire: "Ateş", earth: "Toprak", air: "Hava", water: "Su" };
const bcs = profile.birth_chart_summary;
const chartBlock = bcs ? `\nDoğum Haritası Özeti:\nDominant Element: ${elementLabels[bcs.dominantElement || ""] || bcs.dominantElement || "?"}\nDominant Gezegen: ${bcs.dominantPlanet || "?"}${bcs.stelliums?.length ? `\nStellium: ${bcs.stelliums.slice(0, 2).join("; ")}` : ""}${bcs.notableAspects?.length ? `\nÖnemli açılar: ${bcs.notableAspects.slice(0, 3).join(", ")}` : ""}\nBu bilgileri doğal konuşmada kullan.` : "";
```

Append `${chartBlock}` at the end of the `cosmicProfile` template string.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/guide-prompts.ts
git commit -m "feat(guide-prompts): add birth_chart_summary to Layer 2 cosmic profile"
```

---

## Task 7: dogum-haritasi/page.tsx — Complete Rewrite (5 Tabs)

**File:** `src/app/dogum-haritasi/page.tsx`

- [ ] **Step 1: Read the full current file**

Read `src/app/dogum-haritasi/page.tsx` completely to understand all imports and state variables.

- [ ] **Step 2: Replace the file with the new 5-tab version**

Key changes from the current version:
- Tab IDs: `"ozet" | "gezegenler" | "evler" | "acilar" | "ai-yorumu"`
- New state: `aspectFilter`, `chartInterpretation`, `interpretLoading`, `interpretError`
- `handleCalculate` — keep form logic, add `syncBirthChart(data.data, user.id)` call after success
- Remove `useAuth` import from `@/lib/auth-helpers` if not present, add it

The new page includes these sections when `result` is not null:

**Big Three row:** 3 cards (Sun/Moon/Rising) with emoji, label, sign name, degree.

**Tab bar:** 5 tabs with icons using `Star, Orbit, Home, Zap, Brain` from Lucide.

**Özet tab:**
- BirthChartWheel (existing component)
- Element balance: 4 horizontal bars (fire=orange, earth=green, air=sky, water=blue) with % values
- Modal balance: 3 horizontal bars (cardinal=red, fixed=purple, mutable=teal) with descriptions
- Dominant planet card: planet emoji, name, sign, house, meaning
- Stelliums section: `result.stelliums` — each stellium shows sign name and planet list
- Retrograde summary: colored chips for each retrograde planet

**Gezegenler tab:**
- Grid of 10 planet cards
- Each card: emoji, name, sign, degree, house number badge (purple), retrograde badge (amber)
- If retrograde: italic explanation text below

**Evler tab:**
- Grid of 12 house cards
- Each card: house number, HOUSE_NAMES[idx], sign, cusp degree, ruler planet info, planets-in-house chips

```ts
const HOUSE_NAMES = [
  "Kimlik & Dış Görünüş", "Maddi Değerler & Para", "İletişim & Kardeşler",
  "Ev & Aile & Kökler", "Yaratıcılık & Romantizm", "Sağlık & Günlük Hayat",
  "İlişkiler & Ortaklıklar", "Dönüşüm & Ortak Kaynaklar", "Felsefe & Uzak Yolculuklar",
  "Kariyer & Statü", "Arkadaşlık & Gruplar", "Bilinçaltı & Spiritüellik",
];
```

**Açılar tab:**
- Filter buttons: Tümü / Uyumlu / Zorlu / Nötr
- `filteredAspects = useMemo` filtering by `aspectFilter`
- Each aspect card shows: typeEmoji, planet1 · planet2, type, orb, applying badge ("Yaklaşıyor ↗" green / "Uzaklaşıyor ↘" gray), description

**AI Yorumu tab:**
- If no interpretation: centered card with Brain icon, description, "Haritamı Yorumla" button → calls `/api/birth-chart/interpret`
- If interpretation loaded: 4 section cards (general / strengths / challenges / advice) + "Yeniden yorumla" link
- Below: Transit Interpretation section (existing `handleTransitInterpret` logic, moved here from overview)

`syncBirthChart` function:
```ts
const syncBirthChart = useCallback(async (chart: BirthChart, userId: string) => {
  try {
    await fetch("/api/birth-chart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chart, userId }),
    });
  } catch (err) {
    console.error("Birth chart sync failed:", err);
  }
}, []);
```

useAuth import:
```ts
import { useAuth } from "@/lib/auth-helpers";
// inside component:
const { user, profile } = useAuth();
```

- [ ] **Step 3: Remove unused imports**

If TypeScript warns about unused imports (`NextImage`, `planets`, `PlanetIcon`, `ZodiacIcon`, `Link2`, `CheckCircle2`, `AlertTriangle`), remove them.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -50
```

- [ ] **Step 5: Start dev server and manually test**

```bash
npm run dev
```

Open `http://localhost:3000/dogum-haritasi`. Test:
- [ ] Form submits → shows Big Three + 5 tabs
- [ ] Özet tab: element bars, modal bars, dominant planet, stelliums (if any), retrogrades
- [ ] Gezegenler tab: 10 planet cards with house badges
- [ ] Evler tab: 12 house cards with ruler info
- [ ] Açılar tab: filter buttons work, applying/separating labels show
- [ ] AI Yorumu tab: interpret button → 4 section cards render
- [ ] Logged-in user: `/api/birth-chart/sync` called in Network tab

- [ ] **Step 6: Commit**

```bash
git add src/app/dogum-haritasi/page.tsx
git commit -m "feat(dogum-haritasi): complete 5-tab rewrite with element balance, house rulerships, applying aspects, AI yorumu"
```

---

## Task 8: Wire birth_chart_summary Into Mistik Rehber Chat Route

**File:** Find with `grep -rn "buildSystemPrompt" src/`

- [ ] **Step 1: Find the chat API route**

```bash
grep -rn "buildSystemPrompt" "c:\Users\Administrator\Desktop\Falcı Bacı\src" --include="*.ts"
```

- [ ] **Step 2: Read the chat route file**

Read the file found in Step 1.

- [ ] **Step 3: Add `birth_chart_summary` to the profile spread passed to `buildSystemPrompt`**

Find where `buildSystemPrompt({...profile...})` is called. Add:
```ts
birth_chart_summary: (profile as any).birth_chart_summary ?? null,
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "c:\Users\Administrator\Desktop\Falcı Bacı" && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Test end-to-end**

1. Calculate birth chart while logged in
2. Open Mistik Rehber chat with any guide
3. Ask: "Benim dominant elementim ne?"
4. Guide should reference the element from the birth chart naturally

- [ ] **Step 6: Commit**

```bash
git add src/app/api/mistik-rehber/
git commit -m "feat(mistik-rehber): wire birth_chart_summary into guide system prompt"
```

---

## Final Verification Checklist

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] Element balance % values sum to ~100
- [ ] Stellium detection works (3+ planets same sign)
- [ ] Applying/separating labels are correct
- [ ] After chart calculation for logged-in user: `profiles.birth_chart_summary` is populated in Supabase
- [ ] `memories` table has `category: "astroloji"` rows for all 5 guides
- [ ] Mistik Rehber references birth chart data in conversation
- [ ] All 5 tabs render correctly on mobile (375px viewport)
- [ ] Rate limiter works on `/api/birth-chart/interpret`
