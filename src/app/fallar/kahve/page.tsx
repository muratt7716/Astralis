"use client";
import { useState, useRef } from "react";
import { useTranslation } from "@/lib/i18n";

export default function KahvePage() {
  const { language } = useTranslation();
  const [mode, setMode] = useState<"photo" | "virtual">("virtual");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setResult(null); setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/divination", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "coffee", imageBase64: base64, mimeType: file.type, question, language }) });
        const data = await res.json();
        if (data.success) setResult(data.data);
        else setError(data.error || "Fal okunamadı.");
      } catch (err) { setError("Bağlantı hatası."); }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVirtual = async () => {
    setError(""); setResult(null); setLoading(true);
    try {
      const res = await fetch("/api/divination", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "coffee", virtual: true, question, language }) });
      const data = await res.json();
      if (data.success) setResult(data.data);
      else setError(data.error || "Fal okunamadı.");
    } catch (err) { setError("Bağlantı hatası."); }
    setLoading(false);
  };

  return (
    <div className="cosmic-gradient min-h-screen">
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4 float">☕</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">Kahve Falı</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Fincanınızın fotoğrafını yükleyin veya sanal fincan çevirerek mistik kahve falınızı öğrenin.</p>
        </div>
      </section>

      <section className="pb-6 px-4"><div className="max-w-2xl mx-auto space-y-4">
        <div className="glass-card p-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => setMode("photo")}
              className={`p-4 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-2 ${mode === "photo" ? "bg-yellow-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
              <span className="text-2xl">📷</span> Fincanımı Çek
            </button>
            <button onClick={() => setMode("virtual")}
              className={`p-4 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-2 ${mode === "virtual" ? "bg-yellow-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
              <span className="text-2xl">✨</span> Sanal Fincan
            </button>
          </div>
          <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">Sorunuz</label>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Falınızdan ne öğrenmek istiyorsunuz?" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 text-sm resize-none" rows={2} />
        </div>

        {mode === "photo" ? (
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 glow">
              {loading ? "Telveler Okunuyor... ☕" : "📷 Fincan Fotoğrafı Yükle"}
            </button>
            <p className="text-gray-500 text-xs text-center mt-2">⚠️ Yalnızca kahve fincanı fotoğrafı kabul edilir. Uygunsuz görseller otomatik reddedilir.</p>
          </div>
        ) : (
          <button onClick={handleVirtual} disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 glow">
            {loading ? "Sanal Fincan Çevriliyor... ☕" : "☕ Sanal Fincanı Çevir & Falıma Bak"}
          </button>
        )}

        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-center text-sm">{error}</div>}
      </div></section>

      {result && (
        <section className="pb-20 px-4"><div className="max-w-3xl mx-auto space-y-6 fade-in-up">
          <div className="glass-card p-8 glow">
            <h3 className="text-xl font-bold text-white mb-6 text-center">☕ Fincanınızdaki Semboller</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {result.symbols?.map((s: any, i: number) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400 font-bold text-sm">📍 {s.location}</span>
                  </div>
                  <p className="text-white font-bold mb-1">{s.name}</p>
                  <p className="text-gray-300 text-sm">{s.interpretation}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-yellow-900/20 rounded-xl border border-yellow-500/20 mb-4">
              <h4 className="text-lg font-bold text-white mb-2">🌟 Genel Fal Yorumu</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{result.synthesis}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-3 mb-4">
              {result.love && (
                <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20 text-center">
                  <span className="text-2xl block mb-1">❤️</span>
                  <p className="text-pink-300 font-bold text-xs mb-1">Aşk</p>
                  <p className="text-gray-300 text-xs">{result.love}</p>
                </div>
              )}
              {result.career && (
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                  <span className="text-2xl block mb-1">💼</span>
                  <p className="text-emerald-300 font-bold text-xs mb-1">Kariyer</p>
                  <p className="text-gray-300 text-xs">{result.career}</p>
                </div>
              )}
              {result.health && (
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-center">
                  <span className="text-2xl block mb-1">💪</span>
                  <p className="text-blue-300 font-bold text-xs mb-1">Sağlık</p>
                  <p className="text-gray-300 text-xs">{result.health}</p>
                </div>
              )}
            </div>

            {result.advice && (
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-amber-400 font-semibold text-sm">🧿 Anneanne Tavsiyesi: </span>
                <span className="text-gray-300 text-sm">{result.advice}</span>
              </div>
            )}
          </div>
        </div></section>
      )}
    </div>
  );
}
