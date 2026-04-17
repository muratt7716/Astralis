"use client";
import Link from "next/link";
import { ZodiacSign } from "@/data/zodiac";
import { useTranslation } from "@/lib/i18n";
import { GlowCard } from "@/components/ui/spotlight-card";
import ZodiacIcon from "@/components/Cosmic/ZodiacIcon";

interface ZodiacCardProps {
  sign: ZodiacSign;
  compact?: boolean;
}

const zodiacConstellations: Record<string, React.ReactNode> = {
  aries: (
    <g fill="currentColor">
      <circle cx="40" cy="40" r="1.5" /><circle cx="100" cy="30" r="2" /><circle cx="140" cy="80" r="1.5" />
      <path d="M40 40 L100 30 L140 80" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
  taurus: (
    <g fill="currentColor">
      <circle cx="30" cy="30" r="1.5" /><circle cx="70" cy="60" r="2" /><circle cx="110" cy="90" r="1.5" />
      <circle cx="100" cy="30" r="1.5" /><circle cx="140" cy="20" r="1.5" />
      <path d="M30 30 L70 60 L110 90 M70 60 L100 30 L140 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
  gemini: (
    <g fill="currentColor">
      <circle cx="40" cy="30" r="2" /><circle cx="40" cy="140" r="2" />
      <circle cx="120" cy="30" r="2" /><circle cx="120" cy="140" r="2" />
      <path d="M40 30 L40 140 M120 30 L120 140 M40 60 L120 60 M40 100 L120 100" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
  cancer: (
    <g fill="currentColor">
      <circle cx="80" cy="30" r="2" /><circle cx="80" cy="80" r="2" /><circle cx="40" cy="130" r="1.5" /><circle cx="120" cy="130" r="1.5" />
      <path d="M80 30 L80 80 L40 130 M80 80 L120 130" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
  leo: (
    <g fill="currentColor">
      <circle cx="140" cy="100" r="2" /><circle cx="100" cy="115" r="1.5" /><circle cx="50" cy="115" r="2" /><circle cx="30" cy="90" r="1.5" /><circle cx="45" cy="60" r="1.5" /><circle cx="90" cy="60" r="2" /><circle cx="140" cy="30" r="1.5" />
      <path d="M140 100 L100 115 L50 115 L30 90 L45 60 L90 60 L140 30" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
  virgo: (
    <g fill="currentColor">
      <circle cx="40" cy="30" r="1.5" /><circle cx="60" cy="70" r="2" /><circle cx="90" cy="80" r="1.5" /><circle cx="130" cy="60" r="2" /><circle cx="60" cy="110" r="1.5" />
      <path d="M40 30 L60 70 L90 80 L130 60 M60 70 L60 110" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
  libra: (
    <g fill="currentColor">
      <circle cx="80" cy="30" r="2" /><circle cx="40" cy="80" r="2" /><circle cx="80" cy="130" r="2" /><circle cx="120" cy="80" r="2" />
      <path d="M80 30 L40 80 L80 130 L120 80 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
  scorpio: (
    <g fill="currentColor">
      <circle cx="130" cy="30" r="2" /><circle cx="100" cy="45" r="1.5" /><circle cx="80" cy="75" r="1.5" /><circle cx="80" cy="120" r="2" /><circle cx="60" cy="140" r="1.5" /><circle cx="40" cy="130" r="2" />
      <path d="M130 30 L100 45 L80 75 L80 120 L60 140 L40 130" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
  sagittarius: (
    <g fill="currentColor">
      <circle cx="40" cy="110" r="2" /><circle cx="80" cy="80" r="2" /><circle cx="130" cy="60" r="2" /><circle cx="80" cy="30" r="2" />
      <path d="M40 110 L80 80 L130 60 M80 80 L80 30" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
  capricorn: (
    <g fill="currentColor">
      <circle cx="30" cy="40" r="2" /><circle cx="80" cy="120" r="2" /><circle cx="130" cy="40" r="2" />
      <path d="M30 40 L80 120 L130 40 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
  aquarius: (
    <g fill="currentColor">
      <circle cx="30" cy="60" r="1.5" /><circle cx="60" cy="45" r="2" /><circle cx="90" cy="60" r="1.5" /><circle cx="130" cy="45" r="2" />
      <circle cx="30" cy="90" r="1.5" /><circle cx="60" cy="75" r="2" /><circle cx="90" cy="90" r="1.5" /><circle cx="130" cy="75" r="2" />
      <path d="M30 60 L60 45 L90 60 L130 45 M30 90 L60 75 L90 90 L130 75" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
  pisces: (
    <g fill="currentColor">
      <circle cx="130" cy="40" r="2" /><circle cx="30" cy="40" r="2" /><circle cx="30" cy="120" r="2" /><circle cx="130" cy="120" r="2" />
      <path d="M130 40 L30 40 L30 120 L130 120" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </g>
  ),
};

export default function ZodiacCard({ sign, compact = false }: ZodiacCardProps) {
  const { t } = useTranslation();

  const elementThemes: Record<string, { 
    gradient: string, 
    glowColor: 'blue' | 'purple' | 'green' | 'red' | 'orange', 
    accent: string, 
    svg: string,
    badge: string,
    iconBg: string
  }> = {
    "Ateş": {
      gradient: "from-orange-950/40 via-red-950/50 to-orange-900/40",
      glowColor: "orange",
      accent: "text-orange-400 border-orange-500/20 shadow-orange-500/10",
      svg: "#f97316",
      badge: "bg-orange-500/10 border-orange-500/20 text-orange-300",
      iconBg: "bg-gradient-to-br from-orange-500/20 to-red-500/30"
    },
    "Toprak": {
      gradient: "from-emerald-950/40 via-green-950/50 to-emerald-900/40",
      glowColor: "green",
      accent: "text-emerald-400 border-emerald-500/20 shadow-emerald-500/10",
      svg: "#10b981",
      badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
      iconBg: "bg-gradient-to-br from-emerald-500/20 to-green-500/30"
    },
    "Hava": {
      gradient: "from-purple-950/40 via-violet-950/50 to-purple-900/40",
      glowColor: "purple",
      accent: "text-purple-400 border-purple-500/20 shadow-purple-500/10",
      svg: "#a855f7",
      badge: "bg-purple-500/10 border-purple-500/20 text-purple-300",
      iconBg: "bg-gradient-to-br from-purple-500/20 to-violet-500/30"
    },
    "Su": {
      gradient: "from-blue-950/40 via-indigo-950/50 to-blue-900/40",
      glowColor: "blue",
      accent: "text-blue-400 border-blue-500/20 shadow-blue-500/10",
      svg: "#3b82f6",
      badge: "bg-blue-500/10 border-blue-500/20 text-blue-300",
      iconBg: "bg-gradient-to-br from-blue-500/20 to-indigo-500/30"
    },
  };

  const theme = elementThemes[sign.element] || elementThemes["Ateş"];
  const elementTrMap: Record<string, string> = { "Ateş": "element.fire", "Toprak": "element.earth", "Hava": "element.air", "Su": "element.water" };

  if (compact) {
    return (
      <Link href={`/burclar/${sign.id}`} className="block h-full transition-transform hover:scale-105 duration-500">
        <GlowCard 
          glowColor={theme.glowColor} 
          customSize={true} 
          className="h-full group"
        >
          {/* Internal Clipping Layer */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center gap-3 h-full justify-center">
            <div className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center ${theme.iconBg} border border-white/10 backdrop-blur-md shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]`}>
              <ZodiacIcon signId={sign.id} size={56} glowColor={theme.svg} />
            </div>
            <div>
              <h3 className="text-white font-bold tracking-wide text-sm mb-1">{t(`zodiac.${sign.id}`)}</h3>
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                {sign.dateRange}
              </div>
            </div>
          </div>
        </GlowCard>
      </Link>
    );
  }

  return (
    <Link href={`/burclar/${sign.id}`} className="block h-full group">
      <GlowCard 
        glowColor={theme.glowColor} 
        customSize={true} 
        className="h-full flex flex-col"
      >
        {/* Internal Clipping Layer for Background Decorations */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {/* Noise & Nebula Backgrounds */}
          <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className={`absolute -right-20 -top-20 w-64 h-64 ${theme.glowColor === 'orange' ? 'bg-orange-500/10' : theme.glowColor === 'green' ? 'bg-green-500/10' : theme.glowColor === 'purple' ? 'bg-purple-500/10' : 'bg-blue-500/10'} rounded-full blur-[80px] transition-opacity duration-700 group-hover:opacity-60`} />

          <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-all duration-1000 will-change-transform">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute -right-10 -top-10 w-64 h-64 animate-spin-slow text-white/40 will-change-transform">
              {zodiacConstellations[sign.id] || zodiacConstellations.aries}
            </svg>
          </div>
        </div>

        <div className="relative z-10 flex items-start justify-between mb-10">
          <div className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center ${theme.iconBg} border border-white/10 shadow-2xl transition-all duration-700 group-hover:scale-105 group-hover:-rotate-2`}>
            <ZodiacIcon signId={sign.id} size={112} glowColor={theme.svg} />
          </div>
          <div className={`px-4 py-2 rounded-xl ${theme.badge} flex items-center gap-2 border shadow-lg transition-all duration-500 group-hover:border-white/30`}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {t(elementTrMap[sign.element] || "element.fire")}
            </span>
            <span className="text-base animate-pulse-slow">{sign.elementEmoji}</span>
          </div>
        </div>

        <div className="relative z-10 mt-auto">
          <div className="mb-8">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-2 font-serif tracking-tight leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all duration-700">
              {t(`zodiac.${sign.id}`)}
            </h3>
            <div className="flex items-center gap-3">
              <div className="h-px bg-gradient-to-r from-purple-500/50 to-transparent w-8 group-hover:scale-x-150 origin-left transition-transform duration-700" />
              <p className="text-gray-400 text-xs font-bold tracking-[0.3em] uppercase">{sign.dateRange}</p>
            </div>
          </div>

          <div className={`flex items-center gap-4 ${theme.accent.split(' ')[0]} text-[10px] font-black tracking-[0.4em] uppercase opacity-60 group-hover:opacity-100 transition-all duration-500`}>
            <span className="relative pb-1">
              {t("zodiac.details")}
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            </span>
            <div className={`w-8 h-8 rounded-full border border-current flex items-center justify-center group-hover:bg-white transition-all duration-500`}>
              <svg className="w-4 h-4 transition-colors duration-500 group-hover:!text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>
      </GlowCard>
    </Link>
  );
}
