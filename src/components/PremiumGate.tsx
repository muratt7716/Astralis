"use client";

import { useAuth } from "@/lib/auth-helpers";
import { useRouter } from "next/navigation";
import { Crown, Lock } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";

interface PremiumGateProps {
  children: React.ReactNode;
  /** Özelliğin adı — overlay mesajında gösterilir */
  featureName?: string;
}

export default function PremiumGate({ children, featureName }: PremiumGateProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Auth yükleniyorsa skeleton göster
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  // Giriş yapılmamış
  if (!user) {
    router.replace("/onboarding");
    return null;
  }

  // Premium değil → overlay göster
  if (!profile?.is_premium) {
    return (
      <div className="relative min-h-screen bg-[#050508] flex items-center justify-center px-4">
        {/* Blur arka plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]" />
        </div>

        {/* Premium gate kartı */}
        <div className="relative z-10 max-w-md w-full">
          <div className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 text-center shadow-[0_0_60px_rgba(168,85,247,0.1)]">
            {/* İkon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6 mx-auto">
              <Lock className="w-7 h-7 text-purple-400" />
            </div>

            {/* Başlık */}
            <h2 className="font-serif text-2xl font-semibold text-white mb-3">
              {featureName ? `${featureName} Premium'a Özel` : "Bu İçerik Premium'a Özel"}
            </h2>

            {/* Açıklama */}
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Bu özelliğe erişmek için Astralis Premium üyeliği gerekiyor. Evrenin tüm kapılarını bir adımda aç.
            </p>

            {/* CTA */}
            <div className="flex flex-col gap-3">
              <GlassButton
                onClick={() => router.push("/premium")}
                className="w-full hover:border-purple-500/30"
                size="lg"
              >
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Premium'a Geç
                </span>
              </GlassButton>

              <button
                onClick={() => router.back()}
                className="text-white/30 text-xs hover:text-white/50 transition-colors py-2"
              >
                Geri dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Premium ✓ — içeriği göster
  return <>{children}</>;
}
