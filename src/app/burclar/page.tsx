"use client";
import { zodiacSigns } from "@/data/zodiac";
import ZodiacCard from "@/components/ZodiacCard";
import { useTranslation } from "@/lib/i18n";

export default function BurclarPage() {
  const { t } = useTranslation();

  const elements = [
    { 
      id: "fire", 
      name: t("astrology.element.fire"), 
      desc: t("astrology.element.fire.desc"),
      emoji: "🔥", 
      signs: zodiacSigns.filter(s => s.element === "Ateş"), 
      color: "from-orange-900/40 to-red-900/40", 
      accent: "border-orange-500/30",
      glow: "hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]",
      iconColor: "#f97316",
      pattern: (
        <svg className="absolute right-0 bottom-0 w-32 h-32 opacity-10 pointer-events-none" viewBox="0 0 100 100">
          <path d="M50 10 Q60 40 50 70 Q40 40 50 10" fill="currentColor" />
          <path d="M30 30 Q40 50 30 70 Q20 50 30 30" fill="currentColor" />
          <path d="M70 30 Q80 50 70 70 Q60 50 70 30" fill="currentColor" />
        </svg>
      )
    },
    { 
      id: "earth", 
      name: t("astrology.element.earth"), 
      desc: t("astrology.element.earth.desc"),
      emoji: "🌍", 
      signs: zodiacSigns.filter(s => s.element === "Toprak"), 
      color: "from-emerald-900/40 to-green-900/40", 
      accent: "border-emerald-500/30",
      glow: "hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]",
      iconColor: "#10b981",
      pattern: (
        <svg className="absolute right-0 bottom-0 w-32 h-32 opacity-10 pointer-events-none" viewBox="0 0 100 100">
          <rect x="20" y="20" width="20" height="20" rx="2" fill="currentColor" />
          <rect x="50" y="40" width="25" height="25" rx="2" fill="currentColor" />
          <rect x="30" y="70" width="15" height="15" rx="2" fill="currentColor" />
        </svg>
      )
    },
    { 
      id: "air", 
      name: t("astrology.element.air"), 
      desc: t("astrology.element.air.desc"),
      emoji: "💨", 
      signs: zodiacSigns.filter(s => s.element === "Hava"), 
      color: "from-sky-900/40 to-cyan-900/40", 
      accent: "border-sky-500/30",
      glow: "hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]",
      iconColor: "#06b6d4",
      pattern: (
        <svg className="absolute right-0 bottom-0 w-32 h-32 opacity-10 pointer-events-none" viewBox="0 0 100 100">
          <path d="M20 50 C20 30 40 30 50 50 C60 70 80 70 80 50" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M20 30 C20 10 40 10 50 30 C60 50 80 50 80 30" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M20 70 C20 50 40 50 50 70 C60 90 80 90 80 70" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      )
    },
    { 
      id: "water", 
      name: t("astrology.element.water"), 
      desc: t("astrology.element.water.desc"),
      emoji: "💧", 
      signs: zodiacSigns.filter(s => s.element === "Su"), 
      color: "from-blue-900/40 to-indigo-900/40", 
      accent: "border-blue-500/30",
      glow: "hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]",
      iconColor: "#3b82f6",
      pattern: (
        <svg className="absolute right-0 bottom-0 w-32 h-32 opacity-10 pointer-events-none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.2" />
        </svg>
      )
    },
  ];

  return (
    <div className="cosmic-gradient min-h-screen">
      {/* Header */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm md:text-base text-gray-400 mb-6 tracking-widest uppercase fade-in">
            {t("site.name")} • {t("zodiac.signs")}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="gradient-text">{t("zodiac.signs")}</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            {t("home.zodiac.subtitle")}
          </p>
        </div>
      </section>

      {/* All Signs Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {zodiacSigns.map((sign, i) => (
              <div key={sign.id} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <ZodiacCard sign={sign} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Elements Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              {t("zodiac.by_elements")}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {elements.map((el, i) => (
              <div 
                key={el.id} 
                className={`group relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 border transition-all duration-700 bg-gradient-to-br ${el.color} ${el.accent} ${el.glow} fade-in-up`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Pattern Overlay */}
                <div className="text-white/10 group-hover:text-white/20 transition-colors duration-700">
                  {el.pattern}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                      {el.emoji}
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        {t("element.group", { name: el.name })}
                      </h3>
                      <div className="h-0.5 w-12 bg-white/20 mt-2 rounded-full group-hover:w-full transition-all duration-700" />
                    </div>
                  </div>

                  <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-md opacity-90">
                    {el.desc}
                  </p>

                  <div className="grid grid-cols-3 gap-4">
                    {el.signs.map((sign) => (
                      <ZodiacCard key={sign.id} sign={sign} compact />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>

  );
}
