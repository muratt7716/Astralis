"use client";

import { planets } from "@/data/planets";
import { zodiacSigns } from "@/data/zodiac";
import { getCurrentCelestialEvents } from "@/lib/astrology";
import type { Metadata } from "next";
import PlanetCard from "@/components/PlanetCard";
import CosmicBackground from "@/components/CosmicBackground";
import { useTranslation } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Gezegenler & Astroloji Bilgileri | Astralis",
  description: "Gezegenlerin astrolojik anlamları, etkileri ve burçlar üzerindeki rolleri.",
};

export default function GezegenlerPage() {
  const { t } = useTranslation();
  const events = getCurrentCelestialEvents();
  
  return (
    <div className="relative min-h-screen bg-[#070714] overflow-x-hidden">
      <CosmicBackground />

      {/* Header Section */}
      <section className="relative pt-24 pb-12 px-4 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium tracking-wider uppercase animate-pulse">
            ✨ {t("planets.title")}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="gradient-text">{t("planets.title")} & {t("nav.zodiac")}</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light">
            {t("home.feature.planets.desc")}
          </p>
        </div>
      </section>

      {/* Live Dashboard Section */}
      <section className="relative pb-16 px-4 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Moon Phase - Larger Card */}
            <div className="lg:col-span-7 glass-card p-8 border-l-4 border-l-purple-500 relative overflow-hidden group hover:bg-white/5 transition-all duration-500">
              <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="text-8xl md:text-9xl group-hover:scale-110 transition-transform duration-700 select-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  {events.moonPhase.emoji}
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-purple-400 font-bold uppercase tracking-widest text-xs">
                    <span className="animate-pulse">●</span> {t("chart.transits")}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{t(`astrology.moon.phase.${events.moonPhase.id}`)}</h3>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-300 text-sm mb-4">
                    %{events.moonPhase.illumination} {t("chart.aspect.strong") || "Aydınlık"}
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed max-w-md font-light">
                    {t(`astrology.moon.phase.${events.moonPhase.id}.desc`)}
                  </p>
                </div>
              </div>
            </div>

            {/* Retrogrades / Alerts */}
            <div className="lg:col-span-5 glass-card p-8 border-l-4 border-l-amber-500/50 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mb-10 pointer-events-none"></div>
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">⚠️</span> 
                {t("planet.retrograde")}
              </h3>
              
              <div className="space-y-4 relative z-10">
                {events.retrogrades.length > 0 ? (
                  events.retrogrades.map((r, i) => (
                    <div 
                      key={r.planet} 
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4 hover:border-amber-500/30 transition-colors"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <span className="text-3xl">{r.emoji}</span>
                      <div>
                        <p className="text-white font-bold text-sm mb-1">{t(`astrology.planet.${r.planetId}`)} {t("planet.retrograde")}</p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          {t(`astrology.planet.${r.planetId}`)} {t("planet.retrograde").toLowerCase()}. {t(`astrology.planet.meaning.${r.planetId}`).toLowerCase()} {t("chart.advice").toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">✨</div>
                    <p className="text-green-400 font-medium">{t("planets.positive")}</p>
                    <p className="text-gray-500 text-sm mt-1 font-light">{t("planets.no_retro")}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Grid vs List Toggle (Always Luxurious List cards for now as per plan) */}
      <section className="pb-32 px-4 relative z-10">
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

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none"></div>
    </div>
  );
}
