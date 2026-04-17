"use client";
import { useState } from "react";
import { elderFutharkRunes, runeSpreads } from "@/data/runes";
import { useAuth } from "@/lib/auth-helpers";
import { useTranslation } from "@/lib/i18n";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import { Sparkles, Lightbulb, Info } from "lucide-react";

export default function RunlerPage() {
  const { t, language } = useTranslation();
  const [spread, setSpread] = useState("odin");
  const [question, setQuestion] = useState("");
  const [drawnRunes, setDrawnRunes] = useState<(typeof elderFutharkRunes[0] & { isReversed: boolean })[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const selectedSpread = runeSpreads.find(s => s.id === spread)!;

  const draw = () => {
    setResult(null); setRevealed(new Set());
    const shuffled = [...elderFutharkRunes].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, selectedSpread.count).map(r => ({
      ...r, isReversed: r.reversed !== "(Ters anlamı yoktur)" && Math.random() < 0.3,
    }));
    setDrawnRunes(drawn);
  };

  const allRevealed = drawnRunes.length > 0 && revealed.size === drawnRunes.length;
  const positions = spread === "norns" ? [t("horoscope.past"), t("horoscope.present"), t("horoscope.future")] : [t("fortune.runler.position.odin")];

  const getReading = async () => {
    if (!user) {
      console.warn("[Runes] User not found, logging might fail");
    }
    setLoading(true);
    try {
      console.log("[Runes] Calling divination API for user:", user?.id);
      const res = await fetch("/api/divination", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rune", cards: drawnRunes.map((r, i) => ({ name: `${r.symbol} ${r.name}`, meaning: r.isReversed ? r.reversed : r.meaning, reversed: r.isReversed })), question, language, userId: user?.id }) });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="cosmic-gradient min-h-screen pt-32">
      <section className="pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <CosmicIcon name="runler" size={80} className="mx-auto mb-6 animate-float" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">{t("fortune.runler.title")}</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("fortune.runler.full_desc")}</p>
        </div>
      </section>

      <section className="pb-6 px-4"><div className="max-w-3xl mx-auto space-y-4">
        <div className="glass-card p-6">
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">{t("chart.overview")}</label>
          <div className="grid grid-cols-2 gap-3">
            {runeSpreads.map(s => (
              <button key={s.id} onClick={() => { setSpread(s.id); setDrawnRunes([]); setResult(null); }}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${spread === s.id ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                {s.name} ({s.count})
              </button>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">{t("fortune.common.question.label")}</label>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder={t("fortune.common.question.placeholder")} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 text-sm resize-none" rows={2} />
        </div>
        <button onClick={draw} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-600 text-white font-bold text-lg hover:shadow-lg transition-all glow">{t("fortune.runler.draw_btn")}</button>
      </div></section>

      {drawnRunes.length > 0 && (
        <section className="pb-8 px-4"><div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-white text-center mb-6">{t("fortune.runler.pick_subtitle")}</h2>
          <div className={`grid gap-6 ${drawnRunes.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : "grid-cols-3 max-w-2xl mx-auto"}`}>
            {drawnRunes.map((rune, idx) => {
              const isRevealed = revealed.has(idx);
              return (
                <div key={idx} onClick={() => setRevealed(prev => new Set(prev).add(idx))} className="cursor-pointer">
                  {!isRevealed ? (
                    <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-800 to-gray-900 border-2 border-blue-500/30 flex flex-col items-center justify-center hover:scale-105 transition-transform hover:border-blue-400/50 shadow-lg">
                      <span className="text-4xl text-gray-600">?</span>
                      <p className="text-blue-300 text-xs mt-2">{positions[idx] || `Rün ${idx + 1}`}</p>
                    </div>
                  ) : (
                    <div className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center fade-in-up shadow-lg ${rune.isReversed ? "bg-gradient-to-b from-red-900/30 to-gray-900 border-red-500/30" : "bg-gradient-to-b from-blue-900/30 to-gray-900 border-blue-500/30"}`}>
                      <p className="text-gray-400 text-xs mb-2">{positions[idx] || `Rün ${idx + 1}`}</p>
                      <span className={`text-5xl font-bold mb-2 ${rune.isReversed ? "rotate-180 inline-block text-red-300" : "text-blue-200"}`} style={{ fontFamily: "serif" }}>{rune.symbol}</span>
                      <p className="text-white font-bold">{rune.name}</p>
                      {rune.isReversed && <p className="text-red-400 text-xs">{t("fortune.runler.reversed")}</p>}
                      <p className="text-gray-400 text-xs mt-2 text-center">{rune.isReversed ? rune.reversed : rune.meaning}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div></section>
      )}

      {allRevealed && !result && (
        <section className="pb-8 px-4"><div className="max-w-3xl mx-auto">
          <button onClick={getReading} disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 glow">
            {loading ? t("fortune.runler.loading") : t("fortune.runler.result_btn")}
          </button>
        </div></section>
      )}

      {result && (
        <section className="pb-20 px-4"><div className="max-w-3xl mx-auto space-y-6 fade-in-up">
          <div className="glass-card p-8 glow">
            <h3 className="text-2xl font-bold text-white mb-4">{result.title}</h3>
            {result.cards?.map((c: any, i: number) => (
              <div key={i} className="mb-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-blue-300 font-bold text-sm mb-1">{c.position}: {c.name}</p>
                <p className="text-gray-300 text-sm">{c.interpretation}</p>
              </div>
            ))}
            <div className="mt-4 p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="size-5 text-blue-400" /> {t("chart.overview")}
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{result.synthesis}</p>
            </div>
            {result.advice && (<div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3">
              <Lightbulb className="size-5 text-blue-400 shrink-0" />
              <span className="text-gray-300 text-sm">{result.advice}</span>
            </div>)}
          </div>
        </div></section>
      )}
    </div>
  );
}
