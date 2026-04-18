# Doğum Haritası v3 — Premium UI Design Spec

> **Status:** Approved — proceed to writing-plans
> **Date:** 2026-04-18
> **Approach:** B — Full Tab Rewrite (data layer untouched)

---

## 1. Goals

- Redesign all 5 doğum haritası tabs to "ultra premium" quality inspired by Astro-Seek
- Replace planet emoji characters with real planet photo thumbnails (Unsplash URLs already in `planets.ts`)
- Add explanatory content to Element/Modality balance sections
- Rewrite Gemini interpret prompt to professional 3rd-person style (no "canım benim")
- Redesign transit section as individual Astro-Seek-style cards
- Full i18n compliance: every new string must use `t()` keys, added to all 5 locales (tr/en/ar/de/fr)

## 2. Constraints

- **Data layer untouched:** `src/lib/astrology.ts`, `src/app/api/calculate/`, Supabase schema — none of these change
- **Tab names unchanged:** Genel Bakış, Gezegenler, Evler, Açılar, Harita Yorumu
- **One file for page:** `src/app/dogum-haritasi/page.tsx` stays as one component — no extraction to subcomponents
- **Planet ID mapping** (astrology.ts → planets.ts):
  ```
  sun→gunes, moon→ay, mercury→merkur, venus→venus, mars→mars,
  jupiter→jupiter, saturn→saturn, uranus→uranus, neptune→neptun, pluto→pluton
  ```
- **`getPlanetById` helper** already exported from `src/data/planets.ts` — use it throughout

---

## 3. Design Direction: "Cosmic Observatory"

| Token | Value |
|-------|-------|
| Page bg | `#050508` |
| Card bg | `rgba(255,255,255,0.03)` |
| Card border | `rgba(255,255,255,0.07)` |
| Body font | system (keep existing) |
| Display font | Playfair Display (already imported via Tailwind/global) |
| Number font | `font-mono` for degrees, orbs, percentages |

**Element accent colors:**
- Fire: `text-orange-400`, `bg-orange-500/10`, `border-orange-500/20`
- Earth: `text-emerald-400`, `bg-emerald-500/10`, `border-emerald-500/20`
- Air: `text-sky-400`, `bg-sky-400/10`, `border-sky-400/20`
- Water: `text-blue-400`, `bg-blue-500/10`, `border-blue-500/20`

**Harmony colors (aspects):**
- positive: green-400 / green-500/10 / green-500/20
- negative: red-400 / red-500/10 / red-500/20
- neutral: blue-400 / blue-500/10 / blue-500/20

---

## 4. Planet Photo Pattern

All tabs use the same helper to get planet data:

```tsx
const PLANET_ID_MAP: Record<string, string> = {
  sun: "gunes", moon: "ay", mercury: "merkur", venus: "venus",
  mars: "mars", jupiter: "jupiter", saturn: "saturn",
  uranus: "uranus", neptune: "neptun", pluto: "pluton"
};

// Usage:
const pd = getPlanetById(PLANET_ID_MAP[pos.planetId] || pos.planetId);
// pd.imageUrl → Unsplash URL for the photo
// pd.color → hex color for glow ring
// pd.glow → rgba for shadow
```

**Planet photo thumbnail (standardized across all tabs):**
```tsx
<div
  className="relative shrink-0 w-14 h-14 rounded-2xl overflow-hidden border border-white/10"
  style={{ boxShadow: `0 0 20px ${pd?.glow || "rgba(255,255,255,0.1)"}` }}
>
  {pd?.imageUrl ? (
    <img src={pd.imageUrl} alt={pos.planet} className="w-full h-full object-cover" />
  ) : (
    <PlanetIcon name={pos.planetId} size={32} className="m-auto mt-3" />
  )}
</div>
```

---

## 5. Tab Designs

### 5A. Genel Bakış (Overview)

Layout order (top → bottom):
1. **Big Three row** — keep existing 3-col grid, no changes
2. **Compact status chips row** — stellium chips + retrograde chips on one line
3. **Two-column row** — Element Balance card (left) + Modality Balance card (right)
4. **Dominant Planet card** — full-width, horizontal layout with planet photo
5. **Birth Chart Wheel** — existing BirthChartWheel component, no changes
6. **Planet Summary Table** — keep existing (overview tab summary table)
7. **Aspect Summary** — keep existing (positive/negative/neutral counts)

