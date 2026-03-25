"use client";

import React, { useMemo } from "react";
import { BirthChart } from "@/lib/astrology";
import { planets } from "@/data/planets";

interface BirthChartWheelProps {
  chart: BirthChart;
}

const ZODIAC_SIGNS = [
  { id: "koc", emoji: "♈", color: "#f87171", element: "fire" },
  { id: "boga", emoji: "♉", color: "#4ade80", element: "earth" },
  { id: "ikizler", emoji: "♊", color: "#38bdf8", element: "air" },
  { id: "yengec", emoji: "♋", color: "#60a5fa", element: "water" },
  { id: "aslan", emoji: "aslan", color: "#fb923c", element: "fire" }, // Fix: mapping to planet collection if needed, but here it's sign emoji
  { id: "basak", emoji: "♍", color: "#84cc16", element: "earth" },
  { id: "terazi", emoji: "♎", color: "#06b6d4", element: "air" },
  { id: "akrep", emoji: "♏", color: "#3b82f6", element: "water" },
  { id: "yay", emoji: "♐", color: "#ef4444", element: "fire" },
  { id: "oglak", emoji: "♑", color: "#10b981", element: "earth" },
  { id: "kova", emoji: "♒", color: "#0ea5e9", element: "air" },
  { id: "balik", emoji: "♓", color: "#2563eb", element: "water" },
];

// Actual sign emojis for the outer ring
const SIGN_EMOJIS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const ELEMENT_COLORS = {
  fire: "#ef4444",
  earth: "#22c55e",
  air: "#06b6d4",
  water: "#3b82f6"
};

