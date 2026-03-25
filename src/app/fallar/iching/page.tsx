"use client";
import { useState } from "react";
import { hexagrams } from "@/data/iching";
import { useTranslation } from "@/lib/i18n";

export default function IChingPage() {
  const { t, language } = useTranslation();
  const [question, setQuestion] = useState("");
  const [lines, setLines] = useState<("yin" | "yang")[]>([]);
  const [hexagram, setHexagram] = useState<typeof hexagrams[0] | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [flipping, setFlipping] = useState(false);

  const throwCoin = () => {
    if (lines.length >= 6) return;
    setFlipping(true);
    setTimeout(() => {
      const coins = [Math.random() > 0.5 ? 3 : 2, Math.random() > 0.5 ? 3 : 2, Math.random() > 0.5 ? 3 : 2];
      const sum = coins.reduce((a, b) => a + b, 0);
      const line: "yin" | "yang" = sum >= 7 ? "yang" : "yin";
      const newLines = [...lines, line];
      setLines(newLines);
      setFlipping(false);

      if (newLines.length === 6) {
        const idx = Math.floor(Math.random() * 64);
        setHexagram(hexagrams[idx]);
      }
    }, 800);
  };

  const reset = () => { setLines([]); setHexagram(null); setResult(null); };

  const getReading = async () => {
    if (!hexagram) return;
    setLoading(true);
    try {
      const res = await fetch("/api/divination", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "iching", cards: [{ name: `${hexagram.id}. ${hexagram.name} (${hexagram.chineseName})`, meaning: `${hexagram.meaning}. ${hexagram.judgement}` }], question, language }) });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="cosmic-gradient min-h-screen">
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4 float">☯️</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">{t("fortune.iching.title")}</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("fortune.iching.full_desc")}</p>
        </div>
      </section>

      <section className="pb-6 px-4"><div className="max-w-2xl mx-auto space-y-4">
        <div className="glass-card p-6">
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">{t("fortune.common.question.label")}</label>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder={t("fortune.common.question.placeholder")} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 text-sm resize-none" rows={2} />
        </div>

        <div className="glass-card p-8 text-center">
          <h3 className="text-lg font-bold text-white mb-4">{t("fortune.iching.create_hex")} ({lines.length}/6 {t("fortune.iching.lines") || "keys"})</h3>
          
          <div className="flex flex-col-reverse items-center gap-2 mb-6 min-h-[180px] justify-end">
            {lines.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2 fade-in-up">
                <span className="text-gray-500 text-xs w-4">{idx + 1}</span>
                {line === "yang" ? (
                  <div className="w-32 h-4 bg-emerald-500 rounded"></div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-14 h-4 bg-emerald-700 rounded"></div>
                    <div className="w-14 h-4 bg-emerald-700 rounded"></div>
                  </div>
                )}
                <span className="text-gray-500 text-xs">{line === "yang" ? "Yang ━" : "Yin ╍╍"}</span>
              </div>
            ))}
          </div>

          {lines.length < 6 ? (
            <button onClick={throwCoin} disabled={flipping} className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 glow">
              {flipping ? (
                <span className="animate-spin inline-block">🪙</span>
              ) : (
                `🪙 ${t("fortune.iching.coins_btn")} (${lines.length + 1}/6)`
              )}
            </button>
          ) : (
            <button onClick={reset} className="px-6 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10">↺ {t("common.back") || "Baştan Başla"}</button>
          )}
        </div>
      </div></section>

      {hexagram && (
        <section className="pb-8 px-4"><div className="max-w-2xl mx-auto fade-in-up">
          <div className="glass-card p-8 text-center border-l-4 border-emerald-500">
            <span className="text-5xl block mb-3">{hexagram.emoji}</span>
            <h3 className="text-2xl font-bold text-white">{hexagram.id}. {hexagram.name}</h3>
            <p className="text-emerald-400 text-lg font-medium mb-2">{hexagram.chineseName}</p>
            <p className="text-gray-400 text-sm mb-2">{hexagram.upperTrigram} ☰ {hexagram.lowerTrigram}</p>
            <p className="text-gray-300 text-sm">{hexagram.meaning}</p>
            <p className="text-emerald-300 text-sm mt-2 italic">&ldquo;{hexagram.judgement}&rdquo;</p>

            {!result && (
              <button onClick={getReading} disabled={loading} className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 glow">
                {loading ? t("fortune.iching.loading") : t("fortune.iching.result_btn")}
              </button>
            )}
          </div>
        </div></section>
      )}

      {result && (
        <section className="pb-20 px-4"><div className="max-w-3xl mx-auto space-y-6 fade-in-up">
          <div className="glass-card p-8 glow">
            <h3 className="text-2xl font-bold text-white mb-4">{result.title}</h3>
            {result.cards?.map((c: any, i: number) => (
              <div key={i} className="mb-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-emerald-300 font-bold text-sm mb-1">{c.name}</p>
                <p className="text-gray-300 text-sm">{c.interpretation}</p>
              </div>
            ))}
            <div className="mt-4 p-4 bg-emerald-900/20 rounded-xl border border-emerald-500/20">
              <h4 className="text-lg font-bold text-white mb-2">🌟 {t("chart.overview")}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{result.synthesis}</p>
            </div>
            {result.advice && (<div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-emerald-400 font-semibold text-sm">💡 {t("chart.advice")}: </span><span className="text-gray-300 text-sm">{result.advice}</span>
            </div>)}
          </div>
        </div></section>
      )}
    </div>
  );
}
