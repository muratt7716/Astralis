# Horary Astroloji Modülü — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/horary` sayfasına bağımsız bir horary astroloji modülü ekle — gerçek gezegen hesabı, Lilly kuralları, 5 bölüm AI yorum, 5 dil desteği.

**Architecture:** Mevcut `astrology.ts` math fonksiyonları baz alınarak `src/lib/horary/` altında üç lib dosyası oluşturulur (`engine.ts`, `rules.ts`, `prompt.ts`). API route `/api/horary` hesap + AI yorumu döner. Frontend `page.tsx` harita wheel + 5 kart gösterir. Harici paket eklenmez — mevcut matematik yeterlidir.

**Tech Stack:** Next.js 15, TypeScript, Gemini AI (`callGeminiWithFallback`), Framer Motion, SVG (wheel), Tailwind CSS, mevcut locale sistemi

---

## Dosya Haritası

| Dosya | Durum | Sorumluluk |
|---|---|---|
| `src/lib/horary/engine.ts` | Yeni | Regiomontanus ev hesabı, 7 klasik gezegen, HoraryChart tipi |
| `src/lib/horary/rules.ts` | Yeni | Strictures, dignities, significators, aspects, timing |
| `src/lib/horary/prompt.ts` | Yeni | Gemini prompt şablonları (5 bölüm, 5 dil) |
| `src/app/api/horary/route.ts` | Yeni | POST handler — hesap + AI yorum |
| `src/components/horary/HoraryChartWheel.tsx` | Yeni | SVG harita wheel (horary varyantı) |
| `src/app/horary/page.tsx` | Yeni | Soru formu + yükleme + sonuç (5 kart) |
| `src/locales/tr.ts` | Değiştirildi | `horary.*` key'leri eklenir |
| `src/locales/en.ts` | Değiştirildi | `horary.*` key'leri eklenir |
| `src/locales/ar.ts` | Değiştirildi | `horary.*` key'leri eklenir |
| `src/locales/de.ts` | Değiştirildi | `horary.*` key'leri eklenir |
| `src/locales/fr.ts` | Değiştirildi | `horary.*` key'leri eklenir |

---

## Task 1: engine.ts — Gezegen Hesabı ve Regiomontanus Evler

**Files:**
- Create: `src/lib/horary/engine.ts`

- [ ] **Step 1: Dosyayı oluştur**

```typescript
// src/lib/horary/engine.ts

const SIGN_IDS = [
  "koc","boga","ikizler","yengec","aslan","basak",
  "terazi","akrep","yay","oglak","kova","balik"
] as const;
export type SignId = typeof SIGN_IDS[number];

export interface HoraryPlanet {
  id: string;
  name: string;
  emoji: string;
  longitude: number;      // 0-360 ekliptik boylamı
  signId: SignId;
  signDegree: number;     // 0-30 burç içi derece
  house: number;          // 1-12
  retrograde: boolean;
  dailyMotion: number;    // günlük hareket (derece)
  combust: boolean;       // Güneş'e 8.5° içinde
  cazimi: boolean;        // Güneş'e 0.283° içinde
  underSunbeams: boolean; // Güneş'e 17° içinde
}

export interface HoraryHouse {
  house: number;
  longitude: number;  // kuspis 0-360
  signId: SignId;
  signDegree: number;
  rulerId: string;    // geleneksel ev yöneticisi
}

export interface HoraryChart {
  timestamp: Date;
  latitude: number;
  longitude: number;
  planets: HoraryPlanet[];
  houses: HoraryHouse[];
  ascendantLongitude: number;
  mcLongitude: number;
}

// ─── Math helpers ────────────────────────────────────────────
function toRad(d: number) { return d * Math.PI / 180; }
function toDeg(r: number) { return r * 180 / Math.PI; }
function mod(x: number, m: number) { return ((x % m) + m) % m; }

function julianDay(date: Date): number {
  const y0 = date.getUTCFullYear();
  const m0 = date.getUTCMonth() + 1;
  const d0 = date.getUTCDate();
  const h  = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  let y = y0, m = m0;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d0 + h / 24 + B - 1524.5;
}

function obliquity(jd: number): number {
  const T = (jd - 2451545) / 36525;
  return 23.4393 - 0.013 * T;
}

function sunLong(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L0 = mod(280.46646 + 36000.76983 * T, 360);
  const M  = mod(357.52911 + 35999.05029 * T, 360);
  const C  = (1.914602 - 0.004817 * T) * Math.sin(toRad(M))
           + (0.019993 - 0.000101 * T) * Math.sin(2 * toRad(M))
           + 0.000289 * Math.sin(3 * toRad(M));
  return mod(L0 + C, 360);
}

function moonLong(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L  = mod(218.3165 + 481267.8813 * T, 360);
  const D  = mod(297.8502 + 445267.1115 * T, 360);
  const M  = mod(134.9634 + 477198.8676 * T, 360);
  const Ms = mod(357.5291 +  35999.0503 * T, 360);
  const F  = mod( 93.272  + 483202.0175 * T, 360);
  return mod(
    L + 6.289  * Math.sin(toRad(M))
      + 1.274  * Math.sin(toRad(2*D - M))
      + 0.658  * Math.sin(toRad(2*D))
      + 0.214  * Math.sin(toRad(2*M))
      - 0.186  * Math.sin(toRad(Ms))
      - 0.114  * Math.sin(toRad(2*F))
      + 0.059  * Math.sin(toRad(2*D - 2*M))
      + 0.057  * Math.sin(toRad(2*D - Ms - M))
      + 0.053  * Math.sin(toRad(2*D + M))
      + 0.046  * Math.sin(toRad(2*D - Ms))
      - 0.041  * Math.sin(toRad(Ms - M)),
    360
  );
}

function planetaryLong(
  jd: number, L0: number, L1: number,
  M0: number, M1: number, e: number
): number {
  const T = (jd - 2451545) / 36525;
  const L = mod(L0 + L1 * T, 360);
  const M = mod(M0 + M1 * T, 360);
  const Mrad = toRad(M);
  const C = (2*e - e**3/4) * Math.sin(Mrad)
          + (5/4 * e**2)   * Math.sin(2*Mrad)
          + (13/12 * e**3) * Math.sin(3*Mrad);
  return mod(L + toDeg(C), 360);
}

function allPlanetLongs(jd: number): Record<string, number> {
  const T  = (jd - 2451545) / 36525;
  const sun  = sunLong(jd);
  const moon = moonLong(jd);

  const mercL   = planetaryLong(jd, 252.2509, 149472.6746, 174.7948, 149472.5153, 0.2056);
  const mercury = mod(mercL + 0.415 * Math.sin(toRad(mod(34.351 + 3034.9057*T, 360) - mercL)), 360);

  const venus = planetaryLong(jd, 181.9798, 58517.8157, 50.4161, 58517.8039, 0.0068);

  const marsL = planetaryLong(jd, 355.433, 19140.2993, 19.373, 19139.8585, 0.0934);
  const mars  = mod(marsL + 0.658 * Math.sin(toRad(mod(34.351 + 3034.9057*T, 360) - marsL)), 360);

  const jupM    = mod(20.020 + 3034.6957*T, 360);
  const jupiter = mod(34.351 + 3034.9057*T + 5.55 * Math.sin(toRad(jupM)), 360);

  const satM   = mod(317.021 + 1222.1138*T, 360);
  const saturn = mod(50.077  + 1222.1138*T + 6.40 * Math.sin(toRad(satM)), 360);

  return { sun, moon, mercury, venus, mars, jupiter, saturn };
}

function ramc(jd: number, geoLng: number): number {
  const T = (jd - 2451545) / 36525;
  const gmst = 280.46061837 + 360.98564736629*(jd - 2451545)
             + 0.000387933*T*T - T**3/38710000;
  return mod(gmst + geoLng, 360);
}

function mcLong(ramcDeg: number, eps: number): number {
  const ra = toRad(ramcDeg), e = toRad(eps);
  return mod(toDeg(Math.atan2(Math.sin(ra), Math.cos(ra) * Math.cos(e))), 360);
}

/**
 * Regiomontanus house cusp formula (Lilly standard):
 * tan(λ) = sin(θ) / (cos(θ)·cos(ε) − tan(φ)·sin(ε))
 * where θ = RAMC + (houseNum − 10) × 30°
 */
function regiomontanusCusp(houseNum: number, ramcDeg: number, eps: number, lat: number): number {
  const thetaDeg = mod(ramcDeg + (houseNum - 10) * 30, 360);
  const theta = toRad(thetaDeg);
  const e     = toRad(eps);
  const phi   = toRad(lat);
  const y = Math.sin(theta);
  const x = Math.cos(theta) * Math.cos(e) - Math.tan(phi) * Math.sin(e);
  let lambda = mod(toDeg(Math.atan2(y, x)), 360);
  // Quadrant fix: lambda must be in same ecliptic half as theta
  const tNorm = mod(thetaDeg, 360);
  if (tNorm >= 180 && lambda < 180) lambda += 180;
  else if (tNorm < 180 && lambda >= 180) lambda -= 180;
  return mod(lambda, 360);
}

function longToSign(long: number): { signId: SignId; signDegree: number } {
  const norm = mod(long, 360);
  const idx  = Math.floor(norm / 30);
  return { signId: SIGN_IDS[idx], signDegree: norm % 30 };
}

function getPlanetHouse(pLong: number, houses: HoraryHouse[]): number {
  const sorted = [...houses].sort((a, b) => a.house - b.house);
  const norm = mod(pLong, 360);
  for (let i = 0; i < 12; i++) {
    const curr = sorted[i].longitude;
    const next = sorted[(i + 1) % 12].longitude;
    if (curr <= next) {
      if (norm >= curr && norm < next) return sorted[i].house;
    } else {
      if (norm >= curr || norm < next) return sorted[i].house;
    }
  }
  return 1;
}

function isRetrograde(jd: number, key: string): boolean {
  const p1 = allPlanetLongs(jd)[key];
  const p2 = allPlanetLongs(jd + 1)[key];
  let diff = p2 - p1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function getDailyMotion(jd: number, key: string): number {
  const p1 = allPlanetLongs(jd)[key];
  const p2 = allPlanetLongs(jd + 1)[key];
  let diff = p2 - p1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return Math.abs(diff);
}

const PLANET_META: Record<string, { name: string; emoji: string }> = {
  sun:     { name: "Güneş",   emoji: "☀️" },
  moon:    { name: "Ay",      emoji: "🌙" },
  mercury: { name: "Merkür",  emoji: "☿"  },
  venus:   { name: "Venüs",   emoji: "♀"  },
  mars:    { name: "Mars",    emoji: "♂"  },
  jupiter: { name: "Jüpiter", emoji: "♃"  },
  saturn:  { name: "Satürn",  emoji: "♄"  },
};

const TRAD_RULERS: Record<string, string> = {
  koc:"mars",   boga:"venus",   ikizler:"mercury", yengec:"moon",
  aslan:"sun",  basak:"mercury",terazi:"venus",    akrep:"mars",
  yay:"jupiter",oglak:"saturn", kova:"saturn",     balik:"jupiter",
};

// ─── Main export ─────────────────────────────────────────────
export function computeHoraryChart(lat: number, lng: number, now: Date = new Date()): HoraryChart {
  const jd  = julianDay(now);
  const eps = obliquity(jd);
  const r   = ramc(jd, lng);
  const longs = allPlanetLongs(jd);
  const sunL  = longs.sun;

  // Build Regiomontanus houses
  const houses: HoraryHouse[] = [];
  for (let h = 1; h <= 12; h++) {
    let cusp: number;
    if      (h === 10) cusp = mcLong(r, eps);
    else if (h === 4)  cusp = mod(mcLong(r, eps) + 180, 360);
    else               cusp = regiomontanusCusp(h, r, eps, lat);
    const { signId, signDegree } = longToSign(cusp);
    houses.push({ house: h, longitude: cusp, signId, signDegree, rulerId: TRAD_RULERS[signId] });
  }
  // Recalculate ASC/DSC correctly
  const ascCusp = regiomontanusCusp(1, r, eps, lat);
  houses[0].longitude = ascCusp;
  Object.assign(houses[0], longToSign(ascCusp));
  houses[0].rulerId = TRAD_RULERS[houses[0].signId];
  houses[6].longitude = mod(ascCusp + 180, 360);
  Object.assign(houses[6], longToSign(houses[6].longitude));
  houses[6].rulerId = TRAD_RULERS[houses[6].signId];

  // Build planets
  const planets: HoraryPlanet[] = Object.entries(longs).map(([id, long]) => {
    const { signId, signDegree } = longToSign(long);
    const house       = getPlanetHouse(long, houses);
    const retrograde  = id !== "sun" && id !== "moon" ? isRetrograde(jd, id) : false;
    const dailyMotion = getDailyMotion(jd, id);

    let combust = false, cazimi = false, underSunbeams = false;
    if (id !== "sun") {
      let diff = mod(long - sunL + 180, 360) - 180;
      const abs = Math.abs(diff);
      cazimi        = abs <= 0.283;
      combust       = !cazimi && abs <= 8.5;
      underSunbeams = !cazimi && !combust && abs <= 17;
    }

    return {
      id, ...PLANET_META[id],
      longitude: long, signId, signDegree, house,
      retrograde, dailyMotion, combust, cazimi, underSunbeams,
    };
  });

  return {
    timestamp: now, latitude: lat, longitude: lng,
    planets, houses,
    ascendantLongitude: ascCusp,
    mcLongitude: mcLong(r, eps),
  };
}
```