export default function BirthChartWheel({ chart }: BirthChartWheelProps) {
  // 1. Calculate Ascendant Full Degree
  const ascIndex = ZODIAC_SIGNS.findIndex((s) => s.id === (chart.risingSign?.id || "koc"));
  const ascFullDegree = ascIndex !== -1 ? ascIndex * 30 + (Number(chart.risingSign?.degree) || 0) : 0;

  // 2. Math helper for SVG coordinates based on astrological degree
  const getCoordinates = (deg: number, radius: number) => {
    // 180° is the 9 o'clock position (Ascendant)
    // As degree increases, visual angle decreases (counter-clockwise)
    const visualDeg = 180 - (deg - ascFullDegree);
    const rad = (visualDeg * Math.PI) / 180;
    return {
      x: 250 + radius * Math.cos(rad),
      y: 250 + radius * Math.sin(rad),
    };
  };

  // 3. Pre-process planet positions to resolve overlaps
  const planetDots = useMemo(() => {
    const dots: { x: number; y: number; label: string; id: string; img?: string; color: string; deg: number; name: string }[] = [];
    
    const planetIdMap: Record<string, string> = {
      sun: "gunes",
      moon: "ay",
      mercury: "merkur",
      neptune: "neptun",
      pluto: "pluton"
    };

    chart.planetPositions.forEach((p) => {
      let fDeg = p.fullDegree;
      if (typeof fDeg === "undefined") {
        const sIdx = ZODIAC_SIGNS.findIndex((s) => s.id === p.signId);
        fDeg = (sIdx !== -1 ? sIdx * 30 : 0) + (p.degree || 15);
      }

      const mappedId = planetIdMap[p.planetId] || p.planetId.toLowerCase();
      const pData = planets.find(pd => pd.id === mappedId);

      dots.push({
        deg: fDeg,
        ...getCoordinates(fDeg, 145), // Inner radius for planets
        label: p.emoji,
        id: p.planetId,
        img: pData?.imageUrl,
        color: pData?.color || "#d8b4fe",
        name: p.planet
      });
    });

    // Anti-collision nudging
    for (let iter = 0; iter < 5; iter++) {
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 28) {
            const push = (28 - dist) / 2;
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
  }, [chart.planetPositions, ascFullDegree]);

  return (
    <div className="w-full flex justify-center py-6">
      <div className="relative w-full max-w-[550px] aspect-square">
        <svg viewBox="-30 -30 560 560" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <defs>
            <radialGradient id="ringBg" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#0a0a1a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.4" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background circles */}
          <circle cx="250" cy="250" r="245" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" />
          <circle cx="250" cy="250" r="235" fill="url(#ringBg)" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1" />
          
          {/* 12 Zodiac Sign Slices & Element Coloring */}
          {ZODIAC_SIGNS.map((sign, index) => {
            const startAngle = index * 30;
            const endAngle = (index + 1) * 30;
            
            const p1 = getCoordinates(startAngle, 235);
            const p2 = getCoordinates(endAngle, 235);
            const p3 = getCoordinates(endAngle, 190);
            const p4 = getCoordinates(startAngle, 190);
            
            const sectorPath = `M ${p1.x} ${p1.y} A 235 235 0 0 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A 190 190 0 0 1 ${p4.x} ${p4.y} Z`;

            const sectorColor = ELEMENT_COLORS[sign.element as keyof typeof ELEMENT_COLORS];
            const centerDeg = startAngle + 15;
            const iconCoord = getCoordinates(centerDeg, 212);

            return (
              <g key={sign.id}>
                <title>{sign.id.toUpperCase()}</title>
                {/* Sector Background */}
                <path 
                  d={sectorPath} 
                  fill={sectorColor} 
                  fillOpacity="0.08" 
                  stroke="rgba(139, 92, 246, 0.15)" 
                  strokeWidth="0.5"
                />
                
                {/* Divider Line */}
                <line
                  {...getCoordinates(startAngle, 190)}
                  {...getCoordinates(startAngle, 235)}
                  stroke="rgba(139, 92, 246, 0.2)"
                  strokeWidth="1"
                />
                
                {/* Sign Icon */}
                <text
                  x={iconCoord.x}
                  y={iconCoord.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="22"
                  fill={sign.color}
                  className="select-none"
                  style={{ filter: "drop-shadow(0px 0px 4px rgba(0,0,0,0.8))" }}
                >
                  {SIGN_EMOJIS[index]}
                </text>
              </g>
            );
          })}

          {/* Inner rings */}
          <circle cx="250" cy="250" r="190" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="1" />

          {/* Aspect Lines */}
          <g filter="url(#glow)">
            {chart.aspects.map((aspect, i) => {
              const p1 = planetDots.find(pd => pd.id === aspect.planet1Id);
              const p2 = planetDots.find(pd => pd.id === aspect.planet2Id);
              
              if (!p1 || !p2) return null;

              let color = "rgba(203, 213, 225, 0.3)"; 
              if (aspect.harmony === "positive") color = "rgba(74, 222, 128, 0.5)"; 
              else if (aspect.harmony === "negative") color = "rgba(248, 113, 113, 0.5)"; 

              return (
                <line
                  key={i}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={color}
                  strokeWidth={aspect.orb < 1 ? "2" : "1"}
                  strokeDasharray={aspect.harmony === "negative" ? "4 2" : "none"}
                >
                  <title>{aspect.description}</title>
                </line>
              );
            })}
          </g>

          {/* Planets */}
          {planetDots.map((planet) => (
            <g key={planet.id} className="transition-all duration-500">
              <title>{planet.name} at {planet.deg.toFixed(2)}°</title>
              
              {/* Orb Effect */}
              <circle cx={planet.x} cy={planet.y} r="16" fill="#0f172a" fillOpacity="0.9" stroke={planet.color} strokeWidth="1.5" />
              
              {/* Planet Image or Emoji */}
              {planet.img ? (
                <image
                  href={planet.img}
                  x={planet.x - 12}
                  y={planet.y - 12}
                  width="24"
                  height="24"
                  className="rounded-full"
                  style={{ clipPath: "circle(50% at 50% 50%)" }}
                />
              ) : (
                <text
                  x={planet.x}
                  y={planet.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="16"
                  fill="#ffffff"
                >
                  {planet.label}
                </text>
              )}
            </g>
          ))}

          {/* House Cusps (Numbers) */}
          {[...Array(12)].map((_, i) => {
            const deg = i * 30;
            const coord = getCoordinates(deg + 3, 110);
            return (
              <text
                key={i}
                x={coord.x}
                y={coord.y}
                fill="rgba(255,255,255,0.25)"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                {i + 1}
              </text>
            );
          })}

          {/* Ascendant Line (Horizon) */}
          <line x1="10" y1="250" x2="250" y2="250" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 3" opacity="0.6" filter="url(#glow)" />
          <g transform="translate(-10, 250)">
            <text x="0" y="4" fill="#f43f5e" fontSize="12" fontWeight="900" textAnchor="end" style={{ letterSpacing: "1px", filter: "drop-shadow(0 0 2px rgba(244, 63, 94, 0.4))" }}>ASC</text>
          </g>
          
          {/* Midheaven Line (Zenith) */}
          <line x1="250" y1="10" x2="250" y2="250" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.5" filter="url(#glow)" />
          <g transform="translate(250, -15)">
            <text x="0" y="0" fill="#38bdf8" fontSize="12" fontWeight="900" textAnchor="middle" style={{ letterSpacing: "1px", filter: "drop-shadow(0 0 2px rgba(56, 189, 248, 0.4))" }}>MC</text>
          </g>

        </svg>
      </div>
    </div>
  );
}
