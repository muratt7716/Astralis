"use client";

import { useTransition } from "react";
import { useAuth } from "@/lib/auth-helpers";
import { createCheckout } from "./actions";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Crown, BanIcon, Video, Sparkles, Star, Telescope,
  Brain, Check, Loader2, Shield, Zap
} from "lucide-react";

const FEATURES = [
  { icon: Crown,     text: "Premium özelliklerin tamamına sınırsız eriş" },
  { icon: BanIcon,   text: "Hiçbir zaman reklam görme" },
  { icon: Video,     text: "Özel astrolog canlı yayınlarına katılım hakkı" },
  { icon: Sparkles,  text: "Sınırsız Mistik Rehber AI konuşması" },
  { icon: Star,      text: "Horary — anlık soru astrolojisi" },
  { icon: Telescope, text: "Kozmik Pusula ve tüm araçlara erişim" },
  { icon: Brain,     text: "Öncelikli yapay zeka yanıt süresi" },
];

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
      {/* Badge */}
      {badge && (
        <div className={`
          absolute -top-3.5 left-1/2 -translate-x-1/2
          px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase
          ${highlight
            ? "bg-amber-500 text-black"
            : "bg-purple-600 text-white"
          }
        `}>
          {badge}
        </div>
      )}

      {/* Başlık */}
      <h3 className="font-serif text-xl font-semibold text-white mb-1">{title}</h3>
      <p className="text-white/40 text-sm mb-6">{description}</p>

      {/* Fiyat */}
      <div className="mb-8">
        <span className="font-serif text-5xl font-bold text-white">{price}</span>
        <span className="text-white/40 text-sm ml-2">{period}</span>
      </div>

      {/* CTA */}
      {isCurrentPlan ? (
        <div className="flex items-center justify-center gap-2 py-4 rounded-full bg-white/5 border border-white/10 text-white/50 text-sm">
          <Shield className="w-4 h-4" />
          Aktif Planın
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
              Hemen Başla
            </span>
          )}
        </GlassButton>
      )}
    </div>
  );
}

export default function PremiumPage() {
  const { profile } = useAuth();
  const [monthlyPending, startMonthly] = useTransition();
  const [lifetimePending, startLifetime] = useTransition();

  const isPremium = profile?.is_premium ?? false;
  const isMonthly = isPremium && profile?.subscription_type === "monthly";
  const isLifetime = isPremium && profile?.subscription_type === "lifetime";

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
      {/* Arka plan efektleri */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-purple-600/[0.08] blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.05] blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium tracking-wider uppercase mb-6">
            <Crown className="w-3.5 h-3.5" />
            Astralis Premium
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-semibold text-white mb-5 leading-tight">
            Evrenin Tüm{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
              Kapılarını Aç
            </span>
          </h1>

          <p className="text-white/40 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Mistik rehberler, anlık soru astrolojisi ve çok daha fazlası — sınırsız, reklamsız, öncelikli.
          </p>
        </div>

        {/* Kartlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <PricingCard
            badge="Lansmana Özel"
            title="Aylık Üyelik"
            price="₺150"
            period="/ ay"
            description="Tüm premium özelliklere aylık erişim"
            glowColor="rgba(168,85,247,0.2)"
            borderColor="border-purple-500/30"
            onBuy={handleMonthly}
            loading={monthlyPending}
            isCurrentPlan={isMonthly}
          />

          <PricingCard
            badge="En Popüler"
            title="Ömür Boyu Kurucu Üyelik"
            price="₺999"
            period="tek seferlik"
            description="Bir kez öde, sonsuza kadar kazan"
            highlight
            glowColor="rgba(245,158,11,0.2)"
            borderColor="border-amber-500/40"
            onBuy={handleLifetime}
            loading={lifetimePending}
            isCurrentPlan={isLifetime}
          />
        </div>

        {/* Özellik listesi */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          <h2 className="font-serif text-xl font-semibold text-white mb-6 text-center">
            Her İki Planda Dahil
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

        {/* Güven notu */}
        <p className="text-center text-white/20 text-xs mt-8">
          Güvenli ödeme — Lemon Squeezy ile işlenir. İstediğin zaman iptal et.
        </p>
      </div>
    </div>
  );
}
