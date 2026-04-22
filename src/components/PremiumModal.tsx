"use client";

import { Crown, Lock, X, Clock, Zap, Infinity, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useState, useEffect, useCallback } from "react";
import { getMsUntilMidnight, formatResetTime } from "@/lib/freemium";

export type PremiumModalVariant = "premium_required" | "quota_exceeded";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  variant?: PremiumModalVariant;
}

function ResetCountdown() {
  const [ms, setMs] = useState(getMsUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setMs(getMsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center mb-6" role="timer" aria-live="polite" aria-atomic="true">
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
        <span className="text-amber-400 text-sm font-mono font-semibold tabular-nums">
          {formatResetTime(ms)}
        </span>
        <span className="text-amber-400/60 text-xs">sonra yenilenir</span>
      </div>
    </div>
  );
}

const FEATURE_HINTS = [
  { icon: Zap, label: "AI Yorum" },
  { icon: Infinity, label: "Sınırsız" },
  { icon: Sparkles, label: "Tüm Araçlar" },
];

export default function PremiumModal({
  isOpen,
  onClose,
  featureName,
  variant = "premium_required",
}: PremiumModalProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isQuota = variant === "quota_exceeded";

  // Escape key closes modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const title = isQuota
    ? "Günlük Hakkınızı Kullandınız"
    : featureName
    ? t("premium.gate.title_feature").replace("{featureName}", featureName)
    : t("premium.gate.title_default");

  const desc = isQuota
    ? "Her gün 1 ücretsiz kullanım hakkınız var. Gece yarısı otomatik yenilenir — ya da Premium'a geçerek sınırsız kullanın."
    : t("premium.gate.desc");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative z-10 max-w-sm w-full"
        style={{ animation: "premiumModalIn 0.28s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* Ambient glow */}
        <div
          className={`absolute inset-0 rounded-2xl blur-2xl scale-110 pointer-events-none ${
            isQuota ? "bg-amber-600/[0.08]" : "bg-purple-600/[0.08]"
          }`}
          aria-hidden="true"
        />

        <div className="relative bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 text-center shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          {/* Close button — 44×44 touch target */}
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 active:scale-[0.97]"
            style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-6 mx-auto" aria-hidden="true">
            <div className={`absolute w-16 h-16 rounded-full blur-xl opacity-60 ${
              isQuota ? "bg-amber-500/30" : "bg-purple-500/30"
            }`} />
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border ${
              isQuota
                ? "bg-amber-500/[0.08] border-amber-500/20"
                : "bg-purple-500/[0.08] border-purple-500/20"
            }`}>
              {isQuota
                ? <Clock className="w-7 h-7 text-amber-400" />
                : <Lock className="w-7 h-7 text-purple-400" />
              }
            </div>
          </div>

          {/* Title */}
          <h2
            id="premium-modal-title"
            className="font-serif text-xl font-semibold text-white mb-2 leading-snug"
          >
            {title}
          </h2>

          {/* Description */}
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            {desc}
          </p>

          {/* Countdown (quota exceeded) */}
          {isQuota && <ResetCountdown />}

          {/* Feature hints (premium required) */}
          {!isQuota && (
            <div className="flex items-center justify-center gap-5 mb-6" aria-hidden="true">
              {FEATURE_HINTS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1 text-white/25">
                  <Icon className="w-3 h-3" />
                  <span className="text-[11px] font-medium">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Primary CTA */}
          <button
            onClick={() => router.push("/premium")}
            className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] ${
              isQuota
                ? "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:shadow-[0_0_24px_rgba(245,158,11,0.25)] focus-visible:ring-amber-500"
                : "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:shadow-[0_0_24px_rgba(168,85,247,0.25)] focus-visible:ring-purple-500"
            }`}
            style={{ transition: "transform 0.15s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease" }}
          >
            <Crown className="w-4 h-4" aria-hidden="true" />
            {isQuota ? "Premium'a Geç — Sınırsız Kullan" : t("premium.gate.cta")}
          </button>

          {/* Secondary dismiss */}
          <button
            onClick={onClose}
            className="mt-3 w-full py-2 text-white/25 text-xs hover:text-white/45 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/10 rounded-lg"
          >
            {isQuota ? "Tamam, yarın denerim" : t("premium.gate.back")}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes premiumModalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
