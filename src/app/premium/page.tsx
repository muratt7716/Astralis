"use client";

import { useTransition } from "react";
import { useAuth } from "@/lib/auth-helpers";
import { useTranslation } from "@/lib/i18n";
import { createCheckout } from "./actions";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Crown, BanIcon, Video, Sparkles, Star, Telescope,
  Brain, Check, Loader2, Shield, Zap
} from "lucide-react";

function PricingCard({
  badge,
  title,
  price,
  period,
  description,
  highlight,
  glowColor,
  borderColor,
  onBuy,
  loading,
  isCurrentPlan,
  ctaLabel,
  activePlanLabel,
}: {
  badge?: string;
  title: string;
  price: string;
  period: string;
  description: string;
  highlight?: boolean;
  glowColor: string;
  borderColor: string;
  onBuy: () => void;
  loading: boolean;
  isCurrentPlan: boolean;
  ctaLabel: string;
  activePlanLabel: string;
}) {
  return (
    <div
      className={`
        relative backdrop-blur-xl bg-white/[0.04] rounded-2xl p-8
        border transition-all duration-300
        ${borderColor}
        ${highlight ? `shadow-[0_0_40px_${glowColor}]` : "shadow-[0_4px_24px_rgba(0,0,0,0.3)]"}
        hover:shadow-[0_0_60px_${glowColor}] hover:scale-[1.02]
      `}
    >
      {badge && (
        <div className={`
          absolute -top-3.5 left-1/2 -translate-x-1/2
          px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase
          ${highlight ? "bg-amber-500 text-black" : "bg-purple-600 text-white"}
        `}>
          {badge}
        </div>
      )}

      <h3 className="font-serif text-xl font-semibold text-white mb-1">{title}</h3>
      <p className="text-white/40 text-sm mb-6">{description}</p>

      <div className="mb-8">
        <span className="font-serif text-5xl font-bold text-white">{price}</span>
        <span className="text-white/40 text-sm ml-2">{period}</span>
      </div>

      {isCurrentPlan ? (
        <div className="flex items-center justify-center gap-2 py-4 rounded-full bg-white/5 border border-white/10 text-white/50 text-sm">
          <Shield className="w-4 h-4" />
          {activePlanLabel}
        </div>
      ) : (
        <GlassButton
          onClick={onBuy}
          disabled={loading}
          className={`w-full ${highlight ? "hover:border-amber-500/40" : "hover:border-purple-500/30"}`}
          size="lg"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {ctaLabel}
            </span>
          )}
        </GlassButton>
      )}
    </div>
  );
}

export default function PremiumPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [monthlyPending, startMonthly] = useTransition();
  const [lifetimePending, startLifetime] = useTransition();

  const isPremium = profile?.is_premium ?? false;
  const isMonthly = isPremium && profile?.subscription_type === "monthly";
  const isLifetime = isPremium && profile?.subscription_type === "lifetime";

  const FEATURES = [
    { icon: Crown,     text: t("premium.features.1") },
    { icon: BanIcon,   text: t("premium.features.2") },
    { icon: Video,     text: t("premium.features.3") },
    { icon: Sparkles,  text: t("premium.features.4") },
    { icon: Star,      text: t("premium.features.5") },
    { icon: Telescope, text: t("premium.features.6") },
    { icon: Brain,     text: t("premium.features.7") },
  ];

  function handleMonthly() {
    startMonthly(async () => {
      await createCheckout("monthly");
    });
  }

  function handleLifetime() {
    startLifetime(async () => {
      await createCheckout("lifetime");
    });
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white pb-24 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-600/[0.08] blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.05] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium tracking-wider uppercase mb-6">
            <Crown className="w-3.5 h-3.5" />
            {t("premium.badge")}
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-semibold text-white mb-5 leading-tight">
            {t("premium.hero.title1")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
              {t("premium.hero.title2")}
            </span>
          </h1>

          <p className="text-white/40 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {t("premium.hero.subtitle")}
          </p>
        </div>

        {/* Kartlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <PricingCard
            badge={t("premium.monthly.badge")}
            title={t("premium.monthly.title")}
            price={t("premium.monthly.price")}
            period={t("premium.monthly.period")}
            description={t("premium.monthly.desc")}
            glowColor="rgba(168,85,247,0.2)"
            borderColor="border-purple-500/30"
            onBuy={handleMonthly}
            loading={monthlyPending}
            isCurrentPlan={isMonthly}
            ctaLabel={t("premium.cta")}
            activePlanLabel={t("premium.active_plan")}
          />

          <PricingCard
            badge={t("premium.lifetime.badge")}
            title={t("premium.lifetime.title")}
            price={t("premium.lifetime.price")}
            period={t("premium.lifetime.period")}
            description={t("premium.lifetime.desc")}
            highlight
            glowColor="rgba(245,158,11,0.2)"
            borderColor="border-amber-500/40"
            onBuy={handleLifetime}
            loading={lifetimePending}
            isCurrentPlan={isLifetime}
            ctaLabel={t("premium.cta")}
            activePlanLabel={t("premium.active_plan")}
          />
        </div>

        {/* Özellik listesi */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          <h2 className="font-serif text-xl font-semibold text-white mb-6 text-center">
            {t("premium.features.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm pt-1.5">
                  <Check className="w-3 h-3 text-purple-400 flex-shrink-0" />
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          {t("premium.trust")}
        </p>
      </div>
    </div>
  );
}
