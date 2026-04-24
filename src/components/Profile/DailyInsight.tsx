import { motion } from "framer-motion";
import { Sparkles, Loader2, Heart, Zap, Shield, Eye, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface DailyInsightProps {
  horoscopeData: any;
  fetchingHoroscope: boolean;
  dir: string;
}

const SIGN_PANELS = [
  {
    key: "sun" as const,
    labelKey: "profile.sign_insights_sun",
    gradient: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/15",
    dot: "bg-amber-400",
    hookColor: "text-amber-200",
    symbol: "☀",
  },
  {
    key: "moon" as const,
    labelKey: "profile.sign_insights_moon",
    gradient: "from-blue-500/10 to-indigo-500/5",
    border: "border-blue-500/15",
    dot: "bg-blue-400",
    hookColor: "text-blue-200",
    symbol: "☽",
  },
  {
    key: "rising" as const,
    labelKey: "profile.sign_insights_rising",
    gradient: "from-orange-500/10 to-rose-500/5",
    border: "border-orange-500/15",
    dot: "bg-orange-400",
    hookColor: "text-orange-200",
    symbol: "↑",
  },
] as const;

export function DailyInsight({ horoscopeData, fetchingHoroscope, dir }: DailyInsightProps) {
  const { t } = useTranslation();
  const signInsights = horoscopeData?.signInsights;

  return (
    <div className="rounded-[2.5rem] border border-white/[0.08] bg-white/[0.02] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-8 md:p-10 relative overflow-hidden flex flex-col justify-between min-h-[350px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 blur-[100px] rounded-full -ml-10 -mb-10 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 block">{t("profile.daily_flow")}</span>
              <span className="text-[9px] text-white/10 uppercase tracking-widest mt-0.5 block">
                {new Date().toLocaleDateString(dir === "rtl" ? "ar-EG" : "tr-TR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
          {fetchingHoroscope && <Loader2 className="w-4 h-4 animate-spin text-purple-400/40" />}
        </div>

        {/* Main title + body */}
        <div className="max-w-2xl">
          <h2 className={cn(
            "text-3xl md:text-5xl font-serif font-bold tracking-tight leading-tight mb-6 transition-all duration-1000",
            fetchingHoroscope ? "opacity-20 blur-md" : "opacity-100"
          )}>
            {horoscopeData?.title || t("profile.daily_preparing")}
          </h2>

          <div className={cn(
            "text-white/40 text-base leading-relaxed space-y-4 transition-all duration-1000 font-light",
            fetchingHoroscope ? "opacity-20 blur-md" : "opacity-100"
          )}>
            {horoscopeData?.text ? (
              horoscopeData.text.split("\n\n").map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))
            ) : (
              <p>{t("profile.daily_analyzing")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Energy Scores */}
      {horoscopeData?.energyScores && (
        <div className="relative z-10 pt-8 mt-8 border-t border-white/[0.05]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "love",     label: t("profile.energy.love")     || "Aşk",    icon: <Heart  className="w-3.5 h-3.5" />, color: "text-rose-400",    bg: "bg-rose-500"    },
              { key: "career",   label: t("profile.energy.career")   || "Kariyer", icon: <Zap    className="w-3.5 h-3.5" />, color: "text-amber-400",   bg: "bg-amber-500"   },
              { key: "health",   label: t("profile.energy.health")   || "Sağlık",  icon: <Shield className="w-3.5 h-3.5" />, color: "text-emerald-400", bg: "bg-emerald-500" },
              { key: "spiritual",label: t("profile.energy.spiritual") || "Ruhsal",  icon: <Eye    className="w-3.5 h-3.5" />, color: "text-violet-400",  bg: "bg-violet-500"  },
            ].map(({ key, label, icon, color, bg }) => {
              const score = Number(horoscopeData.energyScores[key]) || 0;
              return (
                <div key={key} className="p-3 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={cn("p-1.5 rounded-lg bg-white/5", color)}>{icon}</div>
                    <span className="text-xs font-mono font-bold text-white/40">%{score}</span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{label}</p>
                    <div className="h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn("h-full rounded-full", bg)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sign Insights — 3 panels */}
      {signInsights && (
        <div className="relative z-10 pt-8 mt-8 border-t border-white/[0.05] space-y-4">
          {/* Section label */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">
              {t("profile.sign_insights_label")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SIGN_PANELS.map(({ key, labelKey, gradient, border, dot, hookColor, symbol }, idx) => {
              const panel = signInsights[key];
              if (!panel) return null;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={cn(
                    "rounded-2xl border p-4 bg-gradient-to-br space-y-3",
                    gradient, border
                  )}
                >
                  {/* Label row */}
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none opacity-60">{symbol}</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                      {t(labelKey)}
                    </span>
                  </div>

                  {/* Hook headline */}
                  <p className={cn("text-sm font-bold leading-snug", hookColor)}>
                    {panel.hook}
                  </p>

                  {/* Insight body */}
                  <p className="text-[12px] text-white/45 leading-relaxed font-light">
                    {panel.insight}
                  </p>

                  {/* Watch note */}
                  {panel.watch && (
                    <div className="flex items-start gap-1.5 pt-1 border-t border-white/[0.06]">
                      <AlertTriangle className="w-3 h-3 text-white/25 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-white/30 leading-relaxed">
                        {panel.watch}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Source note */}
          <p className="text-[10px] text-white/15 text-center pt-1">
            {t("profile.sign_insights_source")}
          </p>
        </div>
      )}
    </div>
  );
}
