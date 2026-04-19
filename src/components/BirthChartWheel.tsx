"use client";

import React, { useMemo, useState } from "react";
import { BirthChart } from "@/lib/astrology";
import { getPlanetById } from "@/data/planets";
import { useTranslation } from "@/lib/i18n";

interface BirthChartWheelProps {
  chart: BirthChart;
}

const ZODIAC_SIGNS = [
  { id: "koc",     emoji: "♈", color: "#ef4444", element: "fire" },
  { id: "boga",    emoji: "♉", color: "#4ade80", element: "earth" },
  { id: "ikizler", emoji: "♊", color: "#38bdf8", element: "air" },
  { id: "yengec",  emoji: "♋", color: "#60a5fa", element: "water" },
  { id: "aslan",   emoji: "♌", color: "#fb923c", element: "fire" },
  { id: "basak",   emoji: "♍", color: "#84cc16", element: "earth" },
  { id: "terazi",  emoji: "♎", color: "#06b6d4", element: "air" },
  { id: "akrep",   emoji: "♏", color: "#3b82f6", element: "water" },
  { id: "yay",     emoji: "♐", color: "#ef4444", element: "fire" },
  { id: "oglak",   emoji: "♑", color: "#10b981", element: "earth" },
  { id: "kova",    emoji: "♒", color: "#0ea5e9", element: "air" },
  { id: "balik",   emoji: "♓", color: "#2563eb", element: "water" },
];

const ELEMENT_COLORS: Record<string, string> = {
  fire:  "#ef4444",
  earth: "#22c55e",
  air:   "#06b6d4",
  water: "#3b82f6",
};

const PLANET_ID_MAP: Record<string, string> = {
  sun: "gunes", moon: "ay", mercury: "merkur", venus: "venus",
  mars: "mars", jupiter: "jupiter", saturn: "saturn",
  uranus: "uranus", neptune: "neptun", pluto: "pluton",
};

