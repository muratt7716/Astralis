"use client";
import { zodiacSigns } from "@/data/zodiac";
import ZodiacCard from "@/components/ZodiacCard";
import { useTranslation } from "@/lib/i18n";

export default function BurclarPage() {
  const { t } = useTranslation();

  const elements = [
    { name: t("element.at_es"), emoji: "🔥", signs: zodiacSigns.filter(s => s.element === "Ateş"), color: "from-red-500/20 to-orange-500/20 border-red-500/20" },
    { name: t("element.toprak"), emoji: "🌍", signs: zodiacSigns.filter(s => s.element === "Toprak"), color: "from-green-500/20 to-emerald-500/20 border-green-500/20" },
    { name: t("element.hava"), emoji: "💨", signs: zodiacSigns.filter(s => s.element === "Hava"), color: "from-sky-500/20 to-cyan-500/20 border-sky-500/20" },
    { name: t("element.su"), emoji: "💧", signs: zodiacSigns.filter(s => s.element === "Su"), color: "from-blue-500/20 to-indigo-500/20 border-blue-500/20" },
  ];

  return (
    <div className="cosmic-gradient min-h-screen">
      {/* Header */}
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t("zodiac.signs")}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t("home.zodiac.subtitle")}
          </p>
        </div>
      </section>

      {/* All Signs Grid */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {zodiacSigns.map((sign, i) => (
              <div key={sign.id} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <ZodiacCard sign={sign} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Elements Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">{t("zodiac.by_elements")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {elements.map((el) => (
              <div key={el.name} className={`glass-card p-6 bg-gradient-to-br ${el.color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{el.emoji}</span>
                  <h3 className="text-xl font-bold text-white">{t("element.group", { name: el.name })}</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {el.signs.map((sign) => (
                    <ZodiacCard key={sign.id} sign={sign} compact />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