- [ ] **Step 2: Build doğrulama — TypeScript hata yok mu kontrol et**

```bash
cd "c:/Users/Administrator/Desktop/Falcı Bacı"
npx tsc --noEmit --skipLibCheck 2>&1 | grep "horary/engine"
```

Beklenen çıktı: boş (hata yok)

- [ ] **Step 3: Commit**

```bash
git add src/lib/horary/engine.ts
git commit -m "feat(horary): add chart engine with Regiomontanus houses and 7 classical planets"
```

---

## Task 2: rules.ts — Lilly Kuralları

**Files:**
- Create: `src/lib/horary/rules.ts`

- [ ] **Step 1: Dosyayı oluştur**

```typescript
// src/lib/horary/rules.ts
import type { HoraryChart, HoraryPlanet, HoraryHouse, SignId } from "./engine";

// ─── Types ───────────────────────────────────────────────────
export interface Stricture {
  type: "earlyAsc" | "lateAsc" | "voc" | "viaCombusta" | "saturnIn7";
  severity: "warning" | "info";
  messageKey: string;   // i18n key
  detail: string;       // raw English for AI prompt
}

export type DignityLevel =
  | "domicile" | "exaltation" | "triplicity"
  | "term" | "face" | "peregrine" | "detriment" | "fall";

export interface EssentialDignity {
  level: DignityLevel;
  score: number;  // +5 → -5
}

export interface AccidentalStrength {
  houseStrength: "angular" | "succedent" | "cadent";
  isRetrograde: boolean;
  isCombust: boolean;
  isCazimi: boolean;
  isUnderSunbeams: boolean;
}

export interface Significator {
  role: "querent" | "quesited";
  planet: HoraryPlanet;
  house: number;
  essentialDignity: EssentialDignity;
  accidentalStrength: AccidentalStrength;
}

export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface KeyAspect {
  planet1Id: string;
  planet2Id: string;
  type: AspectType;
  angleDiff: number;   // degrees to exact
  applying: boolean;
  willPerfect: boolean;
}

export interface TimingEstimate {
  value: number;
  unit: "days" | "weeks" | "months" | "years";
}

export type QuestionCategory =
  | "relationship" | "career" | "money" | "health"
  | "property" | "travel" | "legal" | "child" | "lost" | "general";

export interface HoraryAnalysis {
  strictures: Stricture[];
  questionCategory: QuestionCategory;
  questionHouse: number;
  querent: Significator;
  moon: HoraryPlanet;
  quesited: Significator;
  keyAspect: KeyAspect | null;
  timing: TimingEstimate | null;
}

// ─── Essential dignity tables (Lilly / Ptolemaic) ────────────
const DOMICILE: Record<string, string[]> = {
  sun:     ["aslan"],
  moon:    ["yengec"],
  mercury: ["ikizler","basak"],
  venus:   ["boga","terazi"],
  mars:    ["koc","akrep"],
  jupiter: ["yay","balik"],
  saturn:  ["oglak","kova"],
};

const EXALTATION: Record<string, string> = {
  sun:"koc", moon:"boga", mercury:"basak", venus:"balik",
  mars:"oglak", jupiter:"yengec", saturn:"terazi",
};

const DETRIMENT: Record<string, string[]> = {
  sun:["kova"], moon:["oglak"], mercury:["yay","balik"],
  venus:["koc","akrep"], mars:["terazi","boga"],
  jupiter:["ikizler","basak"], saturn:["yengec","aslan"],
};

const FALL: Record<string, string> = {
  sun:"terazi", moon:"akrep", mercury:"balik", venus:"basak",
  mars:"yengec", jupiter:"oglak", saturn:"koc",
};

const SIGN_ELEMENT: Record<string, string> = {
  koc:"fire", aslan:"fire", yay:"fire",
  boga:"earth", basak:"earth", oglak:"earth",
  ikizler:"air", terazi:"air", kova:"air",
  yengec:"water", akrep:"water", balik:"water",
};

const TRIPLICITY: Record<string, string[]> = {
  fire:["sun","jupiter"], earth:["venus","moon"],
  air:["saturn","mercury"], water:["mars","moon"],
};

// Ptolemaic terms (Lilly, Christian Astrology)
const TERMS: Record<string, Array<{ruler:string;to:number}>> = {
  koc:     [{ruler:"jupiter",to:6},{ruler:"venus",to:12},{ruler:"mercury",to:20},{ruler:"mars",to:25},{ruler:"saturn",to:30}],
  boga:    [{ruler:"venus",to:8},{ruler:"mercury",to:14},{ruler:"jupiter",to:22},{ruler:"saturn",to:27},{ruler:"mars",to:30}],
  ikizler: [{ruler:"mercury",to:7},{ruler:"jupiter",to:14},{ruler:"venus",to:21},{ruler:"mars",to:25},{ruler:"saturn",to:30}],
  yengec:  [{ruler:"mars",to:6},{ruler:"jupiter",to:13},{ruler:"mercury",to:20},{ruler:"venus",to:27},{ruler:"saturn",to:30}],
  aslan:   [{ruler:"saturn",to:6},{ruler:"mercury",to:13},{ruler:"venus",to:19},{ruler:"jupiter",to:25},{ruler:"mars",to:30}],
  basak:   [{ruler:"mercury",to:7},{ruler:"venus",to:13},{ruler:"jupiter",to:18},{ruler:"saturn",to:24},{ruler:"mars",to:30}],
  terazi:  [{ruler:"saturn",to:6},{ruler:"venus",to:11},{ruler:"jupiter",to:19},{ruler:"mercury",to:24},{ruler:"mars",to:30}],
  akrep:   [{ruler:"mars",to:7},{ruler:"venus",to:11},{ruler:"mercury",to:19},{ruler:"jupiter",to:24},{ruler:"saturn",to:30}],
  yay:     [{ruler:"jupiter",to:8},{ruler:"venus",to:14},{ruler:"mercury",to:19},{ruler:"saturn",to:25},{ruler:"mars",to:30}],
  oglak:   [{ruler:"mercury",to:7},{ruler:"jupiter",to:14},{ruler:"venus",to:22},{ruler:"saturn",to:26},{ruler:"mars",to:30}],
  kova:    [{ruler:"mercury",to:7},{ruler:"venus",to:13},{ruler:"jupiter",to:20},{ruler:"mars",to:25},{ruler:"saturn",to:30}],
  balik:   [{ruler:"venus",to:8},{ruler:"jupiter",to:14},{ruler:"mercury",to:20},{ruler:"mars",to:26},{ruler:"saturn",to:30}],
};

const FACE_ORDER = ["mars","sun","venus","mercury","moon","saturn","jupiter"];
const SIGN_INDEX: Record<string,number> = {
  koc:0,boga:1,ikizler:2,yengec:3,aslan:4,basak:5,
  terazi:6,akrep:7,yay:8,oglak:9,kova:10,balik:11
};

function getFaceRuler(signId: string, degree: number): string {
  const face = Math.floor(degree / 10);
  return FACE_ORDER[((SIGN_INDEX[signId] || 0) * 3 + face) % 7];
}

export function getEssentialDignity(planetId: string, signId: string, degree: number): EssentialDignity {
  if (DOMICILE[planetId]?.includes(signId))  return { level: "domicile",   score: 5  };
  if (EXALTATION[planetId] === signId)        return { level: "exaltation", score: 4  };
  if (DETRIMENT[planetId]?.includes(signId)) return { level: "detriment",  score: -5 };
  if (FALL[planetId] === signId)              return { level: "fall",       score: -4 };
  const el = SIGN_ELEMENT[signId];
  if (el && TRIPLICITY[el]?.includes(planetId)) return { level: "triplicity", score: 3 };
  const terms = TERMS[signId] || [];
  let from = 0;
  for (const t of terms) {
    if (degree >= from && degree < t.to && t.ruler === planetId) return { level: "term", score: 2 };
    from = t.to;
  }
  if (getFaceRuler(signId, degree) === planetId) return { level: "face", score: 1 };
  return { level: "peregrine", score: 0 };
}

export function getAccidentalStrength(planet: HoraryPlanet): AccidentalStrength {
  const houseStrength =
    [1,4,7,10].includes(planet.house) ? "angular"  :
    [2,5,8,11].includes(planet.house) ? "succedent" : "cadent";
  return {
    houseStrength,
    isRetrograde:    planet.retrograde,
    isCombust:       planet.combust,
    isCazimi:        planet.cazimi,
    isUnderSunbeams: planet.underSunbeams,
  };
}

// ─── Question detection ──────────────────────────────────────
const CATEGORY_PATTERNS: Array<[QuestionCategory, RegExp]> = [
  ["relationship", /sevgil|evlil|evli|partner|aşk|ilişki|nikah|boşan|nişan|wife|husband|marriage|love|partner/i],
  ["career",       /iş|kariyer|terfi|işe|işten|meslek|çalış|görev|pozisyon|job|work|career|promotion/i],
  ["money",        /para|borç|gelir|maaş|satış|kira|kredi|ödeme|kazanç|money|debt|salary|financial/i],
  ["health",       /sağlık|hasta|ameliyat|iyileş|tedavi|doktor|hastalık|health|illness|surgery|recover/i],
  ["property",     /ev|daire|mülk|arsa|gayrimenkul|house|property|apartment|real estate/i],
  ["travel",       /seyahat|yolculuk|gitmek|taşınmak|vize|uçuş|travel|journey|trip|move/i],
  ["legal",        /dava|mahkeme|hukuk|avukat|anlaşmazlık|legal|lawsuit|court|attorney/i],
  ["child",        /çocuk|bebek|hamile|doğum|gebelik|child|baby|pregnant|pregnancy/i],
  ["lost",         /kayıp|kaybet|bulamıyor|nerede|çalındı|lost|missing|stolen|find/i],
];

export function detectCategory(question: string): QuestionCategory {
  for (const [cat, re] of CATEGORY_PATTERNS) {
    if (re.test(question)) return cat;
  }
  return "general";
}

export function getQuestionHouse(cat: QuestionCategory): number {
  const map: Record<QuestionCategory, number> = {
    relationship:7, career:10, money:2, health:6,
    property:4, travel:9, legal:7, child:5, lost:2, general:1,
  };
  return map[cat];
}

// ─── Strictures ──────────────────────────────────────────────
const PLANET_ORBS: Record<string, number> = {
  sun:10, moon:10, mercury:7, venus:8, mars:9, jupiter:8, saturn:9
};
const ASPECT_ANGLES = [0, 60, 90, 120, 180];

function mod360(x: number) { return ((x % 360) + 360) % 360; }

function moonIsVOC(moon: HoraryPlanet, planets: HoraryPlanet[]): boolean {
  const degsLeft = 30 - moon.signDegree;
  for (const planet of planets) {
    if (planet.id === "moon") continue;
    for (const angle of ASPECT_ANGLES) {
      const diff = mod360(planet.longitude - moon.longitude);
      const toExact = Math.min(diff, 360 - diff);
      if (Math.abs(toExact - angle) < (PLANET_ORBS[planet.id] || 8)) {
        // Check applying: Moon moves faster, moving toward aspect
        const futDiff = mod360(planet.longitude - mod360(moon.longitude + 0.5));
        const futToExact = Math.min(futDiff, 360 - futDiff);
        if (futToExact < toExact && toExact <= degsLeft) return false;
      }
    }
  }
  return true;
}

export function checkStrictures(chart: HoraryChart): Stricture[] {
  const result: Stricture[] = [];
  const asc   = chart.houses[0];
  const moon  = chart.planets.find(p => p.id === "moon")!;
  const saturn= chart.planets.find(p => p.id === "saturn")!;

  if (asc.signDegree < 3)
    result.push({ type:"earlyAsc",  severity:"warning", messageKey:"horary.stricture.earlyAsc",
      detail:`ASC at ${asc.signDegree.toFixed(1)}° — too early, situation not yet formed` });
  if (asc.signDegree > 27)
    result.push({ type:"lateAsc",   severity:"warning", messageKey:"horary.stricture.lateAsc",
      detail:`ASC at ${asc.signDegree.toFixed(1)}° — late in sign, matter may be decided` });
  if (moonIsVOC(moon, chart.planets))
    result.push({ type:"voc",        severity:"warning", messageKey:"horary.stricture.voc",
      detail:"Moon Void of Course — nothing will come of the matter (consider context)" });

  const moonLong = moon.longitude;
  if (moonLong >= 195 && moonLong <= 225) // 15° Libra to 15° Scorpio
    result.push({ type:"viaCombusta",severity:"warning", messageKey:"horary.stricture.viaCombusta",
      detail:"Moon in Via Combusta (15° Libra – 15° Scorpio) — chart is unreliable" });
  if (saturn.house === 7)
    result.push({ type:"saturnIn7", severity:"info",    messageKey:"horary.stricture.saturnIn7",
      detail:"Saturn in 7th — traditional warning about astrologer's judgment" });

  return result;
}

// ─── Significators ───────────────────────────────────────────
const TRAD_RULERS: Record<string, string> = {
  koc:"mars",   boga:"venus",   ikizler:"mercury", yengec:"moon",
  aslan:"sun",  basak:"mercury",terazi:"venus",    akrep:"mars",
  yay:"jupiter",oglak:"saturn", kova:"saturn",     balik:"jupiter",
};

function getHouseRuler(house: HoraryHouse, planets: HoraryPlanet[]): HoraryPlanet {
  const id = TRAD_RULERS[house.signId] || "sun";
  return planets.find(p => p.id === id) || planets[0];
}

// ─── Aspect detection ────────────────────────────────────────
const ASPECT_NAMES: Record<number, AspectType> = {
  0:"conjunction", 60:"sextile", 90:"square", 120:"trine", 180:"opposition"
};

export function findKeyAspect(sig1: HoraryPlanet, sig2: HoraryPlanet): KeyAspect | null {
  const orb = Math.min(PLANET_ORBS[sig1.id]||8, PLANET_ORBS[sig2.id]||8);
  const faster = sig1.dailyMotion >= sig2.dailyMotion ? sig1 : sig2;
  const slower  = faster === sig1 ? sig2 : sig1;

  for (const angle of ASPECT_ANGLES) {
    const diff = mod360(faster.longitude - slower.longitude);
    const toExact = Math.min(diff, 360 - diff);
    if (toExact <= orb) {
      const applying     = diff < 180 ? diff < angle + orb : (360 - diff) < angle + orb;
      const willPerfect  = applying && !faster.retrograde;
      return {
        planet1Id: sig1.id, planet2Id: sig2.id,
        type: ASPECT_NAMES[angle] || "conjunction",
        angleDiff: toExact, applying, willPerfect,
      };
    }
  }
  return null;
}

// ─── Timing ──────────────────────────────────────────────────
const SIGN_MODAL: Record<string,string> = {
  koc:"cardinal",yengec:"cardinal",terazi:"cardinal",oglak:"cardinal",
  boga:"fixed",  aslan:"fixed",   akrep:"fixed",    kova:"fixed",
  ikizler:"mutable",basak:"mutable",yay:"mutable",  balik:"mutable",
};

export function estimateTiming(aspect: KeyAspect, faster: HoraryPlanet): TimingEstimate | null {
  if (!aspect.applying || !aspect.willPerfect) return null;
  const days = aspect.angleDiff / (faster.dailyMotion || 1);
  const modal   = SIGN_MODAL[faster.signId];
  const angular = [1,4,7,10].includes(faster.house);

  let unit: TimingEstimate["unit"];
  if (modal === "cardinal" && angular)        unit = "days";
  else if (modal === "fixed" || !angular)     unit = days > 30 ? "months" : "weeks";
  else                                         unit = "weeks";

  const value = Math.max(1, Math.round(
    unit === "days" ? days : unit === "weeks" ? days/7 : days/30
  ));
  return { value, unit };
}

// ─── Main analysis function ──────────────────────────────────
export function analyzeHoraryChart(chart: HoraryChart, question: string): HoraryAnalysis {
  const strictures    = checkStrictures(chart);
  const cat           = detectCategory(question);
  const qHouse        = getQuestionHouse(cat);

  const asc1          = chart.houses[0];
  const querentPlanet = getHouseRuler(asc1, chart.planets);
  const moon          = chart.planets.find(p => p.id === "moon")!;
  const quesHouse     = chart.houses.find(h => h.house === qHouse) || chart.houses[0];
  const quesitedPlanet= getHouseRuler(quesHouse, chart.planets);

  const querent: Significator = {
    role: "querent", planet: querentPlanet, house: 1,
    essentialDignity:  getEssentialDignity(querentPlanet.id, querentPlanet.signId, querentPlanet.signDegree),
    accidentalStrength:getAccidentalStrength(querentPlanet),
  };
  const quesited: Significator = {
    role: "quesited", planet: quesitedPlanet, house: qHouse,
    essentialDignity:  getEssentialDignity(quesitedPlanet.id, quesitedPlanet.signId, quesitedPlanet.signDegree),
    accidentalStrength:getAccidentalStrength(quesitedPlanet),
  };

  const keyAspect = findKeyAspect(querentPlanet, quesitedPlanet);
  const faster = (querentPlanet.dailyMotion >= quesitedPlanet.dailyMotion) ? querentPlanet : quesitedPlanet;
  const timing  = keyAspect ? estimateTiming(keyAspect, faster) : null;

  return { strictures, questionCategory: cat, questionHouse: qHouse, querent, moon, quesited, keyAspect, timing };
}
```

