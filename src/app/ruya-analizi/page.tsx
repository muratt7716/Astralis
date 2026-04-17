"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { getCurrentProfile } from "@/lib/auth-helpers";
import { logInteraction } from "@/lib/logging";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import { 
  Moon, 
  Search, 
  History, 
  Brain, 
  ScrollText, 
  Zap, 
  Palette, 
  Sparkles, 
  MessageSquare, 
  PenTool,
  ArrowLeft
} from "lucide-react";

export default function DreamAnalysisPage() {
  const { t, language } = useTranslation();
  const [dream, setDream] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dream.trim().length < 10) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/dream-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream, language }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.analysis);
        
        // Log Interaction
        try {
          const profile = await getCurrentProfile();
          if (profile) {
            logInteraction(profile.id, "dream", "Rüya analizi yapıldı");
          }
        } catch (err) {
          console.error("Log failed", err);
        }
      } else {
        setError(data.error || "Bir hata oluştu.");
      }
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cosmic-gradient min-h-screen pt-32">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <CosmicIcon name="dream" size={80} className="mx-auto mb-6 animate-float" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">
            {t("dream.title")}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("dream.subtitle")}</p>
        </div>

        {/* Form */}
        {!result && (
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="enhanced-glass rounded-2xl p-6 border border-white/10">
              <label className="block text-white font-semibold mb-3">{t("dream.input.label")}</label>
              <textarea
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                placeholder={t("dream.input.placeholder")}
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
                required
                minLength={10}
              />
              <button
                type="submit"
                disabled={loading || dream.trim().length < 10}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("dream.analyzing")}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {t("dream.submit")} <Moon className="size-5" />
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Error */}
        {error && (
          <div className="text-center text-red-400 bg-red-500/10 rounded-xl p-4 mb-8 border border-red-500/20">
            {error}
          </div>
        )}
         {/* Results */}
        {result && (
          <div className="space-y-8 fade-in-up mt-8">
            
            {/* Key Symbol & Synthesis Hero */}
            <div className="enhanced-glass rounded-[2rem] p-8 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Moon className="size-32 text-purple-500" />
              </div>
              <div className="relative z-10">
                {result.key_symbol && (
                  <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/40 border border-purple-500/30">
                    <span className="text-purple-300 font-bold text-sm tracking-widest uppercase">
                      {language === "tr" ? "Anahtar Sembol:" : "Key Symbol:"}
                    </span>
                    <span className="text-white font-serif italic text-lg">{result.key_symbol}</span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-4 font-serif">
                  {language === "tr" ? "Bütünsel Sentez" : "Holistic Synthesis"}
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">{result.synthesis}</p>
              </div>
            </div>

            {/* The 3 Layers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Archaeological */}
              {result.layer_archaeological && (
                <div className="enhanced-glass rounded-3xl p-6 border border-emerald-500/20 bg-gradient-to-b from-emerald-900/10 to-transparent group hover:border-emerald-500/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <History className="size-6 text-emerald-400" />
                  </div>
                  <h3 className="text-emerald-400 font-bold mb-1 tracking-wide">
                    {language === "tr" ? "Arkeolojik Temel" : "Archaeological Basis"}
                  </h3>
                  <p className="text-xs text-emerald-500/60 font-bold uppercase tracking-widest mb-4">
                    Mezopotamya & Mısır
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.layer_archaeological}</p>
                </div>
              )}

              {/* Psychological */}
              {result.layer_psychological && (
                <div className="enhanced-glass rounded-3xl p-6 border border-purple-500/20 bg-gradient-to-b from-purple-900/10 to-transparent group hover:border-purple-500/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="size-6 text-purple-400" />
                  </div>
                  <h3 className="text-purple-400 font-bold mb-1 tracking-wide">
                    {language === "tr" ? "Psikolojik Çözümleme" : "Exploration of Psyche"}
                  </h3>
                  <p className="text-xs text-purple-500/60 font-bold uppercase tracking-widest mb-4">
                    Jung & Artemidorus
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.layer_psychological}</p>
                </div>
              )}

              {/* Cultural */}
              {result.layer_cultural && (
                <div className="enhanced-glass rounded-3xl p-6 border border-amber-500/20 bg-gradient-to-b from-amber-900/10 to-transparent group hover:border-amber-500/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ScrollText className="size-6 text-amber-400" />
                  </div>
                  <h3 className="text-amber-400 font-bold mb-1 tracking-wide">
                    {language === "tr" ? "Kültürel Bağlam" : "Contextual Meaning"}
                  </h3>
                  <p className="text-xs text-amber-500/60 font-bold uppercase tracking-widest mb-4">
                    İbn Şirin Ekolü
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.layer_cultural}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Energy & Chakra */}
              {result.energy_chakra && (
                <div className="enhanced-glass rounded-3xl p-6 border border-rose-500/20 bg-gradient-to-br from-rose-900/10 to-transparent">
                  <h3 className="text-rose-400 font-bold mb-3 flex items-center gap-2">
                    <Zap className="size-5" /> {language === "tr" ? "Kozmik Rezonans & Çakra" : "Cosmic Resonance & Chakra"}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.energy_chakra}</p>
                </div>
              )}

              {/* Color Therapy */}
              {result.color_therapy && (
                <div className="enhanced-glass rounded-3xl p-6 border border-cyan-500/20 bg-gradient-to-br from-cyan-900/10 to-transparent">
                  <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                    <Palette className="size-5" /> {language === "tr" ? "Renk & Frekans Terapisi" : "Color & Frequency Therapy"}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.color_therapy}</p>
                </div>
              )}
            </div>

            {/* Actionable Advice - The Dream's Whisper */}
            {result.actionable_advice && (
              <div className="enhanced-glass rounded-3xl p-8 border border-white/20 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20 mt-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Sparkles className="size-24 text-white" />
                 </div>
                 <div className="relative z-10">
                   <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-3">
                     <Search className="size-6 text-purple-400" /> {language === "tr" ? "Rüyanın Fısıltısı (Tavsiye)" : "The Dream's Whisper (Advice)"}
                   </h3>
                   <p className="text-gray-200 text-lg leading-relaxed italic border-l-4 border-purple-500 pl-4">{result.actionable_advice}</p>
                 </div>
              </div>
            )}

            {/* Reflection Questions */}
            {result.reflection_questions?.length > 0 && (
              <div className="enhanced-glass rounded-3xl p-8 border border-white/10 mt-8">
                <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
                  <PenTool className="size-6 text-purple-400" />
                  {language === "tr" ? "İçsel Keşif Soruları" : "Questions for Reflection"}
                </h3>
                <ul className="space-y-4">
                  {result.reflection_questions.map((q: string, i: number) => (
                    <li key={i} className="text-gray-300 flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-purple-400 font-bold text-lg">{i + 1}.</span>
                      <span className="mt-0.5 leading-relaxed">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* New Dream Button */}
            <div className="text-center mt-12">
              <button
                onClick={() => { setResult(null); setDream(""); }}
                className="group px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-purple-500/50 transition-all flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> 
                {language === "tr" ? "Yeni Rüya Gir" : "Enter Another Dream"}
              </button>
            </div>

            <p className="text-center text-gray-500 text-xs mt-8 pb-8">{t("dream.disclaimer")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
