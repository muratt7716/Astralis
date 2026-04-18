"use client";

import React, { useMemo, useState } from "react";
import { BirthChart } from "@/lib/astrology";
import { getPlanetById } from "@/data/planets";
import { useTranslation } from "@/lib/i18n";

interface BirthChartWheelProps {
  chart: BirthChart;
}

const ZODIAC_SIGNS = [
  { id: "koc",     emoji: "♈", color: "#f87171", element: "fire" },
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

const ELEMENT_COLORS = {
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

  const getCoordinates = (deg: number, radius: number) => {
    const visualDeg = 180 - (deg - ascFullDegree);
    const rad = (visualDeg * Math.PI) / 180;
    return { x: 250 + radius * Math.cos(rad), y: 250 + radius * Math.sin(rad) };
  };

  const planetDots = useMemo(() => {
    const dots: {
      x: number; y: number; id: string; img?: string;
      color: string; deg: number; name: string; emoji: string;
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
        ...getCoordinates(fDeg, 145),
        id: p.planetId,
        img: pData?.imageUrl,
        color: pData?.color || "#d8b4fe",
        name: p.planet,
        emoji: p.emoji,
      });
    });

    for (let iter = 0; iter < 5; iter++) {
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 30) {
            const push = (30 - dist) / 2;
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

  // Derived state for selected planet info
  const selectedPos = selectedPlanetId
    ? chart.planetPositions.find((p) => p.planetId === selectedPlanetId)
    : null;
  const selectedPd = selectedPlanetId
    ? getPlanetById(PLANET_ID_MAP[selectedPlanetId] || selectedPlanetId)
    : null;
  const selectedHouseEntry = selectedPlanetId
    ? Object.entries(chart.planetsByHouse).find(([, ps]) => ps.includes(selectedPlanetId))
    : null;
  const selectedAspects = selectedPlanetId
    ? chart.aspects.filter(
        (a) => a.planet1Id === selectedPlanetId || a.planet2Id === selectedPlanetId
      )
    : [];

  const handlePlanetClick = (planetId: string) => {
    setSelectedPlanetId((prev) => (prev === planetId ? null : planetId));
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 py-4">
      {/* SVG Wheel */}
      <div className="relative w-full max-w-[520px] aspect-square">
        <svg
          viewBox="-30 -30 560 560"
          className="w-full h-full drop-shadow-[0_0_24px_rgba(0,0,0,0.6)]"
        >
          <defs>
            <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#060612" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.5" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowStrong">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="planetClip">
              <circle cx="0" cy="0" r="13" />
            </clipPath>
          </defs>

          {/* Outer decoration ring */}
          <circle cx="250" cy="250" r="248" fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="238" fill="url(#wheelBg)" stroke="rgba(139,92,246,0.08)" strokeWidth="1" />

          {/* Zodiac sign slices */}
          {ZODIAC_SIGNS.map((sign, index) => {
            const startAngle = index * 30;
            const endAngle = (index + 1) * 30;
            const p1 = getCoordinates(startAngle, 238);
            const p2 = getCoordinates(endAngle, 238);
            const p3 = getCoordinates(endAngle, 192);
            const p4 = getCoordinates(startAngle, 192);
            const sectorPath = `M ${p1.x} ${p1.y} A 238 238 0 0 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A 192 192 0 0 1 ${p4.x} ${p4.y} Z`;
            const sectorColor = ELEMENT_COLORS[sign.element as keyof typeof ELEMENT_COLORS];
            const iconCoord = getCoordinates(startAngle + 15, 215);
            return (
              <g key={sign.id}>
                <path
                  d={sectorPath}
                  fill={sectorColor}
                  fillOpacity="0.07"
                  stroke="rgba(139,92,246,0.18)"
                  strokeWidth="0.5"
                />
                <line
                  {...getCoordinates(startAngle, 192)}
                  {...getCoordinates(startAngle, 238)}
                  stroke="rgba(139,92,246,0.25)"
                  strokeWidth="1"
                />
                <text
                  x={iconCoord.x}
                  y={iconCoord.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="20"
                  fill={sign.color}
                  className="select-none"
                  style={{ filter: "drop-shadow(0px 0px 5px rgba(0,0,0,0.9))" }}
                >
                  {sign.emoji}
                </text>
              </g>
            );
          })}

          {/* Inner rings */}
          <circle cx="250" cy="250" r="192" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="165" fill="none" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="1" />

          {/* House division lines (every 30°, finer) */}
          {[...Array(12)].map((_, i) => {
            const inner = getCoordinates(i * 30, 100);
            const outer = getCoordinates(i * 30, 192);
            return (
              <line
                key={`hdiv-${i}`}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="rgba(139,92,246,0.15)"
                strokeWidth="0.5"
              />
            );
          })}

          {/* House numbers */}
          {[...Array(12)].map((_, i) => {
            const coord = getCoordinates(i * 30 + 15, 128);
            return (
              <text
                key={`hnum-${i}`}
                x={coord.x}
                y={coord.y}
                fill="rgba(255,255,255,0.2)"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {i + 1}
              </text>
            );
          })}

          {/* Aspect Lines */}
          {chart.aspects.map((aspect, i) => {
            const p1 = planetDots.find((pd) => pd.id === aspect.planet1Id);
            const p2 = planetDots.find((pd) => pd.id === aspect.planet2Id);
            if (!p1 || !p2) return null;

            const isInvolved =
              !selectedPlanetId ||
              aspect.planet1Id === selectedPlanetId ||
              aspect.planet2Id === selectedPlanetId;

            let baseRGB = "203,213,225";
            if (aspect.harmony === "positive") baseRGB = "74,222,128";
            else if (aspect.harmony === "negative") baseRGB = "248,113,113";
            else baseRGB = "96,165,250";

            const opacity = isInvolved
              ? selectedPlanetId
                ? 0.85
                : 0.45
              : 0.05;

            const strokeWidth =
              aspect.orb <= 1 ? 2.5 :
              aspect.orb <= 3 ? 2 :
              aspect.orb <= 5 ? 1.5 : 1;

            return (
              <line
                key={i}
                x1={p1.x} y1={p1.y}
                x2={p2.x} y2={p2.y}
                stroke={`rgba(${baseRGB},${opacity})`}
                strokeWidth={strokeWidth}
                strokeDasharray={aspect.harmony === "negative" ? "5 3" : "none"}
                style={{ transition: "all 0.25s ease" }}
                filter={isInvolved && selectedPlanetId ? "url(#glow)" : undefined}
              >
                <title>{aspect.description} ({aspect.orb}° orb)</title>
              </line>
            );
          })}

          {/* Planets */}
          {planetDots.map((planet) => {
            const isSelected = planet.id === selectedPlanetId;
            const isRelated =
              selectedPlanetId &&
              chart.aspects.some(
                (a) =>
                  (a.planet1Id === selectedPlanetId && a.planet2Id === planet.id) ||
                  (a.planet2Id === selectedPlanetId && a.planet1Id === planet.id)
              );
            const isDimmed = selectedPlanetId && !isSelected && !isRelated;
            const r = isSelected ? 20 : 16;

            return (
              <g
                key={planet.id}
                onClick={() => handlePlanetClick(planet.id)}
                style={{
                  cursor: "pointer",
                  opacity: isDimmed ? 0.25 : 1,
                  transition: "opacity 0.25s ease",
                }}
              >
                {/* Outer glow ring for selected */}
                {isSelected && (
                  <circle
                    cx={planet.x} cy={planet.y} r="27"
                    fill="none"
                    stroke={planet.color}
                    strokeWidth="1.5"
                    strokeOpacity="0.5"
                    filter="url(#glowStrong)"
                  />
                )}
                {/* Related planet indicator */}
                {isRelated && !isSelected && (
                  <circle
                    cx={planet.x} cy={planet.y} r="20"
                    fill="none"
                    stroke={planet.color}
                    strokeWidth="0.8"
                    strokeOpacity="0.4"
                  />
                )}
                {/* Planet circle */}
                <circle
                  cx={planet.x} cy={planet.y} r={r}
                  fill="#080816"
                  fillOpacity="0.95"
                  stroke={planet.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  filter={isSelected ? "url(#glowStrong)" : undefined}
                />
                {/* Planet image */}
                {planet.img ? (
                  <image
                    href={planet.img}
                    x={planet.x - (isSelected ? 15 : 12)}
                    y={planet.y - (isSelected ? 15 : 12)}
                    width={isSelected ? 30 : 24}
                    height={isSelected ? 30 : 24}
                    style={{ clipPath: "circle(50% at 50% 50%)" }}
                  />
                ) : (
                  <text
                    x={planet.x} y={planet.y}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={isSelected ? 18 : 14}
                    fill="#ffffff"
                  >
                    {planet.emoji}
                  </text>
                )}
              </g>
            );
          })}

          {/* ASC line */}
          <line x1="10" y1="250" x2="490" y2="250"
            stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5"
            filter="url(#glow)"
          />
          <text x="-5" y="254" fill="#f43f5e" fontSize="11" fontWeight="900"
            textAnchor="end"
            style={{ letterSpacing: "0.5px", filter: "drop-shadow(0 0 3px rgba(244,63,94,0.5))" }}>
            ASC
          </text>

          {/* MC line */}
          <line x1="250" y1="10" x2="250" y2="490"
            stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 4" opacity="0.35"
            filter="url(#glow)"
          />
          <text x="250" y="-5" fill="#38bdf8" fontSize="11" fontWeight="900"
            textAnchor="middle"
            style={{ letterSpacing: "0.5px", filter: "drop-shadow(0 0 3px rgba(56,189,248,0.4))" }}>
            MC
          </text>
        </svg>
      </div>

      {/* Click hint */}
      {!selectedPlanetId && (
        <p className="text-[10px] text-gray-600 uppercase tracking-widest text-center">
          {t("chart.wheel.click_hint")}
        </p>
      )}

      {/* Info Panel */}
      {selectedPos && selectedPd && (
        <div className="w-full max-w-[520px] rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Planet header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/15"
              style={{ boxShadow: `0 0 20px ${selectedPd.glow || "rgba(139,92,246,0.3)"}` }}
            >
              {selectedPd.imageUrl ? (
                <img src={selectedPd.imageUrl} alt={selectedPos.planet} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">{selectedPos.emoji}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-base leading-tight">{selectedPos.planet}</h4>
              <p className="text-amber-400 text-xs mt-0.5">
                {selectedPos.sign} · {selectedPos.degree}°
                {selectedPos.retrograde && <span className="text-red-400 ml-2">℞</span>}
              </p>
              {selectedHouseEntry && (
                <p className="text-gray-500 text-[10px] mt-0.5">{t("chart.planet.in_house", { n: selectedHouseEntry[0] })}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedPlanetId(null)}
              className="text-gray-600 hover:text-gray-400 transition-colors text-lg leading-none shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/5"
            >
              ✕
            </button>
          </div>

          {/* Aspects of selected planet */}
          {selectedAspects.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-2 font-bold">
                {t("chart.wheel.planet_aspects")} ({selectedAspects.length})
              </p>
              <div className="space-y-1.5">
                {selectedAspects.map((a, i) => {
                  const otherId = a.planet1Id === selectedPlanetId ? a.planet2Id : a.planet1Id;
                  const otherPos = chart.planetPositions.find((p) => p.planetId === otherId);
                  const otherPd = getPlanetById(PLANET_ID_MAP[otherId] || otherId);
                  const harmonyColor =
                    a.harmony === "positive" ? "rgba(74,222,128,0.15)" :
                    a.harmony === "negative" ? "rgba(248,113,113,0.15)" :
                    "rgba(96,165,250,0.15)";
                  const harmonyBorder =
                    a.harmony === "positive" ? "rgba(74,222,128,0.25)" :
                    a.harmony === "negative" ? "rgba(248,113,113,0.25)" :
                    "rgba(96,165,250,0.25)";
                  const harmonyText =
                    a.harmony === "positive" ? "#4ade80" :
                    a.harmony === "negative" ? "#f87171" : "#60a5fa";

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                      style={{ background: harmonyColor, border: `1px solid ${harmonyBorder}` }}
                    >
                      {otherPd?.imageUrl && (
                        <img src={otherPd.imageUrl} alt={otherId} className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/10" />
                      )}
                      <span className="text-base leading-none">{a.typeEmoji}</span>
                      <span className="text-white text-xs font-medium flex-1 min-w-0 truncate">
                        {otherPos?.planet || otherId}
                      </span>
                      <span className="text-[9px] font-mono shrink-0" style={{ color: harmonyText }}>
                        {a.orb}° orb
                      </span>
                      <span
                        className="text-[8px] uppercase tracking-wider shrink-0 font-bold"
                        style={{ color: harmonyText }}
                      >
                        {t(`astrology.aspect.${a.typeId}`)}
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
