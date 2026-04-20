"use client";

import { useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────
export interface WheelPlanet {
  id: string; name: string; emoji: string;
  longitude: number; signId: string; signDegree: number;
  house: number; retrograde: boolean; combust: boolean; cazimi: boolean;
}
interface House { house: number; longitude: number; signId: string; signDegree: number; }

interface Props {
  planets: WheelPlanet[];
  houses: House[];
  ascendantLongitude: number;
  mcLongitude: number;
  querentPlanetId: string;
  quesitedPlanetId: string;
  keyAspectPlanet1?: string;
  keyAspectPlanet2?: string;
  selectedPlanetId?: string | null;
  onPlanetClick?: (planet: WheelPlanet | null) => void;
  planetImages?: Record<string, string>;
}

// ─── Geometry constants ───────────────────────────────────────
const SIZE = 620;
const CX   = SIZE / 2;
const CY   = SIZE / 2;

// Ring radii — zodiac band is 72 units wide for large readable glyphs
const R_OUT   = 298;   // outer rim for tick ring
const R_TIN   = 288;   // short tick inner
const R_TLONG = 272;   // long tick inner (every 30°)
const R_ZO    = 272;   // zodiac outer edge
const R_ZI    = 200;   // zodiac inner edge  (72-unit band)
const R_HN    = 184;   // house number label
const R_CI    = 170;   // cusp inner endpoint
const R_PL    = 145;   // planet orbit ring
const R_IN    = 118;   // inner circle for aspect web

// ─── Zodiac – Unicode + element colours ──────────────────────
const ZODIAC = [
  { id:"koc",     sym:"♈", el:"fire"  },
  { id:"boga",    sym:"♉", el:"earth" },
  { id:"ikizler", sym:"♊", el:"air"   },
  { id:"yengec",  sym:"♋", el:"water" },
  { id:"aslan",   sym:"♌", el:"fire"  },
  { id:"basak",   sym:"♍", el:"earth" },
  { id:"terazi",  sym:"♎", el:"air"   },
  { id:"akrep",   sym:"♏", el:"water" },
  { id:"yay",     sym:"♐", el:"fire"  },
  { id:"oglak",   sym:"♑", el:"earth" },
  { id:"kova",    sym:"♒", el:"air"   },
  { id:"balik",   sym:"♓", el:"water" },
] as const;

const SIGN_INDEX: Record<string,number> = Object.fromEntries(ZODIAC.map((s,i) => [s.id, i]));

// Element palette: bg (slice fill) / rim (border) / sym (glyph colour)
const EL: Record<string,{bg:string;rim:string;sym:string}> = {
  fire:  { bg:"#2a0902", rim:"#7a2010", sym:"#f28050" },
  earth: { bg:"#0a1f04", rim:"#2e5a14", sym:"#90d040" },
  air:   { bg:"#03101f", rim:"#0e3a5a", sym:"#50cce8" },
  water: { bg:"#040c24", rim:"#0e2258", sym:"#5080e0" },
};

// ─── Aspects — bold, glowing, distinct colours ───────────────
const ASPECTS = [
  { name:"conjunction", angle:0,   orb:8, color:"#f0dc80", w:2.8, dash:"",     opacity:0.90 },
  { name:"opposition",  angle:180, orb:8, color:"#e84040", w:2.5, dash:"",     opacity:0.85 },
  { name:"trine",       angle:120, orb:8, color:"#30d080", w:2.2, dash:"",     opacity:0.82 },
  { name:"square",      angle:90,  orb:7, color:"#e87020", w:2.4, dash:"8 5",  opacity:0.82 },
  { name:"sextile",     angle:60,  orb:6, color:"#40b8f0", w:1.9, dash:"4 5",  opacity:0.78 },
];

// ─── Planet glyph override (SVG-safe chars) ──────────────────
const P_GLYPH: Record<string,string> = {
  sun:"☉", moon:"☽", mercury:"☿", venus:"♀", mars:"♂", jupiter:"♃", saturn:"♄",
};

// ─── Helpers ─────────────────────────────────────────────────
function toXY(long: number, asc: number, r: number) {
  const a = ((180 - (long - asc)) * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}
function full(signId: string, deg: number) {
  return (SIGN_INDEX[signId] ?? 0) * 30 + deg;
}
function slicePath(i: number, asc: number) {
  const s0 = i * 30, s1 = s0 + 30;
  const o1 = toXY(s0, asc, R_ZO), o2 = toXY(s1, asc, R_ZO);
  const i1 = toXY(s1, asc, R_ZI), i2 = toXY(s0, asc, R_ZI);
  return `M${o1.x},${o1.y} A${R_ZO},${R_ZO} 0 0,0 ${o2.x},${o2.y} L${i1.x},${i1.y} A${R_ZI},${R_ZI} 0 0,1 ${i2.x},${i2.y} Z`;
}

// ─── Component ───────────────────────────────────────────────
export default function HoraryChartWheel({
  planets, houses, ascendantLongitude, mcLongitude,
  querentPlanetId, quesitedPlanetId,
  selectedPlanetId, onPlanetClick,
  planetImages = {},
}: Props) {
  const asc = ascendantLongitude;
  const [hovered, setHovered] = useState<string|null>(null);

  // ── Planet positions with collision nudge ─────────────────
  const dots = useMemo(() => {
    const sorted = [...planets]
      .map(p => ({ ...p, f: full(p.signId, p.signDegree) }))
      .sort((a,b) => a.f - b.f);
    const placed: (typeof sorted[0] & { r: number })[] = [];
    for (const p of sorted) {
      let r = R_PL;
      if (placed.some(q => Math.abs(q.f - p.f) < 10 && q.r === r)) r = R_PL - 26;
      placed.push({ ...p, r });
    }
    return placed.map(p => ({
      ...p,
      pos: toXY(p.f, asc, p.r),
      isQ: p.id === querentPlanetId,
      isS: p.id === quesitedPlanetId,
      glyph: P_GLYPH[p.id] ?? p.emoji,
    }));
  }, [planets, asc, querentPlanetId, quesitedPlanetId]);

  // ── Aspect web ────────────────────────────────────────────
  const aspectLines = useMemo(() => {
    type Line = { x1:number;y1:number;x2:number;y2:number;color:string;w:number;dash:string;opacity:number;name:string };
    const out: Line[] = [];
    for (let i = 0; i < dots.length; i++) {
      for (let j = i+1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        let diff = Math.abs(a.f - b.f);
        if (diff > 180) diff = 360 - diff;
        for (const asp of ASPECTS) {
          if (Math.abs(diff - asp.angle) <= asp.orb) {
            // Project to inner-circle radius
            const scale_a = R_IN / a.r, scale_b = R_IN / b.r;
            out.push({
              x1: CX + (a.pos.x - CX) * scale_a,
              y1: CY + (a.pos.y - CY) * scale_a,
              x2: CX + (b.pos.x - CX) * scale_b,
              y2: CY + (b.pos.y - CY) * scale_b,
              ...asp,
            });
          }
        }
      }
    }
    return out;
  }, [dots]);

  // ── House data ────────────────────────────────────────────
  const ROMAN = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
  const houseData = useMemo(() => houses.map((h, idx) => {
    const f  = full(h.signId, h.signDegree);
    const nxt = houses[(idx + 1) % 12];
    const nf  = full(nxt.signId, nxt.signDegree);
    const mid = f + ((nf - f + 360) % 360) / 2;
    return {
      f, outer: toXY(f, asc, R_ZI), inner: toXY(f, asc, R_CI),
      isAngle: [1,4,7,10].includes(h.house),
      numPos: toXY(mid, asc, R_HN),
      label: ROMAN[h.house], house: h.house,
    };
  }), [houses, asc]);

  // ── Degree ticks ──────────────────────────────────────────
  const ticks = useMemo(() => Array.from({ length: 72 }, (_, i) => {
    const long = i * 5, isLong = i % 6 === 0;
    return { p1: toXY(long, asc, R_OUT), p2: toXY(long, asc, isLong ? R_TLONG : R_TIN), isLong };
  }), [asc]);

  function handleClick(p: typeof dots[0]) {
    if (!onPlanetClick) return;
    onPlanetClick(selectedPlanetId === p.id ? null : p);
  }

  // ─────────────────────────────────────────────────────────
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full max-w-[600px] mx-auto select-none"
      style={{ fontFamily:"'Cinzel', serif" }}>

      <defs>
        {/* Font for zodiac glyphs — Noto Sans Symbols 2 has beautifully drawn ♈–♓ */}
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&display=swap');`}</style>

        {/* Backgrounds */}
        <radialGradient id="bgG" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#0e1830" />
          <stop offset="100%" stopColor="#05080e" />
        </radialGradient>
        <radialGradient id="inG" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#0a1224" />
          <stop offset="100%" stopColor="#050a14" />
        </radialGradient>

        {/* Glow filters */}
        <filter id="gA" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="gP" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="gLabel" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        {/* Per-planet clip circles (for photo images) */}
        {dots.map(p => {
          const r = p.isQ || p.isS ? 17 : 14;
          return (
            <clipPath key={`cp-${p.id}`} id={`cp-${p.id}`}>
              <circle cx={p.pos.x} cy={p.pos.y} r={r} />
            </clipPath>
          );
        })}

        {/* Per-planet radial gradient body */}
        {dots.map(p => {
          const c0 = p.isQ ? "#c9a84c" : p.isS ? "#c090ff" : "#203858";
          const c1 = p.isQ ? "#6a4a10" : p.isS ? "#6030a0" : "#0c1828";
          return (
            <radialGradient key={`rg-${p.id}`} id={`rg-${p.id}`} cx="35%" cy="30%" r="65%">
              <stop offset="0%"   stopColor={c0} stopOpacity="0.9" />
              <stop offset="100%" stopColor={c1} stopOpacity="1"   />
            </radialGradient>
          );
        })}
      </defs>

      {/* ── 1. Background disc ── */}
      <circle cx={CX} cy={CY} r={R_OUT + 8} fill="url(#bgG)" />

      {/* ── 2. Degree tick ring ── */}
      {ticks.map((t, i) => (
        <line key={i}
          x1={t.p1.x} y1={t.p1.y} x2={t.p2.x} y2={t.p2.y}
          stroke={t.isLong ? "#c9a84c" : "#283848"}
          strokeWidth={t.isLong ? 1.5 : 0.7}
          opacity={t.isLong ? 0.9 : 0.5}
        />
      ))}
      <circle cx={CX} cy={CY} r={R_OUT} fill="none" stroke="#1e2e42" strokeWidth="0.6" />

      {/* ── 3. Zodiac band — element-coloured slices with Unicode glyphs ── */}
      {ZODIAC.map((sign, i) => {
        const el   = EL[sign.el];
        const midL = i * 30 + 15;
        const mid  = toXY(midL, asc, (R_ZO + R_ZI) / 2);
        return (
          <g key={sign.id} style={{ pointerEvents:"none" }}>
            <path d={slicePath(i, asc)} fill={el.bg} stroke={el.rim} strokeWidth="0.6" opacity="0.95" />
            {/* Large Unicode glyph — Noto Sans Symbols 2 renders ♈–♓ beautifully */}
            <text
              x={mid.x} y={mid.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize="26"
              fontFamily="'Noto Sans Symbols 2', 'Segoe UI Symbol', 'Apple Symbols', 'Symbola', serif"
              fill={el.sym}
              opacity="0.95"
              filter="url(#gLabel)"
            >{sign.sym}</text>
          </g>
        );
      })}

      {/* Zodiac ring borders */}
      <circle cx={CX} cy={CY} r={R_ZO} fill="none" stroke="#304050" strokeWidth="1"   />
      <circle cx={CX} cy={CY} r={R_ZI} fill="none" stroke="#304050" strokeWidth="0.8" />

      {/* ── 4. Inner chart field ── */}
      <circle cx={CX} cy={CY} r={R_ZI} fill="url(#inG)" />

      {/* ── 5. Aspect web inside inner circle ── */}
      <circle cx={CX} cy={CY} r={R_IN} fill="#050912" stroke="#182030" strokeWidth="0.6" />

      {aspectLines.map((asp, i) => (
        <g key={i} filter="url(#gA)">
          <line
            x1={asp.x1} y1={asp.y1} x2={asp.x2} y2={asp.y2}
            stroke={asp.color} strokeWidth={asp.w}
            strokeDasharray={asp.dash}
            strokeLinecap="round"
            opacity={asp.opacity}
          />
        </g>
      ))}

      {/* Aspect legend dots at center */}
      {["#f0dc80","#e84040","#30d080","#e87020","#40b8f0"].map((c,i) => (
        <circle key={i} cx={CX + (i-2)*6} cy={CY} r="1.8"
          fill={c} opacity="0.6" />
      ))}

      <circle cx={CX} cy={CY} r={R_IN} fill="none" stroke="#1e304a" strokeWidth="0.8" />

      {/* ── 6. House cusp lines ── */}
      {houseData.map((h, i) => (
        <g key={i}>
          <line
            x1={h.inner.x} y1={h.inner.y} x2={h.outer.x} y2={h.outer.y}
            stroke={h.isAngle ? "#c9a84c" : "#1a2c3e"}
            strokeWidth={h.isAngle ? 2.0 : 0.7}
            opacity={h.isAngle ? 1.0 : 0.8}
          />
          <text x={h.numPos.x} y={h.numPos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize="9" fill={h.isAngle ? "#c9a84c" : "#3a5468"} opacity="0.95"
            style={{ pointerEvents:"none" }}
          >{h.label}</text>
        </g>
      ))}

      {/* ── 7. Planets ── */}
      {dots.map(p => {
        const isSel  = selectedPlanetId === p.id;
        const isHov  = hovered === p.id;
        const isSig  = p.isQ || p.isS;
        const accent = p.isQ ? "#f0c060" : p.isS ? "#c090ff" : "#6090b8";
        const r      = isSig ? 17 : 14;

        return (
          <g key={p.id}
            style={{ cursor: onPlanetClick ? "pointer" : "default" }}
            onClick={() => handleClick(p)}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Outer glow ring for selected */}
            {isSel && (
              <circle cx={p.pos.x} cy={p.pos.y} r={r + 14}
                fill="none" stroke={accent} strokeWidth="1.5" opacity="0.2"
                filter="url(#gP)"
              />
            )}

            {/* Animated pulse ring for significators */}
            {isSig && (
              <circle cx={p.pos.x} cy={p.pos.y} r={r + 6}
                fill="none" stroke={accent} strokeWidth={isSel ? 2 : 1.5}
                opacity={isSel ? 0.7 : 0.4}
              >
                <animate attributeName="r"       values={`${r+5};${r+10};${r+5}`} dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity"  values="0.5;0.1;0.5"              dur="3s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Combust dashed ring */}
            {p.combust && !p.cazimi && (
              <circle cx={p.pos.x} cy={p.pos.y} r={r + 4}
                fill="none" stroke="#ef4444" strokeWidth="1.5"
                strokeDasharray="3 3" opacity="0.65"
              />
            )}

            {/* Cazimi gold ring */}
            {p.cazimi && (
              <circle cx={p.pos.x} cy={p.pos.y} r={r + 4}
                fill="none" stroke="#ffd700" strokeWidth="2" opacity="0.8"
              />
            )}

            {/* Planet body circle */}
            <circle cx={p.pos.x} cy={p.pos.y} r={r}
              fill={`url(#rg-${p.id})`}
              stroke={isSel || isHov ? accent : isSig ? accent : "#203040"}
              strokeWidth={isSel ? 2.5 : isSig ? 2 : 1}
            />

            {/* Planet photo image */}
            {planetImages[p.id] && (
              <>
                <image
                  href={planetImages[p.id]}
                  x={p.pos.x - r} y={p.pos.y - r}
                  width={r * 2} height={r * 2}
                  clipPath={`url(#cp-${p.id})`}
                  preserveAspectRatio="xMidYMid slice"
                  opacity="0.72"
                />
                {/* Dim overlay so glyph stays readable */}
                <circle cx={p.pos.x} cy={p.pos.y} r={r}
                  fill={isSig ? "rgba(8,10,18,0.3)" : "rgba(4,7,14,0.52)"}
                  clipPath={`url(#cp-${p.id})`}
                />
              </>
            )}

            {/* Planet glyph — large & crisp */}
            <text x={p.pos.x} y={p.pos.y + 0.5}
              textAnchor="middle" dominantBaseline="central"
              fontSize={isSig ? "13" : "11"}
              fontFamily="'Noto Sans Symbols 2', 'Segoe UI Symbol', 'Apple Symbols', serif"
              fill={isSig ? accent : isHov ? "#a0c8e0" : "#6898b8"}
              fontWeight="bold"
              style={{ pointerEvents:"none" }}
            >{p.glyph}</text>

            {/* Retrograde marker */}
            {p.retrograde && (
              <text x={p.pos.x + r + 2} y={p.pos.y - r + 2}
                fontSize="8" fill="#f97316" fontWeight="bold"
                style={{ pointerEvents:"none" }}
              >ℛ</text>
            )}

            {/* Hover tooltip: name + degree */}
            {isHov && (
              <g>
                <rect
                  x={p.pos.x + r + 4} y={p.pos.y - 12}
                  width="60" height="18" rx="4"
                  fill="#060e1e" stroke={accent} strokeWidth="0.8" opacity="0.95"
                />
                <text x={p.pos.x + r + 7} y={p.pos.y - 0.5}
                  fontSize="8.5" fill={accent}
                  fontFamily="'JetBrains Mono', monospace"
                  style={{ pointerEvents:"none" }}
                >
                  {p.signDegree.toFixed(1)}°{p.signId.slice(0,3).toUpperCase()}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* ── 8. Angle labels ASC / DSC / MC / IC ── */}
      {[
        { long: asc,             label:"ASC" },
        { long: asc + 180,       label:"DSC" },
        { long: mcLongitude,     label:"MC"  },
        { long: mcLongitude+180, label:"IC"  },
      ].map(({ long, label }) => {
        const pos = toXY(long, asc, R_OUT + 16);
        return (
          <text key={label} x={pos.x} y={pos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize="10" fill="#c9a84c" fontWeight="bold"
            filter="url(#gLabel)"
          >{label}</text>
        );
      })}

      {/* ── 9. Centre point ── */}
      <circle cx={CX} cy={CY} r="6" fill="#c9a84c" opacity="0.35" />
      <circle cx={CX} cy={CY} r="2.5" fill="#e8d080" opacity="0.85" />
    </svg>
  );
}