- [ ] **Step 2: TypeScript kontrolü**

```bash
cd "c:/Users/Administrator/Desktop/Falcı Bacı"
npx tsc --noEmit --skipLibCheck 2>&1 | grep "horary/rules"
```

Beklenen çıktı: boş

- [ ] **Step 3: Commit**

```bash
git add src/lib/horary/rules.ts
git commit -m "feat(horary): add Lilly rules engine (strictures, dignities, significators, aspects, timing)"
```

---

## Task 3: prompt.ts — Gemini Prompt Şablonları

**Files:**
- Create: `src/lib/horary/prompt.ts`

- [ ] **Step 1: Dosyayı oluştur**

```typescript
// src/lib/horary/prompt.ts
import type { SupportedLanguage } from "@/lib/gemini";
import type { HoraryChart }       from "./engine";
import type { HoraryAnalysis, DignityLevel, TimingEstimate } from "./rules";

const LANG_NAMES: Record<SupportedLanguage, string> = {
  tr:"Türkçe", en:"English", ar:"العربية", de:"Deutsch", fr:"Français",
};

const DIGNITY_DESC: Record<DignityLevel, string> = {
  domicile:   "in its own sign — very strong, free to act",
  exaltation: "exalted — strong, acts proudly",
  triplicity: "in triplicity — moderately strong",
  term:       "in its term — minor strength",
  face:       "in its face — very weak strength",
  peregrine:  "peregrine — no essential dignity, unreliable",
  detriment:  "in detriment — weakened, in hostile territory",
  fall:       "in fall — weakened, humiliated",
};

function timingStr(t: TimingEstimate | null): string {
  if (!t) return "timing unclear — no perfecting aspect found";
  return `approximately ${t.value} ${t.unit}`;
}

function stricturesStr(analysis: HoraryAnalysis): string {
  if (!analysis.strictures.length) return "No strictures present. Chart is radical and readable.";
  return analysis.strictures.map(s => `⚠ ${s.detail}`).join("\n");
}

export function buildHoraryPrompt(
  question: string,
  chart: HoraryChart,
  analysis: HoraryAnalysis,
  lang: SupportedLanguage
): string {
  const { querent, quesited, moon, keyAspect, timing, strictures } = analysis;
  const langName = LANG_NAMES[lang];
  const ts = chart.timestamp.toISOString();

  const chartContext = `
