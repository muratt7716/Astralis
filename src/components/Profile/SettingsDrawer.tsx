import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, MapPin, Heart, Sparkles, Globe, Save, LogOut, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "./ProfileUI";
import { useTranslation } from "@/lib/i18n";
import { RELATIONSHIP_KEYS, LIFE_FOCUS_KEYS, LANGUAGES } from "./ProfileConstants";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (data: any) => void;
  saving: boolean;
  onSave: (e: React.FormEvent) => void;
  onSignOut: () => void;
}

export function SettingsDrawer({
  open,
  onClose,
  formData,
  setFormData,
  saving,
  onSave,
  onSignOut
}: SettingsDrawerProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#050508]/80 backdrop-blur-md z-[150]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0a0a0f] border-l border-white/10 z-[160] shadow-2xl overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-xl font-serif font-bold text-white">{t("profile.settings")}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/5 text-white/40 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={onSave} className="space-y-8 pb-10">
                <SectionLabel>{t("profile.section_identity")}</SectionLabel>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_name")}</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                    <Input
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      className="bg-white/[0.04] border-white/[0.06] h-12 pl-11 rounded-xl text-sm"
                      placeholder={t("profile.placeholder_name")}
                    />
                  </div>
                </div>

                {/* Birth date + time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_birth_date")}</label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                      className="bg-white/[0.04] border-white/[0.06] h-12 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_birth_time")}</label>
                    <Input
                      type="time"
                      value={formData.birth_time}
                      onChange={e => setFormData({ ...formData, birth_time: e.target.value })}
                      className="bg-white/[0.04] border-white/[0.06] h-12 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Birth city */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_birth_city")}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                    <Input
                      value={formData.birth_city}
                      onChange={e => setFormData({ ...formData, birth_city: e.target.value })}
                      className="bg-white/[0.04] border-white/[0.06] h-12 pl-11 rounded-xl text-sm"
                      placeholder={t("profile.placeholder_city")}
                    />
                  </div>
                </div>

                <SectionLabel>{t("profile.section_context")}</SectionLabel>

                {/* Relationship status */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_relationship")}</label>
                  <div className="relative">
                    <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                    <select
                      className="w-full h-12 rounded-xl border border-white/[0.06] bg-white/[0.04] pl-11 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                      value={formData.relationship_status}
                      onChange={e => setFormData({ ...formData, relationship_status: e.target.value })}
                    >
                      {RELATIONSHIP_KEYS.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-[#0a0a0f]">{t(opt.key)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Life Focus */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_focus")}</label>
                  <div className="relative">
                    <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                    <select
                      className="w-full h-12 rounded-xl border border-white/[0.06] bg-white/[0.04] pl-11 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                      value={formData.life_focus}
                      onChange={e => setFormData({ ...formData, life_focus: e.target.value })}
                    >
                      {LIFE_FOCUS_KEYS.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-[#0a0a0f]">{t(opt.key)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <SectionLabel>{t("profile.section_prefs")}</SectionLabel>

                {/* Language */}
                <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium ml-1">{t("profile.label_language")}</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                    <select
                      className="w-full h-12 rounded-xl border border-white/[0.06] bg-white/[0.04] pl-11 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all"
                      value={formData.language}
                      onChange={e => setFormData({ ...formData, language: e.target.value })}
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code} className="bg-[#0a0a0f]">{lang.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Save */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t("profile.btn_save")}
                </button>
              </form>

              {/* Sign Out */}
              <div className="mt-10 pt-6 border-t border-white/[0.04]">
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all text-xs font-medium"
                >
                  <LogOut className="w-4 h-4" /> {t("profile.sign_out")}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
