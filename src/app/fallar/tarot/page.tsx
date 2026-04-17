"use client";

import { useState } from "react";
import { tarotCards, tarotSpreads } from "@/data/tarot";
import { tarotImageMap } from "@/data/card-images";
import { useTranslation } from "@/lib/i18n";
import { FortuneTeller } from "@/data/fortune-tellers";
import { getLocalizedName } from "@/lib/fortune-utils";
import FortuneTellerSelector from "@/components/Fortune/FortuneTellerSelector";
import { GlassButton } from "@/components/ui/glass-button";
import CosmicLoader from "@/components/Cosmic/CosmicLoader";

interface DrawnCard {
  id: number;
  name: string;
  emoji: string;
  upright: string;
  reversedMeaning: string;
  isReversed: boolean;
  position: string;
  suit?: string;
  arcana: "major" | "minor";
}

const suitColors: Record<string, string> = {
  cups: "from-blue-800/40 to-blue-950/60 border-blue-500/40",
  wands: "from-orange-800/40 to-orange-950/60 border-orange-500/40",
  swords: "from-cyan-800/40 to-cyan-950/60 border-cyan-500/40",
  pentacles: "from-yellow-800/40 to-yellow-950/60 border-yellow-500/40",
};

export default function TarotPage() {
  const { t, language } = useTranslation();
  const [spread, setSpread] = useState("single");
  const [question, setQuestion] = useState("");
  const [allCards, setAllCards] = useState<typeof tarotCards>([]);
  const [selectedCards, setSelectedCards] = useState<DrawnCard[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"setup" | "teller-selection" | "picking" | "reading">("setup");
  const [selectedTeller, setSelectedTeller] = useState<FortuneTeller | null>(null);

  const selectedSpread = tarotSpreads.find(s => s.id === spread)!;

  const startSelection = () => {
    setPhase("teller-selection");
  };

  const startPicking = (teller: FortuneTeller) => {
    setSelectedTeller(teller);
    setResult(null);
    setSelectedCards([]);
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
    setAllCards(shuffled);
    setPhase("picking");
  };

  const positions = spread === "three"
    ? [t("fortune.tarot.pos.past"), t("fortune.tarot.pos.present"), t("fortune.tarot.pos.future")]
    : spread === "celtic"
    ? [
        t("fortune.tarot.pos.situation"), t("fortune.tarot.pos.obstacle"), t("fortune.tarot.pos.subconscious"),
        t("fortune.tarot.pos.past"), t("fortune.tarot.pos.potential"), t("fortune.tarot.pos.future_near"),
        t("fortune.tarot.pos.attitude"), t("fortune.tarot.pos.environment"), t("fortune.tarot.pos.hopes"), t("fortune.tarot.pos.outcome")
      ]
    : [t("fortune.tarot.pos.message")];

  const pickCard = (card: typeof tarotCards[0]) => {
    if (selectedCards.length >= selectedSpread.count) return;
    if (selectedCards.some(c => c.id === card.id)) return;
    const idx = selectedCards.length;
    const drawn: DrawnCard = {
      id: card.id,
      name: card.name,
      emoji: card.emoji,
      upright: card.upright,
      reversedMeaning: card.reversedMeaning,
      isReversed: Math.random() < 0.3,
      position: positions[idx] || `${t("fortune.common.card")} ${idx + 1}`,
      suit: card.suit,
      arcana: card.arcana,
    };
    const newSelected = [...selectedCards, drawn];
    setSelectedCards(newSelected);
    if (newSelected.length === selectedSpread.count) {
      setPhase("reading");
    }
  };

  const getInterpretation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/divination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tarot",
          cards: selectedCards.map(c => ({
            name: c.name,
            meaning: c.isReversed ? c.reversedMeaning : c.upright,
            reversed: c.isReversed,
          })),
          question,
          language,
          persona: selectedTeller ? { name: selectedTeller.name, style: selectedTeller.style } : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="cosmic-gradient min-h-screen">
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4 float">🃏</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t("fortune.tarot.title")}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("fortune.tarot.full_desc")}</p>
        </div>
      </section>

      {/* Setup Phase */}
      {phase === "setup" && (
        <section className="pb-6 px-4">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="glass-card p-6">
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">{t("fortune.tarot.spread_type")}</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                {tarotSpreads.map(s => (
                  <button key={s.id} onClick={() => setSpread(s.id)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${spread === s.id ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                    {t(s.nameKey)} ({s.count})
                  </button>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-2">{t(selectedSpread.descKey)}</p>
            </div>
            <div className="glass-card p-6">
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">{t("fortune.common.question.label")} ({t("chart.optional")})</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder={t("fortune.common.question.placeholder")}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 text-sm resize-none" rows={2} />
            </div>
            <GlassButton 
              fullWidth 
              onClick={startSelection}
            >
              {t("fortune.common.start")}
            </GlassButton>
          </div>
        </section>
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

      {/* Card Picking Phase */}
      {phase === "picking" && (
        <section className="pb-8 px-4 fade-in-up">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6 px-4">
              <h2 className="text-xl font-bold text-white mb-2">
                {t("fortune.common.picking", { count: selectedSpread.count.toString(), current: selectedCards.length.toString(), total: selectedSpread.count.toString() })}
              </h2>
              <p className="text-gray-400 text-sm max-w-lg mx-auto">{t("fortune.selection.subtitle")}</p>
            </div>

            {/* Selected cards preview */}
            {selectedCards.length > 0 && (
              <div className="flex gap-3 justify-center mb-6 flex-wrap">
                {selectedCards.map((card, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`w-16 h-24 rounded-lg border-2 overflow-hidden ${card.isReversed ? "border-red-500/50" : "border-purple-500/50"}`}>
                      {tarotImageMap[card.id] ? (
                        <img src={tarotImageMap[card.id]} alt={card.name} className={`w-full h-full object-cover ${card.isReversed ? "rotate-180" : ""}`} />
                      ) : (
                        <span className={`text-xl ${card.isReversed ? "rotate-180 inline-block" : ""}`}>{card.emoji}</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-[10px] mt-1">{card.position}</p>
                  </div>
                ))}
              </div>
            )}

            {/* All cards grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-10 gap-2">
              {allCards.map((card) => {
                const isSelected = selectedCards.some(c => c.id === card.id);
                return (
                  <div key={card.id} onClick={() => !isSelected && pickCard(card)}
                    className={`relative aspect-[2/3] rounded-lg overflow-hidden border cursor-pointer transition-all duration-300
                      ${isSelected
                        ? "border-purple-500/50 opacity-20 cursor-default"
                        : "border-purple-500/20 lg:hover:border-purple-400/60 lg:hover:scale-110 lg:hover:shadow-lg lg:hover:shadow-purple-500/20"
                      }`}>
                    {isSelected ? (
                      <div className="w-full h-full bg-purple-900/40 flex items-center justify-center">
                        <span className="text-purple-400 text-lg">✓</span>
                      </div>
                    ) : (
                      <img src="/cards/tarot-back.png" alt="Tarot" className="w-full h-full object-cover" />
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
            <div className={`grid gap-4 ${selectedCards.length <= 3 ? "grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"}`}>
              {selectedCards.map((card, idx) => {
                const colorClass = card.suit ? suitColors[card.suit] : "from-violet-800/40 to-violet-950/60 border-violet-500/40";
                return (
                  <div key={idx} className={`rounded-xl border text-center bg-gradient-to-b ${card.isReversed ? "from-red-900/30 to-gray-900/40 border-red-500/30" : colorClass} overflow-hidden fade-in-up`}
                    style={{ animationDelay: `${idx * 0.15}s` }}>
                    {tarotImageMap[card.id] && (
                      <div className={`w-full overflow-hidden ${card.isReversed ? "rotate-180" : ""}`}>
                        <img src={tarotImageMap[card.id]} alt={card.name} className="w-full h-auto" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-gray-400 text-xs uppercase mb-1">{card.position}</p>
                      <p className="text-white text-sm font-bold">{getLocalizedName(card, language)}</p>
                      {card.isReversed && <p className="text-red-400 text-xs font-medium">↻ {t("fortune.tarot.reversed")}</p>}
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        {language === "tr" ? (card.isReversed ? card.reversedMeaning : card.upright) : t("fortune.tarot.click_to_read")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {!result && (
              <div className="max-w-3xl mx-auto mt-8">
                {loading ? (
                  <CosmicLoader label={t("fortune.reading.loading", { name: selectedTeller?.name || "" })} />
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-purple-400 text-sm font-bold">{t("fortune.reading.ready", { name: selectedTeller?.name || "" })}</p>
                    </div>
                    <GlassButton 
                      fullWidth 
                      onClick={getInterpretation} 
                      disabled={loading}
                    >
                      {t("fortune.reading.btn")}
                    </GlassButton>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Result */}
      {result && (
        <section className="pb-20 px-4">
          <div className="max-w-3xl mx-auto space-y-6 fade-in-up">
            <div className="glass-card p-8 relative overflow-hidden glow">
              {/* Persona Header */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500/30">
                  {selectedTeller && <img src={selectedTeller.avatar} alt={selectedTeller.name} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{t("fortune.reading.header", { name: selectedTeller?.name || "" })}</h3>
                  <p className="text-purple-400 text-xs font-medium uppercase tracking-widest">{selectedTeller?.title}</p>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <h3 className="text-2xl font-bold text-white mb-4">{result.title}</h3>
              {result.cards?.map((card: any, i: number) => (
                <div key={i} className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-purple-300 font-bold text-sm mb-1">{card.position}: {card.name}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{card.interpretation}</p>
                </div>
              ))}
              <div className="mt-6 p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
                <h4 className="text-lg font-bold text-white mb-2">🌟 {t("fortune.reading.synthesis")}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{result.synthesis}</p>
              </div>
              {result.advice && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-pink-400 font-semibold text-sm">💡 {t("fortune.reading.advice")}: </span>
                  <span className="text-gray-300 text-sm">{result.advice}</span>
                </div>
              )}
            </div>
            <GlassButton 
              fullWidth 
              variant="secondary"
              onClick={() => { setPhase("setup"); setSelectedCards([]); setResult(null); }}
            >
              {t("fortune.common.result.retry")}
            </GlassButton>
          </div>
        </section>
      )}
    </div>
  );
}
