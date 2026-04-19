import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Settings, LogOut, ArrowUpCircle } from "lucide-react";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import ZodiacIcon from "@/components/Cosmic/ZodiacIcon";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ProfileHeroProps {
  profile: any;
  zodiacSign: any;
  risingSignName: string | null;
  risingSignId: string | null;
  moonSignName: string | null;
  moonSignId: string | null;
  onSettingsOpen: () => void;
  onSignOut: () => void;
  previewUrl?: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHero({
  profile,
  zodiacSign,
  risingSignName,
  risingSignId,
  moonSignName,
  moonSignId,
  onSettingsOpen,
  onSignOut,
  previewUrl,
  onAvatarChange
}: ProfileHeroProps) {
  const { t, dir } = useTranslation();

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="relative mb-12"
    >
      <div className="flex flex-col md:flex-row items-center md:items-end gap-10 md:gap-14">
        {/* Avatar section */}
        <div className="relative group/avatar shrink-0">
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-110 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700" />
          <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-2 ring-white/[0.06] group-hover/avatar:ring-white/20 transition-all duration-500">
            <AvatarImage src={previewUrl || profile?.avatar_url} className="object-cover" />
            <AvatarFallback className="text-3xl bg-white/5 text-white/40 font-sans">{profile?.full_name?.[0]}</AvatarFallback>
          </Avatar>
          <label className="absolute bottom-0 right-0 p-2 bg-white/10 backdrop-blur-md rounded-full cursor-pointer hover:bg-white/20 transition-all active:scale-90 border border-white/10 opacity-0 group-hover/avatar:opacity-100 translate-y-1 group-hover/avatar:translate-y-0 duration-300">
            <input type="file" className="hidden" accept="image/*" onChange={onAvatarChange} />
            <ArrowUpCircle className="w-3.5 h-3.5 text-white/70" />
          </label>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-white mb-2">
            {profile?.full_name}
          </h1>

          {/* Zodiac triple */}
          {(zodiacSign || risingSignName || moonSignName) && (
            <div className="flex items-center gap-2 justify-center md:justify-start mb-6 flex-wrap">
              {/* Sun Sign */}
              {zodiacSign && (
                <div className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 group/badge hover:bg-purple-500/15 transition-all">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <ZodiacIcon signId={zodiacSign.id} variant="classic" size={16} glowColor="#a855f7" className="text-purple-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-purple-400/50 uppercase tracking-[0.2em] leading-none">{t("profile.sun_sign") || "Güneş"}</span>
                    <span className="text-[11px] font-bold text-purple-300 leading-tight">{zodiacSign.name}</span>
                  </div>
                </div>
              )}

              {/* Rising sign */}
              {risingSignName && risingSignId && (
                <div className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 group/badge hover:bg-orange-500/15 transition-all">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center">
                    <ZodiacIcon signId={risingSignId} variant="classic" size={16} glowColor="#f97316" className="text-orange-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-orange-400/50 uppercase tracking-[0.2em] leading-none">{t("profile.rising_sign") || "Yükselen"}</span>
                    <span className="text-[11px] font-bold text-orange-300 leading-tight">{risingSignName}</span>
                  </div>
                </div>
              )}

              {/* Moon sign */}
              {moonSignName && moonSignId && (
                <div className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group/badge hover:bg-blue-500/15 transition-all">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                    <ZodiacIcon signId={moonSignId} variant="classic" size={16} glowColor="#3b82f6" className="text-blue-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-blue-400/50 uppercase tracking-[0.2em] leading-none">{t("profile.moon_sign") || "Ay"}</span>
                    <span className="text-[11px] font-bold text-blue-300 leading-tight">{moonSignName}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 justify-center md:justify-start text-white/25 text-xs flex-wrap">
            {profile?.birth_date && (
              <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {profile.birth_date}</span>
            )}
            {profile?.birth_time && (
              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {profile.birth_time}</span>
            )}
            {profile?.birth_city && (
              <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {profile.birth_city}</span>
            )}
            {zodiacSign && (
              <>
                <span className="w-px h-3 bg-white/10" />
                <span className="flex items-center gap-1"><CosmicIcon name={(zodiacSign.elementKey?.split(".").pop() || "earth") as any} size={14} /> {zodiacSign.element}</span>
                <span className="text-white/15">·</span>
                <span>{zodiacSign.rulingPlanet}</span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSettingsOpen}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-medium flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {t("profile.settings")}
          </button>
          <button
            onClick={onSignOut}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/20 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/15 transition-all"
            title={t("profile.sign_out")}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
