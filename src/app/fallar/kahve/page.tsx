"use client";
import { useState, useRef } from "react";
import { useTranslation } from "@/lib/i18n";
import { FortuneTeller } from "@/data/fortune-tellers";
import FortuneTellerSelector from "@/components/Fortune/FortuneTellerSelector";
import CosmicButton from "@/components/Cosmic/CosmicButton";
import CosmicLoader from "@/components/Cosmic/CosmicLoader";

export default function KahvePage() {
  const { t, language } = useTranslation();
  const [phase, setPhase] = useState<"teller-selection" | "input" | "reading">("teller-selection");
  const [selectedTeller, setSelectedTeller] = useState<FortuneTeller | null>(null);
  const [mode, setMode] = useState<"photo" | "virtual">("virtual");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startInput = (teller: FortuneTeller) => {
    setSelectedTeller(teller);
    setPhase("input");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setResult(null); setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/divination", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            type: "coffee", 
            imageBase64: base64, 
            mimeType: file.type, 
            question, 
            language,
            persona: selectedTeller ? { name: selectedTeller.name, style: selectedTeller.style } : undefined
          }) 
        });
        const data = await res.json();
        if (data.success) {
          setResult(data.data);
          setPhase("reading");
        } else {
          setError(data.error || "Fal okunamadı.");
        }
      } catch (err) { setError("Bağlantı hatası."); }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVirtual = async () => {
    setError(""); setResult(null); setLoading(true);
    try {
      const res = await fetch("/api/divination", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "coffee", 
          virtual: true, 
          question, 
          language,
          persona: selectedTeller ? { name: selectedTeller.name, style: selectedTeller.style } : undefined
        }) 
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setPhase("reading");
      } else {
        setError(data.error || "Fal okunamadı.");
      }
    } catch (err) { setError("Bağlantı hatası."); }
    setLoading(false);
  };

  return (
    <div className="cosmic-gradient min-h-screen">
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4 float">☕</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">{t("fortune.kahve.title")}</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("fortune.kahve.desc")}</p>
        </div>
      </section>

      {/* Teller Selection */}
      {phase === "teller-selection" && (
        <section className="pb-8 px-4 fade-in-up">
          <div className="max-w-6xl mx-auto">
            <FortuneTellerSelector 
              onSelect={(teller) => startInput(teller)} 
              selectedId={selectedTeller?.id} 
            />
          </div>
        </section>
      )}

      {/* Input Phase */}
      {phase === "input" && !loading && (
        <section className="pb-6 px-4 fade-in-up">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-center mb-6">
              <p className="text-pink-400 font-bold mb-1">{t("fortune.reading.ready", { name: selectedTeller?.name || "" })}</p>
              <button onClick={() => setPhase("teller-selection")} className="text-xs text-gray-500 underline hover:text-gray-300">{t("fortune.common.result.retry")}</button>
            </div>
            
            <div className="glass-card p-6">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button onClick={() => setMode("photo")}
                  className={`p-4 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-2 ${mode === "photo" ? "bg-yellow-600/40 border-yellow-500/50 text-white" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
                  <span className="text-2xl">📷</span> {t("fortune.kahve.title")} (Photo)
                </button>
                <button onClick={() => setMode("virtual")}
                  className={`p-4 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-2 ${mode === "virtual" ? "bg-yellow-600/40 border-yellow-500/50 text-white" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
                  <span className="text-2xl">✨</span> {t("fortune.kahve.title")} (Virtual)
                </button>
              </div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">{t("fortune.common.question.label")} ({t("chart.optional")})</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder={t("fortune.common.question.placeholder")} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 text-sm resize-none" rows={2} />
            </div>

            {mode === "photo" ? (
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 glow">
                  📷 {t("fortune.reading.btn.kahve")} (Upload)
                </button>
                <p className="text-gray-500 text-[10px] text-center mt-2">{t("kahve.upload_warn")}</p>
              </div>
            ) : (
              <CosmicButton fullWidth onClick={handleVirtual} disabled={loading} icon="☕">
                {t("fortune.reading.btn.kahve")}
              </CosmicButton>
            )}

            {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-center text-sm">{error}</div>}
          </div>
        </section>
      )}

      {/* Loading Overlay */}
      {loading && (
        <section className="py-20">
          <CosmicLoader label={t("fortune.reading.loading", { name: selectedTeller?.name || "" })} />
        </section>
      )}

      {/* Reading Result */}
      {phase === "reading" && result && (
        <section className="pb-20 px-4 fade-in-up">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="glass-card p-8 glow relative overflow-hidden">
               {/* Persona Badge */}
               <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500/30">
                    {selectedTeller && <img src={selectedTeller.avatar} alt={selectedTeller.name} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{t("fortune.reading.header", { name: selectedTeller?.name || "" })}</h3>
                    <p className="text-pink-400 text-xs font-medium uppercase tracking-widest">{selectedTeller?.title}</p>
                  </div>
               </div>

              <h3 className="text-xl font-bold text-white mb-6 text-center">☕ {t("kahve.symbols")}</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {result.symbols?.map((s: any, i: number) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-400 font-bold text-xs">📍 {s.location}</span>
                    </div>
                    <p className="text-white font-bold mb-1">{s.name}</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{s.interpretation}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-yellow-900/20 rounded-xl border border-yellow-500/20 mb-6 text-center md:text-left">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center justify-center md:justify-start gap-2">
                  <span className="text-2xl">🌟</span> {t("chart.overview")}
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">{result.synthesis}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-3 mb-6">
                {result.love && (
                  <div className="p-4 bg-pink-500/10 rounded-xl border border-pink-500/20 text-center">
                    <span className="text-2xl block mb-2">❤️</span>
                    <p className="text-pink-300 font-bold text-xs mb-1 uppercase tracking-wider">{t("horoscope.love")}</p>
                    <p className="text-gray-300 text-xs leading-relaxed">{result.love}</p>
                  </div>
                )}
                {result.career && (
                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                    <span className="text-2xl block mb-2">💼</span>
                    <p className="text-emerald-300 font-bold text-xs mb-1 uppercase tracking-wider">{t("horoscope.career")}</p>
                    <p className="text-gray-300 text-xs leading-relaxed">{result.career}</p>
                  </div>
                )}
                {result.health && (
                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-center">
                    <span className="text-2xl block mb-2">💪</span>
                    <p className="text-blue-300 font-bold text-xs mb-1 uppercase tracking-wider">{t("horoscope.health")}</p>
                    <p className="text-gray-300 text-xs leading-relaxed">{result.health}</p>
                  </div>
                )}
              </div>

              {result.advice && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-amber-400 font-bold text-sm">🧿 {t("fortune.reading.advice")}: </span>
                  <span className="text-gray-300 text-sm italic">{result.advice}</span>
                </div>
              )}
            </div>

            <CosmicButton 
              fullWidth 
              variant="secondary"
              onClick={() => { setPhase("teller-selection"); setQuestion(""); setResult(null); }}
              icon="↺"
            >
              {t("fortune.common.result.retry")}
            </CosmicButton>
          </div>
        </section>
      )}
    </div>
  );
}
