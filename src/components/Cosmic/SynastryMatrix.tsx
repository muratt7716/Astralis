"use client";

import { useState } from "react";
import { zodiacSigns } from "@/data/zodiac";
import { useTranslation } from "@/lib/i18n";
import { calculateBaseCompatibilityScore } from "@/lib/astrology/compatibility-logic";

export default function SynastryMatrix() {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<{ r: string; c: string } | null>(null);

  return (
    <div className="w-full overflow-x-auto pt-24 pb-40 custom-scrollbar">
      <div className="min-w-[800px] px-4">
        <div className="grid grid-cols-[120px_repeat(12,1fr)] gap-1">
          {/* Top Left Empty Corner */}
          <div className="h-10 border border-white/5 bg-black/20 rounded-tl-2xl flex items-center justify-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Astralis</span>
          </div>

          {/* Column Headers (Signs) */}
          {zodiacSigns.map((sign, i) => (
            <div
              key={sign.id}
              onMouseEnter={() => setHovered(prev => ({ ...prev!, c: sign.id }))}
              onMouseLeave={() => setHovered(prev => ({ ...prev!, c: "" }))}
              className={`h-10 flex items-center justify-center border border-white/5 bg-black/40 backdrop-blur-md transition-all duration-300 ${i === 11 ? "rounded-tr-2xl" : ""
                } ${hovered?.c === sign.id ? "bg-pink-500/20 scale-105 z-10" : ""}`}
            >
              <span className="text-lg" title={t(sign.nameKey)}>{sign.symbol}</span>
            </div>
          ))}

          {/* Rows */}
          {zodiacSigns.map((rowSign, rowIndex) => (
            <div key={`row-container-${rowSign.id}`} className="contents">
              {/* Row Header */}
              <div
                key={`row-header-${rowSign.id}`}
                onMouseEnter={() => setHovered(prev => ({ ...prev!, r: rowSign.id }))}
                onMouseLeave={() => setHovered(prev => ({ ...prev!, r: "" }))}
                className={`h-10 flex items-center justify-start px-3 border border-white/5 bg-black/40 backdrop-blur-md transition-all duration-300 ${rowIndex === 11 ? "rounded-bl-2xl" : ""
                  } ${hovered?.r === rowSign.id ? "bg-pink-500/20 scale-105 z-10" : ""}`}
              >
                <span className="text-sm mr-2">{rowSign.symbol}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase truncate">{t(rowSign.nameKey)}</span>
              </div>

              {/* Data Cells */}
              {zodiacSigns.map((colSign, colIndex) => {
                const score = calculateBaseCompatibilityScore(rowSign.id, colSign.id);
                const isSelected = hovered?.r === rowSign.id && hovered?.c === colSign.id;

                let bgColor = "bg-white/[0.02]";
                if (score >= 90) bgColor = "bg-emerald-500/20 text-emerald-400";
                else if (score >= 80) bgColor = "bg-cyan-500/20 text-cyan-400";
                else if (score >= 60) bgColor = "bg-blue-500/10 text-blue-300";
                else bgColor = "bg-red-500/10 text-red-400";

                return (
                  <div
                    key={`${rowSign.id}-${colSign.id}`}
                    onMouseEnter={() => setHovered({ r: rowSign.id, c: colSign.id })}
                    onMouseLeave={() => setHovered(null)}
                    className={`
                      h-10 flex items-center justify-center border border-white/5 
                      cursor-default transition-all duration-300 relative group
                      ${bgColor}
                      ${isSelected ? "ring-2 ring-pink-500/50 z-50 scale-125 rounded-sm shadow-2xl bg-pink-500/40 text-white" : ""}
                      ${rowIndex === 11 && colIndex === 11 ? "rounded-br-2xl" : ""}
                    `}
                  >
                    <span className="text-[11px] font-black">{score}%</span>

                    {/* Tooltip on Hover */}
                    {isSelected && (
                      <div className={`
                        absolute ${rowIndex < 2 ? "top-full mt-4" : "bottom-full mb-4"} 
                        ${colIndex < 2 ? "left-0 translate-x-0" : colIndex > 9 ? "right-0 translate-x-0" : "left-1/2 -translate-x-1/2"}
                        w-48 p-3 glass-card border-pink-500/30 shadow-2xl z-[100] 
                        pointer-events-none animate-in fade-in zoom-in slide-in-from-bottom-2
                      `}>
                        <div className="text-[10px] text-pink-400 font-black uppercase tracking-widest mb-1">
                          {t(rowSign.nameKey)} + {t(colSign.nameKey)}
                        </div>
                        <div className="text-xs text-white leading-tight">
                          {score >= 80 ? t("synastry.matrix.high") : score >= 60 ? t("synastry.matrix.medium") : t("synastry.matrix.low")}
                        </div>
                        <div className={`
                          absolute ${colIndex < 2 ? "left-4" : colIndex > 9 ? "right-4" : "left-1/2 -translate-x-1/2"} 
                          ${rowIndex < 2 ? "bottom-full border-b-pink-500/30 -mb-1" : "top-full border-t-pink-500/30 -mt-1"} 
                          border-8 border-transparent
                        `} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-6 px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/50" />
          <span className="text-[10px] text-gray-400 uppercase font-black uppercase tracking-widest">{t("synastry.legend.incredible")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500/40 border border-cyan-500/50" />
          <span className="text-[10px] text-gray-400 uppercase font-black uppercase tracking-widest">{t("synastry.legend.verygood")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500/50" />
          <span className="text-[10px] text-gray-400 uppercase font-black uppercase tracking-widest">{t("synastry.legend.compatible")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
          <span className="text-[10px] text-gray-400 uppercase font-black uppercase tracking-widest">{t("synastry.legend.challenging")}</span>
        </div>
      </div>
    </div>
  );
}
