// src/app/horary/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-helpers";
import { turkishCities } from "@/data/cities";
import CosmicSelect from "@/components/Cosmic/CosmicSelect";
import HoraryChartWheel, { WheelPlanet } from "@/components/horary/HoraryChartWheel";
import { planets as PLANET_DATA } from "@/data/planets";
import {
  Telescope, Sparkles, AlertTriangle, CheckCircle2,
  Clock, Star, MessageCircle, ArrowLeft, Scroll, X
} from "lucide-react";
import PremiumGate from "@/components/PremiumGate";

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
  section3: string; section4: string; section5: string;
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
  const [city,            setCity]            = useState("");
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
    if (city) {
      const found = turkishCities.find(c => c.name === city);
      if (found) return { lat: found.lat, lng: found.lng };
    }
    return { lat: 41.01, lng: 28.96 };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (question.trim().length < 5) return;
    setLoading(true); setLoadStep(0); setError("");
    setChartData(null); setAnalysis(null); setReading(null); setSelectedPlanet(null);
    const coords = getCoordinates();
    try {
      const res  = await fetch("/api/horary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, latitude: coords.lat, longitude: coords.lng, language, userId: user?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setChartData(data.chartData); setAnalysis(data.analysis); setReading(data.reading);
      } else { setError(data.error || "Bir hata oluştu."); }
    } catch { setError("Bağlantı hatası. Lütfen tekrar deneyin."); }
    finally  { setLoading(false); }
  }

  function handleReset() {
    setChartData(null); setAnalysis(null); setReading(null);
    setQuestion(""); setCity(""); setSelectedPlanet(null);
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <PremiumGate featureName="Horary Astrolojisi">
    <div className="min-h-screen text-white" style={{ fontFamily:"'EB Garamond', serif", background:"#06090f" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
        .horary-field { background:rgba(201,168,76,0.04); border:1px solid rgba(201,168,76,0.18); transition:border-color .2s; }
        .horary-field:focus-within { border-color:rgba(201,168,76,0.45); }
        @keyframes orrery { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        @keyframes orrery-r { from { transform:rotate(0deg) } to { transform:rotate(-360deg) } }
        .spin-fwd { animation: orrery   6s linear infinite; transform-origin:center; }
        .spin-rev { animation: orrery-r 4s linear infinite; transform-origin:center; }
      `}</style>

      {/* Star field */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex:0 }}>
        <svg width="100%" height="100%" style={{ opacity:.35 }}>
          {Array.from({length:120},(_,i) => (
            <circle key={i}
              cx={`${(i*137.5)%100}%`} cy={`${(i*97.3)%100}%`}
              r={i%7===0?"1.2":i%3===0?"0.8":"0.5"}
              fill="white" opacity={0.3+0.4*(i%5)/4}
            />
          ))}
        </svg>
      </div>

      <div className="relative container mx-auto px-4 pt-28 pb-16 max-w-5xl" style={{ zIndex:1 }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity:0, y:-24 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7 }}
          className="text-center mb-14">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-600/50" />
            <Telescope className="w-7 h-7" style={{ color:"#c9a84c" }} />
            <h1 className="text-4xl font-bold tracking-wider" style={{ fontFamily:"'Cinzel',serif", color:"#c9a84c" }}>
              {t("horary.hero.title")}
            </h1>
            <Telescope className="w-7 h-7 scale-x-[-1]" style={{ color:"#c9a84c" }} />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-600/50" />
          </div>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed" style={{ fontSize:"1.05rem" }}>
            {t("horary.hero.subtitle")}
          </p>
          <p className="text-xs mt-3 tracking-[.2em] uppercase" style={{ color:"#b87333" }}>
            {t("horary.hero.tradition")}
          </p>
        </motion.div>

        {/* ── Panels ── */}
        <AnimatePresence mode="wait">

          {/* Form */}
          {!chartData && !loading && (
            <motion.form key="form"
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
              onSubmit={handleSubmit} className="max-w-xl mx-auto">
              {/* decorative top rule */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(201,168,76,.35))" }} />
                <span className="text-xs tracking-widest uppercase" style={{ color:"#c9a84c88", fontFamily:"'Cinzel',serif" }}>{t("horary.form.question_label_short")}</span>
                <div className="flex-1 h-px" style={{ background:"linear-gradient(270deg,transparent,rgba(201,168,76,.35))" }} />
              </div>

              {/* Question textarea */}
              <div className="mb-5">
                <label className="block text-xs mb-2 tracking-widest uppercase"
                  style={{ color:"#c9a84c", fontFamily:"'Cinzel',serif" }}>
                  {t("horary.form.question_label")}
                </label>
                <div className="horary-field rounded-xl overflow-hidden">
                  <textarea
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder={t("horary.form.question_placeholder")}
                    rows={3}
                    className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-600 resize-none focus:outline-none"
                    style={{ fontFamily:"'EB Garamond',serif", fontSize:"1.05rem" }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mb-5">
                <CosmicSelect
                  label={t("horary.form.location_label")}
                  options={[
                    { value:"", label:"— İstanbul (varsayılan) —" },
                    ...turkishCities.map(c => ({ value:c.name, label:c.name })),
                  ]}
                  value={city} onChange={e => setCity(e.target.value)}
                />
              </div>

              {/* Note */}
              <p className="text-xs text-gray-600 mb-7 text-center italic">{t("horary.form.note")}</p>
              {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

              {/* Submit */}
              <motion.button type="submit"
                disabled={question.trim().length < 5}
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                className="w-full py-4 rounded-xl font-semibold text-lg disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden"
                style={{ background:"linear-gradient(135deg,#c9a84c,#b87333)", color:"#06090f", fontFamily:"'Cinzel',serif" }}>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {t("horary.form.submit")}
                </span>
              </motion.button>
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
                className="flex items-center gap-2 text-gray-500 hover:text-amber-400 mb-8 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />
                {t("horary.result.new_question")}
              </button>

              {/* Question banner */}
              <div className="mb-8 px-6 py-4 rounded-xl text-center italic text-gray-300"
                style={{ background:"rgba(201,168,76,0.04)", border:"1px solid rgba(201,168,76,0.14)" }}>
                <Scroll className="inline w-4 h-4 mr-2 opacity-60" style={{ color:"#c9a84c" }} />
                &quot;{question}&quot;
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
                        className="mt-4 rounded-xl overflow-hidden"
                        style={{ border:"1px solid rgba(201,168,76,0.3)", background:"rgba(10,16,30,0.95)" }}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {PLANET_IMAGE_MAP[selectedPlanet.id] ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0"
                                  style={{ border:"1px solid rgba(201,168,76,0.35)", boxShadow:"0 0 12px rgba(201,168,76,0.15)" }}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={PLANET_IMAGE_MAP[selectedPlanet.id]} alt={selectedPlanet.name}
                                    className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <span className="text-3xl leading-none" style={{ color:"#c9a84c", fontFamily:"serif" }}>
                                  {PLANET_GLYPH[selectedPlanet.id] ?? selectedPlanet.emoji}
                                </span>
                              )}
                              <div>
                                <div className="font-semibold text-white" style={{ fontFamily:"'Cinzel',serif" }}>
                                  {selectedPlanet.name}
                                  {selectedPlanet.id === analysis.querent.planetId && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(240,192,96,0.15)", color:"#f0c060" }}>
                                      {t("horary.result.querent_label")}
                                    </span>
                                  )}
                                  {selectedPlanet.id === analysis.quesited.planetId && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(180,140,255,0.15)", color:"#c8a0ff" }}>
                                      {t("horary.result.quesited_label")}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm mt-0.5" style={{ fontFamily:"'JetBrains Mono',monospace", color:"#7aa4c0" }}>
                                  {selectedPlanet.signDegree.toFixed(2)}°&nbsp;
                                  {selectedPlanet.signId.toUpperCase()}&nbsp;·&nbsp;
                                  {t("horary.result.house_suffix").trim() ? (
                                    <>{selectedPlanet.house}{t("horary.result.house_suffix")}</>
                                  ) : (
                                    <>{t("horary.result.house_suffix")}{selectedPlanet.house}</>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button onClick={() => setSelectedPlanet(null)}
                              className="text-gray-600 hover:text-gray-300 transition-colors mt-0.5">
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
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 shrink-0" style={{ color:"#c9a84c" }} />
                        <div>
                          <span className="text-xs text-gray-500 block">{t("horary.result.timing_label")}</span>
                          <span className="font-semibold" style={{ color:"#c9a84c", fontFamily:"'Cinzel',serif" }}>
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
                  <div className="flex-1 h-px" style={{ background:"linear-gradient(90deg,transparent,rgba(201,168,76,.2))" }} />
                  <Scroll className="w-4 h-4" style={{ color:"#c9a84c66" }} />
                  <div className="flex-1 h-px" style={{ background:"linear-gradient(270deg,transparent,rgba(201,168,76,.2))" }} />
                </div>

                {([
                  { key:"section1", title:t("horary.result.section1_title"), icon:Telescope,     accent:false },
                  { key:"section2", title:t("horary.result.section2_title"), icon:Star,           accent:false },
                  { key:"section3", title:t("horary.result.section3_title"), icon:Sparkles,       accent:false },
                  { key:"section4", title:t("horary.result.section4_title"), icon:MessageCircle,  accent:true  },
                  { key:"section5", title:t("horary.result.section5_title"), icon:Clock,          accent:false },
                ] as const).map(({ key, title, icon:Icon, accent }, i) => (
                  <motion.div key={key}
                    initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.12, duration:.5 }}
                    className="rounded-2xl p-6"
                    style={{
                      background: accent ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${accent ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.06)"}`,
                      boxShadow: accent ? "0 0 40px rgba(201,168,76,0.06)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.2)" }}>
                        <Icon className="w-3.5 h-3.5" style={{ color:"#c9a84c" }} />
                      </div>
                      <h3 className="font-semibold tracking-wide" style={{ fontFamily:"'Cinzel',serif", color:"#c9a84c", fontSize:"1rem" }}>
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
    </PremiumGate>
  );
}