HORARY CHART DATA
=================
Question asked: "${question}"
Time of question (UTC): ${ts}
Location: ${chart.latitude.toFixed(2)}°N, ${chart.longitude.toFixed(2)}°E
House system: Regiomontanus | Planetary set: 7 classical planets (Lilly tradition)

ASCENDANT: ${chart.houses[0].signId.toUpperCase()} ${chart.houses[0].signDegree.toFixed(1)}°
MC: ${chart.houses[9].signId.toUpperCase()} ${chart.houses[9].signDegree.toFixed(1)}°

ALL PLANET POSITIONS:
${chart.planets.map(p =>
  `  ${p.name} (${p.id}): ${p.signId.toUpperCase()} ${p.signDegree.toFixed(1)}° | House ${p.house}${p.retrograde?" [R]":""}${p.combust?" [COMBUST]":""}${p.cazimi?" [CAZIMI]":""}`
).join("\n")}

STRICTURES:
${stricturesStr(analysis)}

QUERENT SIGNIFICATOR: ${querent.planet.name} (${querent.planet.id})
  Position: ${querent.planet.signId.toUpperCase()} ${querent.planet.signDegree.toFixed(1)}° | House ${querent.planet.house}
  Essential dignity: ${DIGNITY_DESC[querent.essentialDignity.level]} (score: ${querent.essentialDignity.score})
  Accidental: house=${querent.accidentalStrength.houseStrength}${querent.accidentalStrength.isRetrograde?", retrograde":""}${querent.accidentalStrength.isCombust?", combust":""}

MOON (co-significator of querent):
  ${moon.signId.toUpperCase()} ${moon.signDegree.toFixed(1)}° | House ${moon.house}${moon.retrograde?" [R]":""}

QUESITED SIGNIFICATOR (${analysis.questionCategory} → House ${analysis.questionHouse}): ${quesited.planet.name} (${quesited.planet.id})
  Position: ${quesited.planet.signId.toUpperCase()} ${quesited.planet.signDegree.toFixed(1)}° | House ${quesited.planet.house}
  Essential dignity: ${DIGNITY_DESC[quesited.essentialDignity.level]} (score: ${quesited.essentialDignity.score})
  Accidental: house=${quesited.accidentalStrength.houseStrength}${quesited.accidentalStrength.isRetrograde?", retrograde":""}${quesited.accidentalStrength.isCombust?", combust":""}

KEY ASPECT BETWEEN SIGNIFICATORS:
${keyAspect
  ? `  ${keyAspect.planet1Id} ${keyAspect.type} ${keyAspect.planet2Id} | ${keyAspect.angleDiff.toFixed(1)}° to exact | applying=${keyAspect.applying} | will perfect=${keyAspect.willPerfect}`
  : "  No major aspect between significators within orb."}

TIMING ESTIMATE: ${timingStr(timing)}
`;

  return `You are a master horary astrologer working in the tradition of William Lilly (Christian Astrology, 1647) and John Frawley (The Horary Textbook, 2014). You have been given a fully calculated horary chart with all significator data already computed. Your task is to deliver a deep, structured, expert reading.

${chartContext}

STRICT RULES:
- Write ONLY in ${langName}. Every word must be in ${langName}.
- DO NOT use filler phrases like "certainly", "of course", "as we can see". Every sentence must carry unique insight.
- Base your reasoning on the provided chart data above — do NOT invent planet positions.
- Follow Lilly's tradition: use the 7 classical planets only, interpret applying aspects, respect the dignity scores.
- You MUST produce ONLY valid JSON. No text before or after the JSON object.

Produce a JSON object with exactly these 5 keys. Each value is a string. Use \\n for line breaks within strings.

{
  "section1": "HARITANIN İLK SESİ — Write 2-3 paragraphs. Address: are there strictures? If yes, name each one specifically and explain what Lilly says about it. What is the general atmosphere of this chart? Is it radical (fit to be read)? Tone: observant, careful, like an expert studying a manuscript.",

  "section2": "SEN VE KONU — Write 2-3 paragraphs. Describe the querent significator in detail: which planet, what sign, what house, what is its essential dignity (use the score), what does this say about the querent's current state and power to act? Then describe the quesited significator the same way. Explain what each planet's condition reveals about the real-world situation. Tone: personal, explanatory, insightful.",

  "section3": "GEZEGENLER NE ANLATIYOR? — Write 2-3 paragraphs. Analyze the Moon: its sign, house, dignity, what its last and next aspects suggest about the flow of events. Then analyze the key aspect between the two significators: is it applying or separating? Will it perfect? Are there any planets that could translate light, collect light, or prohibit the aspect? What does this web of aspects tell us? Tone: analytical, step-by-step, like a master explaining their reasoning.",

  "section4": "CEVAP — Write 3-4 paragraphs minimum (at least 200 words). Start with a clear verdict: 'Evet', 'Hayır', 'Belirsiz', or 'Zaman İster'. Then justify the verdict deeply using the significator conditions, the aspect analysis, and any receptions. Address what must change for a yes/no. Be honest — if the chart shows difficulty, say so clearly. Tone: decisive, expert, honest, like a trusted advisor.",

  "section5": "ZAMAN VE TAVSİYE — Write 2 paragraphs. First paragraph: give the timing estimate (use the computed value: ${timingStr(timing)}) and explain the astrological basis for it (which planets, which signs, which houses determine the time unit). Second paragraph: give the querent a practical, grounded piece of advice based on what the chart shows — what should they do, what should they avoid, what to watch for. Tone: constructive, supportive, forward-looking."
}`;
}
```

- [ ] **Step 2: TypeScript kontrolü**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep "horary/prompt"
```

Beklenen: boş

- [ ] **Step 3: Commit**

```bash
git add src/lib/horary/prompt.ts
git commit -m "feat(horary): add 5-section Gemini prompt builder (Lilly/Frawley tradition)"
```

---

## Task 4: API Route

**Files:**
- Create: `src/app/api/horary/route.ts`

- [ ] **Step 1: Dizin oluştur ve dosyayı yaz**

```typescript
// src/app/api/horary/route.ts
import { NextRequest, NextResponse }        from "next/server";
import { checkRateLimit }                   from "@/lib/rate-limit";
import { callGeminiWithFallback, SupportedLanguage } from "@/lib/gemini";
import { supabaseAdmin }                    from "@/lib/supabase-admin";
import { computeHoraryChart }              from "@/lib/horary/engine";
import { analyzeHoraryChart }              from "@/lib/horary/rules";
import { buildHoraryPrompt }               from "@/lib/horary/prompt";

const SUPPORTED_LANGS: SupportedLanguage[] = ["tr","en","ar","de","fr"];

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(request);
  if (rl) return rl;

  try {
    const body = await request.json();
    const { question, latitude, longitude, language = "tr", userId } = body;

    const lang: SupportedLanguage = SUPPORTED_LANGS.includes(language) ? language : "tr";

    // Validation
    if (!question || question.trim().length < 5) {
      return NextResponse.json({ success: false, error: "Soru çok kısa." }, { status: 400 });
    }
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ success: false, error: "Konum bilgisi eksik." }, { status: 400 });
    }

    // 1. Compute chart for this exact moment
    const now   = new Date();
    const chart = computeHoraryChart(latitude, longitude, now);

    // 2. Apply Lilly rules
    const analysis = analyzeHoraryChart(chart, question);

    // 3. Build prompt and call Gemini
    const prompt = buildHoraryPrompt(question, chart, analysis, lang);
    const aiText  = await callGeminiWithFallback(prompt);

    // 4. Parse JSON response
    let reading: Record<string, string> = {};
    try {
      const start = aiText.indexOf("{");
      const end   = aiText.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        reading = JSON.parse(aiText.substring(start, end + 1));
      }
    } catch {
      reading = { section4: aiText };
    }

    // 5. Optional logging
    if (userId) {
      supabaseAdmin.from("interaction_logs").insert({
        user_id:     userId,
        action_type: "horary",
        description: "Horary açılımı yapıldı.",
        metadata:    { question, answer: reading.section4?.slice(0, 200) },
      }).catch(console.error);
    }

    // 6. Serialize chart for frontend (only what's needed)
    const chartData = {
      timestamp:          chart.timestamp.toISOString(),
      ascendantLongitude: chart.ascendantLongitude,
      mcLongitude:        chart.mcLongitude,
      planets: chart.planets.map(p => ({
        id: p.id, name: p.name, emoji: p.emoji,
        longitude: p.longitude, signId: p.signId,
        signDegree: p.signDegree, house: p.house,
        retrograde: p.retrograde, combust: p.combust, cazimi: p.cazimi,
      })),
      houses: chart.houses.map(h => ({
        house: h.house, longitude: h.longitude,
        signId: h.signId, signDegree: h.signDegree, rulerId: h.rulerId,
      })),
    };

    return NextResponse.json({
      success: true,
      chartData,
      analysis: {
        strictures:       analysis.strictures,
        questionCategory: analysis.questionCategory,
        questionHouse:    analysis.questionHouse,
        querent: {
          planetId: analysis.querent.planet.id,
          planetName: analysis.querent.planet.name,
          signId: analysis.querent.planet.signId,
          signDegree: analysis.querent.planet.signDegree,
          house: analysis.querent.house,
          dignityLevel: analysis.querent.essentialDignity.level,
          dignityScore: analysis.querent.essentialDignity.score,
        },
        quesited: {
          planetId: analysis.quesited.planet.id,
          planetName: analysis.quesited.planet.name,
          signId: analysis.quesited.planet.signId,
          signDegree: analysis.quesited.planet.signDegree,
          house: analysis.quesited.questionHouse,
          dignityLevel: analysis.quesited.essentialDignity.level,
          dignityScore: analysis.quesited.essentialDignity.score,
        },
        timing: analysis.timing,
      },
      reading,
    });

  } catch (err) {
    console.error("[horary] route error:", err);
    return NextResponse.json({ success: false, error: "Horary analizi yapılamadı." }, { status: 500 });
  }
}
```

- [ ] **Step 2: TypeScript kontrolü**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep "api/horary"
```

