"use client";

import React from "react";
import { calculateBiorhythmRange } from "@/lib/biorhythm";

interface BiorhythmChartProps {
  birthDate: string;
  targetDate: string;
  activeTab?: "primary" | "advanced";
  showPartner?: boolean;
  partnerBirthDate?: string;
  language?: string;
}

export function BiorhythmChart({
  birthDate,
  targetDate,
  activeTab = "primary",
  showPartner = false,
  partnerBirthDate,
}: BiorhythmChartProps) {
  const parsedBirth = React.useMemo(() => new Date(birthDate), [birthDate]);
  const parsedTarget = React.useMemo(() => new Date(targetDate), [targetDate]);

  const chartData = React.useMemo(() => {
    return calculateBiorhythmRange(parsedBirth, parsedTarget, 15, 15);
  }, [parsedBirth, parsedTarget]);

  const partnerChartData = React.useMemo(() => {
    if (!showPartner || !partnerBirthDate) return [];
    return calculateBiorhythmRange(new Date(partnerBirthDate), parsedTarget, 15, 15);
  }, [partnerBirthDate, showPartner, parsedTarget]);

  const t = (key: string) => {
    const dict: any = {
      "bio.physical": "Fiziksel",
      "bio.emotional": "Duygusal",
      "bio.intellectual": "Zihinsel",
      "bio.intuitional": "Sezgisel",
      "bio.aesthetic": "Estetik",
      "bio.spiritual": "Ruhsal",
      "bio.target_marker": "BUGÜN",
    };
    return dict[key] || key;
  };

  return (
    <div className="w-full bg-black/20 rounded-2xl p-4 border border-white/5">
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <svg viewBox="0 0 1000 300" className="w-full min-w-[600px]">
          {/* Grid lines */}
          <line x1="60" y1="150" x2="960" y2="150" stroke="rgba(255,255,255,0.2)" strokeDasharray="6" strokeWidth="1" />
          
          {/* Date labels */}
          {chartData.map((p, i) => {
            const x = 60 + i * (900 / (chartData.length - 1));
            if (i % 5 === 0) {
              return (
                <text key={i} x={x} y="170" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle">
                  {p.date.getDate()}/{p.date.getMonth() + 1}
                </text>
              );
            }
            return null;
          })}

          {/* Today marker */}
          <line x1={510} y1="30" x2={510} y2="270" stroke="rgba(255,255,255,0.4)" strokeDasharray="4" strokeWidth="1" />
          <text x={510} y="25" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">{t("bio.target_marker")}</text>

          {/* Curves */}
          {activeTab === "primary" && [
            { key: "physical" as const, color: "#10b981" },
            { key: "emotional" as const, color: "#ec4899" },
            { key: "intellectual" as const, color: "#3b82f6" },
          ].map((curve) => (
            <polyline
              key={curve.key}
              fill="none"
              stroke={curve.color}
              strokeWidth="3"
              strokeLinecap="round"
              points={chartData.map((p, i) => {
                const x = 60 + i * (900 / (chartData.length - 1));
                const y = 150 - (p[curve.key] / 100) * 100;
                return `${x},${y}`;
              }).join(" ")}
              className="opacity-90"
            />
          ))}

          {activeTab === "advanced" && [
            { key: "intuitional" as const, color: "#a855f7" },
            { key: "aesthetic" as const, color: "#f59e0b" },
            { key: "spiritual" as const, color: "#6366f1" },
          ].map((curve) => (
            <polyline
              key={curve.key}
              fill="none"
              stroke={curve.color}
              strokeWidth="3"
              strokeLinecap="round"
              points={chartData.map((p, i) => {
                const x = 60 + i * (900 / (chartData.length - 1));
                const y = 150 - (p[curve.key] / 100) * 100;
                return `${x},${y}`;
              }).join(" ")}
              className="opacity-90"
            />
          ))}
          
          {/* Partner Curves */}
          {showPartner && partnerChartData.length > 0 && [
            { key: "physical" as const, color: "#10b981" },
            { key: "emotional" as const, color: "#ec4899" },
            { key: "intellectual" as const, color: "#3b82f6" },
          ].map((curve) => (
            <polyline
              key={curve.key + "_p"}
              fill="none"
              stroke={curve.color}
              strokeWidth="1.5"
              strokeDasharray="4,4"
              points={partnerChartData.map((p, i) => {
                const x = 60 + i * (900 / (partnerChartData.length - 1));
                const y = 150 - (p[curve.key] / 100) * 100;
                return `${x},${y}`;
              }).join(" ")}
              className="opacity-40"
            />
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 justify-center">
        {(activeTab === "primary" ? ["physical", "emotional", "intellectual"] : ["intuitional", "aesthetic", "spiritual"]).map(key => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: key === 'physical' ? '#10b981' : key === 'emotional' ? '#ec4899' : key === 'intellectual' ? '#3b82f6' : key === 'intuitional' ? '#a855f7' : key === 'aesthetic' ? '#f59e0b' : '#6366f1' }} />
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{t(`bio.${key}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
