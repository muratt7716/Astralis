// src/app/horary/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassButton } from "@/components/ui/glass-button";
import { useTranslation } from "@/lib/i18n";
import { useAuth, getCurrentProfile } from "@/lib/auth-helpers";
import LocationSearch, { type LocationResult } from "@/components/ui/LocationSearch";
import HoraryChartWheel, { WheelPlanet } from "@/components/horary/HoraryChartWheel";
import { planets as PLANET_DATA } from "@/data/planets";
import {
  Telescope, Sparkles, AlertTriangle, CheckCircle2,
  Clock, Star, MessageCircle, ArrowLeft, Scroll, X,
  Shield, Moon, Handshake, Scale, Timer, Compass
} from "lucide-react";
import { useFreemiumQuota } from "@/lib/freemium";
import PremiumModal, { PremiumModalVariant } from "@/components/PremiumModal";
import FreemiumBadge from "@/components/FreemiumBadge";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import { logInteraction } from "@/lib/logging";

// ─── Types ───────────────────────────────────────────────────
interface Stricture { type: string; severity: string; messageKey: string; }
interface SignificatorInfo {
  planetId: string; planetName: string; signId: string;
  signDegree: number; house: number; representsHouse: number;
  dignityLevel: string; dignityScore: number;
}
interface Timing { value: number; unit: string; }
interface Analysis {
  strictures: Stricture[];
  questionCategory: string;
  questionHouse: number;
  querent: SignificatorInfo;
  quesited: SignificatorInfo;
  timing: Timing | null;
}
interface Reading {
  section1: string; section2: string;
  section3: string; section4: string;
  section5: string; section6: string;
  section7: string; section8: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ChartData {
  planets: any[]; houses: any[];
  ascendantLongitude: number; mcLongitude: number;
}

const LOADING_STEPS = [
  "horary.loading.step1", "horary.loading.step2",
  "horary.loading.step3", "horary.loading.step4",
];

// ─── Planet glyph map ────────────────────────────────────────
const PLANET_GLYPH: Record<string,string> = {
  sun:"☉", moon:"☽", mercury:"☿", venus:"♀", mars:"♂", jupiter:"♃", saturn:"♄",
};

// ─── Planet image map (horary id → imageUrl from planets.ts) ─
const HORARY_TO_DATA_ID: Record<string,string> = {
  sun:"gunes", moon:"ay", mercury:"merkur",
  venus:"venus", mars:"mars", jupiter:"jupiter", saturn:"saturn",
};
const PLANET_IMAGE_MAP: Record<string,string> = Object.fromEntries(
  Object.entries(HORARY_TO_DATA_ID).map(([horaryId, dataId]) => {
    const p = PLANET_DATA.find(x => x.id === dataId);
    return [horaryId, p?.imageUrl ?? ""];
  })
);

// ─── Main component ──────────────────────────────────────────
export default function HoraryPage() {
  const { t, language } = useTranslation();
  const { user }        = useAuth();

  const [question,        setQuestion]        = useState("");
  const [location,        setLocation]        = useState<LocationResult | null>(null);
  const [locationDisplay, setLocationDisplay]  = useState("");
  const [questionDatetime, setQuestionDatetime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [loading,         setLoading]         = useState(false);
  const [loadStep,        setLoadStep]        = useState(0);
  const [error,           setError]           = useState("");
  const [chartData,       setChartData]       = useState<ChartData | null>(null);
  const [analysis,        setAnalysis]        = useState<Analysis | null>(null);
  const [reading,         setReading]         = useState<Reading | null>(null);
  const [selectedPlanet,  setSelectedPlanet]  = useState<WheelPlanet | null>(null);

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setLoadStep(s => (s + 1) % LOADING_STEPS.length), 2200);
    return () => clearInterval(iv);
  }, [loading]);

  function getCoordinates() {
    if (location) return { lat: location.lat, lng: location.lng };
    return { lat: 41.01, lng: 28.96 };
  }
  const { isPremium, isBlocked, isPremiumOnly, consumeQuota } = useFreemiumQuota("horary");
  const [showPremium, setShowPremium] = useState(false);
  const [premiumVariant, setPremiumVariant] = useState<PremiumModalVariant>("premium_required");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    if (!isPremium) {
      if (isPremiumOnly) { setPremiumVariant("premium_required"); setShowPremium(true); return; }
      if (isBlocked) { setPremiumVariant("quota_exceeded"); setShowPremium(true); return; }
      consumeQuota();
    }
    setLoading(true); setLoadStep(0); setError("");
    setChartData(null); setAnalysis(null); setReading(null); setSelectedPlanet(null);
    const coords = getCoordinates();
    try {
      const res  = await fetch("/api/horary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, latitude: coords.lat, longitude: coords.lng, language, userId: user?.id, datetime: questionDatetime }),
      });
      const data = await res.json();
      if (data.success) {
        setChartData(data.chartData); setAnalysis(data.analysis); setReading(data.reading);
        
        // Log Interaction
        try {
          const profile = await getCurrentProfile();
          if (profile) {
            logInteraction(profile.id, "astrology", t("horary.hero.title") + " hesaplaması yapıldı");
          }
        } catch (err) {
          console.error("Log failed", err);
        }
      } else { setError(data.error || "Bir hata oluştu."); }
    } catch { setError("Bağlantı hatası. Lütfen tekrar deneyin."); }
    finally  { setLoading(false); }
  }

  function handleReset() {
    setChartData(null); setAnalysis(null); setReading(null);
    setQuestion(""); setLocation(null); setLocationDisplay(""); setSelectedPlanet(null);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setQuestionDatetime(now.toISOString().slice(0, 16));
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="cosmic-gradient min-h-screen pt-32 pb-16 px-4">
      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} featureName={t("horary.hero.title")} variant={premiumVariant} />
      <style>{`
        @keyframes orrery { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes orrery-r { from { transform:rotate(0deg) } to { transform:rotate(-360deg) } }
        .spin-fwd { animation: orrery   6s linear infinite; transform-origin:center; }
        .spin-rev { animation: orrery-r 4s linear infinite; transform-origin:center; }
      `}</style>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* ── Header ── */}
        <motion.div initial={{ opacity:0, y:-24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7 }}
          className="text-center mb-12">
          
          <CosmicIcon name="horary" size={80} className="mx-auto mb-6 animate-float" />
          
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="hidden sm:block h-px w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
            <Telescope className="w-7 h-7 text-amber-500" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-wider drop-shadow-[0_0_15px_rgba(245,158,11,0.2)] text-amber-500 font-serif">
              {t("horary.hero.title")}
            </h1>
            <Telescope className="w-7 h-7 scale-x-[-1] text-amber-500" />
            <div className="hidden sm:block h-px w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>

          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-light leading-relaxed mb-3">
            {t("horary.hero.subtitle")}
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600/80 font-bold">
            {t("horary.hero.tradition")}
          </p>
          
          <div className="mt-6">
            <FreemiumBadge toolKey="horary" />
          </div>
        </motion.div>

        {/* ── Panels ── */}
        <AnimatePresence mode="wait">

          {/* Form */}
          {!chartData && !loading && (
            <motion.form key="form"
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
              onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12 glass-card p-8 shadow-2xl">
              
              {/* Note */}
              <p className="text-[13px] text-gray-400 mb-6 text-center italic font-light">{t("horary.form.note")}</p>

              {/* Question textarea */}
              <div className="mb-6">
                <label className="block text-gray-300 font-bold mb-2 uppercase tracking-wider text-sm">
                  {t("horary.form.question_label")}
                </label>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder={t("horary.form.question_placeholder")}
                  rows={3}
                  className="w-full px-5 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner resize-none font-serif text-lg placeholder:text-gray-500"
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-gray-300 font-bold mb-2 uppercase tracking-wider text-sm">
                  {t("horary.form.location_label")}
                </label>
                <LocationSearch
                  value={locationDisplay}
                  onChange={(loc) => {
                    setLocation(loc);
                    setLocationDisplay(loc?.displayName || "");
                  }}
                  inputClassName="w-full px-5 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner font-serif text-lg placeholder:text-gray-500"
                />
              </div>

              {/* DateTime */}
              <div className="mb-6">
                <label className="block text-gray-300 font-bold mb-2 uppercase tracking-wider text-sm">
                  {t("horary.form.datetime_label")}
                </label>
                <input
                  type="datetime-local"
                  value={questionDatetime}
                  onChange={e => setQuestionDatetime(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all shadow-inner font-serif text-lg [color-scheme:dark]"
                />
              </div>

              {/* Note */}
              <p className="text-xs text-gray-600 mb-7 text-center italic">{t("horary.form.note")}</p>
              {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

              {/* Submit */}
              <GlassButton
                type="submit"
                fullWidth
                disabled={question.trim().length < 5}
                className="hover:border-amber-500/50"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  <span className="text-amber-200">{t("horary.form.submit")}</span>
                </div>
              </GlassButton>
            </motion.form>
          )}

          {/* Loading */}
          {loading && (
            <motion.div key="loading"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="text-center py-20 flex flex-col items-center gap-8">
              {/* Orrery animation */}
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 80 80" className="w-full h-full absolute inset-0">
                  <circle cx="40" cy="40" r="4" fill="#c9a84c" opacity=".9" />
                </svg>
                <svg viewBox="0 0 80 80" className="w-full h-full absolute inset-0 spin-fwd">
                  <circle cx="40" cy="40" r="28" fill="none" stroke="#c9a84c" strokeWidth=".6" opacity=".3" />
                  <circle cx="68" cy="40" r="3" fill="#c9a84c" opacity=".7" />
                </svg>
                <svg viewBox="0 0 80 80" className="w-full h-full absolute inset-0 spin-rev">
                  <circle cx="40" cy="40" r="18" fill="none" stroke="#b87333" strokeWidth=".5" opacity=".3" />
                  <circle cx="22" cy="40" r="2" fill="#b87333" opacity=".6" />
                </svg>
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={loadStep}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  className="text-gray-400" style={{ fontFamily:"'EB Garamond',serif", fontSize:"1.05rem" }}>
                  {t(LOADING_STEPS[loadStep])}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Results */}
          {chartData && analysis && reading && (
            <motion.div key="results" initial={{ opacity:0 }} animate={{ opacity:1 }}>

              {/* Back */}
              <button onClick={handleReset}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm uppercase tracking-widest font-bold">
                <ArrowLeft className="w-4 h-4" />
                {t("horary.result.new_question")}
              </button>

              {/* Question banner */}
              <div className="mb-8 px-6 py-5 rounded-2xl text-center italic text-gray-300 glass-card border border-white/10 shadow-lg">
                <Scroll className="inline w-4 h-4 mr-2 text-purple-400" />
                <span className="font-serif text-lg">&quot;{question}&quot;</span>
              </div>

              {/* ── Main grid ── */}
              <div className="grid lg:grid-cols-[1fr_260px] xl:grid-cols-[1fr_320px] gap-8 mb-8 items-start">

                {/* Left: wheel + planet detail */}
                <div>
                  <HoraryChartWheel
                    planets={chartData.planets}
                    houses={chartData.houses}
                    ascendantLongitude={chartData.ascendantLongitude}
                    mcLongitude={chartData.mcLongitude}
                    querentPlanetId={analysis.querent.planetId}
                    quesitedPlanetId={analysis.quesited.planetId}
                    keyAspectPlanet1={analysis.querent.planetId}
                    keyAspectPlanet2={analysis.quesited.planetId}
                    selectedPlanetId={selectedPlanet?.id ?? null}
                    onPlanetClick={setSelectedPlanet}
                    planetImages={PLANET_IMAGE_MAP}
                  />

                  {/* Planet detail panel */}
                  <AnimatePresence>
                    {selectedPlanet && (
                      <motion.div
                        initial={{ opacity:0, y:10, height:0 }}
                        animate={{ opacity:1, y:0, height:"auto" }}
                        exit={{ opacity:0, y:6, height:0 }}
                        className="mt-4 rounded-2xl overflow-hidden glass-card border-white/10 shadow-2xl"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 w-full">
                              {PLANET_IMAGE_MAP[selectedPlanet.id] ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-purple-500/30">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={PLANET_IMAGE_MAP[selectedPlanet.id]} alt={selectedPlanet.name}
                                    className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 flex items-center justify-center text-2xl text-purple-400 bg-purple-500/10 rounded-full border border-purple-500/20">
                                  {PLANET_GLYPH[selectedPlanet.id] ?? selectedPlanet.emoji}
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="font-bold text-white text-lg flex items-center">
                                  {selectedPlanet.name}
                                  {selectedPlanet.id === analysis.querent.planetId && (
                                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest font-bold">
                                      {t("horary.result.querent_label")}
                                    </span>
                                  )}
                                  {selectedPlanet.id === analysis.quesited.planetId && (
                                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest font-bold">
                                      {t("horary.result.quesited_label")}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm mt-0.5 text-cyan-300 font-mono">
                                  {selectedPlanet.signDegree.toFixed(2)}° {selectedPlanet.signId.toUpperCase()} · 
                                  {t("horary.result.house_suffix").trim() ? (
                                    <> {selectedPlanet.house}{t("horary.result.house_suffix")}</>
                                  ) : (
                                    <> {t("horary.result.house_suffix")}{selectedPlanet.house}</>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button onClick={() => setSelectedPlanet(null)}
                              className="text-gray-500 hover:text-white transition-colors absolute top-4 right-4 bg-black/20 p-1.5 rounded-full">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Status badges */}
                          <div className="flex flex-wrap gap-2">
                            {selectedPlanet.retrograde && (
                              <span className="text-xs px-2 py-1 rounded-md" style={{ background:"rgba(249,115,22,0.12)", color:"#f97316" }}>
                                ℛ Retrograd
                              </span>
                            )}
                            {selectedPlanet.cazimi && (
                              <span className="text-xs px-2 py-1 rounded-md" style={{ background:"rgba(255,215,0,0.12)", color:"#ffd700" }}>
                                ✦ Cazimi
                              </span>
                            )}
                            {selectedPlanet.combust && !selectedPlanet.cazimi && (
                              <span className="text-xs px-2 py-1 rounded-md" style={{ background:"rgba(239,68,68,0.12)", color:"#ef4444" }}>
                                🔥 Combusted
                              </span>
                            )}
                            {/* Dignity for significators */}
                            {selectedPlanet.id === analysis.querent.planetId && (
                              <DignityBadge level={analysis.querent.dignityLevel} score={analysis.querent.dignityScore} t={t} />
                            )}
                            {selectedPlanet.id === analysis.quesited.planetId && (
                              <DignityBadge level={analysis.quesited.dignityLevel} score={analysis.quesited.dignityScore} t={t} />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Click hint */}
                  {!selectedPlanet && (
                    <p className="text-center text-xs text-gray-700 mt-3 italic">
                      {t("horary.result.planet_click_hint")}
                    </p>
                  )}
                </div>

                {/* Right: sidebar cards */}
                <div className="space-y-3">
                  {/* Strictures */}
                  <SideCard accent={analysis.strictures.length > 0 ? "warn" : "ok"}>
                    {analysis.strictures.length === 0 ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {t("horary.result.stricture_ok")}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {analysis.strictures.map((s, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0"
                              style={{ color: s.severity==="warning" ? "#fb923c" : "#94a3b8" }} />
                            <span className="text-sm text-gray-300">{t(s.messageKey)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </SideCard>

                  {/* Querent */}
                  <SignificatorCard label={t("horary.result.querent_label")} info={analysis.querent} t={t} accent="#f0c060" />

                  {/* Quesited */}
                  <SignificatorCard label={t("horary.result.quesited_label")} info={analysis.quesited} t={t} accent="#c8a0ff" />

                  {/* Timing */}
                  {analysis.timing && (
                    <SideCard>
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <Clock className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block">{t("horary.result.timing_label")}</span>
                          <span className="font-bold text-amber-300">
                            ~{analysis.timing.value} {t(`horary.${analysis.timing.unit}`)}
                          </span>
                        </div>
                      </div>
                    </SideCard>
                  )}
                </div>
              </div>

              {/* ── 5 Reading sections ── */}
              <div className="space-y-5">
                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-500/20" />
                  <Scroll className="w-4 h-4 text-amber-500/40" />
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-500/20" />
                </div>

                {([
                  { key:"section1", title:t("horary.result.section1_title"), icon:Shield,         accent:false },
                  { key:"section2", title:t("horary.result.section2_title"), icon:Star,           accent:false },
                  { key:"section3", title:t("horary.result.section3_title"), icon:Telescope,      accent:false },
                  { key:"section4", title:t("horary.result.section4_title"), icon:Moon,           accent:false },
                  { key:"section5", title:t("horary.result.section5_title"), icon:Handshake,      accent:false },
                  { key:"section6", title:t("horary.result.section6_title"), icon:Scale,          accent:true  },
                  { key:"section7", title:t("horary.result.section7_title"), icon:Timer,          accent:false },
                  { key:"section8", title:t("horary.result.section8_title"), icon:Compass,        accent:false },
                ] as const).map(({ key, title, icon:Icon, accent }, i) => (
                  <motion.div key={key}
                    initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.12, duration:.5 }}
                    className={`rounded-2xl p-6 border ${accent ? 'bg-amber-500/5 border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.06)]' : 'bg-white/[0.02] border-white/5'}`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
                        <Icon className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <h3 className="font-semibold tracking-wide text-amber-500 text-base font-serif">
                        {title}
                      </h3>
                    </div>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line"
                      style={{ fontFamily:"'EB Garamond',serif", fontSize:"1.05rem" }}>
                      {reading[key as keyof Reading]}
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="text-center text-xs text-gray-700 mt-10 italic">
                {t("horary.result.footer_note")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────
function SideCard({ children, accent }: { children: React.ReactNode; accent?: "warn"|"ok" }) {
  const bgColor =
    accent === "warn" ? "bg-orange-500/5 hover:bg-orange-500/10" :
    accent === "ok"   ? "bg-green-500/5 hover:bg-green-500/10" :
    "bg-white/[0.02] hover:bg-white/[0.04]";
  const borderColor =
    accent === "warn" ? "border-orange-500/20" :
    accent === "ok"   ? "border-green-500/20" :
    "border-white/5";
  return (
    <div className={`p-5 rounded-2xl border transition-colors ${bgColor} ${borderColor} shadow-lg backdrop-blur-md`}>
      {children}
    </div>
  );
}

function SignificatorCard({ label, info, t, accent }: {
  label:string; info:SignificatorInfo; t:(k:string)=>string; accent:string;
}) {
  const isQuerent = label === t("horary.result.querent_label");
  const colorClass = isQuerent ? "text-amber-400" : "text-purple-400";
  const bgClass = isQuerent ? "bg-amber-500/10 border-amber-500/20" : "bg-purple-500/10 border-purple-500/20";
  return (
    <div className={`p-5 rounded-2xl glass-card border border-white/5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{label}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${bgClass} ${colorClass}`}>
          {info.representsHouse}{t("horary.result.house_suffix")}
        </span>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-bold text-white flex items-center gap-2">
            <span className={colorClass}>{PLANET_GLYPH[info.planetId] ?? ""}</span> {info.planetName}
          </span>
          <div className="text-cyan-200/70 text-xs mt-1 font-mono">
            {info.signId.toUpperCase()} {info.signDegree.toFixed(1)}°
            <span className="mx-1.5 opacity-50">·</span>
            {info.house}{t("horary.result.house_suffix")}
          </div>
        </div>
        <DignityBadge level={info.dignityLevel} score={info.dignityScore} t={t} />
      </div>
    </div>
  );
}

function DignityBadge({ level, score, t }: { level:string; score:number; t:(k:string)=>string }) {
  const colors =
    score >= 4 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
    score >= 2 ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
    score >= 0 ? "bg-gray-500/10 text-gray-300 border-gray-500/30" :
    score >= -3 ? "bg-orange-500/10 text-orange-400 border-orange-500/30" : 
    "bg-red-500/10 text-red-400 border-red-500/30";
  return (
    <span className={`text-[10px] px-2 py-1 flex items-center justify-center rounded-full shrink-0 font-bold tracking-wider uppercase border ${colors}`}>
      {t(`horary.dignity.${level}`)}
    </span>
  );
}