Beklenen: boş

- [ ] **Step 3: Commit**

```bash
git add src/app/api/horary/route.ts
git commit -m "feat(horary): add API route — compute chart + Lilly analysis + Gemini reading"
```

---

## Task 5: i18n — 5 Locale Dosyasına Horary Key'leri Ekle

**Files:**
- Modify: `src/locales/tr.ts`, `en.ts`, `ar.ts`, `de.ts`, `fr.ts`

- [ ] **Step 1: tr.ts sonuna ekle**

`src/locales/tr.ts` dosyasının kapanış `}` parantezinden ÖNCE şu satırları ekle:

```typescript
  // ── Horary ──────────────────────────────────────────
  "horary.hero.title": "Horary — Anın Sorusunu Gökyüzüne Sor",
  "horary.hero.subtitle": "William Lilly (1647) geleneğiyle, sorunun sorulduğu anın haritası okunur. Soru gerçekse, gökyüzü cevaplar.",
  "horary.hero.tradition": "Lilly · Frawley · Barclay geleneği",
  "horary.form.question_label": "Sorunuzu yazın",
  "horary.form.question_placeholder": "Örn: Bu işi alabilecek miyim? O kişi beni seviyor mu? Nerede kayboldu?",
  "horary.form.location_label": "Bulunduğunuz şehir",
  "horary.form.submit": "Haritayı Aç",
  "horary.form.note": "Soru içten ve gerçek olmalı. Aynı soruyu tekrar sormak haritayı geçersiz kılar.",
  "horary.loading.step1": "Gezegenlerin koordinatları hesaplanıyor...",
  "horary.loading.step2": "Regiomontanus evleri çiziliyor...",
  "horary.loading.step3": "Lilly kuralları uygulanıyor...",
  "horary.loading.step4": "Yorum hazırlanıyor...",
  "horary.result.section1_title": "Haritanın İlk Sesi",
  "horary.result.section2_title": "Sen ve Konu",
  "horary.result.section3_title": "Gezegenler Ne Anlatıyor?",
  "horary.result.section4_title": "Cevap",
  "horary.result.section5_title": "Zaman ve Tavsiye",
  "horary.result.querent_label": "Seni temsil eden",
  "horary.result.quesited_label": "Konuyu temsil eden",
  "horary.result.stricture_ok": "Harita geçerli ve okunabilir",
  "horary.result.stricture_warning": "Uyarı",
  "horary.result.timing_label": "Tahmini süre",
  "horary.result.answer_yes": "Evet",
  "horary.result.answer_no": "Hayır",
  "horary.result.answer_unclear": "Belirsiz",
  "horary.result.footer_note": "Bu okuma William Lilly'nin Christian Astrology (1647) geleneğine dayanmaktadır.",
  "horary.result.new_question": "Yeni Soru Sor",
  "horary.stricture.earlyAsc": "Yükselen çok erken derecede — durum henüz olgunlaşmamış",
  "horary.stricture.lateAsc": "Yükselen geç derecede — konu zaten çözülmüş olabilir",
  "horary.stricture.voc": "Ay Boşlukta — sonuç belirsizleşebilir",
  "horary.stricture.viaCombusta": "Ay Via Combusta'da — harita güvenilirliği azalmış",
  "horary.stricture.saturnIn7": "Satürn 7. evde — yorumcu uyarısı",
  "horary.dignity.domicile": "Kendi burcunda",
  "horary.dignity.exaltation": "Yükselmede",
  "horary.dignity.triplicity": "Üçlü uyumda",
  "horary.dignity.term": "Teriminde",
  "horary.dignity.face": "Yüzünde",
  "horary.dignity.peregrine": "Yabancı",
  "horary.dignity.detriment": "Güçsüz (Zarar)",
  "horary.dignity.fall": "Düşüşte",
  "horary.days": "gün",
  "horary.weeks": "hafta",
  "horary.months": "ay",
  "horary.years": "yıl",
```

- [ ] **Step 2: en.ts sonuna ekle**

```typescript
  // ── Horary ──────────────────────────────────────────
  "horary.hero.title": "Horary — Ask the Sky Your Question",
  "horary.hero.subtitle": "In the tradition of William Lilly (1647), the chart of the moment the question is asked is read. If the question is sincere, the sky answers.",
  "horary.hero.tradition": "Lilly · Frawley · Barclay tradition",
  "horary.form.question_label": "Write your question",
  "horary.form.question_placeholder": "e.g. Will I get this job? Does he/she love me? Where is the lost item?",
  "horary.form.location_label": "Your city",
  "horary.form.submit": "Open the Chart",
  "horary.form.note": "The question must be sincere and personal. Asking the same question twice invalidates the chart.",
  "horary.loading.step1": "Calculating planetary coordinates...",
  "horary.loading.step2": "Drawing Regiomontanus houses...",
  "horary.loading.step3": "Applying Lilly's rules...",
  "horary.loading.step4": "Preparing interpretation...",
  "horary.result.section1_title": "The Chart's First Voice",
  "horary.result.section2_title": "You and the Matter",
  "horary.result.section3_title": "What the Planets Say",
  "horary.result.section4_title": "The Answer",
  "horary.result.section5_title": "Timing and Advice",
  "horary.result.querent_label": "Representing you",
  "horary.result.quesited_label": "Representing the matter",
  "horary.result.stricture_ok": "Chart is valid and readable",
  "horary.result.stricture_warning": "Warning",
  "horary.result.timing_label": "Estimated timing",
  "horary.result.answer_yes": "Yes",
  "horary.result.answer_no": "No",
  "horary.result.answer_unclear": "Unclear",
  "horary.result.footer_note": "This reading is based on the tradition of William Lilly's Christian Astrology (1647).",
  "horary.result.new_question": "Ask a New Question",
  "horary.stricture.earlyAsc": "Ascendant very early — situation not yet formed",
  "horary.stricture.lateAsc": "Ascendant late in sign — matter may already be decided",
  "horary.stricture.voc": "Moon Void of Course — outcome may come to nothing",
  "horary.stricture.viaCombusta": "Moon in Via Combusta — chart reliability reduced",
  "horary.stricture.saturnIn7": "Saturn in 7th — traditional warning about judgment",
  "horary.dignity.domicile": "In own sign",
  "horary.dignity.exaltation": "Exalted",
  "horary.dignity.triplicity": "In triplicity",
  "horary.dignity.term": "In term",
  "horary.dignity.face": "In face",
  "horary.dignity.peregrine": "Peregrine",
  "horary.dignity.detriment": "In detriment",
  "horary.dignity.fall": "In fall",
  "horary.days": "days",
  "horary.weeks": "weeks",
  "horary.months": "months",
  "horary.years": "years",
```

- [ ] **Step 3: ar.ts sonuna ekle**

```typescript
  // ── Horary ──────────────────────────────────────────
  "horary.hero.title": "الهوراري — اسأل السماء سؤالك",
  "horary.hero.subtitle": "في تقليد ويليام ليلي (١٦٤٧)، يُقرأ برج لحظة طرح السؤال. إذا كان السؤال صادقاً، تجيب السماء.",
  "horary.hero.tradition": "تقليد ليلي · فراولي · باركلي",
  "horary.form.question_label": "اكتب سؤالك",
  "horary.form.question_placeholder": "مثال: هل سأحصل على هذه الوظيفة؟ هل يحبني؟ أين الشيء المفقود؟",
  "horary.form.location_label": "مدينتك",
  "horary.form.submit": "افتح الخريطة",
  "horary.form.note": "يجب أن يكون السؤال صادقاً وشخصياً. طرح نفس السؤال مرتين يبطل الخريطة.",
  "horary.loading.step1": "حساب إحداثيات الكواكب...",
  "horary.loading.step2": "رسم بيوت ريجيومونتانوس...",
  "horary.loading.step3": "تطبيق قواعد ليلي...",
  "horary.loading.step4": "إعداد التفسير...",
  "horary.result.section1_title": "الصوت الأول للخريطة",
  "horary.result.section2_title": "أنت والموضوع",
  "horary.result.section3_title": "ما تقوله الكواكب",
  "horary.result.section4_title": "الجواب",
  "horary.result.section5_title": "التوقيت والنصيحة",
  "horary.result.querent_label": "يمثلك",
  "horary.result.quesited_label": "يمثل الموضوع",
  "horary.result.stricture_ok": "الخريطة صالحة وقابلة للقراءة",
  "horary.result.stricture_warning": "تحذير",
  "horary.result.timing_label": "التوقيت المقدر",
  "horary.result.answer_yes": "نعم",
  "horary.result.answer_no": "لا",
  "horary.result.answer_unclear": "غير واضح",
  "horary.result.footer_note": "هذه القراءة مبنية على تقليد ويليام ليلي في كتاب علم التنجيم المسيحي (١٦٤٧).",
  "horary.result.new_question": "اسأل سؤالاً جديداً",
  "horary.stricture.earlyAsc": "الطالع في درجة مبكرة جداً",
  "horary.stricture.lateAsc": "الطالع في درجة متأخرة",
  "horary.stricture.voc": "القمر فارغ من السير",
  "horary.stricture.viaCombusta": "القمر في منطقة الاحتراق",
  "horary.stricture.saturnIn7": "زحل في البيت السابع",
  "horary.dignity.domicile": "في بيته",
  "horary.dignity.exaltation": "في شرفه",
  "horary.dignity.triplicity": "في مثلثيته",
  "horary.dignity.term": "في حده",
  "horary.dignity.face": "في وجهه",
  "horary.dignity.peregrine": "غريب",
  "horary.dignity.detriment": "في وبال",
  "horary.dignity.fall": "في هبوطه",
  "horary.days": "أيام",
  "horary.weeks": "أسابيع",
  "horary.months": "أشهر",
  "horary.years": "سنوات",
```

