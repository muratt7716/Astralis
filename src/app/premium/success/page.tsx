"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-helpers";
import { GlassButton } from "@/components/ui/glass-button";
import { Crown, CheckCircle2, ArrowRight, Sparkles, Star } from "lucide-react";

export default function PremiumSuccessPage() {
  const { profile } = useAuth();
  const isPremium = profile?.is_premium ?? false;
  const [dots, setDots] = useState("");

  // Bekleme animasyonu
  useEffect(() => {
    if (isPremium) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 600);
    return () => clearInterval(interval);
  }, [isPremium]);

  // Premium aktif olduğunda confetti efekti
  useEffect(() => {
    if (!isPremium) return;
    const particles = document.getElementById("particles");
    if (!particles) return;
    for (let i = 0; i < 40; i++) {
      const el = document.createElement("div");
      el.className = "confetti-particle";
      el.style.setProperty("--x", `${Math.random() * 100}vw`);
      el.style.setProperty("--delay", `${Math.random() * 2}s`);
      el.style.setProperty("--duration", `${2 + Math.random() * 3}s`);
      el.style.setProperty(
        "--color",
        ["#CA8A04", "#A855F7", "#10B981", "#F59E0B", "#EC4899"][
          Math.floor(Math.random() * 5)
        ]
      );
      particles.appendChild(el);
    }
  }, [isPremium]);

  return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center px-6 relative overflow-hidden">
      {/* ─── Ambient Glow ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {isPremium ? (
          <>
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.06] blur-[180px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/[0.05] blur-[150px] rounded-full" />
          </>
        ) : (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/[0.04] blur-[160px] rounded-full animate-pulse" />
        )}
      </div>

      {/* ─── Confetti Container ─── */}
      <div id="particles" className="fixed inset-0 z-50 pointer-events-none" />

      <style jsx global>{`
        .confetti-particle {
          position: fixed;
          top: -10px;
          left: var(--x);
          width: 8px;
          height: 8px;
          background: var(--color);
          border-radius: 50%;
          animation: confetti-fall var(--duration) ease-in var(--delay) forwards;
          opacity: 0;
        }
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg) scale(0.3);
          }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #CA8A04 0%,
            #F59E0B 25%,
            #FBBF24 50%,
            #F59E0B 75%,
            #CA8A04 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .float-icon {
          animation: float-icon 3s ease-in-out infinite;
        }
      `}</style>

      {/* ─── Main Content ─── */}
      <div className="relative z-10 max-w-lg mx-auto text-center">
        {isPremium ? (
          <>
            {/* ── BAŞARILI ── */}
            <div className="float-icon w-24 h-24 mx-auto mb-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-amber-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.15)]">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-4 h-4 text-amber-400/60" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/60 font-medium">
                Premium Aktif
              </span>
              <Star className="w-4 h-4 text-amber-400/60" />
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white mb-5 leading-tight">
              Hoş Geldiniz,{" "}
              <span className="shimmer-text">
                {profile?.subscription_type === "lifetime" ? "VIP" : "Premium"}
              </span>
            </h1>

            <p className="text-white/40 text-base md:text-lg leading-relaxed mb-10 max-w-md mx-auto">
              Üyeliğiniz başarıyla aktif edildi. Artık tüm Astralis araçlarına
              sınırsız erişiminiz var.
            </p>

            {/* Plan Rozeti */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 mb-12 shadow-[0_0_20px_rgba(16,185,129,0.08)]">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white/80 tracking-wide">
                {profile?.subscription_type === "lifetime"
                  ? "Ömür Boyu VIP Erişim"
                  : "Aylık Premium Üyelik"}
              </span>
            </div>

            {/* CTA Butonları */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profil" className="cursor-pointer">
                <GlassButton
                  size="lg"
                  className="hover:border-emerald-500/30 transition-all duration-300 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    Profilime Git <ArrowRight className="w-4 h-4" />
                  </span>
                </GlassButton>
              </Link>
              <Link href="/dogum-haritasi" className="cursor-pointer">
                <GlassButton
                  size="lg"
                  className="hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Doğum Haritası Çıkar
                  </span>
                </GlassButton>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* ── BEKLENİYOR ── */}
            <div className="float-icon w-24 h-24 mx-auto mb-10 rounded-full bg-gradient-to-br from-purple-500/15 to-amber-500/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.1)]">
              <Crown className="w-12 h-12 text-amber-400/80" strokeWidth={1.5} />
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/60 font-medium">
                İşleniyor
              </span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white mb-5 leading-tight">
              Ödemeniz Alındı{dots}
            </h1>

            <p className="text-white/40 text-base md:text-lg leading-relaxed mb-10 max-w-md mx-auto">
              Hesabınız birkaç dakika içinde aktif edilecektir.
              Bu sayfa otomatik olarak güncellenecektir.
            </p>

            {/* Durum Kartı */}
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-10 max-w-sm mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                <span className="text-sm text-white/60 font-medium">Ödeme onaylandı</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full border border-white/20 animate-pulse" />
                <span className="text-sm text-white/30">Premium aktifleştiriliyor...</span>
              </div>
            </div>

            <p className="text-white/20 text-xs mb-10 leading-relaxed max-w-sm mx-auto">
              5 dakika içinde aktif edilmezse{" "}
              <a
                href="mailto:astralislab@gmail.com"
                className="text-purple-400/80 hover:text-purple-300 underline underline-offset-2 transition-colors duration-200 cursor-pointer"
              >
                astralislab@gmail.com
              </a>{" "}
              adresine e-posta gönderin.
            </p>

            <Link href="/premium" className="cursor-pointer">
              <GlassButton
                size="lg"
                className="hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Premium Sayfasına Dön
                </span>
              </GlassButton>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
