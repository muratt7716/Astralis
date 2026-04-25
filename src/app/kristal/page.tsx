"use client";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-helpers";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import { GlassButton } from "@/components/ui/glass-button";
import PremiumModal, { PremiumModalVariant } from "@/components/PremiumModal";
import FreemiumBadge from "@/components/FreemiumBadge";
import { useFreemiumQuota } from "@/lib/freemium";
import { Sparkles, Orbit, Info } from "lucide-react";

export default function KristalPage() {
  const { t, language } = useTranslation();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { isPremium, isBlocked, consumeQuota } = useFreemiumQuota("kristal");
  const [showPremium, setShowPremium] = useState(false);
  const [premiumVariant, setPremiumVariant] = useState<PremiumModalVariant>("premium_required");

  const getReading = async () => {
    if (!question.trim()) return;
    if (!isPremium) {
      if (isBlocked) { setPremiumVariant("quota_exceeded"); setShowPremium(true); return; }
      consumeQuota();
    }
    setResult(null); setLoading(true);
    try {
      const res = await fetch("/api/divination", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "crystal",
          cards: [{ name: "Kristal Küre", meaning: question }],
          question,
          language,
          userId: user?.id
        })
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="cosmic-gradient min-h-screen pt-32">
      <PremiumModal isOpen={showPremium} onClose={() => setShowPremium(false)} featureName={t("fortune.kristal.title")} variant={premiumVariant} />
      <section className="pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <CosmicIcon name="kristal" size={80} className="mx-auto mb-6 animate-float" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">{t("fortune.kristal.title")}</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-4">{t("fortune.kristal.full_desc")}</p>
          <FreemiumBadge toolKey="kristal" />
        </div>
      </section>

      <section className="pb-8 px-4"><div className="max-w-2xl mx-auto space-y-4">
        <div className="glass-card p-5 sm:p-8">
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-3">{t("fortune.common.question.label")}</label>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder={t("fortune.common.question.placeholder")} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 text-sm resize-none" rows={4} />
        </div>
        <div className="mt-6">
          <GlassButton fullWidth onClick={getReading} disabled={loading || !question.trim() || !user} className="hover:border-purple-500/50">
            {loading ? t("fortune.kristal.loading") : t("fortune.kristal.result_btn")}
          </GlassButton>
        </div>
      </div></section>

      {result && (
        <section className="pb-20 px-4"><div className="max-w-3xl mx-auto fade-in-up">
          <div className="glass-card p-5 sm:p-8 relative overflow-hidden glow">
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

            {/* Başlık */}
            <h3 className="text-2xl font-bold text-white mb-4">{result.title}</h3>

            {/* Açılış — kürenin atmosferi */}
            {result.opening && (
              <p className="text-violet-200/70 text-sm leading-relaxed italic mb-6 border-l-2 border-violet-500/30 pl-4">
                {result.opening}
              </p>
            )}

            {/* 3 Vizyon */}
            {result.visions?.map((v: any, i: number) => (
              <div key={i} className="mb-4 p-4 bg-violet-900/20 rounded-xl border border-violet-500/20">
                <p className="text-violet-300 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Sparkles className="size-3" />
                  {v.image}
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">{v.meaning}</p>
              </div>
            ))}

            {/* Ana mesaj */}
            {result.message && (
              <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20 mt-4">
                <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2 uppercase tracking-wider">
                  <Orbit className="size-4" /> Kürenin Mesajı
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">{result.message}</p>
              </div>
            )}

            {/* Rehberlik */}
            {result.guidance && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3">
                <Info className="size-4 text-violet-400 shrink-0" />
                <span className="text-gray-300 text-sm italic">{result.guidance}</span>
              </div>
            )}
          </div>
        </div></section>
      )}

      <style jsx>{`
        @keyframes glow-pulse {
          from { filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.3)); }
          to { filter: drop-shadow(0 0 25px rgba(139, 92, 246, 0.8)); }
        }
      `}</style>
    </div>
  );
}
