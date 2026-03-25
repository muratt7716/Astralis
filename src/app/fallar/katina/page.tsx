"use client";
import { useState } from "react";
import { katinaCards } from "@/data/katina";
import { KatinaCardFace } from "@/components/CardSVG";
import { useTranslation } from "@/lib/i18n";
import { FortuneTeller } from "@/data/fortune-tellers";
import { getLocalizedName } from "@/lib/fortune-utils";
import FortuneTellerSelector from "@/components/Fortune/FortuneTellerSelector";
import CosmicButton from "@/components/Cosmic/CosmicButton";
import CosmicLoader from "@/components/Cosmic/CosmicLoader";

export default function KatinaPage() {
  const { t, language } = useTranslation();
  const [question, setQuestion] = useState("");
  const [shuffledDeck, setShuffledDeck] = useState<typeof katinaCards>([]);
  const [selectedCards, setSelectedCards] = useState<typeof katinaCards>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"setup" | "teller-selection" | "picking" | "reading">("setup");
  const [selectedTeller, setSelectedTeller] = useState<FortuneTeller | null>(null);
  const cardCount = 5;

  const startSelection = () => {
    setPhase("teller-selection");
  };

  const startPicking = (teller: FortuneTeller) => {
    setSelectedTeller(teller);
    setResult(null); setSelectedCards([]);
    setShuffledDeck([...katinaCards].sort(() => Math.random() - 0.5));
    setPhase("picking");
  };

  const pickCard = (card: typeof katinaCards[0]) => {
    if (selectedCards.length >= cardCount) return;
    if (selectedCards.some(c => c.id === card.id)) return;
    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);
    if (newSelected.length === cardCount) setPhase("reading");
  };

  const getReading = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/divination", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "katina", 
          cards: selectedCards.map(c => ({ name: getLocalizedName(c, language), meaning: c.meaning })), 
          question, 
          language,
          persona: selectedTeller ? { name: selectedTeller.name, style: selectedTeller.style } : undefined
        }) });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="cosmic-gradient min-h-screen">
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4 float">🌸</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">{t("fortune.katina.title")}</span></h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("fortune.katina.desc")}</p>
        </div>
      </section>

      {/* Setup */}
      {phase === "setup" && (
        <section className="pb-6 px-4"><div className="max-w-3xl mx-auto space-y-4">
          <div className="glass-card p-6">
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">{t("fortune.common.question.label")}</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder={t("fortune.common.question.placeholder")} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 text-sm resize-none" rows={2} />
          </div>
          <CosmicButton 
            fullWidth 
            onClick={startSelection}
            icon="🏵️"
          >
            {t("fortune.common.start")}
          </CosmicButton>
        </div></section>
      )}

      {/* Teller Selection Phase */}
      {phase === "teller-selection" && (
        <section className="pb-8 px-4 fade-in-up">
          <div className="max-w-6xl mx-auto">
            <FortuneTellerSelector 
              onSelect={(teller) => startPicking(teller)} 
              selectedId={selectedTeller?.id} 
            />
          </div>
        </section>
      )}

      {/* Picking Phase */}
      {phase === "picking" && (
        <section className="pb-8 px-4 fade-in-up">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6 px-4">
              <h2 className="text-xl font-bold text-white mb-2">
                {t("fortune.common.picking", { count: cardCount.toString(), current: selectedCards.length.toString(), total: cardCount.toString() })}
              </h2>
              <p className="text-gray-400 text-sm">{t("fortune.selection.subtitle")}</p>
            </div>

            {selectedCards.length > 0 && (
              <div className="flex gap-3 justify-center flex-wrap mb-6">
                {selectedCards.map((card, idx) => (
                  <div key={idx} className="w-14 h-20 rounded-lg overflow-hidden border-2 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                    <KatinaCardFace name={getLocalizedName(card, language)} theme={card.theme} id={card.id} className="w-full h-full" />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-[repeat(13,minmax(0,1fr))] gap-2">
              {shuffledDeck.map((card) => {
                const isSelected = selectedCards.some(c => c.id === card.id);
                return (
                  <div key={card.id} onClick={() => !isSelected && pickCard(card)}
                    className={`aspect-[2/3] rounded-lg overflow-hidden border cursor-pointer transition-all duration-300
                      ${isSelected
                        ? "border-pink-500/50 opacity-20 cursor-default"
                        : "border-pink-500/20 lg:hover:border-pink-400/60 lg:hover:scale-110 lg:hover:shadow-lg lg:hover:shadow-pink-500/20"
                      }`}>
                    {isSelected ? (
                      <div className="w-full h-full bg-pink-900/40 flex items-center justify-center">
                        <span className="text-pink-400 text-lg">✓</span>
                      </div>
                    ) : (
                      <img src="/cards/katina-back.png" alt="Katina" className="w-full h-full object-cover" />
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
            <h2 className="text-xl font-bold text-white text-center mb-6">{t("fortune.common.selected")} ✨</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-3xl mx-auto mb-8">
              {selectedCards.map((card, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-pink-500/30 text-center fade-in-up bg-gradient-to-b from-pink-950/80 to-gray-900/60"
                  style={{ animationDelay: `${idx * 0.15}s` }}>
                  <div className="w-full aspect-[2/3] overflow-hidden">
                    <KatinaCardFace name={getLocalizedName(card, language)} theme={card.theme} id={card.id} className="w-full h-full" />
                  </div>
                  <div className="p-2 bg-black/20 border-t border-pink-500/20">
                    <p className="text-white text-sm font-bold">{getLocalizedName(card, language)}</p>
                    <p className="text-gray-400 text-xs mt-1">{card.meaning}</p>
                  </div>
                </div>
              ))}
            </div>

            {!result && (
              <div className="max-w-3xl mx-auto">
                {loading ? (
                  <CosmicLoader label={t("fortune.reading.loading", { name: selectedTeller?.name || "" })} />
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-pink-400 text-sm font-bold">{t("fortune.reading.ready", { name: selectedTeller?.name || "" })}</p>
                    </div>
                    <CosmicButton 
                      fullWidth 
                      onClick={getReading} 
                      disabled={loading}
                      icon="✨"
                    >
                      {t("fortune.reading.btn")}
                    </CosmicButton>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Result */}
      {result && (
        <section className="pb-20 px-4"><div className="max-w-3xl mx-auto space-y-6 fade-in-up">
          <div className="glass-card p-8 glow relative overflow-hidden">
            {/* Persona Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-pink-500/30">
                {selectedTeller && <img src={selectedTeller.avatar} alt={selectedTeller.name} className="w-full h-full object-cover" />}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{t("fortune.reading.header", { name: selectedTeller?.name || "" })}</h3>
                <p className="text-pink-400 text-xs font-medium uppercase tracking-widest">{selectedTeller?.title}</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-4">{result.title}</h3>
            {result.cards?.map((c: any, i: number) => (
              <div key={i} className="mb-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-pink-300 font-bold text-sm mb-1">{c.name}</p>
                <p className="text-gray-300 text-sm">{c.interpretation}</p>
              </div>
            ))}
            <div className="mt-4 p-4 bg-pink-900/20 rounded-xl border border-pink-500/20">
              <h4 className="text-lg font-bold text-white mb-2">🌟 {t("fortune.reading.synthesis")}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{result.synthesis}</p>
            </div>
            {result.advice && (
              <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-pink-400 font-semibold text-sm">💡 {t("fortune.reading.advice")}: </span>
                <span className="text-gray-300 text-sm">{result.advice}</span>
              </div>
            )}
          </div>
          <CosmicButton 
            fullWidth 
            variant="secondary"
            onClick={() => { setPhase("setup"); setSelectedCards([]); setResult(null); }}
            icon="↺"
          >
            {t("fortune.common.result.retry")}
          </CosmicButton>
        </div></section>
      )}
    </div>
  );
}
