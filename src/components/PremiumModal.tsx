"use client";

import { Crown, Lock, X, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
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
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-amber-400 text-sm font-mono font-semibold tabular-nums">
          {formatResetTime(ms)}
        </span>
        <span className="text-amber-400/60 text-xs">sonra yenilenir</span>
      </div>
    </div>
  );
}

export default function PremiumModal({
  isOpen,
  onClose,
  featureName,
  variant = "premium_required",
}: PremiumModalProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isQuota = variant === "quota_exceeded";

  const title = isQuota
    ? "Günlük Hakkınızı Kullandınız"
    : featureName
    ? t("premium.gate.title_feature").replace("{featureName}", featureName)
    : t("premium.gate.title_default");

  const desc = isQuota
    ? "Her gün 1 ücretsiz kullanım hakkınız var. Gece yarısı otomatik yenilenir — ya da Premium'a geçerek sınırsız kullanın."
    : t("premium.gate.desc");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
        {/* Glow bg */}
        <div className={`absolute inset-0 rounded-2xl blur-2xl scale-110 pointer-events-none ${
          isQuota ? "bg-amber-600/10" : "bg-purple-600/10"
        }`} />

        <div className="relative backdrop-blur-xl bg-[#0a0a12]/80 border border-white/[0.08] rounded-2xl p-8 text-center shadow-[0_0_80px_rgba(168,85,247,0.12)]">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-6 mx-auto">
            <div className={`absolute inset-0 rounded-full blur-xl ${isQuota ? "bg-amber-500/20" : "bg-purple-500/20"}`} />
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border ${
              isQuota
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-purple-500/10 border-purple-500/30"
            }`}>
              {isQuota
                ? <Clock className="w-7 h-7 text-amber-400" />
                : <Lock className="w-7 h-7 text-purple-400" />
              }
            </div>
          </div>

          {/* Title */}
          <h2 className="font-serif text-xl font-semibold text-white mb-2 leading-snug">
            {title}
          </h2>

          {/* Desc */}
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            {desc}
          </p>

          {/* Countdown (quota exceeded only) */}
          {isQuota && <ResetCountdown />}

          {/* Feature hints (non-quota only) */}
          {!isQuota && (
            <div className="flex items-center justify-center gap-4 mb-6">
              {["✨ AI Yorum", "♾️ Sınırsız", "🔮 Tüm Araçlar"].map((f) => (
                <span key={f} className="text-[10px] text-white/30 font-medium">
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => router.push("/premium")}
            className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${
              isQuota
                ? "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:shadow-lg hover:shadow-amber-500/20"
                : "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:shadow-lg hover:shadow-purple-500/25"
            }`}
          >
            <Crown className="w-4 h-4" />
            {isQuota ? "Premium'a Geç — Sınırsız Kullan" : t("premium.gate.cta")}
          </button>

          <button
            onClick={onClose}
            className="mt-3 w-full text-white/25 text-xs hover:text-white/40 transition-colors py-2"
          >
            {isQuota ? "Tamam, yarın denerim" : t("premium.gate.back")}
          </button>
        </div>
      </div>
    </div>
  );
}
