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
const SIZE = 700;
const CX   = SIZE / 2;
const CY   = SIZE / 2;

// Ring radii — proportional from outside in
const R_OUT   = 306;   // outer rim
const R_TIN   = 296;   // short tick inner
const R_TLONG = 280;   // long tick (every 30°)
const R_ZO    = 280;   // zodiac outer edge
const R_ZI    = 214;   // zodiac inner edge (66-unit band)
const R_HN    = 196;   // house number label
const R_CI    = 180;   // cusp inner endpoint
const R_PL    = 154;   // planet orbit ring
const R_IN    = 120;   // inner circle for aspect web

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
  fire:  { bg:"#1a0800", rim:"#7a2010", sym:"#f08050" },
  earth: { bg:"#081a04", rim:"#2e5a14", sym:"#88cc40" },
  air:   { bg:"#020e1c", rim:"#0e3a5a", sym:"#48c8e0" },
  water: { bg:"#030a20", rim:"#0e2258", sym:"#4878d8" },
};

// ─── Aspects — distinct line styles ──────────────────────────
const ASPECTS = [
  { name:"conjunction", angle:0,   orb:8, color:"#f0dc80", w:2.5, dash:"",     opacity:0.90, label:"☌" },
  { name:"opposition",  angle:180, orb:8, color:"#e84040", w:2.2, dash:"",     opacity:0.85, label:"☍" },
  { name:"trine",       angle:120, orb:8, color:"#30d080", w:2.0, dash:"",     opacity:0.82, label:"△" },
  { name:"square",      angle:90,  orb:7, color:"#e87020", w:2.2, dash:"7 4",  opacity:0.82, label:"□" },
  { name:"sextile",     angle:60,  orb:6, color:"#40b8f0", w:1.8, dash:"4 4",  opacity:0.78, label:"⚹" },
];

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
      if (placed.some(q => Math.abs(q.f - p.f) < 10 && q.r === r)) r = R_PL - 28;
      placed.push({ ...p, r });
    }
    return placed.map(p => ({
      ...p,
      pos: toXY(p.f, asc, p.r),
      isQ: p.id === querentPlanetId,
      isS: p.id === quesitedPlanetId,
    }));
  }, [planets, asc, querentPlanetId, quesitedPlanetId]);

  // ── Aspect web ────────────────────────────────────────────
  const aspectLines = useMemo(() => {
    type Line = { x1:number;y1:number;x2:number;y2:number;color:string;w:number;dash:string;opacity:number;name:string;label:string };
    const out: Line[] = [];
    for (let i = 0; i < dots.length; i++) {
      for (let j = i+1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        let diff = Math.abs(a.f - b.f);
        if (diff > 180) diff = 360 - diff;
        for (const asp of ASPECTS) {
          if (Math.abs(diff - asp.angle) <= asp.orb) {
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
    <div className="w-full">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[700px] mx-auto select-none"
        style={{ fontFamily:"'Cinzel', serif" }}>

        <defs>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&display=swap');`}</style>

          {/* Backgrounds */}
          <radialGradient id="hwBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0e1830" />
            <stop offset="100%" stopColor="#040810" />
          </radialGradient>
          <radialGradient id="hwIn" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0a1224" />
            <stop offset="100%" stopColor="#040810" />
          </radialGradient>

          {/* Glow filters */}
          <filter id="hwGA" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="hwGP" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="hwGL" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="hwShadow">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#000" floodOpacity="0.5"/>
          </filter>

          {/* Per-planet clip circles */}
          {dots.map(p => {
            const r = p.isQ || p.isS ? 20 : 16;
            return (
              <clipPath key={`cp-${p.id}`} id={`cp-${p.id}`}>
                <circle cx={p.pos.x} cy={p.pos.y} r={r} />
              </clipPath>
            );
          })}
        </defs>

        {/* ── 1. Background disc ── */}
        <circle cx={CX} cy={CY} r={R_OUT + 8} fill="url(#hwBg)" />

        {/* ── 2. Degree tick ring ── */}
        {ticks.map((t, i) => (
          <line key={i}
            x1={t.p1.x} y1={t.p1.y} x2={t.p2.x} y2={t.p2.y}
            stroke={t.isLong ? "#c9a84c" : "#283848"}
            strokeWidth={t.isLong ? 1.5 : 0.7}
            opacity={t.isLong ? 0.9 : 0.45}
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
              <text
                x={mid.x} y={mid.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize="24"
                fontFamily="'Noto Sans Symbols 2', 'Segoe UI Symbol', 'Apple Symbols', serif"
                fill={el.sym}
                opacity="0.92"
                filter="url(#hwGL)"
              >{sign.sym}</text>
            </g>
          );
        })}

        {/* Zodiac ring borders */}
        <circle cx={CX} cy={CY} r={R_ZO} fill="none" stroke="#304050" strokeWidth="1"   />
        <circle cx={CX} cy={CY} r={R_ZI} fill="none" stroke="#304050" strokeWidth="0.8" />

        {/* ── 4. Inner chart field ── */}
        <circle cx={CX} cy={CY} r={R_ZI} fill="url(#hwIn)" />

        {/* ── 5. Aspect web inside inner circle ── */}
        <circle cx={CX} cy={CY} r={R_IN} fill="#040910" stroke="#182030" strokeWidth="0.6" />

        {aspectLines.map((asp, i) => (
          <g key={i} filter="url(#hwGA)">
            <line
              x1={asp.x1} y1={asp.y1} x2={asp.x2} y2={asp.y2}
              stroke={asp.color} strokeWidth={asp.w}
              strokeDasharray={asp.dash}
              strokeLinecap="round"
              opacity={asp.opacity}
            />
            {/* Aspect glyph at midpoint */}
            <text
              x={(asp.x1 + asp.x2) / 2}
              y={(asp.y1 + asp.y2) / 2}
              textAnchor="middle" dominantBaseline="central"
              fontSize="9" fill={asp.color} opacity="0.7"
              fontFamily="'Noto Sans Symbols 2', serif"
              style={{ pointerEvents:"none" }}
            >{asp.label}</text>
          </g>
        ))}

        <circle cx={CX} cy={CY} r={R_IN} fill="none" stroke="#1e304a" strokeWidth="0.8" />

        {/* ── 6. House cusp lines ── */}
        {houseData.map((h, i) => (
          <g key={i}>
            <line
              x1={h.inner.x} y1={h.inner.y} x2={h.outer.x} y2={h.outer.y}
              stroke={h.isAngle ? "#c9a84c" : "#1a2c3e"}
              strokeWidth={h.isAngle ? 2.0 : 0.7}
              opacity={h.isAngle ? 1.0 : 0.7}
            />
            <text x={h.numPos.x} y={h.numPos.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize="9.5" fill={h.isAngle ? "#c9a84c" : "#3a5468"} opacity="0.9"
              fontWeight={h.isAngle ? "bold" : "normal"}
              style={{ pointerEvents:"none", fontFamily:"'Cinzel', serif" }}
            >{h.label}</text>
          </g>
        ))}

        {/* ── 7. Planets — photo-first, no glyph overlay ── */}
        {dots.map(p => {
          const isSel  = selectedPlanetId === p.id;
          const isHov  = hovered === p.id;
          const isSig  = p.isQ || p.isS;
          const accent = p.isQ ? "#f0c060" : p.isS ? "#c090ff" : "#6090b8";
          const r      = isSig ? 20 : 16;
          const hasImg = !!planetImages[p.id];

          return (
            <g key={p.id}
              style={{ cursor: onPlanetClick ? "pointer" : "default", transition: "opacity 0.2s" }}
              onClick={() => handleClick(p)}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Selection glow ring */}
              {isSel && (
                <circle cx={p.pos.x} cy={p.pos.y} r={r + 12}
                  fill="none" stroke={accent} strokeWidth="1.5" opacity="0.25"
                  filter="url(#hwGP)"
                />
              )}

              {/* Animated pulse ring for significators */}
              {isSig && (
                <circle cx={p.pos.x} cy={p.pos.y} r={r + 6}
                  fill="none" stroke={accent} strokeWidth={isSel ? 2 : 1.5}
                  opacity={isSel ? 0.6 : 0.35}
                >
                  <animate attributeName="r"       values={`${r+4};${r+10};${r+4}`} dur="3.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity"  values="0.4;0.08;0.4"            dur="3.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Combust dashed ring */}
              {p.combust && !p.cazimi && (
                <circle cx={p.pos.x} cy={p.pos.y} r={r + 4}
                  fill="none" stroke="#ef4444" strokeWidth="1.5"
                  strokeDasharray="3 3" opacity="0.6"
                />
              )}

              {/* Cazimi gold ring */}
              {p.cazimi && (
                <circle cx={p.pos.x} cy={p.pos.y} r={r + 4}
                  fill="none" stroke="#ffd700" strokeWidth="2" opacity="0.75"
                />
              )}

              {/* Planet body — image fills the full circle, vibrant & clear */}
              {hasImg ? (
                <>
                  {/* Background circle for border */}
                  <circle cx={p.pos.x} cy={p.pos.y} r={r}
                    fill="#0a1020"
                    stroke={isSel || isHov ? accent : isSig ? accent : "#283848"}
                    strokeWidth={isSel ? 2.5 : isSig ? 2 : 1.2}
                    filter="url(#hwShadow)"
                  />
                  {/* Planet photo — full opacity, vivid */}
                  <image
                    href={planetImages[p.id]}
                    x={p.pos.x - r} y={p.pos.y - r}
                    width={r * 2} height={r * 2}
                    clipPath={`url(#cp-${p.id})`}
                    preserveAspectRatio="xMidYMid slice"
                    opacity={isSel || isHov ? 1 : 0.88}
                  />
                  {/* Border ring on top of image */}
                  <circle cx={p.pos.x} cy={p.pos.y} r={r}
                    fill="none"
                    stroke={isSel || isHov ? accent : isSig ? accent : "#283848"}
                    strokeWidth={isSel ? 2.5 : isSig ? 2 : 1.2}
                  />
                </>
              ) : (
                /* Fallback: glyph-based planet (no image available) */
                <>
                  <circle cx={p.pos.x} cy={p.pos.y} r={r}
                    fill="#0e1828"
                    stroke={isSel || isHov ? accent : isSig ? accent : "#283848"}
                    strokeWidth={isSel ? 2.5 : isSig ? 2 : 1.2}
                  />
                  <text x={p.pos.x} y={p.pos.y + 0.5}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={isSig ? "16" : "13"}
                    fontFamily="'Noto Sans Symbols 2', 'Segoe UI Symbol', serif"
                    fill={isSig ? accent : "#6898b8"}
                    style={{ pointerEvents:"none" }}
                  >{p.emoji}</text>
                </>
              )}

              {/* Planet name label below — always visible */}
              <text x={p.pos.x} y={p.pos.y + r + 10}
                textAnchor="middle" dominantBaseline="central"
                fontSize="7.5"
                fill={isSig ? accent : "#6a8ca0"}
                fontWeight={isSig ? "bold" : "normal"}
                opacity={isHov || isSel ? 1 : 0.8}
                style={{ pointerEvents:"none", fontFamily:"'JetBrains Mono', monospace" }}
              >
                {p.signDegree.toFixed(0)}° {p.signId.slice(0,3).toUpperCase()}
              </text>

              {/* Retrograde marker */}
              {p.retrograde && (
                <text x={p.pos.x + r + 2} y={p.pos.y - r + 2}
                  fontSize="9" fill="#f97316" fontWeight="bold"
                  style={{ pointerEvents:"none" }}
                >ℛ</text>
              )}

              {/* Significator role badge */}
              {isSig && (
                <g>
                  <rect
                    x={p.pos.x - 7} y={p.pos.y - r - 12}
                    width="14" height="10" rx="3"
                    fill={p.isQ ? "#c9a84c" : "#9060e0"} opacity="0.9"
                  />
                  <text x={p.pos.x} y={p.pos.y - r - 6.5}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize="6.5" fill="#fff" fontWeight="bold"
                    style={{ pointerEvents:"none", fontFamily:"'JetBrains Mono', monospace" }}
                  >{p.isQ ? "Q" : "S"}</text>
                </g>
              )}

              {/* Hover tooltip */}
              {isHov && (
                <g>
                  <rect
                    x={p.pos.x + r + 6} y={p.pos.y - 14}
                    width="72" height="22" rx="5"
                    fill="#060e1e" stroke={accent} strokeWidth="0.8" opacity="0.95"
                  />
                  <text x={p.pos.x + r + 10} y={p.pos.y - 2}
                    fontSize="9" fill={accent}
                    fontFamily="'JetBrains Mono', monospace"
                    style={{ pointerEvents:"none" }}
                  >
                    {p.name} {p.signDegree.toFixed(1)}°
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
          const pos = toXY(long, asc, R_OUT + 18);
          return (
            <text key={label} x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize="11" fill="#c9a84c" fontWeight="bold"
              filter="url(#hwGL)"
              style={{ fontFamily:"'Cinzel', serif" }}
            >{label}</text>
          );
        })}

        {/* ── 9. Centre point ── */}
        <circle cx={CX} cy={CY} r="5" fill="#c9a84c" opacity="0.3" />
        <circle cx={CX} cy={CY} r="2" fill="#e8d080" opacity="0.8" />
      </svg>

      {/* ── Aspect Legend ── */}
      <div className="flex flex-wrap justify-center gap-3 mt-3 px-2"
        style={{ fontFamily:"'JetBrains Mono', monospace" }}>
        {ASPECTS.map(asp => (
          <div key={asp.name} className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 rounded-full" style={{
              background: asp.color,
              borderStyle: asp.dash ? "dashed" : "solid",
              opacity: asp.opacity,
            }} />
            <span className="text-xs" style={{ color: asp.color, opacity: 0.8, fontSize: "0.65rem" }}>
              {asp.label} {asp.name.charAt(0).toUpperCase() + asp.name.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
