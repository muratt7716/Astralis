"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, AtSign, Compass, Star, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/i18n";
import LocationSearch from "@/components/ui/LocationSearch";

interface OnboardingFormProps extends React.HTMLAttributes<HTMLDivElement> {
  imageSrc: string;
  avatarSrc?: string;
  avatarFallback: string;
  title: string;
  description: string;
  inputPlaceholder: string;
  buttonText: string;
  onUploadClick?: () => void;
  onAvatarChange?: (file: File) => void;
  onFormSubmit: (data: { username: string; birthDate: string; birthTime: string; birthCity: string; gender: string; relationshipStatus: string; lifeFocus: string }) => void;
  isSubmitting?: boolean;
}

const OnboardingForm = React.forwardRef<HTMLDivElement, OnboardingFormProps>(
  (
    {
      className,
      imageSrc,
      avatarSrc,
      avatarFallback,
      title,
      description,
      inputPlaceholder,
      buttonText,
      onUploadClick,
      onAvatarChange,
      onFormSubmit,
      isSubmitting = false,
      ...props
    },
    ref
  ) => {
    const { t, dir } = useTranslation();
    const isRTL = dir === "rtl";
    const [step, setStep] = React.useState(1);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [formData, setFormData] = React.useState({
      username: "",
      birthDate: "",
      birthTime: "",
      birthCity: "",
      gender: "not_specified",
      relationshipStatus: "single",
      lifeFocus: "general"
    });

    const FADE_UP_ANIMATION_VARIANTS = {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: { type: "spring" } },
    } as any;

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (step < 3) {
        handleNext();
      } else {
        onFormSubmit(formData);
      }
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
      fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
        if (onAvatarChange) onAvatarChange(file);
      }
    };

    return (
      <motion.div
        initial="hidden"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.15 } },
        }}
        className={cn(
          "w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 shadow-2xl backdrop-blur-2xl",
          isRTL ? "rtl text-right" : "ltr text-left",
          className
        )}
        dir={dir}
        ref={ref}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
        {/* Banner with Cosmic Overlay */}
        <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="relative h-80 overflow-hidden">
          <img
            src={imageSrc}
            alt="Welcome Banner"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                 <Compass className="text-cyan-400 w-6 h-6 animate-pulse" />
             </div>
             <div>
                <h2 className="text-white font-bold text-lg leading-tight">Mistik Yolculuk</h2>
                <p className="text-white/60 text-xs">Adım {step} / 3</p>
             </div>
          </div>
        </motion.div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-2 text-center">
                  <h1 className="font-brand font-bold text-2xl text-white">{title}</h1>
                  <p className="text-gray-400 text-sm">{description}</p>
                </div>

                <div className="flex flex-col items-center gap-4 py-4">
                  <Avatar className="w-24 h-24 border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    <AvatarImage src={previewUrl || avatarSrc} alt="User Avatar" />
                    <AvatarFallback className="bg-white/5 text-purple-400 text-2xl font-bold">
                        {avatarFallback || <Star className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" type="button" onClick={handleUploadClick} className="bg-white/5 border-white/10 hover:bg-white/10">
                    <Upload className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t("onboarding.avatar.label")}
                  </Button>
                </div>

                <div className="relative">
                  <AtSign className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500", isRTL ? "right-3" : "left-3")} />
                  <Input
                    placeholder={inputPlaceholder}
                    className={cn("bg-white/5 border-white/10 text-white focus:ring-purple-500/50", isRTL ? "pr-10" : "pl-10")}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center">
                <div className="space-y-2">
                  <h1 className="font-brand font-bold text-2xl text-white">{t("onboarding.cosmic.title")}</h1>
                  <p className="text-gray-400 text-sm">{t("onboarding.cosmic.desc")}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className={cn("space-y-1", isRTL ? "text-right" : "text-left")}>
                      <label className={cn("text-xs text-gray-400", isRTL ? "mr-2" : "ml-2")}>{t("onboarding.birth_date")}</label>
                      <Input 
                        type="date" 
                        className="bg-white/5 border-white/10 text-white"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        required
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className={cn("space-y-1", isRTL ? "text-right" : "text-left")}>
                        <label className={cn("text-xs text-gray-400", isRTL ? "mr-2" : "ml-2")}>{t("onboarding.birth_time")}</label>
                        <Input 
                          type="time" 
                          className="bg-white/5 border-white/10 text-white"
                          value={formData.birthTime}
                          onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                        />
                      </div>
                      <div className={cn("space-y-1", isRTL ? "text-right" : "text-left")}>
                        <label className={cn("text-xs text-gray-400", isRTL ? "mr-2" : "ml-2")}>{t("onboarding.birth_city")}</label>
                        <LocationSearch
                          value={formData.birthCity}
                          onChange={(loc) => setFormData({ ...formData, birthCity: loc?.displayName || "" })}
                          variant="onboarding"
                          inputClassName="!h-10 !rounded-md"
                        />
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center">
                <div className="space-y-2">
                  <h1 className="font-brand font-bold text-2xl text-white">{t("onboarding.personal.title")}</h1>
                  <p className="text-gray-400 text-sm">{t("onboarding.personal.desc")}</p>
                </div>

                <div className="space-y-4">
                   <div className={cn("space-y-1", isRTL ? "text-right" : "text-left")}>
                      <label className={cn("text-xs text-gray-400", isRTL ? "mr-2" : "ml-2")}>{t("onboarding.rel.label")}</label>
                      <select 
                        className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        value={formData.relationshipStatus}
                        onChange={(e) => setFormData({ ...formData, relationshipStatus: e.target.value })}
                      >
                         <option value="single" className="bg-slate-900">{t("onboarding.rel.single")}</option>
                         <option value="relationship" className="bg-slate-900">{t("onboarding.rel.relationship")}</option>
                         <option value="complicated" className="bg-slate-900">{t("onboarding.rel.complicated")}</option>
                         <option value="married" className="bg-slate-900">{t("onboarding.rel.married")}</option>
                         <option value="platonik" className="bg-slate-900">{t("onboarding.rel.platonik")}</option>
                      </select>
                   </div>
                    <div className={cn("space-y-1", isRTL ? "text-right" : "text-left")}>
                       <label className={cn("text-xs text-gray-400", isRTL ? "mr-2" : "ml-2")}>{t("onboarding.focus.label")}</label>
                       <select 
                         className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                         value={formData.lifeFocus}
                         onChange={(e) => setFormData({ ...formData, lifeFocus: e.target.value })}
                       >
                          <option value="general" className="bg-slate-900">{t("onboarding.focus.general")}</option>
                          <option value="love" className="bg-slate-900">{t("onboarding.focus.love")}</option>
                          <option value="career" className="bg-slate-900">{t("onboarding.focus.career")}</option>
                          <option value="spiritual" className="bg-slate-900">{t("onboarding.focus.spiritual")}</option>
                       </select>
                    </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} className="w-1/3 border-white/10 bg-white/5 hover:bg-white/10 text-white">
                  {t("onboarding.btn.back")}
                </Button>
              )}
              <Button type="submit" className={cn("bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-none shadow-[0_0_20px_rgba(168,85,247,0.4)]", step === 1 ? "w-full" : "flex-grow")} disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                )}
                {step < 3 ? t("onboarding.btn.next") : buttonText}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  }
);

OnboardingForm.displayName = "OnboardingForm";

export { OnboardingForm };