export default function BirthChartWheel({ chart }: BirthChartWheelProps) {
  const { t } = useTranslation();
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);

  const ascIndex = ZODIAC_SIGNS.findIndex((s) => s.id === (chart.risingSign?.id || "koc"));
  const ascFullDegree = ascIndex !== -1 ? ascIndex * 30 + (Number(chart.risingSign?.degree) || 0) : 0;

  const getCoords = (deg: number, radius: number) => {
    const visualDeg = 180 - (deg - ascFullDegree);
    const rad = (visualDeg * Math.PI) / 180;
    return { x: 250 + radius * Math.cos(rad), y: 250 + radius * Math.sin(rad) };
  };

  // House cusp full degrees
  const houseCuspDegrees = useMemo(() => {
    return chart.houses.map((h) => {
      const sIdx = ZODIAC_SIGNS.findIndex((s) => s.id === h.signId);
      return sIdx * 30 + (h.degree || 0);
    });
  }, [chart.houses]);

  // MC full degree
  const mcFullDegree = useMemo(() => {
    if (!chart.mc) return null;
    const sIdx = ZODIAC_SIGNS.findIndex((s) => s.id === chart.mc?.signId);
    return sIdx >= 0 ? sIdx * 30 + (chart.mc.degree || 0) : null;
  }, [chart.mc]);

  // Planet dots with anti-collision
  const planetDots = useMemo(() => {
    const dots: {
      x: number; y: number; id: string; img?: string;
      color: string; deg: number; name: string; emoji: string; glow?: string;
    }[] = [];

    chart.planetPositions.forEach((p) => {
      let fDeg = p.fullDegree;
      if (typeof fDeg === "undefined") {
        const sIdx = ZODIAC_SIGNS.findIndex((s) => s.id === p.signId);
        fDeg = (sIdx !== -1 ? sIdx * 30 : 0) + (p.degree || 15);
      }
      const mappedId = PLANET_ID_MAP[p.planetId] || p.planetId.toLowerCase();
      const pData = getPlanetById(mappedId);
      dots.push({
        deg: fDeg,
        ...getCoords(fDeg, 130),
        id: p.planetId,
        img: pData?.imageUrl,
        color: pData?.color || "#d8b4fe",
        glow: pData?.glow,
        name: p.planet,
        emoji: p.emoji,
      });
    });

    for (let iter = 0; iter < 6; iter++) {
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 32) {
            const push = (32 - dist) / 2;
            const angle = Math.atan2(dy, dx);
            dots[i].x += Math.cos(angle) * push;
            dots[i].y += Math.sin(angle) * push;
            dots[j].x -= Math.cos(angle) * push;
            dots[j].y -= Math.sin(angle) * push;
          }
        }
      }
    }
    return dots;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart.planetPositions, ascFullDegree]);

  const selectedPos = selectedPlanetId ? chart.planetPositions.find((p) => p.planetId === selectedPlanetId) : null;
  const selectedPd  = selectedPlanetId ? getPlanetById(PLANET_ID_MAP[selectedPlanetId] || selectedPlanetId) : null;
  const selectedHouseEntry = selectedPlanetId ? Object.entries(chart.planetsByHouse).find(([, ps]) => ps.includes(selectedPlanetId)) : null;
  const selectedAspects = selectedPlanetId ? chart.aspects.filter((a) => a.planet1Id === selectedPlanetId || a.planet2Id === selectedPlanetId) : [];

  return (
    <div className="w-full flex flex-col items-center gap-5 py-2">
      {/* SVG Wheel */}
      <div className="relative w-full max-w-[560px] aspect-square">
        <svg viewBox="-20 -20 540 540" className="w-full h-full">
          <defs>
            <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e1040" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#040410" stopOpacity="0.95" />
            </radialGradient>
            <radialGradient id="outerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="#040410" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.06" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glowStrong" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Background fill */}
          <circle cx="250" cy="250" r="248" fill="#040410" />
          <circle cx="250" cy="250" r="248" fill="url(#outerGrad)" />

          {/* ── ZODIAC SIGN RING (r=195 to r=238) ── */}
          {ZODIAC_SIGNS.map((sign, index) => {
            const startDeg = index * 30;
            const endDeg = startDeg + 30;
            const p1 = getCoords(startDeg, 238);
            const p2 = getCoords(endDeg, 238);
            const p3 = getCoords(endDeg, 195);
            const p4 = getCoords(startDeg, 195);
            const path = `M ${p1.x} ${p1.y} A 238 238 0 0 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A 195 195 0 0 1 ${p4.x} ${p4.y} Z`;
            const elColor = ELEMENT_COLORS[sign.element];
            const iconPos = getCoords(startDeg + 15, 216);
            return (
              <g key={sign.id}>
                <path d={path} fill={elColor} fillOpacity="0.1" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />
                <line
                  x1={getCoords(startDeg, 195).x} y1={getCoords(startDeg, 195).y}
                  x2={getCoords(startDeg, 238).x} y2={getCoords(startDeg, 238).y}
                  stroke="rgba(139,92,246,0.3)" strokeWidth="0.8"
                />
                <text x={iconPos.x} y={iconPos.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="19" fill={elColor} className="select-none"
                  style={{ filter: "drop-shadow(0 0 5px rgba(0,0,0,1))", fontFamily: "serif" }}>
                  {sign.emoji}
                </text>
              </g>
            );
          })}

          {/* ── DEGREE TICK MARKS (r=238 to r=248) ── */}
          {Array.from({ length: 72 }, (_, i) => {
            const deg = i * 5;
            const signIdx = Math.floor(deg / 30);
            const elColor = ELEMENT_COLORS[ZODIAC_SIGNS[signIdx].element];
            const inner = getCoords(deg, i % 2 === 0 ? 233 : 235);
            const outer = getCoords(deg, 238);
            return (
              <line key={`tick-${i}`}
                x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke={elColor} strokeWidth={i % 6 === 0 ? 1.5 : 0.8} strokeOpacity={i % 6 === 0 ? 0.7 : 0.35}
              />
            );
          })}

          {/* ── RING CIRCLES ── */}
          <circle cx="250" cy="250" r="238" fill="none" stroke="rgba(139,92,246,0.35)" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="195" fill="none" stroke="rgba(139,92,246,0.4)"  strokeWidth="1.5" />
          <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="1" />
          <circle cx="250" cy="250" r="58"  fill="url(#centerGrad)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />

          {/* ── HOUSE CUSP LINES ── */}
          {houseCuspDegrees.map((cuspDeg, i) => {
            const inner = getCoords(cuspDeg, 58);
            const outer = getCoords(cuspDeg, 195);
            const isAngle = i === 0 || i === 3 || i === 6 || i === 9; // ASC,IC,DSC,MC
            return (
              <line key={`cusp-${i}`}
                x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke={isAngle ? "rgba(139,92,246,0.6)" : "rgba(139,92,246,0.25)"}
                strokeWidth={isAngle ? 1.5 : 0.8}
              />
            );
          })}

          {/* ── HOUSE NUMBERS (mid-house) ── */}
          {houseCuspDegrees.map((cuspDeg, i) => {
            const nextCusp = houseCuspDegrees[(i + 1) % 12];
            let midDeg = cuspDeg + (nextCusp - cuspDeg) / 2;
            // Handle wraparound
            if (nextCusp < cuspDeg) midDeg = cuspDeg + (nextCusp + 360 - cuspDeg) / 2;
            const pos = getCoords(midDeg, 148);
            return (
              <text key={`hnum-${i}`}
                x={pos.x} y={pos.y}
                fill="rgba(255,255,255,0.22)" fontSize="10" fontWeight="600"
                textAnchor="middle" dominantBaseline="middle">
                {i + 1}
              </text>
            );
          })}

          {/* ── ASPECT LINES ── */}
          {chart.aspects.map((aspect, i) => {
            const p1 = planetDots.find((pd) => pd.id === aspect.planet1Id);
            const p2 = planetDots.find((pd) => pd.id === aspect.planet2Id);
            if (!p1 || !p2) return null;

            const isInvolved = !selectedPlanetId || aspect.planet1Id === selectedPlanetId || aspect.planet2Id === selectedPlanetId;
            const opacity = isInvolved ? (selectedPlanetId ? 0.88 : 0.38) : 0.04;

            let rgb = "203,213,225";
            if (aspect.harmony === "positive") rgb = "74,222,128";
            else if (aspect.harmony === "negative") rgb = "248,113,113";
            else rgb = "96,165,250";

            const sw = aspect.orb <= 1 ? 2.5 : aspect.orb <= 3 ? 2 : aspect.orb <= 5 ? 1.5 : 1;

            return (
              <line key={i}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={`rgba(${rgb},${opacity})`}
                strokeWidth={sw}
                strokeDasharray={aspect.harmony === "negative" ? "5 3" : "none"}
                style={{ transition: "all 0.2s" }}
                filter={isInvolved && selectedPlanetId ? "url(#glow)" : undefined}
              >
                <title>{p1.name} {aspect.type} {p2.name} ({aspect.orb}°)</title>
              </line>
            );
          })}

          {/* ── ASC/DSC LINE ── */}
          {(() => {
            const ascStart = getCoords(ascFullDegree, 240);
            const ascEnd   = getCoords(ascFullDegree + 180, 240);
            const ascLabel = getCoords(ascFullDegree, 252);
            const dscLabel = getCoords(ascFullDegree + 180, 252);
            return (
              <g filter="url(#glow)">
                <line x1={ascStart.x} y1={ascStart.y} x2={ascEnd.x} y2={ascEnd.y}
                  stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.7" />
                <text x={ascLabel.x} y={ascLabel.y} fill="#f43f5e" fontSize="9" fontWeight="900"
                  textAnchor="middle" dominantBaseline="middle">ASC</text>
                <text x={dscLabel.x} y={dscLabel.y} fill="#f43f5e" fontSize="9" fontWeight="700"
                  textAnchor="middle" dominantBaseline="middle" opacity="0.6">DSC</text>
              </g>
            );
          })()}

          {/* ── MC/IC LINE ── */}
          {mcFullDegree !== null && (() => {
            const mcStart  = getCoords(mcFullDegree, 240);
            const icEnd    = getCoords(mcFullDegree + 180, 240);
            const mcLabel  = getCoords(mcFullDegree, 252);
            const icLabel  = getCoords(mcFullDegree + 180, 252);
            return (
              <g filter="url(#glow)">
                <line x1={mcStart.x} y1={mcStart.y} x2={icEnd.x} y2={icEnd.y}
                  stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 3" opacity="0.5" />
                <text x={mcLabel.x} y={mcLabel.y} fill="#38bdf8" fontSize="9" fontWeight="900"
                  textAnchor="middle" dominantBaseline="middle">MC</text>
                <text x={icLabel.x} y={icLabel.y} fill="#38bdf8" fontSize="9" fontWeight="700"
                  textAnchor="middle" dominantBaseline="middle" opacity="0.6">IC</text>
              </g>
            );
          })()}

          {/* ── PLANETS ── */}
          {planetDots.map((planet) => {
            const isSelected = planet.id === selectedPlanetId;
            const isRelated  = selectedPlanetId && !isSelected && chart.aspects.some(
              (a) => (a.planet1Id === selectedPlanetId && a.planet2Id === planet.id) ||
                     (a.planet2Id === selectedPlanetId && a.planet1Id === planet.id)
            );
            const isDimmed   = selectedPlanetId && !isSelected && !isRelated;
            const r = isSelected ? 19 : 15;
            return (
              <g key={planet.id}
                onClick={() => setSelectedPlanetId((p) => p === planet.id ? null : planet.id)}
                style={{ cursor: "pointer", opacity: isDimmed ? 0.2 : 1, transition: "opacity 0.2s" }}>
                {isSelected && (
                  <circle cx={planet.x} cy={planet.y} r="27"
                    fill="none" stroke={planet.color} strokeWidth="1.5" strokeOpacity="0.5"
                    filter="url(#glowStrong)" />
                )}
                {isRelated && (
                  <circle cx={planet.x} cy={planet.y} r="21"
                    fill="none" stroke={planet.color} strokeWidth="0.8" strokeOpacity="0.35" />
                )}
                <circle cx={planet.x} cy={planet.y} r={r}
                  fill="#060612" fillOpacity="0.97"
                  stroke={planet.color} strokeWidth={isSelected ? 2 : 1.5}
                  filter={isSelected ? "url(#glowStrong)" : undefined} />
                {planet.img ? (
                  <image href={planet.img}
                    x={planet.x - (isSelected ? 14 : 11)} y={planet.y - (isSelected ? 14 : 11)}
                    width={isSelected ? 28 : 22} height={isSelected ? 28 : 22}
                    style={{ clipPath: "circle(50% at 50% 50%)" }} />
                ) : (
                  <text x={planet.x} y={planet.y} textAnchor="middle" dominantBaseline="central"
                    fontSize={isSelected ? 17 : 13} fill="#fff">{planet.emoji}</text>
                )}
              </g>
            );
          })}

          {/* ── ASPECT LEGEND (bottom of SVG, outside circle) ── */}
          <g transform="translate(250, 510)">
            {[
              { color: "#4ade80", label: "Uyumlu" },
              { color: "#f87171", label: "Zorlayıcı" },
              { color: "#60a5fa", label: "Nötr" },
            ].map((item, i) => (
              <g key={i} transform={`translate(${(i - 1) * 100}, 0)`}>
                <line x1="-16" y1="0" x2="-2" y2="0" stroke={item.color} strokeWidth="2" opacity="0.8" />
                <text x="0" y="1" fill={item.color} fontSize="9" dominantBaseline="middle" opacity="0.8">{item.label}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Click hint */}
      {!selectedPlanetId && (
        <p className="text-[10px] text-gray-600 uppercase tracking-widest text-center -mt-3">
          Gezegene tıklayarak açılarını ve detaylarını görün
        </p>
      )}

      {/* Info Panel */}
      {selectedPos && selectedPd && (
        <div className="w-full max-w-[560px] rounded-2xl border border-white/10 bg-white/[0.03] p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/15"
              style={{ boxShadow: `0 0 20px ${selectedPd.glow || "rgba(139,92,246,0.3)"}` }}>
              {selectedPd.imageUrl
                ? <img src={selectedPd.imageUrl} alt={selectedPos.planet} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">{selectedPos.emoji}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-base">{selectedPos.planet}</h4>
              <p className="text-amber-400 text-xs mt-0.5">
                {selectedPos.sign} · {selectedPos.degree}°
                {selectedPos.retrograde && <span className="text-red-400 ml-2">℞ Retrograde</span>}
              </p>
              {selectedHouseEntry && (
                <p className="text-gray-500 text-[10px] mt-0.5">{selectedHouseEntry[0]}. Ev</p>
              )}
            </div>
            <button onClick={() => setSelectedPlanetId(null)}
              className="text-gray-600 hover:text-gray-400 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/5 shrink-0 text-lg leading-none">✕</button>
          </div>

          {selectedAspects.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-2 font-bold">
                Yapılan Açılar ({selectedAspects.length})
              </p>
              <div className="space-y-1.5">
                {selectedAspects.map((a, i) => {
                  const otherId = a.planet1Id === selectedPlanetId ? a.planet2Id : a.planet1Id;
                  const otherPos = chart.planetPositions.find((p) => p.planetId === otherId);
                  const otherPd  = getPlanetById(PLANET_ID_MAP[otherId] || otherId);
                  const bg = a.harmony === "positive" ? "rgba(74,222,128,0.1)" : a.harmony === "negative" ? "rgba(248,113,113,0.1)" : "rgba(96,165,250,0.1)";
                  const border = a.harmony === "positive" ? "rgba(74,222,128,0.2)" : a.harmony === "negative" ? "rgba(248,113,113,0.2)" : "rgba(96,165,250,0.2)";
                  const textCol = a.harmony === "positive" ? "#4ade80" : a.harmony === "negative" ? "#f87171" : "#60a5fa";
                  return (
                    <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                      style={{ background: bg, border: `1px solid ${border}` }}>
                      {otherPd?.imageUrl && <img src={otherPd.imageUrl} alt={otherId} className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/10" />}
                      <span className="text-base leading-none">{a.typeEmoji}</span>
                      <span className="text-white text-xs font-medium flex-1 min-w-0 truncate">{otherPos?.planet || otherId}</span>
                      <span className="text-[9px] font-mono shrink-0" style={{ color: textCol }}>{a.orb}°</span>
                      <span className="text-[8px] uppercase tracking-wider shrink-0 font-bold" style={{ color: textCol }}>
                        {a.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
