import React, { useState } from "react";
import {
  ChevronRight, Calendar, ChevronLeft, Clock, Trash2, Loader2, AlertCircle,
  X, MessageSquare, Sparkles, Eye, Info, Database, Telescope, Star, HeartHandshake, Brain,
  ChevronUp, Compass, Activity, Moon, Wand2, Heart, CheckCircle2, AlertTriangle, Grid, Zap,
  Shield, Handshake, Scale, Timer
} from "lucide-react";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import { useTranslation } from "@/lib/i18n";
import { deleteActivity, clearAllActivities } from "@/app/profil/actions";
import { calculateNeuroMatrix, calculateCosmicResonance } from "@/lib/numerology/advancedAlgorithms";
import { getChaldeanAnalysis } from "@/lib/numerology/chaldean";
import { getFrequencyExplanations, getPythagoreanMeaning } from "@/data/numerology/meanings";
import { reduceToSingleOrMaster } from "@/lib/numerology/pythagoras";
import { motion, AnimatePresence } from "framer-motion";

interface ActivityFeedProps {
  activities: any[];
  onSelectActivity: (activity: any) => void;
  mutate?: any;
}

const ITEMS_PER_PAGE = 5;

const ACTION_META: Record<string, { label: string; iconName: string; accent: string; bg: string }> = {
  horary: {
    label: "Horary",
    iconName: "horary",
    accent: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  sphere: {
    label: "Kristal Küre",
    iconName: "kristal",
    accent: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  iching: {
    label: "I-Ching",
    iconName: "iching",
    accent: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  runler: {
    label: "Kadim Rünler",
    iconName: "runler",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  numerology_synthesis_analyze: {
    label: "Numeroloji Sentezi",
    iconName: "numerology",
    accent: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  birthchart: {
    label: "Doğum Haritası",
    iconName: "astrology",
    accent: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  dream: {
    label: "Rüya Analizi",
    iconName: "dream",
    accent: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  biorhythm_analyze: {
    label: "Biyoritim Analizi",
    iconName: "biorhythm",
    accent: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  biorhythm_synergy_analyze: {
    label: "Biyoritim Sinerjisi",
    iconName: "biorhythm",
    accent: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  synastry: {
    label: "Sinastri Uyumu",
    iconName: "compatibility",
    accent: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  astrology: {
    label: "Doğum Haritası",
    iconName: "astrology",
    accent: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  tarot: {
    label: "Tarot Falı",
    iconName: "tarot",
    accent: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
};

const DEFAULT_META = {
  label: "Kozmik Analiz",
  iconName: "stars",
  accent: "text-purple-400",
  bg: "bg-purple-500/10 border-purple-500/20",
};

export function ActivityFeed({ activities, onSelectActivity, mutate }: ActivityFeedProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const totalPages = Math.max(1, Math.ceil(activities.length / ITEMS_PER_PAGE));
  const pagedActivities = activities.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(id);

    // Optimistic Update
    if (mutate) {
      // Assuming SWR data structure (sometimes it's { activities: [] } or just [])
      mutate((current: any) => {
        if (!current) return current;
        if (Array.isArray(current)) return current.filter((a: any) => a.id !== id);
        if (current.activities) return { ...current, activities: current.activities.filter((a: any) => a.id !== id) };
        return current;
      }, false);
    }

    try {
      await deleteActivity(id);
      if (mutate) await mutate();
    } catch (err) {
      console.error(err);
      if (mutate) mutate(); // Rollback
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (isClearing) return;
    setIsClearing(true);

    // Optimistic Clear
    if (mutate) {
      mutate((current: any) => {
        if (!current) return current;
        if (Array.isArray(current)) return [];
        if (current.activities) return { ...current, activities: [] };
        return current;
      }, false);
    }

    try {
      await clearAllActivities();
      if (mutate) await mutate();
      setShowConfirmClear(false);
      setPage(0);
    } catch (err) {
      console.error(err);
      if (mutate) mutate(); // Rollback
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-purple-400/60" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">{t("profile.recent_activity")}</span>
          <div className="w-16 h-px bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        {activities.length > 0 && (
          <div className="flex items-center gap-2">
            {!showConfirmClear ? (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300"
              >
                <Trash2 className="w-3 h-3 text-white/20 group-hover:text-red-400 transition-colors" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/25 group-hover:text-red-400 transition-colors">{t("common.clear_all") || "Tümünü Temizle"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <span className="text-[9px] font-bold uppercase tracking-wider text-red-400/80 mr-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {t("common.are_you_sure") || "Emin misiniz?"}
                </span>
                <button
                  disabled={isClearing}
                  onClick={handleClearAll}
                  className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[9px] font-bold uppercase tracking-wider hover:bg-red-500/30 transition-all disabled:opacity-50"
                >
                  {isClearing ? <Loader2 className="w-3 h-3 animate-spin" /> : (t("common.yes") || "Evet")}
                </button>
                <button
                  disabled={isClearing}
                  onClick={() => setShowConfirmClear(false)}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all"
                >
                  {t("common.no") || "Hayır"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        {pagedActivities.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {pagedActivities.map((act) => {
              const meta = ACTION_META[act.action_type] || DEFAULT_META;
              return (
                <div
                  key={act.id}
                  onClick={() => onSelectActivity(act)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectActivity(act); }}
                  className="w-full flex items-center gap-4 p-4 md:p-5 hover:bg-white/[0.04] transition-all duration-300 group/item text-left relative cursor-pointer"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.02] to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Custom SVG icon */}
                  <div className="relative z-10 shrink-0 group-hover/item:scale-110 transition-transform duration-300">
                    <CosmicIcon name={meta.iconName as any} size={36} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-[14px] font-serif font-bold text-white/90 tracking-wide truncate group-hover/item:text-white transition-colors">
                        {meta.label}
                      </h4>
                    </div>
                    <p className="text-[11px] text-white/30 truncate font-light">
                      {act.metadata?.question || act.description || t("profile.activity_click_detail")}
                    </p>
                  </div>

                  {/* Date + arrow + delete */}
                  <div className="relative z-10 flex items-center gap-3 shrink-0">
                    <span className="hidden md:block text-[10px] text-white/15 font-mono tracking-wider">
                      {new Date(act.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(e, act.id); }}
                        disabled={deletingId === act.id}
                        className="p-2 rounded-xl bg-white/0 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 group/trash opacity-0 group-hover/item:opacity-100 transition-all duration-300"
                        title={t("common.delete") || "Sil"}
                      >
                        {deletingId === act.id ? (
                          <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-white/15 group-hover/trash:text-red-400 transition-colors" />
                        )}
                      </button>

                      <div className="p-2">
                        <ChevronRight className="w-4 h-4 text-white/10 group-hover/item:text-white/40 group-hover/item:translate-x-0.5 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
              <Calendar className="w-5 h-5 text-white/10" />
            </div>
            <p className="text-white/20 text-sm font-light leading-relaxed max-w-xs">{t("profile.no_activity")}</p>
          </div>
        )}

        {/* Pagination footer */}
        {activities.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04] bg-white/[0.01]">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/30 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-15 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Önceki</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all duration-200 ${i === page
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-white/20 hover:text-white/50 hover:bg-white/[0.04]"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/30 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-15 disabled:pointer-events-none"
            >
              <span className="hidden md:inline">Sonraki</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


export function ActivityDetailModal({ activity, onClose }: { activity: any; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  if (!activity) return null;
  const meta = ACTION_META[activity.action_type] || DEFAULT_META;

  // Render specialized content based on activity type
  const renderContent = () => {
    const full = activity.metadata?.full_result;
    const lang = (activity.metadata?.language || "tr") as any;

    // 1. Numeroloji (Sentez)
    if ((activity.action_type === "numerology_synthesis_analyze" || activity.action_type === "numerology") && full) {
      const core = activity.metadata?.coreNumbers || full?.coreNumbers;
      const nm = activity.metadata?.neuroMatrix || (activity.metadata?.dob ? calculateNeuroMatrix(activity.metadata.dob, activity.metadata.fullName) : null);
      const res = core ? calculateCosmicResonance(core.lifePath, core.expression, new Date(activity.created_at).getFullYear()) : 50;
      const chaldean = activity.metadata?.fullName ? getChaldeanAnalysis(activity.metadata.fullName, lang) : null;
      const freqExp = getFrequencyExplanations(lang);

      return (
        <div className="space-y-12">
          {/* Top Dashboard: Matrix & Resonance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Activity className="w-12 h-12 text-teal-400" />
              </div>
              <h4 className="text-xs font-black text-teal-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                <span>🧬</span> Nöro-Psikolojik Yaşam Matrisi
              </h4>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-3">👇 Pasif Frekanslar</p>
                  <div className="space-y-2">
                    {nm?.missing?.map((n: number) => (
                      <div key={n} className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex gap-3">
                         <span className="text-lg font-black text-red-400">{n}</span>
                         <span className="text-[11px] text-white/50 italic leading-tight">{freqExp.passive[n as keyof typeof freqExp.passive]}</span>
                      </div>
                    ))}
                    {(!nm?.missing || nm.missing.length === 0) && <p className="text-[10px] text-white/20 italic">Hiçbiri</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 group">
               <div className="w-24 h-24 rounded-full border-4 border-amber-500/20 flex items-center justify-center">
                  <span className="text-3xl font-black text-amber-500 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">%{res}</span>
               </div>
               <div>
                  <h4 className="text-xs font-black text-amber-400 tracking-widest uppercase mb-2">Fibonacci & Fraktal Kozmik Rezonans</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed max-w-[200px]">Doğum frekanslarınızın evrensel altın oran (Fibonacci) ve yıl enerjisiyle hizalanma skorudur.</p>
               </div>
            </div>
          </div>

          {/* Core Numbers */}
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-1">Klinik ve Mistik Çekirdek Rapor</h5>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Yaşam Yolu", val: core?.lifePath, color: "text-cyan-400" },
                { label: "İfade", val: core?.expression, color: "text-purple-400" },
                { label: "Ruh Güdüsü", val: core?.soulUrge, color: "text-indigo-400" },
                { label: "Kişilik", val: core?.personality, color: "text-blue-400" },
                { label: "Olgunluk", val: core?.maturity, color: "text-amber-400" },
              ].map((n, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] text-center group/num hover:bg-white/10 transition-all">
                  <div className="text-[9px] uppercase font-bold text-white/30 mb-2">{n.label}</div>
                  <div className={`text-2xl font-serif font-black ${n.color}`}>{n.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chaldean Name Vibrations */}
          {chaldean && (
            <div className="bg-[#12081c]/60 border border-fuchsia-500/20 p-8 rounded-[3rem] space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest">Keldani İsim Titreşimi</h3>
                  <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-widest mt-1">Cheiro&apos;nun Kadim Gizemleri</p>
                </div>
                <div className="flex gap-4">
                   <div className="text-center">
                     <span className="text-[9px] text-white/30 uppercase block">Gezegen</span>
                     <span className="text-sm font-bold text-amber-300">{chaldean.destinyPlanet}</span>
                   </div>
                   <div className="text-center">
                     <span className="text-[9px] text-white/30 uppercase block">Kök</span>
                     <span className="text-sm font-bold text-fuchsia-400">{chaldean.rootNumber}</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {chaldean.breakdown?.map((word: any, i: number) => (
                  <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                     <span className="text-sm font-bold text-white tracking-widest">{word.word}</span>
                     <div className="flex gap-4">
                        <span className="text-xs text-white/40">B: <span className="text-white">{word.compound}</span></span>
                        <span className="text-xs text-white/40">K: <span className="text-fuchsia-400">{word.root}</span></span>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Synthesis Segments */}
          <div className="space-y-6">
            {[
              { key: 'pythagorean', label: 'Kadim Kökler (Pisagor & Decoz)', icon: Compass, color: 'text-amber-400' },
              { key: 'jungian', label: 'Bilinçaltı Dinamikleri (Jungian)', icon: Brain, color: 'text-fuchsia-400' },
              { key: 'neuroscience', label: 'Nöral Aktarımlar (Sinirbilim)', icon: Activity, color: 'text-cyan-400' },
              { key: 'synthesis', label: 'Bütüncül Strateji', icon: Sparkles, color: 'text-indigo-400', banner: true },
            ].map((section) => (
              full[section.key] && (
                <div key={section.key} className={`p-8 rounded-[2.5rem] border transition-all ${
                  section.banner ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500/20 shadow-xl' : 'bg-white/[0.02] border-white/10'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <section.icon className={`w-5 h-5 ${section.color}`} />
                    <h5 className={`text-[11px] font-black uppercase tracking-widest ${section.color}`}>{section.label}</h5>
                  </div>
                  <p className={`text-white/80 leading-relaxed font-serif ${section.banner ? 'text-lg italic text-white' : 'text-[15px]'}`}>
                    {full[section.key]}
                  </p>
                </div>
              )
            ))}
          </div>

          {/* Healing Prescription */}
          {full.prescription && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2.5rem] space-y-4">
              <div className="flex items-center gap-3">
                 <span className="text-2xl">🌿</span>
                 <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Nöro-Mistik Şifa Reçetesi</h5>
              </div>
              <p className="text-emerald-100/70 text-[14px] leading-relaxed font-serif italic whitespace-pre-line px-1">
                {full.prescription}
              </p>
            </div>
          )}
        </div>
      );
    }

    // 2. Biyoritim (Analiz & Sinerji)
    if ((activity.action_type === "biorhythm_analyze" || activity.action_type === "biorhythm_synergy_analyze") && full) {
      const bioValues = full.values || {};
      const stats = [
        { label: "Fiziksel", value: bioValues.physical?.value, icon: "💪", color: "text-rose-400", bg: "bg-rose-500/5" },
        { label: "Duygusal", value: bioValues.emotional?.value, icon: "❤️", color: "text-blue-400", bg: "bg-blue-500/5" },
        { label: "Zihinsel", value: bioValues.intellectual?.value, icon: "🧠", color: "text-purple-400", bg: "bg-purple-500/5" },
      ];

      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <div key={i} className={`${s.bg} border border-white/[0.06] p-6 rounded-[2rem] text-center relative group overflow-hidden`}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{s.label}</div>
                <div className={`text-3xl font-serif font-bold ${s.color}`}>{s.value ?? "0"}%</div>
              </div>
            ))}
          </div>

          {[
            { key: 'overview', label: 'Kozmik Enerji Durumu', icon: Telescope, color: 'text-rose-400', bg: 'bg-rose-500/5' },
            { key: 'clashes', label: 'Dalga Çatışmaları & Hassasiyetler', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/5' },
            { key: 'psychodynamics', label: 'Psikodinamik Rezonans', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/5' },
            { key: 'strategy', label: 'Üstadın Günlük Stratejisi', icon: Sparkles, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          ].map((sec) => (
            full[sec.key] && (
              <div key={sec.key} className="group/sec">
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div className={`p-2 rounded-lg ${sec.bg} border border-white/5`}>
                    <sec.icon className={`w-4 h-4 ${sec.color}`} />
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${sec.color}`}>{sec.label}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-[2rem] text-white/80 text-[15px] leading-relaxed font-serif group-hover/sec:bg-white/[0.04] transition-colors">
                  {full[sec.key]}
                </div>
              </div>
            )
          ))}
        </div>
      );
    }

    // 3. Gelişmiş Sinastri
    if (activity.action_type === "synastry" && full) {
      const scores = [
        { label: "Aşk", score: full.loveScore || full.interpretation?.loveScore || 0, icon: "❤️", color: "text-rose-400", bg: "bg-rose-500/5", border: "border-rose-500/10" },
        { label: "Arkadaşlık", score: full.friendshipScore || full.interpretation?.friendshipScore || 0, icon: "🤝", color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/10" },
        { label: "İş", score: full.workScore || full.interpretation?.workScore || 0, icon: "💼", color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10" },
      ];

      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scores.map((s, i) => (
              <div key={i} className={`${s.bg} ${s.border} p-6 rounded-[2rem] text-center relative group overflow-hidden`}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">{s.label}</div>
                <div className={`text-3xl font-serif font-bold ${s.color}`}>{s.score}%</div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20 p-8 rounded-[2.5rem] relative isolate">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Heart className="w-20 h-20 text-purple-400" />
            </div>
            <p className="text-[11px] text-purple-300 uppercase font-bold tracking-widest mb-4 px-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> İki Ruhun Dansı
            </p>
            <div className="text-white/90 text-[16px] leading-relaxed font-serif italic mb-8">
              {full.description || full.interpretation?.description || "Kozmik uyum analizi hazırlanıyor..."}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 px-1">Güçlü Bağlar</span>
                <div className="space-y-2">
                  {(full.strengths || full.interpretation?.strengths || []).map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 px-1">Gelişim Alanları</span>
                <div className="space-y-2">
                  {(full.challenges || full.interpretation?.challenges || []).map((c: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl text-sm text-white/70">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {full.synastryAspects?.length > 0 && (
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Kozmik Geometrisi (Açılar)</span>
              <div className="grid grid-cols-1 gap-3">
                {full.synastryAspects.map((a: any, i: number) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
                        <span className="text-xs font-bold text-white">{a.planet1 || a.p1Name}</span>
                        <span className="text-lg">{a.typeEmoji}</span>
                        <span className="text-xs font-bold text-white">{a.planet2 || a.p2Name}</span>
                      </div>
                      <div className="text-[13px] text-white/60 font-serif">
                        {a.p1Sign || a.planet1Sign} - {a.p2Sign || a.planet2Sign}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`${a.harmony === 'positive' ? 'text-emerald-400' : a.harmony === 'negative' ? 'text-rose-400' : 'text-amber-400'} text-[10px] font-bold uppercase tracking-widest`}>
                        {a.type || a.typeName}
                      </span>
                      <span className="text-[9px] text-white/20">Orb: {a.orb}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // 4. Rüya Analizi
    if (activity.action_type === "dream" && full) {
      return (
        <div className="space-y-8">
          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
              <Brain className="w-16 h-16 text-blue-400" />
            </div>
            <p className="text-[11px] text-blue-300 uppercase font-bold tracking-widest mb-2">Ana Sembol</p>
            <h4 className="text-2xl font-serif text-white font-bold">{full.key_symbol || "Bilinmiyor"}</h4>
          </div>

          {[
            { key: 'layer_archaeological', label: 'Kadim & Arkeolojik Katman', icon: Telescope, color: 'text-amber-400', bg: 'bg-amber-500/5' },
            { key: 'layer_psychological', label: 'Jungiyen & Psikolojik Analiz', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/5' },
            { key: 'layer_cultural', label: 'Kültürel & Batıni Perspektif', icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
            { key: 'synthesis', label: 'Bütüncül Rüya Sentezi', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          ].map((sec) => (
            full[sec.key] && (
              <div key={sec.key} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <div className={`p-2 rounded-lg ${sec.bg}`}>
                    <sec.icon className={`w-4 h-4 ${sec.color}`} />
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${sec.color}`}>{sec.label}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-[2rem] text-white/80 text-[15px] leading-relaxed font-serif">
                  {full[sec.key]}
                </div>
              </div>
            )
          ))}

          {full.actionable_advice && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem]">
              <h4 className="text-emerald-400 font-serif text-lg mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Rüyanın Fısıltısı (Tavsiye)
              </h4>
              <p className="text-white/70 text-[15px] leading-relaxed italic">{full.actionable_advice}</p>
            </div>
          )}
        </div>
      );
    }

    // 4. Doğum Haritası (FULL OVERHAUL)
    if ((activity.action_type === "birthchart" || activity.action_type === "astrology") && full) {
      const interpretations = full.interpretations || {};

      const tabs = [
        { id: "overview", label: "Genel Bakış", icon: Telescope },
        { id: "planets", label: "Gezegenler", icon: Compass },
        { id: "houses", label: "Evler", icon: Activity },
        { id: "aspects", label: "Açılar", icon: Star },
        { id: "synthesis", label: "Kozmik Sentez", icon: Brain }
      ];

      return (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-white/30 hover:text-white/50"
                  }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Güneş', val: full.sunSign?.id || full.sun, color: 'text-amber-400' },
                    { label: 'Ay', val: full.moonSign?.id || full.moon, color: 'text-blue-300' },
                    { label: 'Yükselen', val: full.risingSign?.id || full.asc, color: 'text-purple-400' }
                  ].map(item => (
                    <div key={item.label} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                      <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className={`text-sm font-bold ${item.color} capitalize`}>{item.val}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-[2rem] text-white/80 text-[15px] leading-relaxed font-serif italic">
                  {interpretations.summary?.general || interpretations.summary?.summary || full.interpretation?.summary || full.interpretation || "Bu analiz için detaylı kozmik portre eşleştirilemedi."}
                </div>
              </div>
            )}

            {activeTab === "planets" && (
              <div className="space-y-4">
                {full.planetPositions?.map((p: any) => (
                  <div key={p.planetId} className="group/planet">
                    <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] p-5 rounded-[2rem] hover:bg-white/[0.04] transition-colors">
                      <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{p.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">{p.planet}</h4>
                          <span className="text-[10px] text-white/30 font-mono">{p.sign} {p.degree}°</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          {interpretations.planets?.[p.planetId] || `${p.house}. evde konumlanmış.`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "houses" && (
              <div className="grid grid-cols-1 gap-4">
                {full.houses?.map((h: any) => (
                  <div key={h.house} className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-[10px] font-bold text-purple-400 border border-purple-500/20">
                        {h.house}. Ev
                      </div>
                      <h4 className="text-sm font-bold text-white/80">{h.sign}</h4>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {interpretations.houses?.[`house_${h.house}`] || interpretations.houses?.[h.house] || `${h.sign} burcu ile yönetiliyor.`}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "aspects" && (
              <div className="space-y-3">
                {full.aspects?.map((a: any, i: number) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-[2rem]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{a.planet1}</span>
                        <span className="text-lg">{a.typeEmoji}</span>
                        <span className="text-xs font-bold text-white">{a.planet2}</span>
                      </div>
                      <span className="text-[10px] text-white/30 px-2 py-0.5 bg-white/5 rounded-full">{a.type}</span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed font-serif">
                      {interpretations.aspects?.[`${a.planet1Id}_${a.planet2Id}_${a.typeId}`] || interpretations.aspects?.[i] || `${a.type} etkileşimi mevcut.`}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "synthesis" && (
              <div className="space-y-6">
                {(interpretations.summary?.categories || interpretations.summary) ? (
                  Object.entries(interpretations.summary?.categories || {
                    "Güçlü Yanlar": interpretations.summary?.strengths,
                    "Zorluklar": interpretations.summary?.challenges,
                    "Öneriler": interpretations.summary?.advice
                  }).map(([cat, text]: [string, any], i) => (
                    text && (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">{cat}</span>
                        </div>
                        <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-[2rem] text-white/80 text-[15px] leading-relaxed font-serif">
                          {text}
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-[2.5rem] text-white/80 text-[15px] leading-relaxed font-serif italic text-center">
                    Bu kayıt için özel kozmik sentez verisi bulunmamaktadır.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 5. Horary
    if (activity.action_type === "horary" && full) {
      const reading = full.reading || full;
      const analysis = full.analysis || {};
      const sections = [
        { key: "section1", title: "Haritanın Radikalliği", icon: Shield },
        { key: "section2", title: "Soran Kişi (Querent)", icon: Star },
        { key: "section3", title: "Konu Analizi (Quesited)", icon: Telescope },
        { key: "section4", title: "Ay Analizi", icon: Moon },
        { key: "section5", title: "Resepsiyon ve İlişki Dinamiği", icon: Handshake },
        { key: "section6", title: "Kesin Hüküm", icon: Scale, accent: true },
        { key: "section7", title: "Zamanlama", icon: Timer },
        { key: "section8", title: "Stratejik Tavsiye ve Kozmik Rehberlik", icon: Compass },
      ];

      const PLANET_GLYPH: Record<string, string> = {
        sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂", jupiter: "♃", saturn: "♄",
      };

      return (
        <div className="space-y-8">
          {/* Header Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] text-white/40 font-mono tracking-widest uppercase">
            <span>☌ Conjunction</span>
            <span className="opacity-20">|</span>
            <span>☍ Opposition</span>
            <span className="opacity-20">|</span>
            <span>△ Trine</span>
            <span className="opacity-20">|</span>
            <span>□ Square</span>
            <span className="opacity-20">|</span>
            <span>⚹ Sextile</span>
          </div>

          {/* Strictures & Interaction Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-500/5 border border-orange-500/20 p-6 rounded-[2rem] space-y-4">
              <p className="text-[10px] text-orange-400 uppercase font-bold tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Kozmik Kısıtlamalar
              </p>
              <div className="space-y-2">
                {analysis.strictures?.length > 0 ? (
                  analysis.strictures.map((s: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-white/70 text-[13px] italic leading-tight">
                      <span className="text-orange-500/50">•</span>
                      <span>{s.detail || (typeof s === 'string' ? s : "Kozmik uyarı tespit edildi.")}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-emerald-400/60 text-[12px] italic">Harita yargıya tamamen elverişli.</p>
                )}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-[2rem] flex flex-col justify-center gap-3">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Kilit Etkileşim & Zaman</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="text-xs text-white font-serif italic">
                    {analysis.keyAspect ? `${analysis.keyAspect.type || 'Açı'} (${analysis.keyAspect.angleDiff?.toFixed(1)}°)` : "Belirgin bir açı yok"}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-white font-serif italic">
                    {analysis.timing ? `${analysis.timing.value} ${analysis.timing.unit}` : "Zamanlama belirsiz"}
                  </span>
                </div>
              </div>
              <p className="text-[9px] text-white/20 italic mt-1 text-center font-light decoration-dotted underline underline-offset-4">Gezegene tıkla → detay (Canlı panelde mevcuttur)</p>
            </div>
          </div>

          {/* Significator Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Querent Card */}
            {analysis.querent && (
              <div className="bg-white/[0.03] border border-white/[0.1] p-6 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-2xl group-hover:scale-125 transition-transform duration-700">
                  {PLANET_GLYPH[analysis.querent.planetId] || "★"}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-amber-500/80 uppercase font-bold tracking-widest">Seni Temsil Eden</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">{analysis.querent.representsHouse || "1"}. Ev</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl text-amber-400">
                    {PLANET_GLYPH[analysis.querent.planetId] || "♀"}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                       {analysis.querent.planetName || "Venüs"}
                       <span className="text-[10px] text-amber-500/40 opacity-50">·</span>
                       <span className="text-[11px] text-amber-300 font-medium italic">{analysis.querent.dignityLevel || "Yüzünde"}</span>
                    </h4>
                    <p className="text-[11px] text-white/40 uppercase font-mono tracking-wider mt-0.5">
                      {(analysis.querent.signId || "yengec").toUpperCase()} {(analysis.querent.signDegree || 0).toFixed(1)}° · {analysis.querent.house || 2}. EV
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quesited Card */}
            {analysis.quesited && (
              <div className="bg-white/[0.03] border border-white/[0.1] p-6 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-2xl group-hover:scale-125 transition-transform duration-700">
                  {PLANET_GLYPH[analysis.quesited.planetId] || "★"}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-purple-400/80 uppercase font-bold tracking-widest">Konuyu Temsil Eden</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold">{analysis.quesited.house || "7"}. Ev</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl text-purple-400">
                    {PLANET_GLYPH[analysis.quesited.planetId] || "♂"}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                       {analysis.quesited.planetName || "Mars"}
                       <span className="text-[10px] text-purple-500/40 opacity-50">·</span>
                       <span className="text-[11px] text-purple-300 font-medium italic">{analysis.quesited.dignityLevel || "Üçlü Uyumda"}</span>
                    </h4>
                    <p className="text-[11px] text-white/40 uppercase font-mono tracking-wider mt-0.5">
                      {(analysis.quesited.signId || "balık").toUpperCase()} {(analysis.quesited.signDegree || 0).toFixed(1)}° · {analysis.quesited.house || 7}. EV
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Banner with main answer (Kesin Hüküm) */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-10 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Scale className="w-24 h-24 text-amber-400" />
            </div>
            <p className="text-[11px] text-amber-300 uppercase font-bold tracking-[0.4em] mb-4 px-1">Göklerin Nihai Kararı</p>
            <div className="text-white/95 text-[20px] md:text-2xl leading-relaxed font-serif italic relative z-10 drop-shadow-lg">
              {reading.section6 || full.answer || "Analiz detayları hazırlanıyor..."}
            </div>
          </div>

          {/* Detailed Reading Sections */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-px bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Kozmik Arşiv Kayıtları</span>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="space-y-6">
              {sections.map(({ key, title, icon: Icon, accent }, i) => (
                reading[key] && (
                  <div key={key} className={`group/item border rounded-[3rem] p-8 md:p-10 transition-all duration-500 ${accent ? 'bg-amber-500/5 border-amber-500/20 shadow-[0_30px_60px_-15px_rgba(245,158,11,0.1)]' : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04]'
                    }`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-4 rounded-2xl ${accent ? 'bg-amber-500/20' : 'bg-white/5'} border border-white/10 group-hover/item:scale-110 transition-all duration-500 shadow-xl`}>
                        <Icon className={`w-6 h-6 ${accent ? 'text-amber-400' : 'text-white/60'}`} />
                      </div>
                      <h3 className={`text-xl font-serif font-bold tracking-wide ${accent ? 'text-amber-500' : 'text-white/80'}`}>{title}</h3>
                    </div>
                    <div className="text-white/70 text-[16px] leading-[1.8] font-serif whitespace-pre-line px-1 decoration-slate-400 decoration-1 selection:bg-purple-500/30">
                      {reading[key]}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.3em] font-medium pt-8 pb-4">
            Bu okuma William Lilly&apos;nin Christian Astrology (1647) geleneğine dayanmaktadır.
          </p>
        </div>
      );
    }

    // 6. Kristal Küre, I-Ching, Kadim Rünler, Numeroloji, Tarot
    if ((activity.action_type === "sphere" || activity.action_type === "iching" || activity.action_type === "runler" || activity.action_type === "numerology" || activity.action_type === "tarot") && full) {
      return (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
              <Wand2 className="w-16 h-16 text-indigo-400" />
            </div>
            <p className="text-[11px] text-indigo-300 uppercase font-bold tracking-widest mb-3 px-1">Mistik Kehanet</p>
            <div className="text-white/90 text-lg md:text-xl font-serif leading-relaxed italic">
              {full.synthesis || full.content || "Kehanet hazırlanıyor..."}
            </div>
          </div>

          {full.cards?.length > 0 && (
            <div className="space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 px-1">Sembolik Yansımalar</span>
              <div className="grid grid-cols-1 gap-4">
                {full.cards.map((c: any, i: number) => (
                  <div key={i} className="group/card bg-white/[0.02] border border-white/[0.06] p-6 rounded-[2rem] hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Eye className="w-12 h-12 text-white" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
                        {i + 1}
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        {c.position || c.name || "Sembol"}
                      </h4>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed font-serif">
                      {c.interpretation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Final Fallback for Answer/Description
    return (
      <div className="space-y-6">
        {activity.metadata?.answer ? (
          <div className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-[2.5rem] text-white/90 text-[16px] leading-relaxed font-serif">
            {activity.metadata.answer}
          </div>
        ) : (
          <p className="text-white/60 text-[15px] leading-relaxed bg-white/[0.02] p-8 rounded-[2.5rem]">
            {activity.description || "Analiz detayları yüklenemedi."}
          </p>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#020308]/95 backdrop-blur-3xl"
        />

        {/* Animated Background Artifacts */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="relative w-full max-w-4xl bg-[#0a0a0c] border border-white/[0.08] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden isolate max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="relative z-10 shrink-0 p-8 md:p-10 border-b border-white/[0.04] bg-white/[0.01]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shadow-2xl group transition-transform hover:scale-105 duration-500">
                  <CosmicIcon name={meta.iconName as any} size={32} />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">{meta.label}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-[10px] text-white/30 font-sans uppercase tracking-[0.25em]">
                      {new Date(activity.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Kozmik Arşiv
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-4 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.1] hover:text-white transition-all text-white/40 active:scale-90 hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="relative z-10 flex-1 overflow-y-auto p-8 md:p-10 pt-1 custom-scrollbar">
            {activity.metadata?.question && (
              <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                  <MessageSquare className="w-3 h-3 text-purple-400" />
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">Niyet / Soru</span>
                </div>
                <h4 className="text-xl md:text-2xl font-serif italic text-white/90 leading-relaxed px-4">
                  &ldquo;{activity.metadata.question}&rdquo;
                </h4>
              </div>
            )}

            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {renderContent()}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
