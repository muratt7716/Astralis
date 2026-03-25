"use client";

import Link from "next/link";
import { ZodiacSign } from "@/data/zodiac";
import { useTranslation } from "@/lib/i18n";

interface ZodiacCardProps {
  sign: ZodiacSign;
  compact?: boolean;
}

export default function ZodiacCard({ sign, compact = false }: ZodiacCardProps) {
  const { t } = useTranslation();

  const elementThemes: Record<string, { gradient: string, glow: string, accent: string, svg: string }> = {
    "Ateş": { 
      gradient: "from-orange-950/90 to-[#2a0800]", 
      glow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]", 
      accent: "text-orange-400 border-orange-500/20",
      svg: "#f97316"
    },
    "Toprak": { 
      gradient: "from-emerald-950/90 to-[#021f10]", 
      glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]", 
      accent: "text-emerald-400 border-emerald-500/20",
      svg: "#10b981"
    },
    "Hava": { 
      gradient: "from-cyan-950/90 to-[#02182b]", 
      glow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]", 
      accent: "text-cyan-400 border-cyan-500/20",
      svg: "#06b6d4"
    },
    "Su": { 
      gradient: "from-indigo-950/90 to-[#0a0524]", 
      glow: "group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]", 
      accent: "text-indigo-400 border-indigo-500/20",
      svg: "#6366f1"
    },
  };

  const theme = elementThemes[sign.element] || elementThemes["Ateş"];
  const elementTrMap: Record<string, string> = { "Ateş": "element.fire", "Toprak": "element.earth", "Hava": "element.air", "Su": "element.water" };

  if (compact) {
    return (
      <Link href={`/burclar/${sign.id}`}>
        <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} border ${theme.accent} transition-all duration-500 lg:hover:scale-[1.03] ${theme.glow} cursor-pointer p-4`}>
          {/* Subtle background element */}
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-colors" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/40 border ${theme.accent} backdrop-blur-md shadow-inner`}>
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{sign.symbol}</span>
            </div>
            <div>
              <h3 className="text-white font-bold tracking-wide">{t(`zodiac.${sign.id}`)}</h3>
              <p className="text-gray-400 text-xs mt-0.5">{sign.dateRange}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/burclar/${sign.id}`}>
      <div className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} border ${theme.accent} transition-all duration-500 lg:hover:scale-[1.02] ${theme.glow} cursor-pointer h-full flex flex-col p-8`}>
        
        {/* Decorative SVG Background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute -right-10 -top-10 w-64 h-64 animate-spin-slow">
            <circle cx="100" cy="100" r="80" fill="none" stroke={theme.svg} strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="60" fill="none" stroke={theme.svg} strokeWidth="1" />
            <path d="M100 20 L100 180 M20 100 L180 100 M45 45 L155 155 M155 45 L45 155" stroke={theme.svg} strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 flex items-start justify-between mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-black/50 border ${theme.accent} backdrop-blur-md group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-500`}>
            <span className="text-4xl group-hover:scale-110 transition-transform duration-500">{sign.symbol}</span>
          </div>
          <div className={`px-4 py-1.5 rounded-full bg-black/40 border ${theme.accent} backdrop-blur-sm flex items-center gap-2`}>
            <span className="text-sm text-gray-300 font-medium tracking-wide">
              {t(elementTrMap[sign.element] || "element.fire")}
            </span>
            <span>{sign.elementEmoji}</span>
          </div>
        </div>
        
        <div className="relative z-10 mt-auto">
          <h3 className="text-3xl font-bold text-white mb-2 font-serif tracking-wide">{t(`zodiac.${sign.id}`)}</h3>
          <p className="text-gray-400 text-sm font-medium tracking-wider uppercase mb-6">{sign.dateRange}</p>
          
          <div className={`flex items-center gap-3 ${theme.accent.split(' ')[0]} text-sm font-bold tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
            <span>{t("zodiac.details")}</span>
            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
