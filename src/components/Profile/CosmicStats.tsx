import React from "react";
import { Target, Anchor, RefreshCw, Hash } from "lucide-react";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import ZodiacIcon from "@/components/Cosmic/ZodiacIcon";
import { getPlanetById } from "@/data/planets";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { SectionLabel } from "./ProfileUI";
import { useRouter } from "next/navigation";

interface CosmicStatsProps {
  zodiacSign: any;
  normalizePlanetId: (name: string) => string;
}

export function CosmicStats({ zodiacSign, normalizePlanetId }: CosmicStatsProps) {
  const { t } = useTranslation();
  const router = useRouter();

  if (!zodiacSign) return null;

  return (
    <div className="rounded-[2.5rem] border border-white/[0.08] bg-white/[0.03] p-10 overflow-hidden relative group/stats isolate text-left">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover/stats:bg-white/10 transition-all duration-1000" />

      <SectionLabel>{t("astrology.label.cosmic_stats")}</SectionLabel>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8 relative z-10">
        {/* Planet Visual */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] group/planet">
          {(() => {
            const planetId = normalizePlanetId(zodiacSign.rulingPlanet);
            const planetData = getPlanetById(planetId);
            return (
              <>
                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full border border-white/10 p-1.5 bg-black/40 ring-1 ring-white/5 overflow-hidden flex items-center justify-center">
                  {planetData?.imageUrl ? (
                    <img
                      src={planetData.imageUrl}
                      alt={zodiacSign.rulingPlanet}
                      className="w-full h-full object-cover opacity-90 group-hover/planet:opacity-100 transition-all duration-1000 scale-125 group-hover/planet:scale-110 filter brightness-110"
                    />
                  ) : null}
                  <div className={cn("flex flex-col items-center gap-2", planetData?.imageUrl ? "hidden" : "")}>
                    <CosmicIcon name="planet" size={64} className="text-white/20" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="mt-6 text-center">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] block mb-2">{t("astrology.label.planet")}</span>
                  <span className="text-2xl font-serif font-black text-white tracking-tight">{t(zodiacSign.rulingPlanetKey)}</span>
                </div>
              </>
            );
          })()}
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-7 flex flex-col gap-4 justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
            <div className="p-3 md:p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] transition-all hover:bg-white/[0.05] hover:border-white/10 group/stat">
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2 font-black">{t("astrology.label.element")}</p>
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover/stat:scale-110 transition-transform flex-shrink-0">
                  <CosmicIcon
                    name={zodiacSign.elementKey.split('.').pop() as any || "earth"}
                    size={20}
                    className="group-hover/stat:rotate-12 transition-transform duration-500"
                  />
                </div>
                <span className="text-xs sm:text-base md:text-lg font-serif font-black text-white text-center sm:text-left leading-tight">{t(zodiacSign.elementKey)}</span>
              </div>
            </div>

            <div className="p-3 md:p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] transition-all hover:bg-white/[0.05] hover:border-white/10 group/stat">
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2 font-black">{t("astrology.label.quality")}</p>
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover/stat:scale-110 transition-transform flex-shrink-0">
                  {(() => {
                    const q = zodiacSign.qualityKey.split('.').pop();
                    if (q === 'cardinal') return <Target className="w-5 h-5 text-purple-400" />;
                    if (q === 'fixed') return <Anchor className="w-5 h-5 text-purple-400" />;
                    return <RefreshCw className="w-5 h-5 text-purple-400" />;
                  })()}
                </div>
                <span className="text-xs sm:text-base md:text-lg font-serif font-black text-white text-center sm:text-left leading-tight">{t(zodiacSign.qualityKey)}</span>
              </div>
            </div>

            <div className="p-3 md:p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] transition-all hover:bg-white/[0.05] hover:border-white/10 group/stat">
              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-2 font-black">{t("astrology.label.lucky_number")}</p>
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover/stat:scale-110 transition-transform flex-shrink-0">
                  <Hash className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-xs sm:text-base md:text-lg font-serif font-black text-white text-center sm:text-left leading-tight">{zodiacSign.luckyNumbers[0]}</span>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 transition-all hover:bg-indigo-500/10 hover:border-indigo-500/20 group/stat relative overflow-hidden">
              <p className="text-[9px] text-indigo-400/50 uppercase tracking-[0.2em] mb-4 font-black">{t("nav.compatibility")}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {zodiacSign.compatibility.slice(0, 4).map((id: string) => (
                  <button
                    key={id}
                    onClick={() => router.push(`/uyumluluk?sign1=${zodiacSign.id}&sign2=${id}`)}
                    className="px-2 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all hover:scale-105 group/zi"
                    title={t(`zodiac.${id}`)}
                  >
                    <ZodiacIcon signId={id} variant="classic" size={20} glowColor={id === 'akrep' ? '#a855f7' : '#6366f1'} className="text-white/40 group-hover/zi:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