**Compact chips row:**
```tsx
<div className="flex flex-wrap gap-2 items-center">
  {result.stelliums.map(s => (
    <span key={s.signId} className="px-3 py-1 rounded-full text-[10px] font-bold
      bg-purple-500/10 border border-purple-500/20 text-purple-300 uppercase tracking-wider">
      ✦ {t("chart.stellium.of_sign", { sign: s.signName })}
    </span>
  ))}
  {result.planetPositions.filter(p => p.retrograde).map(p => {
    const pd = getPlanetById(PLANET_ID_MAP[p.planetId] || p.planetId);
    return (
      <span key={p.planetId} className="px-3 py-1 rounded-full text-[10px] font-bold
        bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <img src={pd?.imageUrl} className="w-3.5 h-3.5 rounded-full inline mr-1 object-cover" />
        {p.planet} ℞
      </span>
    );
  })}
</div>
```

**Element Balance card** (adds planet list and desc below bars):
```tsx
<div className="glass-card p-5 rounded-2xl">
  <h3>{t("chart.element_balance")}</h3>
  <p className="text-xs text-gray-500 mb-4">{t("chart.element_balance.desc")}</p>
  {elements.map(el => {
    const pct = result.elementBalance[el.key];
    const isDominant = result.elementBalance.dominant === el.key;
    // contributing planets = planetPositions whose sign maps to this element
    const contributing = result.planetPositions.filter(p =>
      ELEMENT_OF_SIGN[p.signId] === el.key
    );
    return (
      <div key={el.key} className={`mb-4 p-3 rounded-xl ${isDominant ? el.bgActive : el.bg}`}>
        <div className="flex justify-between text-xs mb-1.5">
          <span className={el.text}>{el.emoji} {t(`astrology.element.${el.key}`)}</span>
          <span className={`font-mono font-bold ${isDominant ? el.text : "text-gray-400"}`}>
            %{pct} {isDominant && "★"}
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
          <div className={`h-full rounded-full ${el.bar}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-gray-500 mb-1">{t(`chart.element.${el.key}.desc`)}</p>
        {contributing.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {contributing.map(p => {
              const pd = getPlanetById(PLANET_ID_MAP[p.planetId] || p.planetId);
              return (
                <span key={p.planetId} className="flex items-center gap-1 text-[9px]
                  px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                  <img src={pd?.imageUrl} className="w-3 h-3 rounded-full object-cover" />
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

**ELEMENT_OF_SIGN lookup** (define as const in the page):
```tsx
const ELEMENT_OF_SIGN: Record<string, "fire"|"earth"|"air"|"water"> = {
  koc:"fire", aslan:"fire", yay:"fire",
  boga:"earth", basak:"earth", oglak:"earth",
  ikizler:"air", terazi:"air", kova:"air",
  yengec:"water", akrep:"water", balik:"water",
};
```

**Dominant Planet card:**
```tsx
<div className="glass-card p-5 rounded-2xl border border-yellow-500/20 flex items-center gap-5">
  <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10"
    style={{ boxShadow: `0 0 24px ${dpData?.glow}` }}>
    {dpData?.imageUrl && <img src={dpData.imageUrl} className="w-full h-full object-cover" />}
  </div>
  <div className="flex-1">
    <p className="text-[9px] uppercase tracking-[0.3em] text-yellow-400/60 mb-0.5">
      {t("chart.dominant_planet")}
    </p>
    <h4 className="text-xl font-bold text-yellow-300" style={{fontFamily:"'Playfair Display', serif"}}>
      {dp.planet}
    </h4>
    <p className="text-gray-400 text-xs">{dp.sign} · {dpHouseLabel}</p>
    <p className="text-gray-500 text-[11px] mt-1">{t("chart.dominant_planet.desc")}</p>
  </div>
</div>
```

---

### 5B. Gezegenler (Planets)

Each planet = one horizontal card with photo thumbnail on the left:

```tsx
<div className="glass-card p-5 border-white/5 hover:border-white/10 transition-all">
  <div className="flex items-start gap-4">
    {/* Planet photo */}
    <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10"
      style={{ boxShadow: `0 0 20px ${pd?.glow}` }}>
      <img src={pd?.imageUrl} className="w-full h-full object-cover" />
    </div>
    {/* Planet info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-0.5">
        <span className="text-white font-semibold text-base" style={{fontFamily:"'Playfair Display',serif"}}>
          {t(`astrology.planet.${pos.planetId}`)}
        </span>
        {pos.retrograde && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10
            border border-red-500/20 text-red-400 font-bold">℞ {t("chart.planet.retrograde_badge")}</span>
        )}
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5
          border border-white/10 text-gray-400">
          {t("chart.planet.in_house", { n: String(houseNum) })}
        </span>
      </div>
      <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
        <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 shrink-0">
          <ZodiacIcon signId={pos.signId} size={20} className="w-full h-full" />
        </div>
        <span>{t(`zodiac.${pos.signId}`)}</span>
        <span className="font-mono text-gray-500">{pos.degree}°</span>
      </div>
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
        {t(`astrology.planet.meaning.${pos.planetId}`)}
      </p>
    </div>
  </div>
  {/* Traits + description — collapsible section */}
  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
    <p className="text-sm text-gray-300 leading-relaxed italic border-l-2
      border-amber-500/30 pl-4">{t(`astrology.planet.${pos.planetId}.desc`)}</p>
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
        <p className="text-[9px] uppercase font-bold text-green-400 mb-1.5 tracking-wider">
          {t("chart.planet.flow_pos")}
        </p>
        <p className="text-xs text-gray-400 leading-tight">{t(`astrology.planet.${pos.planetId}.traits.pos`)}</p>
      </div>
      <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
        <p className="text-[9px] uppercase font-bold text-red-400 mb-1.5 tracking-wider">
          {t("chart.planet.flow_neg")}
        </p>
        <p className="text-xs text-gray-400 leading-tight">{t(`astrology.planet.${pos.planetId}.traits.neg`)}</p>
      </div>
    </div>
    <p className="text-[10px] text-white/20 font-mono text-right">
      {pos.fullDegree}° {pos.retrograde ? "(℞)" : "(D)"}
    </p>
  </div>
</div>
```

---

### 5C. Evler (Houses)

Keep 2-column grid. Each card updated to show ruler planet photo + planets-in-house with photos:

```tsx
<div className="glass-card p-4 hover:border-purple-500/30 transition-all">
  {/* Header: house number + sign */}
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <span className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/20
        flex items-center justify-center text-indigo-300 text-xs font-bold font-mono">
        {house.house}
      </span>
      <span className="text-white font-medium text-sm">{t(`astrology.house.${house.house}`)}</span>
    </div>
    <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
      <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 shrink-0">
        <ZodiacIcon signId={house.signId} size={20} className="w-full h-full object-cover" />
      </div>
      {t(`zodiac.${house.signId}`)} <span className="font-mono text-gray-500">{house.degree}°</span>
    </div>
  </div>
  <p className="text-gray-400 text-[11px] leading-relaxed italic opacity-80 mb-3">
    {t(`astrology.house.${house.house}.desc`)}
  </p>
  {/* Ruler */}
  {rulerPlanet && (
    <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
      <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 shrink-0"
        style={{ boxShadow: `0 0 8px ${rulerPd?.glow}` }}>
        <img src={rulerPd?.imageUrl} className="w-full h-full object-cover" />
      </div>
      <span className="text-[10px] text-gray-500">{t("chart.house.ruler")}:</span>
      <span className="text-[11px] text-purple-300 font-medium">{rulerPlanet.planet}</span>
      <span className="text-[10px] text-gray-500">
        {t("chart.planet.in_house", { n: String(rulership.rulerHouse) })}
        {rulership.rulerRetrograde ? " ℞" : ""}
      </span>
    </div>
  )}
  {/* Planets in house */}
  {planetsInHouse.length > 0 ? (
    <div className="flex flex-wrap gap-1.5">
      {planetsInHouse.map(pid => {
        const pp = result.planetPositions.find(p => p.planetId === pid);
        const ppd = getPlanetById(PLANET_ID_MAP[pid] || pid);
        return pp ? (
          <span key={pid} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full
            bg-white/5 border border-white/10 text-gray-300">
            <img src={ppd?.imageUrl} className="w-3.5 h-3.5 rounded-full object-cover" />
            {pp.planet}
          </span>
        ) : null;
      })}
    </div>
  ) : (
    <p className="text-[10px] text-white/15 italic">{t("chart.house.empty")}</p>
  )}
</div>
```

---

### 5D. Açılar (Aspects)

Each aspect = horizontal card with planet photos on both sides:

```tsx
<div className={`glass-card p-4 border ${harmonyBorder(aspect.harmony)}`}>
  <div className="flex items-center gap-3">
    {/* Planet 1 photo */}
    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10"
      style={{ boxShadow: `0 0 12px ${p1d?.glow}` }}>
      <img src={p1d?.imageUrl} className="w-full h-full object-cover" />
    </div>
    {/* Aspect symbol */}
    <div className="flex flex-col items-center gap-0.5 shrink-0 min-w-[60px]">
      <span className={`text-xl ${harmonyText(aspect.harmony)}`}>{aspect.typeEmoji}</span>
      <span className={`text-[9px] font-bold uppercase tracking-wider ${harmonyText(aspect.harmony)}`}>
        {t(`astrology.aspect.${aspect.typeId}`)}
      </span>
      <span className="text-[8px] font-mono text-gray-500">{aspect.orb}° orb</span>
    </div>
    {/* Planet 2 photo */}
    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10"
      style={{ boxShadow: `0 0 12px ${p2d?.glow}` }}>
      <img src={p2d?.imageUrl} className="w-full h-full object-cover" />
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
          {aspect.applying ? t("chart.aspect.applying") : t("chart.aspect.separating")}
        </span>
      </div>
    </div>
  </div>
  <p className="text-gray-500 text-[11px] mt-3 pl-1 leading-relaxed">
    {t(`astrology.aspect.${aspect.typeId}.desc`)}
  </p>
</div>
```

---

### 5E. Harita Yorumu Tab

Layout:
1. **Interpretation section** (generate button or 4-section results)
2. **Bugünün Etkileri header** + transit cards

**Transit card (each transit separately):**
```tsx
<div className="glass-card p-4">
  <div className="flex items-center gap-3 mb-3">
    {/* Transit planet */}
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10"
        style={{ boxShadow: `0 0 16px ${tpd?.glow}` }}>
        <img src={tpd?.imageUrl} className="w-full h-full object-cover" />
      </div>
      <span className="text-[8px] text-gray-500 uppercase tracking-wider">{t("chart.transit.transit_planet")}</span>
      <span className="text-[10px] text-white font-medium">{t(`astrology.planet.${transit.transitPlanetId}`)}</span>
    </div>
    {/* Aspect center */}
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-2xl">{transit.typeEmoji}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: transit.harmony === "positive" ? "#4ade80" : transit.harmony === "negative" ? "#f87171" : "#60a5fa" }}>
        {t(`astrology.aspect.${transit.typeId}`)}
      </span>
      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
        transit.applying
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-gray-500/30 bg-gray-500/10 text-gray-400"
      }`}>
        {transit.applying ? t("chart.transit.applying") : t("chart.transit.separating")}
      </span>
    </div>
    {/* Natal planet */}
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10"
        style={{ boxShadow: `0 0 16px ${npd?.glow}` }}>
        <img src={npd?.imageUrl} className="w-full h-full object-cover" />
      </div>
      <span className="text-[8px] text-gray-500 uppercase tracking-wider">{t("chart.transit.natal_planet")}</span>
      <span className="text-[10px] text-white font-medium">{t(`astrology.planet.${transit.natalPlanetId}`)}</span>
    </div>
  </div>
</div>
```

---

## 6. Harita Yorumu Prompt — Professional Style

**Problem:** Current prompt contains `"Kişisel ve samimi bir dil kullan"` → causes "canım benim" output.

**New prompt instruction block:**
```
Doğum haritasını profesyonel bir astrolog bakış açısıyla Türkçe yorumla.

Üslup kuralları:
- Üçüncü şahıs analitik dil kullan: "Bu kişi", "Güneş Akrep burcunun 1. evinde yer almaktadır", "Bu konumlama..."
- "Canım", "Sevgilim", "Seni", "Sen" gibi hitap ve ikinci şahıs ifadeleri KULLANMA
- Astroseek.com benzeri profesyonel astrolog üslubu: psikolojik analiz, davranış kalıpları, hayat temaları
- Astrolojik terimleri kullan, her birini kısa ve öz açıkla
- Spekülatif değil analitik: "Bu kişinin X eğilimi taşıdığı görülmektedir" gibi ifadeler kullan
```

---

## 7. i18n Requirements

All strings newly introduced by this feature must exist in 5 locale files before UI tasks begin.

**New key prefixes:**
- `chart.element_balance`, `chart.element_balance.desc`, `chart.element_balance.dominant`
- `chart.element.{fire|earth|air|water}.desc`
- `chart.modality_balance`, `chart.modality_balance.desc`
- `chart.modality.{cardinal|fixed|mutable}.desc`
- `chart.dominant_planet`, `chart.dominant_planet.desc`
- `chart.stellium`, `chart.stellium.of_sign`, `chart.stellium.desc`
- `chart.retrograde_planets`, `chart.retrograde.explanation`
- `chart.filter.{all|harmonious|challenging|neutral}`
- `chart.aspect.applying`, `chart.aspect.separating`, `chart.aspect.orb`
- `chart.planet.in_house`, `chart.planet.retrograde_badge`
- `chart.interpretation.personal_title`, `chart.interpretation.personal_desc`
- `chart.interpretation.{general|strengths|challenges|advice}_title`
- `chart.interpretation.{regenerate|generate_btn}`
- `chart.transit.{header|desc|none|applying|separating|transit_planet|natal_planet}`
- `chart.house.{ruler|planets_here|empty}`
- `chart.finder.toggle.{open|close}`
