"use client";

import Link from "next/link";
import { zodiacSigns } from "@/data/zodiac";
import ZodiacCard from "@/components/ZodiacCard";
import {
  Sparkles,
  Sun,
  Moon,
  Telescope,
  Globe,
  ChevronRight
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function YorumlarPage() {
  const { t } = useTranslation();

  const periods = [
    {
      id: "daily",
      label: t("horoscope.daily"),
      icon: Sun,
      desc: t("horoscope.daily.desc"),
      color: "from-purple-950/20 to-black",
      accent: "border-purple-500/20",
      iconColor: "#a78bfa"
    },
    {
      id: "weekly",
      label: t("horoscope.weekly"),
      icon: Moon,
      desc: t("horoscope.weekly.desc"),
      color: "from-pink-950/20 to-black",
      accent: "border-pink-500/20",
      iconColor: "#f472b6"
    },
    {
      id: "monthly",
      label: t("horoscope.monthly"),
      icon: Telescope,
      desc: t("horoscope.monthly.desc"),
      color: "from-amber-950/20 to-black",
      accent: "border-amber-500/20",
      iconColor: "#fbbf24"
    },
    {
      id: "yearly",
      label: t("horoscope.yearly"),
      icon: Globe,
      desc: t("horoscope.yearly.desc"),
      color: "from-emerald-950/20 to-black",
      accent: "border-emerald-500/20",
      iconColor: "#34d399"
    },
  ];

  return (
    <div className="bg-transparent min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-600/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-4 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                <Sparkles className="size-10 text-purple-400 animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-[spin_10s_linear_infinite]" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tighter">
            <span className="gradient-text">{t("horoscope.title")}</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            {t("horoscope.subtitle")}
          </p>
        </div>
      </section>

      {/* Periods */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {periods.map((period, idx) => (
            <Link key={period.id} href={`/yorumlar/${period.id}`} className="group">
              <div className={`
                glass-card p-5 sm:p-6 xl:p-8 bg-gradient-to-br ${period.color}
                hover:border-white/20 transition-all duration-700 
                h-full flex flex-col items-center text-center relative overflow-hidden
                fade-in-up border-opacity-30
              `} style={{ animationDelay: `${idx * 0.1}s` }}>
                {/* HUD Decorative Elements */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] blur-3xl rounded-full -mr-24 -mt-24 group-hover:bg-white/[0.05] transition-colors duration-700" />
                
                {/* UI-UX Pro Max refined corners */}
                <div className="absolute -left-px -top-px w-6 h-6 border-t border-l border-white/20 rounded-tl-2xl mix-blend-overlay" />
                <div className="absolute -right-px -bottom-px w-6 h-6 border-b border-r border-white/20 rounded-br-2xl mix-blend-overlay" />

                {/* Icon HUD Frame */}
                <div className="relative mb-6 sm:mb-10 group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-500 ease-out">
                  <div className={`absolute -inset-4 rounded-full blur-xl opacity-20 transition-opacity duration-500 group-hover:opacity-50`} style={{ backgroundColor: period.iconColor }} />
                  <div className={`relative w-24 h-24 rounded-full bg-black/60 border ${period.accent} shadow-[inset_0_2px_20px_rgba(255,255,255,0.05)] flex items-center justify-center backdrop-blur-2xl overflow-hidden`}>
                    <period.icon className="size-11" style={{ color: period.iconColor }} />
                    <div className="absolute inset-0 border border-white/10 rounded-full" />
                    {/* Rotating Rings */}
                    <div className="absolute inset-2 border border-dotted border-white/20 rounded-full animate-[spin_30s_linear_infinite] opacity-30" />
                    <div className="absolute -inset-2 border border-white/[0.02] rounded-full animate-[spin_15s_reverse_linear_infinite]" />
                  </div>
                </div>

                <h2 className="text-2xl font-serif font-bold text-white mb-4 tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">{period.label}</h2>
                <p className="text-white/40 text-sm leading-relaxed mb-10 flex-1 font-light group-hover:text-white/60 transition-colors">{period.desc}</p>

                <div className="mt-auto px-6 py-3 rounded-full bg-black/40 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500 flex items-center gap-2 transform group-hover:translate-y-px shadow-lg group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  {t("horoscope.explore")}
                  <ChevronRight className="size-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center tracking-tight">
              {t("horoscope.pick")}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {zodiacSigns.map((sign) => (
              <ZodiacCard key={sign.id} sign={sign} compact={true} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
