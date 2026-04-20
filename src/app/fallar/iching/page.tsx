"use client";
import { useState } from "react";
import { hexagrams } from "@/data/iching";
import { useAuth } from "@/lib/auth-helpers";
import { useTranslation } from "@/lib/i18n";
import CosmicIcon from "@/components/Cosmic/CosmicIcon";
import { RefreshCw, Coins, Sparkles, Lightbulb, Info, ArrowLeft, Eye, AlertTriangle, Clock, Layers } from "lucide-react";

export default function IChingPage() {
  const { t, language } = useTranslation();
  const [question, setQuestion] = useState("");
  const [lines, setLines] = useState<("yin" | "yang")[]>([]);
  const [hexagram, setHexagram] = useState<typeof hexagrams[0] | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
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
    if (!user) {
      console.warn("[IChing] User not found, logging might fail");
    }
    setLoading(true);
    try {
      console.log("[IChing] Calling divination API for user:", user?.id);
      const res = await fetch("/api/divination", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "iching", cards: [{ name: `${hexagram.id}. ${hexagram.name} (${hexagram.chineseName})`, meaning: `${hexagram.meaning}. ${hexagram.judgement}` }], question, language, userId: user?.id }) });
      const data = await res.json();
      if (data.success) setResult(data.data);
      else console.error("[IChing] API Error:", data.error);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="cosmic-gradient min-h-screen pt-32">
      <section className="pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <CosmicIcon name="iching" size={80} className="mx-auto mb-6 animate-float" />
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
            <button onClick={throwCoin} disabled={flipping} className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-3 mx-auto">
              {flipping ? (
                <RefreshCw className="animate-spin size-6" />
              ) : (
                <><Coins className="size-6" /> {t("fortune.iching.coins_btn")} ({lines.length + 1}/6)</>
              )}
            </button>
          ) : (
            <button onClick={reset} className="flex items-center gap-2 mx-auto px-6 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors">
              <RefreshCw className="size-4" /> {t("common.back") || "Baştan Başla"}
            </button>
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
        <section className="pb-20 px-4"><div className="max-w-3xl mx-auto space-y-4 fade-in-up">
          {/* Başlık ve Hexagram yorumu */}
          <div className="glass-card p-8 glow">
            <h3 className="text-2xl font-bold text-white mb-6">{result.title}</h3>
            {result.cards?.map((c: any, i: number) => (
              <div key={i} className="mb-4 p-5 bg-white/5 rounded-xl border border-white/10">
                <p className="text-emerald-300 font-bold text-sm mb-2">{c.name}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{c.interpretation}</p>
              </div>
            ))}
          </div>

          {/* Trigram Okuma */}
          {result.trigram_reading && (
            <div className="glass-card p-6 border border-emerald-500/20">
              <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Layers className="size-5 text-emerald-400" /> Trigram Enerjisi
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{result.trigram_reading}</p>
            </div>
          )}

          {/* Genel Sentez */}
          <div className="glass-card p-6 bg-emerald-900/10 border border-emerald-500/20">
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-400" /> Hexagramın Mesajı
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">{result.synthesis}</p>
          </div>

          {/* Manevi Mesaj */}
          {result.spiritual_message && (
            <div className="glass-card p-6 border border-teal-500/20 bg-teal-900/10">
              <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Eye className="size-5 text-teal-400" /> Tao'nun Fısıltısı
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed italic">{result.spiritual_message}</p>
            </div>
          )}

          {/* Uyarı */}
          {result.warning && (
            <div className="glass-card p-6 border border-amber-500/20 bg-amber-900/10">
              <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-400" /> Dikkat
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{result.warning}</p>
            </div>
          )}

          {/* Tavsiye + Zamanlama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.advice && (
              <div className="glass-card p-5 border border-white/10 flex items-start gap-3">
                <Lightbulb className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold text-sm mb-1">Pratik Yol</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.advice}</p>
                </div>
              </div>
            )}
            {result.timeframe && (
              <div className="glass-card p-5 border border-white/10 flex items-start gap-3">
                <Clock className="size-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-bold text-sm mb-1">Zamanlama</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.timeframe}</p>
                </div>
              </div>
            )}
          </div>
        </div></section>
      )}
    </div>
  );
}
