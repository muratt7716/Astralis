"use client";

import { useTransition, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-helpers";
import { useTranslation } from "@/lib/i18n";
import { createCheckout } from "./actions";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Crown, BanIcon, Sparkles, Telescope,
  Brain, Loader2, Shield, Zap, Gem, HeartHandshake, AlertCircle, PlayCircle
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
  features,
  quota,
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
  features: { icon: any; text: string }[];
  quota?: {
    current: number;
    total: number;
  };
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

      {quota && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-inner">
          <div className="flex justify-between items-end mb-2">
             <span className="text-[10px] text-amber-500/80 uppercase font-bold tracking-widest flex items-center gap-1.5">
               <AlertCircle className="w-3 h-3" /> Destekçi Kontenjanı
             </span>
             <span className="text-sm font-black text-amber-400">{quota.current} <span className="text-amber-500/40">/ {quota.total}</span></span>
          </div>
          <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${(quota.current/quota.total)*100}%` }} />
          </div>
        </div>
      )}

      {isCurrentPlan ? (
        <div className="flex items-center justify-center gap-2 py-4 rounded-full bg-white/5 border border-white/10 text-emerald-400 font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <Shield className="w-4 h-4" />
          {activePlanLabel}
        </div>
      ) : (
        <GlassButton
          onClick={onBuy}
          disabled={loading}
          className={`${highlight ? "hover:border-amber-500/40 bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-500/30" : "hover:border-purple-500/30"}`}
          size="lg"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="flex items-center gap-2 font-bold tracking-wide">
              {highlight ? <Crown className="w-4 h-4 text-amber-400" /> : <Zap className="w-4 h-4 text-purple-400" />}
              {ctaLabel}
            </span>
          )}
        </GlassButton>
      )}

      <div className="mt-8 space-y-3 pt-6 border-t border-white/5">
         {features.map((feature: { icon: any, text: string }, i: number) => {
           const Icon = feature.icon;
           return (
             <div key={i} className="flex items-start gap-3">
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${highlight ? 'text-amber-400' : 'text-purple-400'}`} aria-hidden="true" />
                <span className="text-sm text-white/70 leading-relaxed font-light">{feature.text}</span>
             </div>
           );
         })}
      </div>
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

  const [lifetimeCount, setLifetimeCount] = useState<number>(184); // Initial fallback

  useEffect(() => {
    fetch("/api/premium-count")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") {
          setLifetimeCount(data.count);
        }
      })
      .catch(console.error);
  }, []);

  const PRO_FEATURES = [
    { icon: Crown, text: "Doğum Haritası ve Matrix Sinastri dahil tüm premium araçlara erişim" },
    { icon: Sparkles, text: "Günlük araç limitlerinin tamamen kaldırılması" },
    { icon: BanIcon, text: "Tamamen reklamsız, temiz arayüz deneyimi" },
    { icon: Telescope, text: "Detaylı transitler ve anlık gökyüzü raporları" },
    { icon: Brain, text: "VIP Yapay Zeka destekli astrolojik yorumlamalar" },
  ];

  const VIP_FEATURES = [
    ...PRO_FEATURES,
    { icon: PlayCircle, text: "Hedef kontenjan tamamlandığında kapalı destekçi canlı yayınları" },
    { icon: HeartHandshake, text: "Canlı yayınlarda astrologlara doğrudan soru sorma önceliği" },
    { icon: Crown, text: "Proje Destekçisi rozeti ve Astralis'in gelişimine doğrudan katkı" },
    { icon: Gem, text: "Gelecekte eklenecek olan tüm yeni yapay zeka araçlarına ÜCRETSİZ ömür boyu erişim" },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-stretch">
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
            features={PRO_FEATURES}
          />

          <PricingCard
            badge="PROJE DESTEKÇİSİ"
            title="Ömür Boyu VIP (Sınırlı)"
            price={t("premium.lifetime.price")}
            period={t("premium.lifetime.period")}
            description="Erken aşamada vizyonumuza inanan destekçilerimize özel ömür boyu ayrıcalıklar."
            highlight
            glowColor="rgba(245,158,11,0.2)"
            borderColor="border-amber-500/40"
            onBuy={handleLifetime}
            loading={lifetimePending}
            isCurrentPlan={isLifetime}
            ctaLabel={t("premium.cta")}
            activePlanLabel={t("premium.active_plan")}
            features={VIP_FEATURES}
            quota={{ current: lifetimeCount, total: 250 }}
          />
        </div>

        {/* Founding Member Explanation */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/5 to-purple-500/5 border border-amber-500/10 rounded-3xl p-8 md:p-12 mb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none -mt-48 -mr-48" />
          
          <div className="relative z-10">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-4 flex items-center justify-center md:justify-start gap-3">
              <Crown className="w-6 h-6 text-amber-400" />
              Proje Destekçisi (VIP) Ayrıcalıkları
            </h2>
            <p className="text-white/60 text-base md:text-lg leading-relaxed mb-8 max-w-3xl text-center md:text-left">
              Ömür Boyu VIP paketi, sadece bir abonelik değil, aynı zamanda Astralis projesinin gelişimine destek olma fırsatıdır. 250 kişilik özel kontenjan dolduğunda, destekçilerimize özel aşağıdaki eşsiz ayrıcalıklar devreye girecektir:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/20 rounded-2xl p-6 border border-white/5 shadow-2xl transition hover:border-amber-500/20">
                <PlayCircle className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Kapalı Astrolog Yayınları</h3>
                <p className="text-white/50 text-sm">250 kişilik kontenjan hedefimiz tamamlandığında, uzman astrolog konuklarımızla sadece proje destekçilerinin katılabileceği kapalı devre canlı yayınlar düzenlenecektir (Yayın platformu ilerleyen süreçte duyurulacaktır).</p>
              </div>
              <div className="bg-black/20 rounded-2xl p-6 border border-white/5 shadow-2xl transition hover:border-amber-500/20">
                <HeartHandshake className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Öncelikli Soru Yanıtlama</h3>
                <p className="text-white/50 text-sm">Canlı yayınlarda soracağınız harita, transit ve yönlendirme soruları uzmanlar tarafından öncelikli olarak analiz edilip cevaplanacaktır. Erken destekçimiz olarak adımlarınızı ilk siz planlayın.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs pb-12">
          {t("premium.trust")}
        </p>
      </div>
    </div>
  );
}
