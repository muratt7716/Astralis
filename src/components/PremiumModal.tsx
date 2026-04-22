"use client";

import { Crown, Lock, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function PremiumModal({ isOpen, onClose, featureName }: PremiumModalProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const title = featureName
    ? t("premium.gate.title_feature").replace("{featureName}", featureName)
    : t("premium.gate.title_default");

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
        <div className="absolute inset-0 rounded-2xl bg-purple-600/10 blur-2xl scale-110 pointer-events-none" />

        <div className="relative backdrop-blur-xl bg-[#0a0a12]/80 border border-white/[0.08] rounded-2xl p-8 text-center shadow-[0_0_80px_rgba(168,85,247,0.15)]">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="relative inline-flex items-center justify-center w-18 h-18 mb-6 mx-auto">
            <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 flex items-center justify-center">
              <Lock className="w-7 h-7 text-purple-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="font-serif text-xl font-semibold text-white mb-2 leading-snug">
            {title}
          </h2>

          {/* Desc */}
          <p className="text-white/40 text-sm leading-relaxed mb-7">
            {t("premium.gate.desc")}
          </p>

          {/* Features hint */}
          <div className="flex items-center justify-center gap-4 mb-7">
            {["✨ AI Yorum", "♾️ Sınırsız", "🔮 Tüm Araçlar"].map((f) => (
              <span key={f} className="text-[10px] text-white/30 font-medium">
                {f}
              </span>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push("/premium")}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            {t("premium.gate.cta")}
          </button>

          <button
            onClick={onClose}
            className="mt-3 w-full text-white/25 text-xs hover:text-white/40 transition-colors py-2"
          >
            {t("premium.gate.back")}
          </button>
        </div>
      </div>
    </div>
  );
}
