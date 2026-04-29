"use client";

import { useTransition, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-helpers";
import { useTranslation } from "@/lib/i18n";
import { getCheckoutUrl } from "./actions";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Crown, BanIcon, Sparkles, Telescope,
  Brain, Loader2, Shield, Zap, Gem, HeartHandshake, AlertCircle, PlayCircle, ExternalLink, Mail, X, CheckCircle2
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
      `}
      style={{
        boxShadow: highlight
          ? `0 0 40px ${glowColor}`
          : "0 4px 24px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 60px ${glowColor}`}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = highlight ? `0 0 40px ${glowColor}` : "0 4px 24px rgba(0,0,0,0.3)"}
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
            <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${(quota.current / quota.total) * 100}%` }} />
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
  const { profile, user, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [monthlyPending, startMonthly] = useTransition();
  const [lifetimePending, startLifetime] = useTransition();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; plan: "monthly" | "lifetime" | null }>({ open: false, plan: null });
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const userEmail = profile?.email || user?.email || "";

  const isPremium = profile?.is_premium ?? false;
  const isMonthly = isPremium && profile?.subscription_type === "monthly";
  const isLifetime = isPremium && profile?.subscription_type === "lifetime";

  const [lifetimeCount, setLifetimeCount] = useState<number>(184);

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

  // Ödeme açıldıktan sonra premium durumunu otomatik kontrol et
  useEffect(() => {
    if (!checkoutOpen || isPremium) return;

    pollRef.current = setInterval(async () => {
      try {
        if (refreshProfile) await refreshProfile();
      } catch { }
    }, 10_000); // 10 saniyede bir kontrol

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [checkoutOpen, isPremium, refreshProfile]);

  // Premium aktif olunca otomatik yönlendir
  useEffect(() => {
    if (checkoutOpen && isPremium) {
      setCheckoutOpen(false);
      if (pollRef.current) clearInterval(pollRef.current);
      router.push("/premium/success");
    }
  }, [checkoutOpen, isPremium, router]);

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
  // Modal'da onay verilince çalışır
  const proceedToCheckout = useCallback((planType: "monthly" | "lifetime") => {
    const startFn = planType === "monthly" ? startMonthly : startLifetime;
    startFn(async () => {
      try {
        const url = await getCheckoutUrl(planType);
        window.open(url, "_blank", "noopener,noreferrer");
        setCheckoutOpen(true);
        setConfirmModal({ open: false, plan: null });
      } catch (err: any) {
        if (err?.message === "NOT_AUTHENTICATED") {
          router.push("/onboarding");
        }
      }
    });
  }, [router]);

  function handleMonthly() {
    setConfirmModal({ open: true, plan: "monthly" });
  }

  function handleLifetime() {
    setConfirmModal({ open: true, plan: "lifetime" });
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white pb-24 overflow-x-hidden">

      {/* ─── E-posta Onay Modal'ı (Liquid Glass) ─── */}
      {confirmModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setConfirmModal({ open: false, plan: null })}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Modal Card */}
          <div
            className="relative w-full max-w-md animate-[scaleIn_0.25s_ease-out] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 via-transparent to-amber-500/20 rounded-[28px] blur-xl pointer-events-none" />

            <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.12] rounded-3xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">

              {/* Close Button */}
              <button
                onClick={() => setConfirmModal({ open: false, plan: null })}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/20 flex items-center justify-center">
                <Mail className="w-7 h-7 text-amber-400" />
              </div>

              {/* Title */}
              <h3 id="confirm-title" className="text-center text-xl font-semibold text-white mb-2 font-serif">
                Ödeme Öncesi Doğrulama
              </h3>

              <p className="text-center text-white/40 text-sm mb-6 leading-relaxed">
                Shopier ödeme sayfası <strong className="text-white/60">yeni sekmede</strong> açılacaktır.
                Premium üyeliğinizin otomatik aktif olması için aşağıdaki e-posta ile ödeme yapmanız gerekmektedir.
              </p>

              {/* Email Display */}
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/[0.06] to-amber-500/[0.06] border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/70 font-semibold">Kayıtlı E-Posta</span>
                </div>
                <p className="text-white text-base font-medium tracking-wide pl-6">
                  {userEmail || "E-posta bulunamadı"}
                </p>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2.5 mb-7 p-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/10">
                <AlertCircle className="w-4 h-4 text-amber-400/70 flex-shrink-0 mt-0.5" />
                <p className="text-amber-200/50 text-xs leading-relaxed">
                  Farklı bir e-posta kullanırsanız premium üyeliğiniz <strong className="text-amber-200/70">otomatik olarak aktif edilemez</strong> ve manuel destek gerektirir.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => confirmModal.plan && proceedToCheckout(confirmModal.plan)}
                  disabled={monthlyPending || lifetimePending}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(monthlyPending || lifetimePending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Onaylıyorum, Shopier&apos;e Git
                    </>
                  )}
                </button>

                <button
                  onClick={() => setConfirmModal({ open: false, plan: null })}
                  className="w-full py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/50 hover:text-white/70 font-medium text-sm transition-all duration-200 cursor-pointer"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <div className="bg-black/20 rounded-2xl p-6 border border-white/5 shadow-2xl transition-all duration-200 hover:border-amber-500/20 cursor-pointer">
                <PlayCircle className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Kapalı Astrolog Yayınları</h3>
                <p className="text-white/50 text-sm">250 kişilik kontenjan hedefimiz tamamlandığında, uzman astrolog konuklarımızla sadece proje destekçilerinin katılabileceği kapalı devre canlı yayınlar düzenlenecektir (Yayın platformu ilerleyen süreçte duyurulacaktır).</p>
              </div>
              <div className="bg-black/20 rounded-2xl p-6 border border-white/5 shadow-2xl transition-all duration-200 hover:border-amber-500/20 cursor-pointer">
                <HeartHandshake className="w-8 h-8 text-pink-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Öncelikli Soru Yanıtlama</h3>
                <p className="text-white/50 text-sm">Canlı yayınlarda soracağınız harita, transit ve yönlendirme soruları uzmanlar tarafından öncelikli olarak analiz edilip cevaplanacaktır. Erken destekçimiz olarak adımlarınızı ilk siz planlayın.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Checkout Açık: Durum Banner'ı ─── */}
        {checkoutOpen && !isPremium && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[slideUp_0.4s_ease-out]">
            <div className="backdrop-blur-2xl bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-500/30 rounded-2xl px-6 py-4 shadow-[0_0_40px_rgba(168,85,247,0.2)] flex items-center gap-4 max-w-md">
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-amber-400/40 animate-ping" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Ödeme bekleniyor</p>
                <p className="text-white/50 text-xs">Shopier sayfasında ödemenizi tamamlayın</p>
              </div>
              <Loader2 className="w-5 h-5 text-purple-300 animate-spin flex-shrink-0" />
            </div>
          </div>
        )}

        {/* ─── E-posta Uyarısı ─── */}
        <div className="max-w-lg mx-auto mb-8 p-5 rounded-2xl backdrop-blur-lg bg-amber-500/[0.04] border border-amber-500/10 text-center transition-all duration-300 hover:border-amber-500/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-400/70" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400/50 font-semibold">Önemli Bilgi</span>
          </div>
          <p className="text-amber-200/60 text-xs leading-relaxed">
            Ödeme sırasında <strong className="text-amber-200/80">Astralis hesabınızda kayıtlı e-posta adresinizi</strong> kullanmanız gerekmektedir.
            Farklı bir e-posta kullanırsanız premium üyeliğiniz otomatik olarak aktif edilemez.
          </p>
        </div>

        <p className="text-center text-white/20 text-xs pb-12">
          {t("premium.trust")}
        </p>
      </div>

      {/* ─── Global Animasyonlar ─── */}
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
