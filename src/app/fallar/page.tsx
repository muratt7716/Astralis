"use client";

import Link from "next/link";
import Logo from "@/components/Cosmic/Logo";
import { useTranslation } from "@/lib/i18n";

interface DivinationSystem {
  id: string;
  emoji: string;
  nameKey: string;
  descKey: string;
  href: string;
  theme: {
    gradient: string;
    border: string;
    glow: string;
    svgColor: string;
    iconBg: string;
  };
}

const divinationSystems: DivinationSystem[] = [
  { 
    id: "tarot", 
    emoji: "🃏", 
    nameKey: "fortune.tarot.title", 
    descKey: "fortune.tarot.full_desc", 
    href: "/fallar/tarot",
    theme: {
      gradient: "from-purple-950/80 to-[#1a0533]",
      border: "border-purple-500/30",
      glow: "shadow-purple-500/20",
      svgColor: "rgba(168, 85, 247, 0.2)",
      iconBg: "bg-purple-500/10"
    }
  },
  { 
    id: "katina", 
    emoji: "🌸", 
    nameKey: "fortune.katina.title", 
    descKey: "fortune.katina.full_desc", 
    href: "/fallar/katina",
    theme: {
      gradient: "from-rose-950/80 to-[#2e0a1a]",
      border: "border-rose-500/30",
      glow: "shadow-rose-500/20",
      svgColor: "rgba(244, 63, 94, 0.2)",
      iconBg: "bg-rose-500/10"
    }
  },
  { 
    id: "lenormand", 
    emoji: "🏵️", 
    nameKey: "fortune.lenormand.title", 
    descKey: "fortune.lenormand.full_desc", 
    href: "/fallar/lenormand",
    theme: {
      gradient: "from-amber-950/80 to-[#331a05]",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/20",
      svgColor: "rgba(245, 158, 11, 0.2)",
      iconBg: "bg-amber-500/10"
    }
  },
  { 
    id: "kahve", 
    emoji: "☕", 
    nameKey: "fortune.kahve.title", 
    descKey: "fortune.kahve.full_desc", 
    href: "/fallar/kahve",
    theme: {
      gradient: "from-yellow-950/80 to-[#2b1d02]",
      border: "border-yellow-500/30",
      glow: "shadow-yellow-500/20",
      svgColor: "rgba(234, 179, 8, 0.2)",
      iconBg: "bg-yellow-500/10"
    }
  },
  { 
    id: "runler", 
    emoji: "ᚱ", 
    nameKey: "fortune.runler.title", 
    descKey: "fortune.runler.desc", 
    href: "/fallar/runler",
    theme: {
      gradient: "from-blue-950/80 to-[#051a33]",
      border: "border-blue-500/30",
      glow: "shadow-blue-500/20",
      svgColor: "rgba(59, 130, 246, 0.2)",
      iconBg: "bg-blue-500/10"
    }
  },
  { 
    id: "iching", 
    emoji: "☯️", 
    nameKey: "fortune.iching.title", 
    descKey: "fortune.iching.desc", 
    href: "/fallar/iching",
    theme: {
      gradient: "from-emerald-950/80 to-[#052e1a]",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/20",
      svgColor: "rgba(16, 185, 129, 0.2)",
      iconBg: "bg-emerald-500/10"
    }
  },
  { 
    id: "kristal", 
    emoji: "🔮", 
    nameKey: "fortune.kristal.title", 
    descKey: "fortune.kristal.desc", 
    href: "/fallar/kristal",
    theme: {
      gradient: "from-violet-950/80 to-[#2a0533]",
      border: "border-violet-500/30",
      glow: "shadow-violet-500/20",
      svgColor: "rgba(139, 92, 146, 0.2)",
      iconBg: "bg-violet-500/10"
    }
  },
];

