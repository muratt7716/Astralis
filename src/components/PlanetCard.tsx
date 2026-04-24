"use client";

import Image from "next/image";
import { Planet } from "@/data/planets";
import { zodiacSigns } from "@/data/zodiac";
import { useTranslation } from "@/lib/i18n";

interface PlanetCardProps {
  planet: Planet;
  index: number;
}

export default function PlanetCard({ planet, index }: PlanetCardProps) {
  const { t } = useTranslation();
  const ruledSigns = zodiacSigns.filter((s) =>
    planet.rulesSign.includes(s.id)
  );

  return (
    <div
      className="glass-card overflow-hidden group hover:border-white/20 transition-all duration-500 fade-in-up shadow-2xl"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
        {/* Left: Media & Identity */}
        <div className="md:w-56 flex-shrink-0 flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6 group-hover:scale-105 transition-transform duration-700">
            {/* Ambient Glow */}
            <div
              className="absolute inset-0 rounded-full md:blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"
              style={{ backgroundColor: planet.color }}
            ></div>

            {/* Image */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)] float">
              <Image
                src={planet.imageUrl}
                alt={t(`astrology.planet.${planet.id}`)}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                sizes="(max-width: 768px) 128px, 160px"
              />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">{t(`astrology.planet.${planet.id}`)}</h2>
          <p className="text-gray-400 text-sm italic mb-4 font-serif">{planet.symbol} {t("planet.ruler")}</p>

          <div className="flex flex-wrap gap-2 justify-center">
            {ruledSigns.map((s) => (
              <span
                key={s.id}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs flex items-center gap-1.5"
                style={{ borderColor: `${planet.color}33` }}
              >
                <span className="text-lg leading-none">{s.symbol}</span>
                {t(s.nameKey)}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Insights */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-gray-200 text-lg leading-relaxed mb-6 font-light">
            {t(`astrology.planet.${planet.id}.desc`)}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("planet.influence")}</h4>
              <p className="text-white font-medium">{t(`astrology.planet.meaning.${planet.id}`)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t("planets.element_transit")}</h4>
              <p className="text-white font-medium">{t(`planet.element.${planet.id}`)} • {t(`planet.transit.${planet.id}`)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                {t("planets.effects_positive")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {planet.positiveEffects.map((_, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-medium">
                    {t(`planet.${planet.id}.pos.${i}`)}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"></span>
                {t("planets.effects_negative")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {planet.negativeEffects.map((_, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium">
                    {t(`planet.${planet.id}.neg.${i}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
