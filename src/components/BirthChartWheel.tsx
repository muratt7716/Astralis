"use client";

import React, { useMemo } from "react";
import { BirthChart } from "@/lib/astrology";

interface BirthChartWheelProps {
  chart: BirthChart;
}

const ZODIAC_SIGNS = [
  { id: "koc", emoji: "♈", color: "#f87171" }, // Fire
  { id: "boga", emoji: "♉", color: "#4ade80" }, // Earth
  { id: "ikizler", emoji: "♊", color: "#38bdf8" }, // Air
  { id: "yengec", emoji: "♋", color: "#60a5fa" }, // Water
  { id: "aslan", emoji: "♌", color: "#f87171" },
  { id: "basak", emoji: "♍", color: "#4ade80" },
  { id: "terazi", emoji: "♎", color: "#38bdf8" },
  { id: "akrep", emoji: "♏", color: "#60a5fa" },
  { id: "yay", emoji: "♐", color: "#f87171" },
  { id: "oglak", emoji: "♑", color: "#4ade80" },
  { id: "kova", emoji: "♒", color: "#38bdf8" },
  { id: "balik", emoji: "♓", color: "#60a5fa" },
];

export default function BirthChartWheel({ chart }: BirthChartWheelProps) {
  // 1. Calculate Ascendant Full Degree
  const ascIndex = ZODIAC_SIGNS.findIndex((s) => s.id === chart.risingSign.id);
  const ascFullDegree = ascIndex !== -1 ? ascIndex * 30 + (Number(chart.risingSign.degree) || 0) : 0;

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
    const dots: { x: number; y: number; label: string; color: string; deg: number }[] = [];
    chart.planetPositions.forEach((p) => {
      // Find exact full degree or use roughly sign * 30 + degree
      let fDeg = p.fullDegree;
      if (typeof fDeg === "undefined") {
        const sIdx = ZODIAC_SIGNS.findIndex((s) => s.id === p.signId);
        fDeg = (sIdx !== -1 ? sIdx * 30 : 0) + (p.degree || 15);
      }
      dots.push({
        deg: fDeg,
        ...getCoordinates(fDeg, 140), // Inner radius for planets
        label: p.emoji,
        color: "#d8b4fe", // Purple-300
      });
    });

    // Simple anti-collision nudging
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 18) { // If they are too close
          // Nudge them apart slightly based on angle
          const push = 10;
          dots[i].x += (dx / dist) * push;
          dots[i].y += (dy / dist) * push;
          dots[j].x -= (dx / dist) * push;
          dots[j].y -= (dy / dist) * push;
        }
      }
    }
    return dots;
  }, [chart.planetPositions, ascFullDegree]);

  return (
    <div className="w-full flex justify-center py-6">
      <div className="relative w-full max-w-[500px] aspect-square">
        <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl">
          <defs>
            <radialGradient id="ringBg" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="#2e1065" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.8" />
            </radialGradient>
          </defs>

          {/* Background circles */}
          <circle cx="250" cy="250" r="230" fill="url(#ringBg)" stroke="#8b5cf6" strokeWidth="2" strokeOpacity="0.3" />
          <circle cx="250" cy="250" r="180" fill="none" stroke="#6d28d9" strokeWidth="1" strokeOpacity="0.5" />
          <circle cx="250" cy="250" r="100" fill="none" stroke="#6d28d9" strokeWidth="1" strokeOpacity="0.2" />

          {/* 12 Zodiac Sign Slices */}
          {ZODIAC_SIGNS.map((sign, index) => {
            const startDeg = index * 30;
            const centerDeg = startDeg + 15;
            // Draw lines dividing the signs
            const lineCoord = getCoordinates(startDeg, 230);
            const innerCoord = getCoordinates(startDeg, 180);
            
            // Icon position
            const iconCoord = getCoordinates(centerDeg, 205);

            return (
              <g key={sign.id}>
                {/* Divider Line */}
                <line
                  x1={innerCoord.x}
                  y1={innerCoord.y}
                  x2={lineCoord.x}
                  y2={lineCoord.y}
                  stroke="#8b5cf6"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
                
                {/* Sign Icon */}
                <text
                  x={iconCoord.x}
                  y={iconCoord.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="24"
                  fill={sign.color}
                  opacity="0.9"
                  style={{ filter: "drop-shadow(0px 0px 4px rgba(0,0,0,0.5))" }}
                >
                  {sign.emoji}
                </text>
              </g>
            );
          })}

          {/* Aspect Lines */}
          <g opacity="0.4">
            {chart.aspects.map((aspect, i) => {
              // Find the two planets to draw a line between them
              const p1 = planetDots.find(p => p.label === chart.planetPositions.find(x => x.planet === aspect.planet1)?.emoji);
              const p2 = planetDots.find(p => p.label === chart.planetPositions.find(x => x.planet === aspect.planet2)?.emoji);
              
              if (!p1 || !p2) return null;

              let color = "#cbd5e1"; // neutral
              if (aspect.harmony === "positive") color = "#4ade80"; // green
              else if (aspect.harmony === "negative") color = "#f87171"; // red

              return (
                <line
                  key={i}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={color}
                  strokeWidth="1.5"
                  opacity={1 - (aspect.orb / 10)} // Stronger aspects are more opaque
                />
              );
            })}
          </g>

          {/* Planets */}
          {planetDots.map((planet, i) => (
            <g key={i}>
              <circle cx={planet.x} cy={planet.y} r="12" fill="#1e1b4b" stroke={planet.color} strokeWidth="1.5" />
              <text
                x={planet.x}
                y={planet.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="14"
                fill="#ffffff"
              >
                {planet.label}
              </text>
            </g>
          ))}

          {/* Ascendant Line (Always horizontal left) */}
          <line x1="20" y1="250" x2="250" y2="250" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" opacity="0.8" />
          <text x="35" y="240" fill="#f43f5e" fontSize="12" fontWeight="bold">ASC</text>
          
          {/* Midheaven Line (Top) */}
          <line x1="250" y1="20" x2="250" y2="250" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
          <text x="260" y="35" fill="#38bdf8" fontSize="12" fontWeight="bold">MC</text>

        </svg>
      </div>
    </div>
  );
}