function DivinationIcon({ id, emoji, color }: { id: string, emoji: string, color: string }) {
  // Returns unique thematic SVG symbols
  const renderSVG = () => {
    switch (id) {
      case "tarot": // Sacred Geometry
        return <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-30 animate-spin-slow">
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="2 2" />
          <path d="M50 10 L90 77 L10 77 Z" fill="none" stroke={color} strokeWidth="0.5" />
          <circle cx="50" cy="54" r="23" fill="none" stroke={color} strokeWidth="1" />
        </svg>;
      case "katina": // Baroque / Mandala
        return <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-30 animate-pulse">
          <path d="M50 0 Q60 25 100 50 Q60 75 50 100 Q40 75 0 50 Q40 25 50 0" fill="none" stroke={color} strokeWidth="0.5" />
          <circle cx="50" cy="50" r="15" fill="none" stroke={color} strokeWidth="1" />
        </svg>;
      case "lenormand": // Compass / Scroll
        return <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-30">
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="0.5" />
          <path d="M50 5 L50 95 M5 50 L95 50 M25 25 L75 75 M75 25 L25 75" stroke={color} strokeWidth="0.5" strokeDasharray="2 2" />
          <path d="M50 30 L55 50 L50 70 L45 50 Z" fill={color} />
        </svg>;
      case "kahve": // Swirls
        return <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-30 animate-pulse">
          <path d="M20 50 Q35 20 50 50 T80 50" fill="none" stroke={color} strokeWidth="1" />
          <path d="M25 60 Q40 40 55 60 T85 60" fill="none" stroke={color} strokeWidth="0.5" />
        </svg>;
      case "runler": // Runic Circle
        return <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-30 animate-spin-slow">
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 8" />
          <path d="M50 20 L50 80 M20 50 L80 50" stroke={color} strokeWidth="0.5" />
        </svg>;
      case "iching": // Hexagram bars
        return <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-30">
          {[...Array(6)].map((_, i) => (
            <path key={i} d={`M20 ${20 + i*12} L80 ${20 + i*12}`} stroke={color} strokeWidth="3" />
          ))}
        </svg>;
      default: // Crystal / Pulse
        return <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-30 animate-pulse">
          <circle cx="50" cy="50" r="30" fill={color} opacity="0.1" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="0.5" />
        </svg>;
    }
  };

  return (
    <div className="relative w-20 h-20 mb-6 mx-auto">
      {renderSVG()}
      <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
        {emoji}
      </div>
    </div>
  );
}

export default function FallarPage() {
  const { t } = useTranslation();

  return (
    <div className="cosmic-gradient min-h-screen">
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-purple-600/30 blur-3xl rounded-full" />
            <Logo size={80} className="relative float" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif mb-6 tracking-tight">
            <span className="gradient-text">{t("fallar.hero.title")}</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t("fallar.hero.desc")}
          </p>
        </div>
      </section>

      <section className="pb-32 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {divinationSystems.map((sys, idx) => (
            <Link key={sys.id} href={sys.href} className="group">
              <div
                className={`
                  relative h-full overflow-hidden rounded-[2.5rem] p-8 md:p-10
                  bg-gradient-to-br ${sys.theme.gradient} border ${sys.theme.border}
                  hover:scale-[1.03] hover:border-white/40 transition-all duration-500 cursor-pointer
                  shadow-2xl flex flex-col items-center text-center
                  fade-in-up
                `}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Background Decorative Element */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 duration-700">
                   <span className="text-9xl">{sys.emoji}</span>
                </div>

                <DivinationIcon id={sys.id} emoji={sys.emoji} color={sys.theme.svgColor} />
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 font-serif tracking-tight">{t(sys.nameKey)}</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-10 flex-grow max-w-xs">
                  {t(sys.descKey)}
                </p>
                
                <div className={`
                  mt-auto w-full py-4 rounded-2xl bg-white/5 border border-white/10 
                  text-sm font-bold text-white uppercase tracking-[0.2em]
                  group-hover:bg-gradient-to-r group-hover:${sys.theme.gradient.replace('from-', 'from-').replace('to-', 'to-')} 
                  group-hover:border-white/40 shadow-lg transition-all duration-300
                `}>
                  {t("fallar.explore.btn")} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

