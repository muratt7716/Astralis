import React from "react";
import { Target, Anchor, RefreshCw, Hash, ArrowRight, Sparkles } from "lucide-react";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import ZodiacIcon from "@/components/Cosmic/ZodiacIcon";
import { getPlanetById } from "@/data/planets";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useRouter } from "next/navigation";

interface CosmicStatsProps {
  zodiacSign: any;
  normalizePlanetId: (name: string) => string;
}

function getQualityIcon(quality: string) {
  if (quality === "cardinal") return <Target className="w-5 h-5" />;
  if (quality === "fixed") return <Anchor className="w-5 h-5" />;
  return <RefreshCw className="w-5 h-5" />;
}

const ELEMENT_ACCENT: Record<string, { text: string; ring: string; glow: string }> = {
  fire: { text: "text-orange-300", ring: "ring-orange-500/30", glow: "bg-orange-500/20" },
  water: { text: "text-blue-300", ring: "ring-blue-500/30", glow: "bg-blue-500/20" },
  air: { text: "text-cyan-300", ring: "ring-cyan-500/30", glow: "bg-cyan-500/20" },
  earth: { text: "text-emerald-300", ring: "ring-emerald-500/30", glow: "bg-emerald-500/20" },
};

export function CosmicStats({ zodiacSign, normalizePlanetId }: CosmicStatsProps) {
  const { t } = useTranslation();
  const router = useRouter();

  if (!zodiacSign) return null;

  const planetId = normalizePlanetId(zodiacSign.rulingPlanet);
  const planetData = getPlanetById(planetId);
  const elementKey = zodiacSign.elementKey?.split(".").pop() || "earth";
  const qualityKey = zodiacSign.qualityKey?.split(".").pop() || "cardinal";
  const elAccent = ELEMENT_ACCENT[elementKey] || ELEMENT_ACCENT.earth;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 px-1">
        <Sparkles className="w-4 h-4 text-purple-400/60" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">{t("astrology.label.cosmic_stats")}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      {/* Planet Hero Card */}
      <div className="group relative rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 md:p-8 overflow-hidden isolate shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-500/[0.06] blur-[60px] rounded-full group-hover:bg-purple-500/[0.12] transition-all duration-1000 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/[0.04] blur-[50px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center gap-5">
          {/* Planet image */}
          <div className={cn(
            "w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0 ring-1",
            "bg-black/60 backdrop-blur-sm group-hover:ring-2 transition-all duration-500",
            elAccent.ring
          )}>
            {planetData?.imageUrl ? (
              <img
                src={planetData.imageUrl}
                alt={zodiacSign.rulingPlanet}
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CosmicIcon name="planet" size={36} className="text-white/15" />
              </div>
            )}
          </div>

          {/* Planet info */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-bold mb-1">{t("astrology.label.planet")}</p>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight leading-tight mb-2">
              {t(zodiacSign.rulingPlanetKey)}
            </h3>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", elAccent.glow)} />
              <span className={cn("text-[10px] font-semibold uppercase tracking-widest", elAccent.text)}>
                {t(zodiacSign.elementKey)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid — 3 columns with CosmicIcon SVGs */}
      <div className="grid grid-cols-3 gap-3">
        {/* Element */}
        <div className="group/card relative rounded-2xl border border-white/[0.06] p-4 md:p-5 overflow-hidden cursor-default bg-gradient-to-b from-white/[0.03] to-transparent hover:from-white/[0.06] transition-all duration-500">
          <div className={cn("absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none", elAccent.glow)} style={{ filter: "blur(40px)" }} />
          <div className="relative z-10">
            <div className="mb-3">
              <CosmicIcon name={elementKey as any} size={32} />
            </div>
            <p className="text-[8px] text-white/25 uppercase tracking-[0.2em] font-bold mb-1">{t("astrology.label.element")}</p>
            <p className="text-sm md:text-base font-bold text-white">{t(zodiacSign.elementKey)}</p>
          </div>
        </div>

        {/* Quality */}
        <div className="group/card relative rounded-2xl border border-white/[0.06] p-4 md:p-5 overflow-hidden cursor-default bg-gradient-to-b from-white/[0.03] to-transparent hover:from-white/[0.06] transition-all duration-500">
          <div className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ filter: "blur(40px)" }} />
          <div className="relative z-10">
            <div className="mb-3">
              <CosmicIcon name={qualityKey as any} size={32} />
            </div>
            <p className="text-[8px] text-white/25 uppercase tracking-[0.2em] font-bold mb-1">{t("astrology.label.quality")}</p>
            <p className="text-sm md:text-base font-bold text-white">{t(zodiacSign.qualityKey)}</p>
          </div>
        </div>

        {/* Lucky Number */}
        <div className="group/card relative rounded-2xl border border-white/[0.06] p-4 md:p-5 overflow-hidden cursor-default bg-gradient-to-b from-white/[0.03] to-transparent hover:from-white/[0.06] transition-all duration-500">
          <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ filter: "blur(40px)" }} />
          <div className="relative z-10">
            <div className="mb-3">
              <CosmicIcon name="numerology" size={32} />
            </div>
            <p className="text-[8px] text-white/25 uppercase tracking-[0.2em] font-bold mb-1">{t("astrology.label.lucky_number")}</p>
            <p className="text-2xl font-black text-white tabular-nums">{zodiacSign.luckyNumbers[0]}</p>
          </div>
        </div>
      </div>

      {/* Compatibility Bar */}
      <div className="rounded-[2rem] border border-indigo-500/[0.08] bg-indigo-500/[0.03] p-5 hover:bg-indigo-500/[0.06] transition-all duration-500">
        <p className="text-[8px] text-indigo-400/40 uppercase tracking-[0.2em] font-bold mb-3">{t("nav.compatibility")}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {zodiacSign.compatibility.slice(0, 4).map((id: string) => (
            <button
              key={id}
              onClick={() => router.push(`/uyumluluk?sign1=${zodiacSign.id}&sign2=${id}`)}
              className="group/c flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300 hover:scale-105"
            >
              <ZodiacIcon signId={id} variant="classic" size={16} glowColor="#6366f1" className="text-white/30 group-hover/c:text-white transition-colors" />
              <span className="text-[11px] text-white/35 font-semibold group-hover/c:text-white transition-colors">{t(`zodiac.${id}`)}</span>
              <ArrowRight className="w-3 h-3 text-white/0 group-hover/c:text-indigo-400 transition-all duration-300 -translate-x-1 group-hover/c:translate-x-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
