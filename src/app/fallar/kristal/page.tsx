"use client";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

export default function KristalPage() {
  const { t, language } = useTranslation();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getReading = async () => {
    if (!question.trim()) return;
    setResult(null); setLoading(true);
    try {
      const res = await fetch("/api/divination", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "crystal", cards: [{ name: "Kristal Küre Sezgisi", meaning: question }], question, language }) });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="cosmic-gradient min-h-screen">
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-7xl mb-4 float" style={{ animation: "float 3s ease-in-out infinite, glow-pulse 2s ease-in-out infinite alternate" }}>🔮</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">{t("fortune.kristal.title")}</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("fortune.kristal.full_desc")}</p>
        </div>
      </section>

      <section className="pb-8 px-4"><div className="max-w-2xl mx-auto space-y-4">
        <div className="glass-card p-8">
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-3">{t("fortune.common.question.label")}</label>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder={t("fortune.common.question.placeholder")} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 text-sm resize-none" rows={4} />
        </div>
        <button onClick={getReading} disabled={loading || !question.trim()}
          className="w-full py-5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 glow">
          {loading ? t("fortune.kristal.loading") : t("fortune.kristal.result_btn")}
        </button>
      </div></section>

      {result && (
        <section className="pb-20 px-4"><div className="max-w-3xl mx-auto fade-in-up">
          <div className="glass-card p-8 relative overflow-hidden glow">
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
            
            <h3 className="text-2xl font-bold text-white mb-6">{result.title}</h3>
            
            {result.cards?.map((c: any, i: number) => (
              <div key={i} className="mb-4 p-4 bg-violet-900/20 rounded-xl border border-violet-500/20">
                <p className="text-gray-300 text-sm leading-relaxed">{c.interpretation}</p>
              </div>
            ))}

            <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20 mt-4">
              <h4 className="text-lg font-bold text-white mb-2">🌌 {t("chart.overview")}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{result.synthesis}</p>
            </div>

            {result.advice && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-violet-400 font-semibold text-sm">✨ {t("chart.advice")}: </span>
                <span className="text-gray-300 text-sm">{result.advice}</span>
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
