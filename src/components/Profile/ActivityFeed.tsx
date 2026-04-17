import React from "react";
import { SectionLabel } from "./ProfileUI";
import { MessageSquare, Eye, Sparkles, ChevronRight, Calendar } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface ActivityFeedProps {
  activities: any[];
  onSelectActivity: (activity: any) => void;
}

export function ActivityFeed({ activities, onSelectActivity }: ActivityFeedProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-[2.5rem] border border-white/[0.08] bg-white/[0.03] p-10 relative group/activity">
      <SectionLabel>{t("profile.recent_activity")}</SectionLabel>

      <div className="space-y-4 mt-8">
        {activities.length > 0 ? (
          activities.map((act) => (
            <button
              key={act.id}
              onClick={() => onSelectActivity(act)}
              className="w-full flex items-center gap-6 p-5 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/10 transition-all group/item text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity" />
              
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform duration-500">
                {act.action_type === 'sphere' ? <Eye className="w-5 h-5 text-indigo-400" /> :
                 act.action_type === 'iching' ? <Sparkles className="w-5 h-5 text-amber-400" /> :
                 act.action_type === 'runler' ? <MessageSquare className="w-5 h-5 text-emerald-400" /> :
                 <Sparkles className="w-5 h-5 text-purple-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-[13px] font-bold text-white tracking-wide truncate">
                    {act.action_type === 'sphere' ? 'Kristal Küre Analizi' :
                     act.action_type === 'iching' ? 'I-Ching Bilgeliği' :
                     act.action_type === 'runler' ? 'Rünlerin Fısıltısı' :
                     'Mistik Etkileşim'}
                  </h4>
                  <span className="shrink-0 text-[10px] text-white/20 font-mono tracking-widest uppercase">
                    {new Date(act.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className="text-[11px] text-white/40 truncate italic font-light">
                  {act.metadata?.question || act.description || "Detayları görüntülemek için tıklayın."}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-white/10 group-hover/item:text-white/30 transition-all group-hover/item:translate-x-1" />
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-[2rem] bg-white/[0.01] border border-dashed border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6 text-white/10" />
            </div>
            <p className="text-white/20 text-sm font-light leading-relaxed max-w-xs transition-opacity">{t("profile.no_activity")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function ActivityDetailModal({ activity, onClose }: { activity: any; onClose: () => void }) {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#050508]/90 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden isolate"
      >
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <SectionLabel>
              {activity.action_type === 'sphere' ? 'Kristal Küre Analizi' :
               activity.action_type === 'iching' ? 'I-Ching Bilgeliği' :
               activity.action_type === 'runler' ? 'Rünlerin Fısıltısı' :
               'Aktivite Detayı'}
            </SectionLabel>
            <p className="text-[10px] text-white/30 font-mono mt-2 uppercase tracking-widest">
              {new Date(activity.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {activity.metadata?.question && (
            <div className="space-y-3">
              <p className="text-[10px] text-white/20 uppercase font-black tracking-widest flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                Soru / Niyet
              </p>
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl italic text-white/60 leading-relaxed">
                "{activity.metadata.question}"
              </div>
            </div>
          )}

          {activity.metadata?.full_result ? (
            <div className="space-y-6">
              {activity.metadata.full_result.cards?.map((c: any, i: number) => (
                <div key={i} className="space-y-3">
                  <p className="text-[10px] text-indigo-400/40 uppercase font-black tracking-widest flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    {c.position ? c.position : (c.name || 'Mistik Sezgi')}
                  </p>
                  <div className="bg-indigo-500/[0.03] border border-indigo-500/10 p-5 rounded-2xl text-white/80 leading-relaxed italic">
                    {c.interpretation}
                  </div>
                </div>
              ))}

              <div className="space-y-3">
                <p className="text-[10px] text-purple-400/40 uppercase font-black tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  {activity.action_type === 'sphere' ? 'Genel Bakış' : 'Sentez'}
                </p>
                <div className="bg-purple-500/[0.04] border border-purple-500/10 p-6 rounded-[2rem] text-white/90 leading-relaxed text-sm md:text-base font-serif whitespace-pre-wrap">
                  {activity.metadata.full_result.synthesis || activity.metadata.full_result.content}
                </div>
              </div>

              {activity.metadata.full_result.advice && (
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-purple-400/40" />
                  <p className="text-white/50 text-[11px] italic leading-relaxed">
                    {activity.metadata.full_result.advice}
                  </p>
                </div>
              )}
            </div>
          ) : (
            activity.metadata?.answer && (
              <div className="space-y-3">
                <p className="text-[10px] text-purple-400/40 uppercase font-black tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Mistik Yanıt
                </p>
                <div className="bg-purple-500/[0.02] border border-purple-500/10 p-6 rounded-[2rem] text-white/90 leading-relaxed text-sm md:text-base font-serif whitespace-pre-wrap">
                  {activity.metadata.answer}
                </div>
              </div>
            )
          )}

          {activity.description && !activity.metadata?.answer && !activity.metadata?.full_result && (
            <div className="space-y-3">
              <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Açıklama</p>
              <p className="text-white/60 leading-relaxed">{activity.description}</p>
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-white/50"
          >
            Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
}
