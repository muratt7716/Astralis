"use client";
import { useState } from "react";
import { lenormandCards, lenormandSpreads } from "@/data/lenormand";
import { LenormandCardFace } from "@/components/CardSVG";
import { useTranslation } from "@/lib/i18n";
import CosmicButton from "@/components/Cosmic/CosmicButton";
import CosmicLoader from "@/components/Cosmic/CosmicLoader";

export default function LenormandPage() {
  const { language } = useTranslation();
  const [spread, setSpread] = useState("three");
  const [question, setQuestion] = useState("");
  const [shuffledDeck, setShuffledDeck] = useState<typeof lenormandCards>([]);
  const [selectedCards, setSelectedCards] = useState<typeof lenormandCards>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"setup" | "picking" | "reading">("setup");

  const selectedSpread = lenormandSpreads.find(s => s.id === spread)!;

  const startPicking = () => {
    setResult(null); setSelectedCards([]);
    setShuffledDeck([...lenormandCards].sort(() => Math.random() - 0.5));
    setPhase("picking");
  };

  const pickCard = (card: typeof lenormandCards[0]) => {
    if (selectedCards.length >= selectedSpread.count) return;
    if (selectedCards.some(c => c.id === card.id)) return;
    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);
    if (newSelected.length === selectedSpread.count) setPhase("reading");
  };

  const getReading = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/divination", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "lenormand", cards: selectedCards.map(c => ({ name: `${c.id}. ${c.name}`, meaning: c.meaning, combinationHint: c.combinationHint })), question, language }) });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="cosmic-gradient min-h-screen">
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4 float">🏵️</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">Lenormand Falı</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">36 kart arasından sezgilerinizle seçim yapın. Lenormand kartları yan yana okunarak anlam kazanır.</p>
        </div>
      </section>

      {/* Setup */}
      {phase === "setup" && (
        <section className="pb-6 px-4"><div className="max-w-3xl mx-auto space-y-4">
          <div className="glass-card p-6">
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">Serim Türü</label>
            <div className="grid grid-cols-3 gap-3">
              {lenormandSpreads.map(s => (
                <button key={s.id} onClick={() => setSpread(s.id)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${spread === s.id ? "bg-amber-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                  {s.name} ({s.count})
                </button>
              ))}
            </div>
          </div>
          <div className="glass-card p-6">
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">Sorunuz</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Sorunuzu yazın..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 text-sm resize-none" rows={2} />
          </div>
          <CosmicButton 
            fullWidth 
            onClick={startPicking}
            icon="🏵️"
          >
            Kartları Aç ve Seçmeye Başla
          </CosmicButton>
        </div></section>
      )}

      {/* Picking Phase */}
      {phase === "picking" && (
        <section className="pb-8 px-4 fade-in-up">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2">
                Sezgilerinizle {selectedSpread.count} kart seçin ({selectedCards.length}/{selectedSpread.count})
              </h2>
              <p className="text-gray-400 text-sm">Kartlar birbirine bağlı bir hikaye anlatacak. İçgüdülerinize güvenin.</p>
            </div>

            {selectedCards.length > 0 && (
              <div className="flex gap-3 justify-center mb-6 flex-wrap">
                {selectedCards.map((card, idx) => (
                  <div key={idx} className="w-14 h-20 rounded-lg overflow-hidden border-2 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <LenormandCardFace name={card.name} id={card.id} className="w-full h-full" />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
              {shuffledDeck.map((card) => {
                const isSelected = selectedCards.some(c => c.id === card.id);
                return (
                  <div key={card.id} onClick={() => !isSelected && pickCard(card)}
                    className={`aspect-[2/3] rounded-lg overflow-hidden border cursor-pointer transition-all duration-300
                      ${isSelected
                        ? "border-amber-500/50 opacity-20 cursor-default"
                        : "border-amber-500/20 lg:hover:border-amber-400/60 lg:hover:scale-110 lg:hover:shadow-lg lg:hover:shadow-amber-500/20"
                      }`}>
                    {isSelected ? (
                      <div className="w-full h-full bg-amber-900/40 flex items-center justify-center">
                        <span className="text-amber-400 text-lg">✓</span>
                      </div>
                    ) : (
                      <img src="/cards/lenormand-back.png" alt="Lenormand" className="w-full h-full object-cover" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Reading Phase */}
      {phase === "reading" && (
        <section className="pb-8 px-4 fade-in-up">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-white text-center mb-6">Seçtiğiniz Kartlar ✨</h2>
            <div className={`grid gap-4 ${selectedCards.length <= 3 ? "grid-cols-3 max-w-2xl mx-auto" : selectedCards.length <= 5 ? "grid-cols-5 max-w-3xl mx-auto" : "grid-cols-3 md:grid-cols-5"} mb-8`}>
              {selectedCards.map((card, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-amber-500/30 text-center fade-in-up bg-gradient-to-b from-amber-950/80 to-gray-900/60"
                  style={{ animationDelay: `${idx * 0.15}s` }}>
                  <div className="w-full aspect-[2/3] overflow-hidden">
                    <LenormandCardFace name={card.name} id={card.id} className="w-full h-full" />
                  </div>
                  <div className="p-2 bg-black/20 border-t border-amber-500/20">
                    <p className="text-white text-xs font-bold">{card.id}. {card.name}</p>
                    <p className="text-gray-400 text-[10px] mt-1">{card.meaning}</p>
                  </div>
                </div>
              ))}
            </div>

            {!result && (
              <div className="max-w-3xl mx-auto">
                {loading ? (
                  <CosmicLoader label="Kartlar Yorumlanıyor... ✨" />
                ) : (
                  <CosmicButton 
                    fullWidth 
                    onClick={getReading} 
                    disabled={loading}
                    icon="✨"
                  >
                    Kombine Okumanızı Alın
                  </CosmicButton>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Result */}
      {result && (
        <section className="pb-20 px-4"><div className="max-w-3xl mx-auto space-y-6 fade-in-up">
          <div className="glass-card p-8 glow">
            <h3 className="text-2xl font-bold text-white mb-4">{result.title}</h3>
            {result.cards?.map((c: any, i: number) => (
              <div key={i} className="mb-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-amber-300 font-bold text-sm mb-1">{c.position}: {c.name}</p>
                <p className="text-gray-300 text-sm">{c.interpretation}</p>
              </div>
            ))}
            <div className="mt-4 p-4 bg-amber-900/20 rounded-xl border border-amber-500/20">
              <h4 className="text-lg font-bold text-white mb-2">🌟 Genel Sentez</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{result.synthesis}</p>
            </div>
            {result.advice && (<div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-amber-400 font-semibold text-sm">💡 Tavsiye: </span><span className="text-gray-300 text-sm">{result.advice}</span>
            </div>)}
          </div>
          <CosmicButton 
            fullWidth 
            variant="secondary"
            onClick={() => { setPhase("setup"); setSelectedCards([]); setResult(null); }}
            icon="↺"
          >
            Yeni Fal Baktır
          </CosmicButton>
        </div></section>
      )}
    </div>
  );
}
