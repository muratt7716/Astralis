"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n";
import ZodiacCard from "@/components/ZodiacCard";
import { ZodiacSign } from "@/data/zodiac";

interface ElementCardProps {
  id: string;
  name: string;
  desc: string;
  signs: ZodiacSign[];
  color: string;
  accent: string;
  iconColor: string;
  delay?: number;
}

export default function ElementCard({
  id,
  name,
  desc,
  signs,
  color,
  accent,
  iconColor,
  delay = 0,
}: ElementCardProps) {
  const { t } = useTranslation();

  // Element specific HUD energy patterns
  const patterns: Record<string, React.ReactNode> = {
    fire: (
      <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="fireBlur" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="80" cy="20" r="40" fill="url(#fireBlur)" className="animate-pulse" />
        <circle cx="20" cy="80" r="30" fill="url(#fireBlur)" className="animate-pulse" style={{ animationDelay: '1s' }} />
      </svg>
    ),
    earth: (
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100">
        <defs>
          <pattern id="grid-earth" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid-earth)" />
        <rect x="10" y="10" width="80" height="80" stroke="#10b981" strokeWidth="0.2" fill="none" opacity="0.1" />
      </svg>
    ),
    air: (
      <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 100 100">
        <path d="M-10 40 Q25 10 50 40 T110 40" stroke="#a855f7" strokeWidth="0.5" fill="none" opacity="0.3">
          <animate attributeName="d" values="M-10 40 Q25 10 50 40 T110 40;M-10 40 Q25 70 50 40 T110 40;M-10 40 Q25 10 50 40 T110 40" dur="8s" repeatCount="indefinite" />
        </path>
        <path d="M-10 60 Q25 30 50 60 T110 60" stroke="#06b6d4" strokeWidth="0.5" fill="none" opacity="0.2">
          <animate attributeName="d" values="M-10 60 Q25 30 50 60 T110 60;M-10 60 Q25 90 50 60 T110 60;M-10 60 Q25 30 50 60 T110 60" dur="10s" repeatCount="indefinite" />
        </path>
      </svg>
    ),
    water: (
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="20" stroke="#3b82f6" strokeWidth="0.5" fill="none" opacity="0.4">
          <animate attributeName="r" values="15;45;15" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="50" r="30" stroke="#3b82f6" strokeWidth="0.3" fill="none" opacity="0.2">
          <animate attributeName="r" values="20;55;20" dur="8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0;0.2" dur="8s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
  };

  const icons: Record<string, React.ReactNode> = {
    fire: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.292 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
    earth: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
        <path d="M8.5 14.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 1 5 0" />
      </svg>
    ),
    air: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="m16 12 4 4-4 4" />
        <path d="M20 16H9a4 4 0 0 1 0-8h3" />
      </svg>
    ),
    water: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5a21 21 0 0 1-4-9.5 21 21 0 0 1-4 9.5c-2 1.6-3 3.5-3 5.5a7 7 0 0 0 7 7Z" />
      </svg>
    ),
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 border transition-all duration-700 bg-black/40 backdrop-blur-2xl ${accent} hover:bg-black/60 shadow-2xl fade-in-up`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Background Energy Pattern */}
      {patterns[id]}

      {/* Decorative HUD Elements - Visual Only */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start opacity-20 pointer-events-none">
        <div className="w-8 h-px bg-white/40" />
        <div className="w-8 h-px bg-white/40" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            {/* Pulsing Glow Base */}
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" style={{ backgroundColor: iconColor }} />
            
            <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white p-3 shadow-inner transition-all duration-700 group-hover:scale-110 group-hover:bg-white/10`} style={{ color: iconColor }}>
              {icons[id]}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5 opacity-60">
              <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: iconColor }}></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">{t("astrology.label.element")}</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-widest uppercase font-brand italic">
              {name}
            </h3>
          </div>
        </div>

        <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-sm font-light leading-relaxed">
          {desc}
        </p>

        <div className="grid grid-cols-3 gap-5">
          {signs.map((sign) => (
            <ZodiacCard key={sign.id} sign={sign} compact />
          ))}
        </div>

        {/* Subtle Footer Divider */}
        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-end opacity-20">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-1 h-1 rounded-full bg-white/40`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