- [ ] **Step 4: de.ts sonuna ekle**

```typescript
  // ── Horary ──────────────────────────────────────────
  "horary.hero.title": "Horary — Stelle dem Himmel deine Frage",
  "horary.hero.subtitle": "In der Tradition von William Lilly (1647) wird das Horoskop des Frageaugenblicks gedeutet. Ist die Frage aufrichtig, antwortet der Himmel.",
  "horary.hero.tradition": "Tradition: Lilly · Frawley · Barclay",
  "horary.form.question_label": "Deine Frage",
  "horary.form.question_placeholder": "z.B. Bekomme ich diese Stelle? Liebt er/sie mich? Wo ist das verlorene Objekt?",
  "horary.form.location_label": "Deine Stadt",
  "horary.form.submit": "Horoskop öffnen",
  "horary.form.note": "Die Frage muss aufrichtig und persönlich sein. Dieselbe Frage zweimal zu stellen macht das Horoskop ungültig.",
  "horary.loading.step1": "Planetenkoordinaten werden berechnet...",
  "horary.loading.step2": "Regiomontanus-Häuser werden gezeichnet...",
  "horary.loading.step3": "Lillys Regeln werden angewendet...",
  "horary.loading.step4": "Deutung wird vorbereitet...",
  "horary.result.section1_title": "Die erste Stimme des Horoskops",
  "horary.result.section2_title": "Du und die Sache",
  "horary.result.section3_title": "Was die Planeten sagen",
  "horary.result.section4_title": "Die Antwort",
  "horary.result.section5_title": "Timing und Rat",
  "horary.result.querent_label": "Dein Signifikator",
  "horary.result.quesited_label": "Signifikator der Sache",
  "horary.result.stricture_ok": "Horoskop ist gültig und lesbar",
  "horary.result.stricture_warning": "Warnung",
  "horary.result.timing_label": "Geschätzte Zeit",
  "horary.result.answer_yes": "Ja",
  "horary.result.answer_no": "Nein",
  "horary.result.answer_unclear": "Unklar",
  "horary.result.footer_note": "Diese Deutung basiert auf der Tradition von William Lillys Christian Astrology (1647).",
  "horary.result.new_question": "Neue Frage stellen",
  "horary.stricture.earlyAsc": "Aszendent sehr früh — Situation noch nicht reif",
  "horary.stricture.lateAsc": "Aszendent spät — Sache möglicherweise bereits entschieden",
  "horary.stricture.voc": "Mond ohne Anwendung — Ergebnis bleibt aus",
  "horary.stricture.viaCombusta": "Mond in Via Combusta — Zuverlässigkeit vermindert",
  "horary.stricture.saturnIn7": "Saturn im 7. Haus — Warnung für den Astrologen",
  "horary.dignity.domicile": "Im eigenen Zeichen",
  "horary.dignity.exaltation": "In Exaltation",
  "horary.dignity.triplicity": "In Triplicität",
  "horary.dignity.term": "In Term",
  "horary.dignity.face": "In Dekanat",
  "horary.dignity.peregrine": "Peregrin",
  "horary.dignity.detriment": "Im Detriment",
  "horary.dignity.fall": "Im Fall",
  "horary.days": "Tage",
  "horary.weeks": "Wochen",
  "horary.months": "Monate",
  "horary.years": "Jahre",
```

- [ ] **Step 5: fr.ts sonuna ekle**

```typescript
  // ── Horary ──────────────────────────────────────────
  "horary.hero.title": "Horary — Pose ta question au ciel",
  "horary.hero.subtitle": "Dans la tradition de William Lilly (1647), le thème du moment de la question est interprété. Si la question est sincère, le ciel répond.",
  "horary.hero.tradition": "Tradition Lilly · Frawley · Barclay",
  "horary.form.question_label": "Écris ta question",
  "horary.form.question_placeholder": "Ex: Vais-je obtenir ce poste ? M'aime-t-il/elle ? Où est l'objet perdu ?",
  "horary.form.location_label": "Ta ville",
  "horary.form.submit": "Ouvrir le thème",
  "horary.form.note": "La question doit être sincère et personnelle. Poser la même question deux fois invalide le thème.",
  "horary.loading.step1": "Calcul des coordonnées planétaires...",
  "horary.loading.step2": "Tracé des maisons Regiomontanus...",
  "horary.loading.step3": "Application des règles de Lilly...",
  "horary.loading.step4": "Préparation de l'interprétation...",
  "horary.result.section1_title": "La première voix du thème",
  "horary.result.section2_title": "Toi et la question",
  "horary.result.section3_title": "Ce que disent les planètes",
  "horary.result.section4_title": "La réponse",
  "horary.result.section5_title": "Timing et conseil",
  "horary.result.querent_label": "Te représente",
  "horary.result.quesited_label": "Représente la question",
  "horary.result.stricture_ok": "Thème valide et lisible",
  "horary.result.stricture_warning": "Avertissement",
  "horary.result.timing_label": "Délai estimé",
  "horary.result.answer_yes": "Oui",
  "horary.result.answer_no": "Non",
  "horary.result.answer_unclear": "Incertain",
  "horary.result.footer_note": "Cette lecture est basée sur la tradition de l'Astrologie Chrétienne de William Lilly (1647).",
  "horary.result.new_question": "Poser une nouvelle question",
  "horary.stricture.earlyAsc": "Ascendant très tôt — situation pas encore formée",
  "horary.stricture.lateAsc": "Ascendant tardif — la question est peut-être déjà résolue",
  "horary.stricture.voc": "Lune hors de course — résultat incertain",
  "horary.stricture.viaCombusta": "Lune en Via Combusta — fiabilité réduite",
  "horary.stricture.saturnIn7": "Saturne en maison 7 — avertissement traditionnel",
  "horary.dignity.domicile": "Dans son domicile",
  "horary.dignity.exaltation": "En exaltation",
  "horary.dignity.triplicity": "En triplicité",
  "horary.dignity.term": "En terme",
  "horary.dignity.face": "En face",
  "horary.dignity.peregrine": "Pérégrin",
  "horary.dignity.detriment": "En détriment",
  "horary.dignity.fall": "En chute",
  "horary.days": "jours",
  "horary.weeks": "semaines",
  "horary.months": "mois",
  "horary.years": "ans",
```

- [ ] **Step 6: Build kontrolü**

```bash
cd "c:/Users/Administrator/Desktop/Falcı Bacı"
npx tsc --noEmit --skipLibCheck 2>&1 | head -20
```

Beklenen: hata yok

- [ ] **Step 7: Commit**

```bash
git add src/locales/tr.ts src/locales/en.ts src/locales/ar.ts src/locales/de.ts src/locales/fr.ts
git commit -m "feat(horary): add i18n keys for all 5 languages"
```

---

## Task 6: HoraryChartWheel Komponenti

**Files:**
- Create: `src/components/horary/HoraryChartWheel.tsx`

- [ ] **Step 1: Klasörü oluştur ve dosyayı yaz**

