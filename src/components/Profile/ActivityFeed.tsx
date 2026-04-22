import React, { useState } from "react";
import { ChevronRight, Calendar, ChevronLeft, Clock } from "lucide-react";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import { useTranslation } from "@/lib/i18n";

interface ActivityFeedProps {
  activities: any[];
  onSelectActivity: (activity: any) => void;
}

const ITEMS_PER_PAGE = 5;

const ACTION_META: Record<string, { label: string; iconName: string; accent: string; bg: string }> = {
  horary: {
    label: "Horary (Saat Astrolojisi)",
    iconName: "horary",
    accent: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  sphere: {
    label: "Kristal Küre Analizi",
    iconName: "kristal",
    accent: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  iching: {
    label: "I-Ching Bilgeliği",
    iconName: "iching",
    accent: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  runler: {
    label: "Rünlerin Fısıltısı",
    iconName: "runler",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  numerology: {
    label: "Numeroloji Raporu",
    iconName: "numerology",
    accent: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  astrology: {
    label: "Doğum Haritası Analizi",
    iconName: "birthchart",
    accent: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  dream: {
    label: "Rüya Analizi",
    iconName: "dream",
    accent: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  bio: {
    label: "Biyoritim Hesaplama",
    iconName: "biorhythm",
    accent: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
};

const DEFAULT_META = {
  label: "Kozmik Analiz",
  iconName: "stars",
  accent: "text-purple-400",
  bg: "bg-purple-500/10 border-purple-500/20",
};

export function ActivityFeed({ activities, onSelectActivity }: ActivityFeedProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(activities.length / ITEMS_PER_PAGE));
  const pagedActivities = activities.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 px-1">
        <Clock className="w-4 h-4 text-purple-400/60" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">{t("profile.recent_activity")}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      {/* Activity List */}
      <div className="rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        {pagedActivities.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {pagedActivities.map((act) => {
              const meta = ACTION_META[act.action_type] || DEFAULT_META;
              return (
                <button
                  key={act.id}
                  onClick={() => onSelectActivity(act)}
                  className="w-full flex items-center gap-4 p-4 md:p-5 hover:bg-white/[0.04] transition-all duration-300 group/item text-left relative"
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

                  {/* Date + arrow */}
                  <div className="relative z-10 flex items-center gap-3 shrink-0">
                    <span className="hidden md:block text-[10px] text-white/15 font-mono tracking-wider">
                      {new Date(act.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/10 group-hover/item:text-white/40 group-hover/item:translate-x-0.5 transition-all duration-300" />
                  </div>
                </button>
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
                  className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                    i === page
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

import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Sparkles, Eye, Info, Database, Telescope, Star, HeartHandshake, Brain } from "lucide-react";

export function ActivityDetailModal({ activity, onClose }: { activity: any; onClose: () => void }) {
  if (!activity) return null;
  const meta = ACTION_META[activity.action_type] || DEFAULT_META;

  // Render generic metadata elegantly if it's not a known structure like tarot
  const renderGenericMetadata = () => {
    if (!activity.metadata) return null;
    const { question, full_result, answer, ...rest } = activity.metadata;
    const entries = Object.entries(rest).filter(([_, v]) => v != null && typeof v !== 'object');
    
    if (entries.length === 0) return null;

    return (
      <div className="space-y-3 mt-6 pt-6 border-t border-white/[0.04]">
        <p className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] flex items-center gap-2">
          <Database className="w-3.5 h-3.5" /> Analiz Detayları
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {entries.map(([key, value]) => (
            <div key={key} className="bg-white/[0.02] border border-white/[0.04] p-3.5 rounded-2xl hover:bg-white/[0.04] transition-colors">
              <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1 font-medium">{key.replace(/_/g, ' ')}</p>
              <p className="text-sm text-white/90 font-serif">{String(value)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#020308]/90 backdrop-blur-2xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-7 md:p-10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden isolate max-h-[90vh] flex flex-col"
        >
          {/* Decorative Orbs */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between mb-8 relative z-10 shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shadow-lg">
                <CosmicIcon name={meta.iconName as any} size={28} />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-serif font-semibold text-white tracking-tight">{meta.label}</h3>
                <p className="text-[10px] text-white/30 font-sans mt-1 uppercase tracking-[0.2em]">
                  {new Date(activity.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.1] hover:text-white transition-all text-white/50 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-8 overflow-y-auto pr-2 pb-4 pt-1 custom-scrollbar relative z-10 flex-1">
            {activity.metadata?.question && (
              <div className="space-y-3">
                <p className="text-[10px] text-purple-400 uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Soru / Niyet
                </p>
                <div className="bg-gradient-to-r from-purple-500/[0.04] to-transparent border-l-2 border-purple-500/40 p-5 rounded-r-2xl italic text-white/80 text-[15px] font-serif leading-relaxed shadow-sm">
                  &ldquo;{activity.metadata.question}&rdquo;
                </div>
              </div>
            )}

            {activity.action_type === "horary" && activity.metadata?.full_result ? (
              <div className="space-y-6">
                {[
                  { key: 'radicality', label: 'Harita Radikalliği', icon: Telescope },
                  { key: 'primary_significators', label: 'Göstergeler', icon: Star },
                  { key: 'moon_analysis', label: 'Ay Analizi', icon: Sparkles },
                  { key: 'aspects', label: 'Açılar', icon: Eye },
                  { key: 'receptions', label: 'Ağırlamalar', icon: HeartHandshake },
                  { key: 'timing', label: 'Zamanlama', icon: Clock },
                  { key: 'conclusion', label: 'Sonuç', icon: Brain },
                ].map((item) => (
                  activity.metadata.full_result[item.key] && (
                    <div key={item.key} className="space-y-3">
                      <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                      </p>
                      <div className="bg-indigo-500/[0.03] border border-indigo-500/10 p-5 rounded-2xl text-white/80 text-[15px] font-serif leading-relaxed">
                        {activity.metadata.full_result[item.key]}
                      </div>
                    </div>
                  )
                ))}
                
                {activity.metadata.full_result.advice && (
                  <div className="bg-gradient-to-r from-amber-500/[0.05] to-transparent border border-amber-500/10 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                    <div className="p-2 rounded-full bg-amber-500/10 shrink-0">
                       <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-white/70 text-[14px] font-serif italic leading-relaxed pt-1.5">{activity.metadata.full_result.advice}</p>
                  </div>
                )}
              </div>
            ) : activity.metadata?.full_result ? (
              <div className="space-y-6">
                {activity.metadata.full_result.cards?.map((c: any, i: number) => (
                  <div key={i} className="space-y-3">
                    <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5" />
                      {c.position || c.name || "Mistik Sezgi"}
                    </p>
                    <div className="bg-indigo-500/[0.03] border border-indigo-500/10 p-5 rounded-2xl text-white/80 text-[15px] font-serif leading-relaxed">
                      {c.interpretation}
                    </div>
                  </div>
                ))}

                <div className="space-y-3">
                  <p className="text-[10px] text-amber-400 uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    {activity.action_type === "sphere" ? "Genel Bakış" : "Sentez"}
                  </p>
                  <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-[2rem] text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
                    {activity.metadata.full_result.synthesis || activity.metadata.full_result.content}
                  </div>
                </div>

                {activity.metadata.full_result.advice && (
                  <div className="bg-gradient-to-r from-amber-500/[0.05] to-transparent border border-amber-500/10 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                    <div className="p-2 rounded-full bg-amber-500/10 shrink-0">
                       <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-white/70 text-[14px] font-serif italic leading-relaxed pt-1.5">{activity.metadata.full_result.advice}</p>
                  </div>
                )}
              </div>
            ) : activity.metadata?.answer ? (
              <div className="space-y-3">
                <p className="text-[10px] text-amber-400 uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Mistik Yanıt
                </p>
                <div className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-[2rem] text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
                  {activity.metadata.answer}
                </div>
              </div>
            ) : activity.description ? (
              <div className="space-y-3">
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Açıklama
                </p>
                <p className="text-white/70 text-[15px] leading-relaxed bg-white/[0.02] p-5 rounded-2xl border border-white/[0.04]">
                  {activity.description}
                </p>
              </div>
            ) : null}

            {renderGenericMetadata()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