// ─── Sub-components ──────────────────────────────────────────
function SideCard({ children, accent }: { children: React.ReactNode; accent?: "warn"|"ok" }) {
  const borderColor =
    accent === "warn" ? "rgba(251,146,60,0.25)" :
    accent === "ok"   ? "rgba(74,222,128,0.18)" :
    "rgba(255,255,255,0.07)";
  return (
    <div className="p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${borderColor}` }}>
      {children}
    </div>
  );
}

function SignificatorCard({ label, info, t, accent }: {
  label:string; info:SignificatorInfo; t:(k:string)=>string; accent:string;
}) {
  return (
    <div className="p-4 rounded-xl" style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${accent}28` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs tracking-wide" style={{ color:`${accent}88` }}>{label}</span>
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background:`${accent}12`, color:`${accent}99`, fontFamily:"'JetBrains Mono',monospace" }}>
          {info.representsHouse}{t("horary.result.house_suffix")}
        </span>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-semibold text-white" style={{ fontFamily:"'Cinzel',serif" }}>
            {PLANET_GLYPH[info.planetId] ?? ""}  {info.planetName}
          </span>
          <div className="text-gray-500 text-xs mt-0.5" style={{ fontFamily:"'JetBrains Mono',monospace" }}>
            {info.signId.toUpperCase()} {info.signDegree.toFixed(1)}°
            &nbsp;·&nbsp;{info.house}{t("horary.result.house_suffix")}
          </div>
        </div>
        <DignityBadge level={info.dignityLevel} score={info.dignityScore} t={t} />
      </div>
    </div>
  );
}

function DignityBadge({ level, score, t }: { level:string; score:number; t:(k:string)=>string }) {
  const color =
    score >= 4 ? "#4ade80" :
    score >= 2 ? "#c9a84c" :
    score >= 0 ? "#94a3b8" :
    score >= -3 ? "#f87171" : "#ef4444";
  return (
    <span className="text-xs px-2 py-1 rounded-full shrink-0"
      style={{ background:`${color}18`, color, fontFamily:"'JetBrains Mono',monospace", border:`1px solid ${color}30` }}>
      {t(`horary.dignity.${level}`)}
    </span>
  );
}
