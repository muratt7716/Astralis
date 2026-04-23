"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  calculateBiorhythm,
  calculateBiorhythmRange,
  generateBiorhythmSummary,
  calculateBiorhythmCompatibility,
} from "@/lib/biorhythm";
import { getCurrentProfile, useAuth } from "@/lib/auth-helpers";
import { logInteraction } from "@/lib/logging";
import { useTranslation } from "@/lib/i18n";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import PremiumModal, { PremiumModalVariant } from "@/components/PremiumModal";
import FreemiumBadge from "@/components/FreemiumBadge";
import { useFreemiumQuota } from "@/lib/freemium";
import { GlassButton } from "@/components/ui/glass-button";
import { AlertTriangle, Info, TrendingUp, Heart, Brain, Dumbbell, Sparkles, Eye, Palette, Waves, Activity } from "lucide-react";

function BiyoritimContent() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const { isPremium, isBlocked, consumeQuota } = useFreemiumQuota("biyoritim");
  const [showPremium, setShowPremium] = useState(false);
  const [premiumVariant, setPremiumVariant] = useState<PremiumModalVariant>("premium_required");

  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultToday = new Date().toISOString().split("T")[0];
  
  const [birthDate, setBirthDate] = useState(searchParams?.get("birth") || "");
  const [targetDateInput, setTargetDateInput] = useState(searchParams?.get("target") || defaultToday);
  const [showResult, setShowResult] = useState(!!searchParams?.get("birth"));
  const [activeTab, setActiveTab] = useState<"primary" | "advanced">("primary");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [showPartner, setShowPartner] = useState(false);
  const [relationType, setRelationType] = useState(t("bio.synergy.relation.love"));
  const [aiAnalysis, setAiAnalysis] = useState<{overview: string, clashes: string, psychodynamics: string, strategy: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const parsedBirth = useMemo(() => {
    if (!birthDate) return null;
    const d = new Date(birthDate);
    return isNaN(d.getTime()) ? null : d;
  }, [birthDate]);

  const parsedTarget = useMemo(() => {
    if (!targetDateInput) return new Date();
    const d = new Date(targetDateInput);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [targetDateInput]);

  const summary = useMemo(() => {
    if (!parsedBirth) return null;
    return generateBiorhythmSummary(parsedBirth, parsedTarget);
  }, [parsedBirth, parsedTarget, showResult]);

  const chartData = useMemo(() => {
    if (!parsedBirth) return [];
    return calculateBiorhythmRange(parsedBirth, parsedTarget, 15, 15);
  }, [parsedBirth, parsedTarget, showResult]);

  const targetPoint = useMemo(() => {
    if (!parsedBirth) return null;
    return calculateBiorhythm(parsedBirth, parsedTarget);
  }, [parsedBirth, parsedTarget, showResult]);

  const parsedPartnerBirth = useMemo(() => {
    if (!showPartner || !partnerBirthDate) return null;
    const d = new Date(partnerBirthDate);
    return isNaN(d.getTime()) ? null : d;
  }, [partnerBirthDate, showPartner]);

  const partnerSummary = useMemo(() => {
    if (!parsedPartnerBirth) return null;
    return generateBiorhythmSummary(parsedPartnerBirth, parsedTarget);
  }, [parsedPartnerBirth, parsedTarget, showResult]);

  const partnerChartData = useMemo(() => {
    if (!parsedPartnerBirth) return [];
    return calculateBiorhythmRange(parsedPartnerBirth, parsedTarget, 15, 15);
  }, [parsedPartnerBirth, parsedTarget, showResult]);

  const synergyCompat = useMemo(() => {
    if (!parsedBirth || !parsedPartnerBirth || !showPartner) return null;
    return calculateBiorhythmCompatibility(parsedBirth, parsedPartnerBirth);
  }, [parsedBirth, parsedPartnerBirth, showPartner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPremium) {
      if (isBlocked) { setPremiumVariant("quota_exceeded"); setShowPremium(true); return; }
      consumeQuota();
    }
    if (parsedBirth) {
      router.push(`?birth=${birthDate}&target=${targetDateInput}`, { scroll: false });
      setShowResult(true);
      
      // Log Interaction
      try {
        const profile = await getCurrentProfile();
        if (profile) {
          logInteraction(profile.id, "bio", "Biyoritim hesaplaması yapıldı");
        }
      } catch (err) {
        console.error("Log failed", err);
      }
    }
  };

  useEffect(() => {
    if (!showResult || !summary || !parsedBirth || !parsedTarget) return;

    let isCancelled = false;

    const fetchAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const res = await fetch("/api/biorhythm/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetDate: targetDateInput,
            physical: summary.physical,
            emotional: summary.emotional,
            intellectual: summary.intellectual,
            intuitional: summary.intuitional,
            aesthetic: summary.aesthetic,
            spiritual: summary.spiritual,
            criticalDays: summary.criticalDays,
            language,
            userId: user?.id, // Pass userId for logging
            ...(showPartner && partnerSummary ? {
                partnerPhysical: partnerSummary.physical,
                partnerEmotional: partnerSummary.emotional,
                partnerIntellectual: partnerSummary.intellectual,
                partnerIntuitional: partnerSummary.intuitional,
                partnerAesthetic: partnerSummary.aesthetic,
                partnerSpiritual: partnerSummary.spiritual,
                relationType,
                partnerBirthDate,
            } : {})
          }),
        });
        const data = await res.json();
        if (!isCancelled && data.success && data.analysis) {
          setAiAnalysis(data.analysis);
        }
      } catch (error) {
        console.error("AI Analysis fetch error:", error);
      } finally {
        if (!isCancelled) setIsAnalyzing(false);
      }
    };

    fetchAnalysis();

    return () => {
      isCancelled = true;
    };
  }, [parsedBirth, parsedTarget, showResult]);

  const getColor = (value: number) => {
    if (value > 50) return "#10b981";
    if (value > 0) return "#6ee7b7";
    if (value > -50) return "#fbbf24";
    return "#ef4444";
  };

  const getGradient = (value: number) => {
    if (value > 50) return "from-emerald-500 to-green-400";
    if (value > 0) return "from-emerald-400 to-teal-300";
    if (value > -50) return "from-amber-400 to-yellow-300";
    return "from-red-500 to-rose-400";
  };

  return (
    <div className="cosmic-gradient min-h-screen pt-32 pb-16 px-4">
      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} featureName="Biyoritim" variant={premiumVariant} />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <CosmicIcon name="biorhythm" size={80} className="mx-auto mb-6 animate-float" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {t("bio.title")}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-light leading-relaxed mb-4">
            {t("bio.subtitle")}
          </p>
          <p className="text-gray-400 text-sm max-w-3xl mx-auto font-light leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5">
             {t("bio.main_desc")}
          </p>
          <div className="mt-4">
            <FreemiumBadge toolKey="biyoritim" />
          </div>
        </div>

        {/* Biorhythm Guide */}
        <div className="max-w-3xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-2 gap-4 fade-in">
          <div className="glass-card p-5 border-l-4 border-l-amber-500 hover:bg-white/5 transition-colors cursor-default shadow-lg">
            <h3 className="text-white font-black uppercase tracking-widest text-[13px] flex items-center gap-2 mb-2">
              <AlertTriangle className="size-5 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" /> {t("bio.guide.critical_title")}
            </h3>
            <p className="text-gray-400 text-[13px] leading-relaxed font-light">
              {t("bio.guide.critical_desc")}
            </p>
          </div>
          <div className="glass-card p-5 border-l-4 border-l-blue-500 hover:bg-white/5 transition-colors cursor-default shadow-lg">
             <h3 className="text-white font-black uppercase tracking-widest text-[13px] flex items-center gap-2 mb-2">
               <TrendingUp className="size-5 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" /> {t("bio.guide.phases_title")}
             </h3>
             <p className="text-gray-400 text-[13px] leading-relaxed font-light">
               {t("bio.guide.phases_desc")}
             </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12 relative z-10 glass-card p-8 border-t-2 border-t-purple-500 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 font-bold mb-2 uppercase tracking-wider text-sm">
                 {t("bio.birth_label")}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => { setBirthDate(e.target.value); setShowResult(false); }}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-5 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner"
                required
              />
            </div>
            <div>
               <label className="block text-gray-300 font-bold mb-2 uppercase tracking-wider text-sm flex items-center justify-between">
                 {t("bio.target_date")}
                 <span className="text-[10px] text-purple-400 font-normal normal-case">{t("bio.time_travel")}</span>
               </label>
              <input
                type="date"
                value={targetDateInput}
                min={birthDate || undefined}
                onChange={(e) => { setTargetDateInput(e.target.value); setShowResult(false); }}
                className="w-full px-5 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner"
                required
              />
              <p className="text-[11px] text-gray-500 mt-3 font-light leading-relaxed">
                {t("bio.time_travel_desc")}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-6">
             <button 
               type="button" 
               onClick={() => { setShowPartner(!showPartner); setShowResult(false); }} 
               className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-purple-500/50 text-purple-300 hover:bg-purple-500/10 transition-colors uppercase tracking-widest text-xs font-bold"
             >
                <Heart className="size-4" /> 
                {showPartner ? t("bio.synergy.close") : t("bio.synergy.open")}
             </button>

             {showPartner && (
                <div className="mt-4 grid md:grid-cols-2 gap-6 p-6 rounded-2xl border border-purple-500/20 bg-purple-900/10 fade-in">
                   <div>
                     <label className="block text-gray-300 font-bold mb-2 uppercase tracking-wider text-sm">
                        {t("bio.synergy.partner_birth")}
                     </label>
                     <input
                       type="date"
                       value={partnerBirthDate}
                       onChange={(e) => { setPartnerBirthDate(e.target.value); setShowResult(false); }}
                       max={new Date().toISOString().split("T")[0]}
                       className="w-full px-5 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner"
                       required={showPartner}
                     />
                   </div>
                   <div>
                     <label className="block text-gray-300 font-bold mb-2 uppercase tracking-wider text-sm">
                        {t("bio.synergy.relation_label")}
                     </label>
                     <select
                       value={relationType}
                       onChange={(e) => { setRelationType(e.target.value); setShowResult(false); }}
                       className="w-full px-5 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner appearance-none"
                     >
                       <option value={t("bio.synergy.relation.love")}>💕 {t("bio.synergy.relation.love")}</option>
                       <option value={t("bio.synergy.relation.work")}>💼 {t("bio.synergy.relation.work")}</option>
                       <option value={t("bio.synergy.relation.family")}>👨‍👩‍👧 {t("bio.synergy.relation.family")}</option>
                       <option value={t("bio.synergy.relation.rival")}>⚔️ {t("bio.synergy.relation.rival")}</option>
                     </select>
                   </div>
                </div>
             )}
          </div>

          <GlassButton
            type="submit"
            fullWidth
            className="mt-8 hover:border-purple-500/50"
          >
            {t("bio.submit")}
          </GlassButton>
        </form>

        {/* Results Sections */}
        {showResult && summary && targetPoint && (
          <div className="space-y-12 fade-in-up">
             
            {/* Master's Insight Alert */}
            <div className="glass-card p-6 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-900/40 to-transparent flex gap-6 items-center">
                <div className="hidden sm:flex p-4 rounded-full bg-purple-500/10 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                   <Sparkles className="size-10 text-purple-400" />
                </div>
               <div>
                 <h3 className="text-white font-black tracking-widest uppercase mb-1">{t("bio.insight.title")}</h3>
                 <p className="text-gray-300 text-sm italic font-light leading-relaxed">
                    "{t("bio.insight.desc")} {t("bio.formula")}"
                 </p>
               </div>
            </div>

            {/* Cycles Navigation Tabs */}
            <div className="flex justify-center mb-6">
              <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex gap-2 w-full max-w-sm shrink-0">
                <button
                  onClick={() => setActiveTab("primary")}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'primary' ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                   {t("bio.mode.primary")}
                </button>
                <button
                  onClick={() => setActiveTab("advanced")}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'advanced' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                   {t("bio.mode.advanced")}
                </button>
              </div>
            </div>

            {/* Gauge Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(activeTab === "primary" ? [
                { id: "physical", label: t("bio.physical"), icon: <Dumbbell className="size-8 text-emerald-400" />, value: targetPoint.physical, cycle: "23", data: summary.physical, color: "#10b981", grad: "from-emerald-500 to-green-400" },
                { id: "emotional", label: t("bio.emotional"), icon: <Heart className="size-8 text-pink-400" />, value: targetPoint.emotional, cycle: "28", data: summary.emotional, color: "#ec4899", grad: "from-pink-500 to-rose-400" },
                { id: "intellectual", label: t("bio.intellectual"), icon: <Brain className="size-8 text-blue-400" />, value: targetPoint.intellectual, cycle: "33", data: summary.intellectual, color: "#3b82f6", grad: "from-blue-500 to-cyan-400" },
              ] : [
                { id: "intuitional", label: t("bio.intuitional"), icon: <Eye className="size-8 text-purple-400" />, value: targetPoint.intuitional, cycle: "38", data: summary.intuitional, color: "#a855f7", grad: "from-purple-500 to-fuchsia-400" },
                { id: "aesthetic", label: t("bio.aesthetic"), icon: <Palette className="size-8 text-amber-400" />, value: targetPoint.aesthetic, cycle: "43", data: summary.aesthetic, color: "#f59e0b", grad: "from-amber-500 to-yellow-400" },
                { id: "spiritual", label: t("bio.spiritual"), icon: <Waves className="size-8 text-indigo-400" />, value: targetPoint.spiritual, cycle: "53", data: summary.spiritual, color: "#6366f1", grad: "from-indigo-500 to-blue-400" },
              ]).map((item) => (
                <div key={item.id} className="enhanced-glass rounded-3xl p-5 sm:p-8 border border-white/10 text-center hover:bg-white/[0.03] transition-all duration-500 hover:transform hover:scale-[1.02]">
                  <div className="flex justify-center mb-4 opacity-80">{item.icon}</div>
                  <h3 className="text-white font-black tracking-widest text-lg uppercase mb-1">{item.label}</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6">{t("bio.cycle")}: {item.cycle} {t("bio.days")}</p>

                  {/* Circular Gauge */}
                  <div className="relative w-36 h-36 mx-auto mb-6 group cursor-default">
                    <div className={`absolute -inset-4 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-gradient-to-br ${item.grad} blur-xl`} />
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 relative z-10">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke={getColor(item.value)}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.abs(item.value) * 3.14} 314`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                      <span className="text-3xl font-black text-white">{item.value > 0 ? "+" : ""}{item.value}%</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${getGradient(item.value)} bg-clip-text text-transparent mt-1`}>
                        {item.data.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed font-light">"{item.data.advice}"</p>
                </div>
              ))}
            </div>

            {/* AI Master Analysis (Kozmik Üstadın Analizi) */}
            {(isAnalyzing || aiAnalysis) && (
              <div className="glass-card p-8 md:p-10 border-t-4 border-t-purple-500 relative overflow-hidden shadow-2xl group fade-in-up">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/10 blur-[80px] pointer-events-none rounded-full" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-600/10 blur-[80px] pointer-events-none rounded-full" />
                
                <h3 className="text-white font-black tracking-widest text-2xl uppercase mb-8 flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                    <Sparkles className={`size-6 text-purple-400 ${isAnalyzing ? 'animate-spin-slow' : 'animate-pulse'}`} />
                  </div>
                  {t("bio.analysis.master_title")}
                </h3>

                {isAnalyzing ? (
                  <div className="py-8 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                    <p className="text-purple-400 font-bold uppercase tracking-widest text-sm animate-pulse">{t("bio.analysis.loading")}</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-6 relative z-10">
                    <div className="bg-black/30 p-6 rounded-2xl border border-white/5 shadow-inner">
                      <p className="text-gray-300 text-lg leading-relaxed font-light italic">
                        "{aiAnalysis.overview}"
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-rose-950/30 p-6 rounded-2xl border border-rose-500/20 flex flex-col gap-3 group-hover:bg-rose-950/40 transition-colors">
                        <div className="flex items-center gap-2">
                           <AlertTriangle className="size-5 text-rose-500" />
                           <span className="text-rose-500 font-bold uppercase tracking-widest text-xs">{t("bio.analysis.clashes")}</span>
                        </div>
                        <p className="text-rose-200/80 text-sm leading-relaxed font-light">
                          {aiAnalysis.clashes}
                        </p>
                      </div>

                      <div className="bg-purple-950/30 p-6 rounded-2xl border border-purple-500/20 flex flex-col gap-3 group-hover:bg-purple-950/40 transition-colors">
                        <div className="flex items-center gap-2">
                           <Brain className="size-5 text-purple-500" />
                           <span className="text-purple-500 font-bold uppercase tracking-widest text-xs">{t("bio.analysis.psychodynamics")}</span>
                        </div>
                        <p className="text-purple-200/80 text-sm leading-relaxed font-light">
                          {aiAnalysis.psychodynamics}
                        </p>
                      </div>

                      <div className="bg-emerald-950/30 p-6 rounded-2xl border border-emerald-500/20 flex flex-col gap-3 group-hover:bg-emerald-950/40 transition-colors">
                        <div className="flex items-center gap-2">
                           <Activity className="size-5 text-emerald-500" />
                           <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs">{t("bio.analysis.strategy")}</span>
                        </div>
                        <p className="text-emerald-200/80 text-sm leading-relaxed font-light">
                          {aiAnalysis.strategy}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Synergy Harmony Gauges */}
            {showPartner && synergyCompat && (
              <div className="glass-card p-8 md:p-10 border-t-2 border-t-pink-500 shadow-2xl relative group fade-in-up">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[80px] pointer-events-none rounded-full" />
                 <h3 className="text-white font-black tracking-widest text-xl uppercase mb-6 text-center">{relationType} {t("bio.compat.title")}</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                    {[
                      { label: t("bio.synergy.gauge.emotional"), value: synergyCompat.emotional, color: "text-pink-400" },
                      { label: t("bio.synergy.gauge.intellectual"), value: synergyCompat.intellectual, color: "text-blue-400" },
                      { label: t("bio.synergy.gauge.physical"), value: synergyCompat.physical, color: "text-emerald-400" },
                      { label: t("bio.synergy.gauge.total"), value: synergyCompat.average, color: "text-purple-400" },
                    ].map((c, i) => (
                      <div key={i} className="bg-black/40 p-6 rounded-2xl border border-white/5 text-center flex flex-col justify-center items-center hover:bg-white/5 transition-colors">
                         <h4 className={`font-bold uppercase tracking-widest text-[10px] mb-3 ${c.color}`}>{c.label}</h4>
                         <div className="text-3xl md:text-4xl font-black text-white">{c.value}%</div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* Interactive Horizon Chart */}
            <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border-t-2 border-t-white/10 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[100px] pointer-events-none rounded-full -translate-y-1/2 translate-x-1/3" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                  <div>
                    <h3 className="text-white font-black tracking-widest text-2xl uppercase">{t("bio.chart_title")}</h3>
                    <p className="text-gray-400 text-sm mt-1 font-light">{t("bio.chart_subtitle")}</p>
                 </div>
                 
                 {/* Legend */}
                 <div className="flex flex-wrap items-center gap-4 bg-black/40 px-6 py-3 rounded-full border border-white/5">
                   {activeTab === "primary" ? (
                     <>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"/><span className="text-xs text-emerald-100 font-bold uppercase tracking-wider">{t("bio.physical")}</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"/><span className="text-xs text-pink-100 font-bold uppercase tracking-wider">{t("bio.emotional")}</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"/><span className="text-xs text-blue-100 font-bold uppercase tracking-wider">{t("bio.intellectual")}</span></div>
                     </>
                   ) : (
                     <>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"/><span className="text-xs text-purple-100 font-bold uppercase tracking-wider">{t("bio.intuitional")}</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"/><span className="text-xs text-amber-100 font-bold uppercase tracking-wider">{t("bio.aesthetic")}</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"/><span className="text-xs text-indigo-100 font-bold uppercase tracking-wider">{t("bio.spiritual")}</span></div>
                     </>
                   )}
                 </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar pb-6 relative z-10 w-full px-2">
                <svg viewBox="0 0 1000 300" className="w-full min-w-[800px] drop-shadow-2xl">
                  {/* Grid lines Background */}
                  <line x1="60" y1="150" x2="960" y2="150" stroke="rgba(255,255,255,0.2)" strokeDasharray="6" strokeWidth="2" />
                  <line x1="60" y1="50" x2="960" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                  <line x1="60" y1="250" x2="960" y2="250" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
                  
                  {/* Axis Labels */}
                  <text x="10" y="154" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="bold">0%</text>
                  <text x="5" y="54" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="bold">+100</text>
                  <text x="5" y="254" fill="rgba(255,255,255,0.5)" fontSize="12" fontWeight="bold">-100</text>

                  {/* Date Ticks on 0 axis */}
                  {chartData.map((p, i) => {
                     const x = 60 + i * (900 / (chartData.length - 1));
                     if (i % 3 === 0) { // Sadece belirli günleri göster kalabalık olmasın
                        return (
                           <text key={i} x={x} y="165" fill="rgba(255,255,255,0.2)" fontSize="9" textAnchor="middle">
                             {p.date.getDate()}/{p.date.getMonth() + 1}
                           </text>
                        )
                     }
                     return null;
                  })}

                  {/* Target Date marker */}
                  <g className="opacity-70 group-hover:opacity-100 transition-opacity">
                    <line x1={60 + 15 * (900 / 30)} y1="30" x2={60 + 15 * (900 / 30)} y2="270" stroke="rgba(255,255,255,0.4)" strokeDasharray="8" strokeWidth="2" />
                    <rect x={60 + 15 * (900 / 30) - 30} y="10" width="60" height="22" rx="4" fill="rgba(255,255,255,0.1)" style={{ backdropFilter: 'blur(4px)' }} />
                    <text x={60 + 15 * (900 / 30)} y="25" fill="#fff" fontSize="11" textAnchor="middle" fontWeight="bold" letterSpacing="1">{t("bio.target_marker")}</text>
                  </g>

                  {/* Primary Curves */}
                  {activeTab === "primary" && [
                    { key: "physical" as const, color: "#10b981", opacity: 0.9 },
                    { key: "emotional" as const, color: "#ec4899", opacity: 0.9 },
                    { key: "intellectual" as const, color: "#3b82f6", opacity: 0.9 },
                  ].map((curve) => (
                    <polyline
                      key={curve.key}
                      fill="none"
                      stroke={curve.color}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={curve.opacity}
                      points={chartData.map((p, i) => {
                        const x = 60 + i * (900 / (chartData.length - 1));
                        const y = 150 - (p[curve.key] / 100) * 100;
                        return `${x},${y}`;
                      }).join(" ")}
                      className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] hover:stroke-white transition-all cursor-crosshair"
                    />
                  ))}
                  
                  {/* Partner Primary Curves (Dashed) */}
                  {showPartner && activeTab === "primary" && partnerChartData.length > 0 && [
                    { key: "physical" as const, color: "#10b981", opacity: 0.5 },
                    { key: "emotional" as const, color: "#ec4899", opacity: 0.5 },
                    { key: "intellectual" as const, color: "#3b82f6", opacity: 0.5 },
                  ].map((curve) => (
                    <polyline
                      key={curve.key + "_partner"}
                      fill="none"
                      stroke={curve.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="5,7"
                      opacity={curve.opacity}
                      points={partnerChartData.map((p, i) => {
                        const x = 60 + i * (900 / (partnerChartData.length - 1));
                        const y = 150 - (p[curve.key] / 100) * 100;
                        return `${x},${y}`;
                      }).join(" ")}
                      className="transition-all"
                    />
                  ))}

                  {/* Advanced Curves */}
                  {activeTab === "advanced" && [
                    { key: "intuitional" as const, color: "#a855f7", opacity: 0.9 },
                    { key: "aesthetic" as const, color: "#f59e0b", opacity: 0.9 },
                    { key: "spiritual" as const, color: "#6366f1", opacity: 0.9 },
                  ].map((curve) => (
                    <polyline
                      key={curve.key}
                      fill="none"
                      stroke={curve.color}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={curve.opacity}
                      points={chartData.map((p, i) => {
                        const x = 60 + i * (900 / (chartData.length - 1));
                        const y = 150 - (p[curve.key] / 100) * 100;
                        return `${x},${y}`;
                      }).join(" ")}
                      className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] hover:stroke-white transition-all cursor-crosshair"
                    />
                  ))}
                  
                  {/* Partner Advanced Curves (Dashed) */}
                  {showPartner && activeTab === "advanced" && partnerChartData.length > 0 && [
                    { key: "intuitional" as const, color: "#a855f7", opacity: 0.5 },
                    { key: "aesthetic" as const, color: "#f59e0b", opacity: 0.5 },
                    { key: "spiritual" as const, color: "#6366f1", opacity: 0.5 },
                  ].map((curve) => (
                    <polyline
                      key={curve.key + "_partner"}
                      fill="none"
                      stroke={curve.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="5,7"
                      opacity={curve.opacity}
                      points={partnerChartData.map((p, i) => {
                        const x = 60 + i * (900 / (partnerChartData.length - 1));
                        const y = 150 - (p[curve.key] / 100) * 100;
                        return `${x},${y}`;
                      }).join(" ")}
                      className="transition-all"
                    />
                  ))}
                  
                </svg>
              </div>
            </div>

            {/* Critical Days Alert */}
            {summary.criticalDays.length > 0 && (
              <div className="glass-card overflow-hidden shadow-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-black relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none" />
                <div className="p-8 md:px-10">
                  <h3 className="text-amber-400 font-black tracking-widest uppercase text-xl mb-3 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl">⚠️</span> 
                    {t("bio.critical_title")}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-3xl font-light leading-relaxed pl-14">
                    {t("bio.critical.extended_desc")}
                  </p>
                  <ul className="space-y-3 pl-14">
                    {summary.criticalDays.map((day, i) => (
                      <li key={i} className="text-amber-300 text-sm flex items-center gap-3 font-semibold bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 w-max pr-6">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                        {day}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}


export default function BiyoritimPage() {
  return (
    <Suspense fallback={<div className="min-h-screen cosmic-gradient" />}>
      <BiyoritimContent />
    </Suspense>
  );
}
