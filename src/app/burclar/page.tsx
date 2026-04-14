"use client";
import { zodiacSigns } from "@/data/zodiac";
import { planets } from "@/data/planets";
import { getCurrentCelestialEvents } from "@/lib/astrology";
import ZodiacCard from "@/components/ZodiacCard";
import PlanetCard from "@/components/PlanetCard";
import { useTranslation } from "@/lib/i18n";

export default function BurclarPage() {
  const { t } = useTranslation();
  const events = getCurrentCelestialEvents();

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

      {/* Live Cosmic Status Section */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className={`glass-card p-0 overflow-hidden border-t-4 transition-all duration-1000 ${events.retrogrades.length > 0 ? "border-t-amber-500/50 bg-amber-500/[0.02]" : "border-t-sky-500/50 bg-sky-500/[0.02]"}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Moon Section */}
              <div className="p-8 md:p-12 flex flex-col items-center md:items-start justify-center border-b lg:border-b-0 lg:border-r border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-purple-500/10 transition-colors duration-700" />
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="text-8xl md:text-9xl group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] select-none">
                    {events.moonPhase.emoji}
                  </div>
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-400 font-bold uppercase tracking-widest text-[10px] mb-4">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> 
                      {t("chart.transits")}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                      {t(`astrology.moon.phase.${events.moonPhase.id}`)}
                    </h3>
                    <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-4">
                      {t(`astrology.moon.phase.${events.moonPhase.id}.desc`)}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
                      {t("astrology.moon.illumination", { amount: String(events.moonPhase.illumination) })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Retrograde / Direct Section */}
              <div className="p-8 md:p-12 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mb-32 group-hover:bg-amber-500/10 transition-colors duration-700" />
                <div className="relative z-10 w-full">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      {events.retrogrades.length > 0 ? (
                        <>
                          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">⚠️</span>
                          <span className="gradient-text-amber">{t("planets.retrograde_active")}</span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">✨</span>
                          <span className="gradient-text-sky">{t("planets.cosmic_status")}</span>
                        </>
                      )}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {events.retrogrades.length > 0 ? (
                      events.retrogrades.map((r, i) => (
                        <div key={r.planet} className="p-5 bg-white/5 border border-white/10 rounded-[2rem] flex items-start gap-5 hover:bg-white/10 transition-all duration-500 group/item">
                          <span className="text-4xl group-hover/item:scale-110 transition-transform duration-500">{r.emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-white font-bold text-base">{t(`astrology.planet.${r.planetId}`)}</p>
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/70">{t("planet.retrograde")}</span>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{t(`astrology.planet.meaning.${r.planetId}`)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-sky-500/5 border border-sky-500/10 rounded-[2rem] p-8">
                        <div className="text-4xl mb-4">🌌</div>
                        <h4 className="text-sky-400 font-bold mb-2 uppercase tracking-[0.1em] text-sm">{t("planets.all_direct")}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                          {t("planets.positive")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      {/* Planet Library */}
      <section id="gezegenler" className="pb-32 px-4 relative z-10 scroll-mt-24">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            <span className="text-gray-500 text-sm font-medium tracking-[0.2em] uppercase">{t("planets.library")}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          </div>
          {planets.map((planet, index) => (
            <PlanetCard key={planet.id} planet={planet} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
