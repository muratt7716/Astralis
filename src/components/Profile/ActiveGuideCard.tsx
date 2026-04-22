import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { SectionLabel } from "./ProfileUI";
import { ALL_TOOLS } from "./ProfileConstants";
import { useRouter } from "next/navigation";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";

interface ActiveGuideCardProps {
  activeGuide: any;
  activeGuideId: string;
  onStartChat: () => void;
  onChangeGuide: () => void;
}

export function ActiveGuideCard({
  activeGuide,
  activeGuideId,
  onStartChat,
  onChangeGuide
}: ActiveGuideCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="lg:col-span-4 space-y-6">
      {/* Active Guide */}
      <div className={cn("relative rounded-[2.5rem] overflow-hidden border p-8 md:p-10 group isolate transform-gpu shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl", activeGuide.borderAccent)} style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.8))` }}>
        {/* Guide image bg */}
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
          <img src={activeGuide.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <span className={cn("text-[10px] font-bold uppercase tracking-[0.3em]", activeGuide.accent)}>{t("profile.active_guide")}</span>
            <div className={cn("w-2 h-2 rounded-full animate-pulse", activeGuide.bgAccent)} style={{ boxShadow: `0 0 12px ${activeGuide.glow}` }} />
          </div>

          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <Avatar className={cn("w-20 h-20 border-2", activeGuide.borderAccent)}>
                <AvatarImage src={activeGuide.image} className="object-cover" />
                <AvatarFallback className="bg-white/5">{activeGuide.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-3xl font-serif font-bold text-white leading-tight">{activeGuide.name}</h3>
              <p className={cn("text-[11px] font-bold uppercase tracking-[0.2em] mt-1", activeGuide.accent)}>{activeGuide.role}</p>
            </div>
          </div>

          <p className="text-white/40 text-[13px] leading-relaxed mb-6 italic">"{activeGuide.bio}"</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {activeGuide.traits.map((trait: string) => (
              <span key={trait} className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.05] text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] shrink-0">{trait}</span>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onStartChat}
              className="w-full h-12 rounded-2xl bg-white text-black text-[12px] font-black uppercase tracking-widest hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> {t("profile.start_chat")}
            </button>
            <button
              onClick={onChangeGuide}
              className={cn("w-full h-12 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/5", activeGuide.borderAccent, activeGuide.accent)}
            >
              {t("profile.change_guide")}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tools */}
      <div className="rounded-[2.5rem] border border-white/[0.08] bg-white/[0.02] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-8">
        <SectionLabel>{t("profile.tools")}</SectionLabel>
        <div className="grid grid-cols-1 gap-2.5">
          {ALL_TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => router.push(tool.href)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/10 transition-all group text-left"
            >
              <div className={cn("shrink-0 transition-transform group-hover:scale-110 duration-500", tool.color)}>
                <CosmicIcon name={tool.iconName as any} size={20} />
              </div>
              <span className="text-[11px] font-bold text-white/40 group-hover:text-white/70 transition-colors tracking-widest uppercase">{tool.name}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/10 group-hover:text-white/30 transition-all group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