```typescript
// src/components/horary/HoraryChartWheel.tsx
"use client";

import React, { useMemo } from "react";

interface Planet {
  id: string;
  name: string;
  emoji: string;
  longitude: number;
  signId: string;
  signDegree: number;
  house: number;
  retrograde: boolean;
  combust: boolean;
  cazimi: boolean;
}

interface House {
  house: number;
  longitude: number;
  signId: string;
  signDegree: number;
}

interface HoraryChartWheelProps {
  planets: Planet[];
  houses: House[];
  ascendantLongitude: number;
  mcLongitude: number;
  querentPlanetId: string;
  quesitedPlanetId: string;
  keyAspectPlanet1?: string;
  keyAspectPlanet2?: string;
}

const ZODIAC_SIGNS = [
  { id:"koc",     symbol:"♈", color:"#ef4444" },
  { id:"boga",    symbol:"♉", color:"#4ade80" },
  { id:"ikizler", symbol:"♊", color:"#60a5fa" },
  { id:"yengec",  symbol:"♋", color:"#60a5fa" },
  { id:"aslan",   symbol:"♌", color:"#fb923c" },
  { id:"basak",   symbol:"♍", color:"#84cc16" },
  { id:"terazi",  symbol:"♎", color:"#06b6d4" },
  { id:"akrep",   symbol:"♏", color:"#3b82f6" },
  { id:"yay",     symbol:"♐", color:"#ef4444" },
  { id:"oglak",   symbol:"♑", color:"#10b981" },
  { id:"kova",    symbol:"♒", color:"#0ea5e9" },
  { id:"balik",   symbol:"♓", color:"#2563eb" },
];

const SIGN_INDEX: Record<string,number> = Object.fromEntries(
  ZODIAC_SIGNS.map((s,i) => [s.id, i])
);

const SIZE = 500;
const CX = SIZE / 2, CY = SIZE / 2;
const R_OUTER = 220, R_ZODIAC = 195, R_INNER = 160, R_HOUSE = 140, R_PLANET = 115;

function toXY(longitude: number, asc: number, r: number) {
  // ASC is on the left (180° in screen coords)
  const visual = 180 - (longitude - asc);
  const rad = (visual * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function longToFull(signId: string, signDegree: number): number {
  return (SIGN_INDEX[signId] || 0) * 30 + signDegree;
}

export default function HoraryChartWheel({
  planets, houses, ascendantLongitude, mcLongitude,
  querentPlanetId, quesitedPlanetId,
  keyAspectPlanet1, keyAspectPlanet2,
}: HoraryChartWheelProps) {
  const asc = ascendantLongitude;

  // Zodiac band (12 × 30° slices)
  const zodiacSlices = useMemo(() => ZODIAC_SIGNS.map((sign, i) => {
    const startLong = i * 30;
    const endLong   = startLong + 30;
    const p1 = toXY(startLong, asc, R_OUTER);
    const p2 = toXY(endLong,   asc, R_OUTER);
    const p3 = toXY(endLong,   asc, R_ZODIAC);
    const p4 = toXY(startLong, asc, R_ZODIAC);
    const large = 0; // 30° < 180°
    const d = `M${p1.x},${p1.y} A${R_OUTER},${R_OUTER} 0 ${large},0 ${p2.x},${p2.y} L${p3.x},${p3.y} A${R_ZODIAC},${R_ZODIAC} 0 ${large},1 ${p4.x},${p4.y} Z`;
    const mid = toXY(startLong + 15, asc, (R_OUTER + R_ZODIAC) / 2);
    return { d, color: sign.color, symbol: sign.symbol, mid };
  }), [asc]);

  // House cusp lines
  const houseCuspLines = useMemo(() => houses.map(h => {
    const full = longToFull(h.signId, h.signDegree);
    const inner = toXY(full, asc, R_HOUSE);
    const outer = toXY(full, asc, R_ZODIAC);
    const isAngle = [1,4,7,10].includes(h.house);
    // Roman numeral position
    const numPos = toXY(full + 13, asc, (R_INNER + R_HOUSE) / 2);
    const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
    return { inner, outer, isAngle, numPos, label: ROMAN[h.house], house: h.house };
  }), [houses, asc]);

  // Planet positions with simple collision avoidance
  const planetDots = useMemo(() => {
    const dots = planets.map(p => {
      const full = longToFull(p.signId, p.signDegree);
      const pos  = toXY(full, asc, R_PLANET);
      const isSignificator = p.id === querentPlanetId || p.id === quesitedPlanetId;
      return { ...p, full, pos, isSignificator };
    });
    return dots;
  }, [planets, asc, querentPlanetId, quesitedPlanetId]);

  // Key aspect line
  const aspectLine = useMemo(() => {
    if (!keyAspectPlanet1 || !keyAspectPlanet2) return null;
    const p1 = planetDots.find(p => p.id === keyAspectPlanet1);
    const p2 = planetDots.find(p => p.id === keyAspectPlanet2);
    if (!p1 || !p2) return null;
    return { x1: p1.pos.x, y1: p1.pos.y, x2: p2.pos.x, y2: p2.pos.y };
  }, [planetDots, keyAspectPlanet1, keyAspectPlanet2]);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full max-w-[500px] mx-auto"
      style={{ fontFamily: "'Cinzel', serif" }}
    >
      {/* Background */}
      <circle cx={CX} cy={CY} r={R_OUTER + 5} fill="#0a0a1a" />

      {/* Zodiac slices */}
      {zodiacSlices.map((s, i) => (
        <g key={i}>
          <path d={s.d} fill={`${s.color}18`} stroke="#1e2a3a" strokeWidth="0.5" />
          <text
            x={s.mid.x} y={s.mid.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize="10" fill={s.color} opacity="0.8"
          >{s.symbol}</text>
        </g>
      ))}

      {/* Inner chart circle */}
      <circle cx={CX} cy={CY} r={R_ZODIAC} fill="none" stroke="#1e2a3a" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={R_HOUSE}  fill="none" stroke="#1e2a3a" strokeWidth="0.5" />
      <circle cx={CX} cy={CY} r={R_INNER}  fill="#0d1424" />

      {/* Key aspect line (pulsing amber) */}
      {aspectLine && (
        <line
          x1={aspectLine.x1} y1={aspectLine.y1}
          x2={aspectLine.x2} y2={aspectLine.y2}
          stroke="#c9a84c" strokeWidth="1.5" opacity="0.7"
          strokeDasharray="4 3"
        >
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" />
        </line>
      )}

      {/* House cusp lines */}
      {houseCuspLines.map((h, i) => (
        <g key={i}>
          <line
            x1={h.inner.x} y1={h.inner.y}
            x2={h.outer.x} y2={h.outer.y}
            stroke={h.isAngle ? "#c9a84c" : "#2a3a4a"}
            strokeWidth={h.isAngle ? 1.5 : 0.7}
          />
          {/* Roman numeral */}
          <text
            x={h.numPos.x} y={h.numPos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize="7" fill="#6b7a8a"
          >{h.label}</text>
        </g>
      ))}

      {/* Planets */}
      {planetDots.map((p) => (
        <g key={p.id}>
          {/* Significator glow ring */}
          {p.isSignificator && (
            <circle cx={p.pos.x} cy={p.pos.y} r="10"
              fill="none" stroke="#c9a84c" strokeWidth="1.5" opacity="0.6"
            >
              <animate attributeName="r" values="10;13;10" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
            </circle>
          )}
          {/* Combust indicator */}
          {p.combust && !p.cazimi && (
            <circle cx={p.pos.x} cy={p.pos.y} r="8"
              fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5" strokeDasharray="2 2"
            />
          )}
          {/* Planet dot */}
          <circle cx={p.pos.x} cy={p.pos.y} r="6"
            fill={p.isSignificator ? "#c9a84c22" : "#1a2535"}
            stroke={p.isSignificator ? "#c9a84c" : "#4a5a6a"}
            strokeWidth={p.isSignificator ? 1.5 : 0.8}
          />
          {/* Planet symbol */}
          <text
            x={p.pos.x} y={p.pos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize="8"
            fill={p.isSignificator ? "#c9a84c" : "#8a9aaa"}
          >
            {p.emoji}
          </text>
          {/* Retrograde marker */}
          {p.retrograde && (
            <text x={p.pos.x + 7} y={p.pos.y - 5} fontSize="5" fill="#f97316">ℛ</text>
          )}
        </g>
      ))}

      {/* ASC / DSC / MC / IC labels */}
      {[
        { long: asc,             label: "ASC" },
        { long: asc + 180,       label: "DSC" },
        { long: mcLongitude,     label: "MC"  },
        { long: mcLongitude+180, label: "IC"  },
      ].map(({ long, label }) => {
        const pos = toXY(long, asc, R_OUTER + 15);
        return (
          <text key={label} x={pos.x} y={pos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize="9" fill="#c9a84c" fontWeight="bold"
          >{label}</text>
        );
      })}

      {/* Center dot */}
      <circle cx={CX} cy={CY} r="3" fill="#c9a84c" opacity="0.6" />
    </svg>
  );
}
```

- [ ] **Step 2: TypeScript kontrolü**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep "HoraryChartWheel"
```

Beklenen: boş

- [ ] **Step 3: Commit**

```bash
git add src/components/horary/HoraryChartWheel.tsx
git commit -m "feat(horary): add SVG chart wheel with significator highlighting and aspect animation"
```

---

## Task 7: page.tsx — Ana Sayfa

**Files:**
- Create: `src/app/horary/page.tsx`

- [ ] **Step 1: Dizin oluştur ve dosyayı yaz**

```typescript
// src/app/horary/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-helpers";
import { turkishCities } from "@/data/cities";
import { countries } from "@/data/countries";
import CosmicSelect from "@/components/Cosmic/CosmicSelect";
import HoraryChartWheel from "@/components/horary/HoraryChartWheel";
import {
  Telescope, Sparkles, AlertTriangle, CheckCircle2,
  Clock, Star, MessageCircle, ArrowLeft, Scroll
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface Stricture { type: string; severity: string; messageKey: string; }
interface SignificatorInfo {
  planetId: string; planetName: string; signId: string;
  signDegree: number; house: number; dignityLevel: string; dignityScore: number;
}
interface Timing { value: number; unit: string; }
interface Analysis {
  strictures: Stricture[];
  questionCategory: string;
  questionHouse: number;
  querent: SignificatorInfo;
  quesited: SignificatorInfo;
  timing: Timing | null;
}
interface Reading {
  section1: string; section2: string;
  section3: string; section4: string; section5: string;
}
interface ChartData {
  planets: any[]; houses: any[];
  ascendantLongitude: number; mcLongitude: number;
}

// ─── Loading steps ───────────────────────────────────────────
const LOADING_STEPS = [
  "horary.loading.step1",
  "horary.loading.step2",
  "horary.loading.step3",
  "horary.loading.step4",
];

// ─── Main component ──────────────────────────────────────────
export default function HoraryPage() {
  const { t, language } = useTranslation();
  const { user }        = useAuth();

  const [question,   setQuestion]   = useState("");
  const [city,       setCity]       = useState<string | null>(null);
  const [country,    setCountry]    = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [loadStep,   setLoadStep]   = useState(0);
  const [error,      setError]      = useState("");
  const [chartData,  setChartData]  = useState<ChartData | null>(null);
  const [analysis,   setAnalysis]   = useState<Analysis | null>(null);
  const [reading,    setReading]    = useState<Reading | null>(null);

  // Cycle loading messages
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadStep(s => (s + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  // Resolve lat/lng from city/country
  function getCoordinates(): { lat: number; lng: number } | null {
    if (city) {
      const found = turkishCities.find(c => c.name === city);
      if (found) return { lat: found.lat, lng: found.lng };
    }
    if (country) {
      const found = countries.find(c => c.name === country);
      if (found) return { lat: found.lat ?? 39, lng: found.lng ?? 35 };
    }
    return { lat: 41.01, lng: 28.96 }; // Istanbul fallback
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (question.trim().length < 5) return;
    setLoading(true);
    setLoadStep(0);
    setError("");
    setChartData(null);
    setAnalysis(null);
    setReading(null);

    const coords = getCoordinates();
    if (!coords) { setError("Konum bulunamadı."); setLoading(false); return; }

    try {
      const res  = await fetch("/api/horary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question, latitude: coords.lat, longitude: coords.lng,
          language, userId: user?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChartData(data.chartData);
        setAnalysis(data.analysis);
        setReading(data.reading);
      } else {
        setError(data.error || "Bir hata oluştu.");
      }
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setChartData(null); setAnalysis(null); setReading(null); setQuestion("");
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "'EB Garamond', serif" }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      <div className="container mx-auto px-4 py-12 max-w-5xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Telescope className="w-8 h-8" style={{ color: "#c9a84c" }} />
            <h1 className="text-4xl font-bold" style={{ fontFamily: "'Cinzel', serif", color: "#c9a84c" }}>
              {t("horary.hero.title")}
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {t("horary.hero.subtitle")}
          </p>
          <p className="text-xs mt-3 tracking-widest uppercase" style={{ color: "#b87333" }}>
            {t("horary.hero.tradition")}
          </p>
        </motion.div>

        {/* ── Form ── */}
        <AnimatePresence mode="wait">
          {!chartData && !loading && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="max-w-2xl mx-auto"
            >
              {/* Question */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: "#c9a84c", fontFamily: "'Cinzel', serif" }}>
                  {t("horary.form.question_label")}
                </label>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder={t("horary.form.question_placeholder")}
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2"
                  style={{
                    background: "rgba(201,168,76,0.05)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    fontFamily: "'EB Garamond', serif",
                    fontSize: "1rem",
                  }}
                />
              </div>

              {/* Location */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <CosmicSelect
                  label={t("horary.form.location_label")}
                  options={turkishCities.map(c => ({ value: c.name, label: c.name }))}
                  value={city}
                  onChange={setCity}
                  placeholder="Şehir seç"
                />
                <CosmicSelect
                  label=" "
                  options={countries.map(c => ({ value: c.name, label: c.name }))}
                  value={country}
                  onChange={setCountry}
                  placeholder="veya ülke"
                />
              </div>

              {/* Note */}
              <p className="text-xs text-gray-500 mb-6 text-center italic">
                {t("horary.form.note")}
              </p>

              {error && (
                <p className="text-red-400 text-sm text-center mb-4">{error}</p>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={question.trim().length < 5}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-semibold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #c9a84c, #b87333)",
                  color: "#0a0a1a",
                  fontFamily: "'Cinzel', serif",
                }}
              >
                <Sparkles className="inline w-5 h-5 mr-2" />
                {t("horary.form.submit")}
              </motion.button>
            </motion.form>
          )}

          {/* ── Loading ── */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 mx-auto mb-8 rounded-full border-2 animate-spin"
                style={{ borderColor: "#c9a84c", borderTopColor: "transparent" }} />
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-gray-300 text-lg"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  {t(LOADING_STEPS[loadStep])}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Results ── */}
          {chartData && analysis && reading && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Back button */}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-gray-400 hover:text-amber-400 mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("horary.result.new_question")}
              </button>

              {/* Question displayed */}
              <div className="mb-8 p-4 rounded-xl text-center italic text-gray-300"
                style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
                <Scroll className="inline w-4 h-4 mr-2" style={{ color: "#c9a84c" }} />
                "{question}"
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Chart Wheel */}
                <div>
                  <HoraryChartWheel
                    planets={chartData.planets}
                    houses={chartData.houses}
                    ascendantLongitude={chartData.ascendantLongitude}
                    mcLongitude={chartData.mcLongitude}
                    querentPlanetId={analysis.querent.planetId}
                    quesitedPlanetId={analysis.quesited.planetId}
                    keyAspectPlanet1={analysis.querent.planetId}
                    keyAspectPlanet2={analysis.quesited.planetId}
                  />
                </div>

                {/* Significator cards */}
                <div className="space-y-4">
                  {/* Strictures */}
                  <div className="p-4 rounded-xl" style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${analysis.strictures.length ? "rgba(251,146,60,0.3)" : "rgba(74,222,128,0.2)"}`,
                  }}>
                    {analysis.strictures.length === 0 ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">{t("horary.result.stricture_ok")}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {analysis.strictures.map((s, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0"
                              style={{ color: s.severity === "warning" ? "#fb923c" : "#94a3b8" }} />
                            <span className="text-sm text-gray-300">{t(s.messageKey)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Querent */}
                  <SignificatorCard
                    label={t("horary.result.querent_label")}
                    info={analysis.querent}
                    t={t}
                  />

                  {/* Quesited */}
                  <SignificatorCard
                    label={t("horary.result.quesited_label")}
                    info={analysis.quesited}
                    t={t}
                  />

                  {/* Timing */}
                  {analysis.timing && (
                    <div className="p-4 rounded-xl flex items-center gap-3"
                      style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)" }}>
                      <Clock className="w-5 h-5 shrink-0" style={{ color: "#c9a84c" }} />
                      <div>
                        <span className="text-xs text-gray-500 block">{t("horary.result.timing_label")}</span>
                        <span className="font-semibold" style={{ color: "#c9a84c", fontFamily: "'Cinzel', serif" }}>
                          ~{analysis.timing.value} {t(`horary.${analysis.timing.unit}`)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5 Reading Cards */}
              <div className="space-y-6">
                {([
                  { key: "section1", title: t("horary.result.section1_title"), icon: Telescope,    accent: false },
                  { key: "section2", title: t("horary.result.section2_title"), icon: Star,         accent: false },
                  { key: "section3", title: t("horary.result.section3_title"), icon: Sparkles,     accent: false },
                  { key: "section4", title: t("horary.result.section4_title"), icon: MessageCircle,accent: true  },
                  { key: "section5", title: t("horary.result.section5_title"), icon: Clock,        accent: false },
                ] as const).map(({ key, title, icon: Icon, accent }, i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="rounded-2xl p-6"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${accent ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.08)"}`,
                      boxShadow: accent ? "0 0 30px rgba(201,168,76,0.1)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="w-5 h-5 shrink-0" style={{ color: "#c9a84c" }} />
                      <h3 className="text-lg font-semibold"
                        style={{ fontFamily: "'Cinzel', serif", color: "#c9a84c" }}>
                        {title}
                      </h3>
                    </div>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line"
                      style={{ fontFamily: "'EB Garamond', serif", fontSize: "1.05rem" }}>
                      {reading[key as keyof Reading]}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer note */}
              <p className="text-center text-xs text-gray-600 mt-10 italic">
                {t("horary.result.footer_note")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Significator card sub-component ────────────────────────
function SignificatorCard({ label, info, t }: {
  label: string; info: SignificatorInfo; t: (k: string) => string;
}) {
  const scoreColor =
    info.dignityScore >= 3 ? "#4ade80" :
    info.dignityScore >= 1 ? "#c9a84c" :
    info.dignityScore < 0  ? "#f87171" : "#94a3b8";

  return (
    <div className="p-4 rounded-xl" style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <span className="text-xs text-gray-500 block mb-2">{label}</span>
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
            {info.planetName}
          </span>
          <span className="text-gray-400 text-sm ml-2">
            {info.signId.toUpperCase()} {info.signDegree.toFixed(1)}° · {info.house}. ev
          </span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full"
          style={{ background: `${scoreColor}20`, color: scoreColor, fontFamily: "'JetBrains Mono', monospace" }}>
          {t(`horary.dignity.${info.dignityLevel}`)}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript / build kontrolü**

```bash
cd "c:/Users/Administrator/Desktop/Falcı Bacı"
npx tsc --noEmit --skipLibCheck 2>&1 | grep "horary/page\|horary\\\\page"
```

Beklenen: boş

- [ ] **Step 3: Dev server'da test et**

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000/horary` aç. Şunları kontrol et:
- Sayfa yükleniyor mu ✓
- Soru formu görünüyor mu ✓
- Şehir seçimi çalışıyor mu ✓
- "Haritayı Aç" butonu aktif oluyor mu ✓

- [ ] **Step 4: API test — gerçek istek**

Browser'da formu doldur:
- Soru: "Bu işi alabilecek miyim?"
- Şehir: İstanbul
- Submit yap

Kontrol et:
- Yükleme mesajları döngüsü çalışıyor mu ✓
- Harita wheel render oluyor mu ✓
- 5 kart içerikli geliyor mu ✓
- Stricture kartı doğru renkte mi ✓
- Footer notu görünüyor mu ✓

- [ ] **Step 5: Commit**

```bash
git add src/app/horary/page.tsx src/components/horary/HoraryChartWheel.tsx
git commit -m "feat(horary): add main page with chart wheel, significator cards, and 5-section reading"
```

---

## Task 8: Build Doğrulama ve Son Kontrol

- [ ] **Step 1: Full build çalıştır**

```bash
cd "c:/Users/Administrator/Desktop/Falcı Bacı"
npm run build 2>&1 | tail -30
```

Beklenen: `✓ Compiled successfully` (veya sadece horary route'u içeren uyarılar)

- [ ] **Step 2: TypeScript tam tarama**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | head -30
```

Beklenen: boş veya sadece pre-existing hatalar

- [ ] **Step 3: 5 dil testi**

Dev server'da şu URL'leri test et:
- `http://localhost:3000/tr/horary`
- `http://localhost:3000/en/horary`
- `http://localhost:3000/ar/horary`
- `http://localhost:3000/de/horary`
- `http://localhost:3000/fr/horary`

Her birinde başlık, placeholder, submit butonunun doğru dilde göründüğünü doğrula.

- [ ] **Step 4: Final commit**

```bash
git add -A
git status
git commit -m "feat(horary): complete horary astrology module — engine, rules, AI reading, wheel, i18n"
```

---

## Self-Review

**Spec coverage:**
- [x] `/horary` bağımsız modül ✓
- [x] Serbest metin soru girişi ✓
- [x] `astronomia` yerine mevcut custom math (daha iyi — harici dep. yok) ✓
- [x] Regiomontanus ev sistemi ✓
- [x] 7 klasik gezegen ✓
- [x] Strictures (earlyAsc, lateAsc, VOC, viaCombusta, saturnIn7) ✓
- [x] Essential dignities (tüm seviyeler) ✓
- [x] Significator atama (10 kategori) ✓
- [x] Applying aspect + perfection ✓
- [x] Timing (sign modality × house type) ✓
- [x] Gemini 5 bölüm prompt (Lilly/Frawley geleneği) ✓
- [x] HoraryChartWheel — significator altın halka, aspect pulse ✓
- [x] 5 kart staggered animasyon ✓
- [x] TR/EN/AR/DE/FR tam i18n ✓
- [x] Cinzel + EB Garamond tipografi ✓
- [x] Global arka plan korunuyor ✓
- [x] Footer note (Lilly atfı) ✓
- [x] Kapsam dışı: Uranus/Neptune/Pluto kullanılmıyor ✓

**Placeholder scan:** Tüm kod adımları tam içerikli. TBD yok.

**Type consistency:**
- `HoraryChart`, `HoraryPlanet`, `HoraryHouse` → engine.ts'de tanımlanıp rules.ts + route.ts'de import ediliyor ✓
- `HoraryAnalysis` → rules.ts'de export, route.ts'de kullanılıyor ✓
- API response shape → page.tsx'deki interface'lerle eşleşiyor ✓

**Not:** `analysis.quesited.questionHouse` route.ts'de `analysis.quesited.house` olarak düzeltilmeli. Task 4 Step 1'deki route.ts'de `quesited` bloğundaki `house: analysis.quesited.questionHouse` satırını `house: analysis.questionHouse` olarak yaz.
