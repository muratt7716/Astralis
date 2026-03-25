"use client";

import { useState } from "react";
import Link from "next/link";
import { zodiacSigns, getZodiacByDate } from "@/data/zodiac";
import { useTranslation } from "@/lib/i18n";
import Logo from "@/components/Cosmic/Logo";

export default function HesaplayiciPage() {
  const { t } = useTranslation();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [result, setResult] = useState<typeof zodiacSigns[0] | null>(null);
  const [error, setError] = useState("");

  const elementTrMap: Record<string, string> = { "Ateş": "element.fire", "Toprak": "element.earth", "Hava": "element.air", "Su": "element.water" };
  const qualityDesc: Record<string, string> = {
    "Öncü": "Lider ruhlu, başlatıcı ve aksiyon odaklı enerji.",
    "Sabit": "Kararlı, dayanıklı, güvenilir ve sürdürücü enerji.",
    "Değişken": "Uyumlu, esnek, çok yönlü ve değişime açık enerji."
  };

  const elementThemes: Record<string, { gradient: string, border: string, text: string, svg: string }> = {
    "Ateş": { gradient: "from-orange-950/80 to-[#2a0800]", border: "border-orange-500/30", text: "text-orange-400", svg: "#f97316" },
    "Toprak": { gradient: "from-emerald-950/80 to-[#021f10]", border: "border-emerald-500/30", text: "text-emerald-400", svg: "#10b981" },
    "Hava": { gradient: "from-cyan-950/80 to-[#02182b]", border: "border-cyan-500/30", text: "text-cyan-400", svg: "#06b6d4" },
    "Su": { gradient: "from-indigo-950/80 to-[#0a0524]", border: "border-indigo-500/30", text: "text-indigo-400", svg: "#6366f1" },
  };

  const handleCalculate = () => {
    if (!day || !month) {
      setError(t("calc.error.empty"));
      return;
    }
    setError("");
    const sign = getZodiacByDate(parseInt(month), parseInt(day));
    if (sign) {
      setResult(sign);
    } else {
      setError(t("calc.error.invalid"));
    }
  };

  const monthsList = [
    t("month.jan"), t("month.feb"), t("month.mar"), t("month.apr"), 
    t("month.may"), t("month.jun"), t("month.jul"), t("month.aug"), 
    t("month.sep"), t("month.oct"), t("month.nov"), t("month.dec")
  ];

  return (
    <div className="cosmic-gradient min-h-screen">
      {/* Header */}
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Logo size={64} className="mx-auto mb-4 float" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t("calc.title")}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t("calc.subtitle")}
          </p>
        </div>
      </section>

      {/* Simple Form */}
      <section className="pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-white mb-6">📅 {t("calc.form.title")}</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">{t("calc.form.day")}</label>
                <select
                  value={day}
                  onChange={(e) => { setDay(e.target.value); setResult(null); }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0a0a1a]">{t("calc.form.day")}</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} className="bg-[#0a0a1a]">{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">{t("calc.form.month")}</label>
                <select
                  value={month}
                  onChange={(e) => { setMonth(e.target.value); setResult(null); }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0a0a1a]">{t("calc.form.month")}</option>
                  {monthsList.map((m, i) => (
                    <option key={i} value={i + 1} className="bg-[#0a0a1a]">{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleCalculate}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
            >
              ⭐ {t("calc.form.btn")}
            </button>
          </div>
        </div>
      </section>

      {/* Quick Result */}
      {result && (
        <section className="pb-8 px-4 fade-in-up">
          <div className="max-w-2xl mx-auto">
            {(() => {
              const theme = elementThemes[result.element] || elementThemes["Ateş"];
              return (
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} border ${theme.border} p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)]`}>
                  
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute -right-20 -top-20 w-96 h-96 animate-spin-slow">
                      <circle cx="100" cy="100" r="80" fill="none" stroke={theme.svg} strokeWidth="0.5" strokeDasharray="4 4" />
                      <circle cx="100" cy="100" r="60" fill="none" stroke={theme.svg} strokeWidth="1" />
                      <circle cx="100" cy="100" r="40" fill="none" stroke={theme.svg} strokeWidth="0.5" strokeDasharray="2 6" />
                      <path d="M100 0 L100 200 M0 100 L200 100" stroke={theme.svg} strokeWidth="0.5" />
                    </svg>
                  </div>

                  <div className="relative z-10 text-center">
                    <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center bg-black/40 border ${theme.border} backdrop-blur-md mb-6 shadow-inner`}>
                      <span className="text-7xl">{result.symbol}</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold font-serif tracking-wide text-white mb-2">{t(`zodiac.${result.id}`)}</h2>
                    <p className="text-gray-400 font-medium tracking-widest uppercase mb-8">{result.dateRange}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      {/* Element Badge */}
                      <div className="flex flex-col items-center p-4 rounded-2xl bg-black/30 border border-white/5 backdrop-blur-sm">
                        <span className="text-2xl mb-2">{result.elementEmoji}</span>
                        <span className="text-sm text-gray-400 uppercase tracking-wider text-xs mb-1">Element</span>
                        <span className={`font-bold ${theme.text}`}>{t(elementTrMap[result.element] || "element.fire")}</span>
                      </div>
                      
                      {/* Planet Badge */}
                      <div className="flex flex-col items-center p-4 rounded-2xl bg-black/30 border border-white/5 backdrop-blur-sm">
                        <span className="text-2xl mb-2">{result.rulingPlanetEmoji}</span>
                        <span className="text-sm text-gray-400 uppercase tracking-wider text-xs mb-1">Yönetici</span>
                        <span className={`font-bold text-white`}>{result.rulingPlanet}</span>
                      </div>

                      {/* Quality/Modality Badge */}
                      <div className="flex flex-col items-center p-4 rounded-2xl bg-black/30 border border-white/5 backdrop-blur-sm group relative">
                        <span className="text-2xl mb-2">🎯</span>
                        <span className="text-sm text-gray-400 uppercase tracking-wider text-xs mb-1">Nitelik</span>
                        <span className={`font-bold text-white cursor-help border-b border-dashed border-gray-500`}>{result.quality}</span>
                        
                        {/* Custom Tooltip via CSS */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-[#0a0a1a] border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 text-xs text-gray-300 leading-relaxed">
                          {qualityDesc[result.quality]}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-solid border-t-[#0a0a1a] border-t-8 border-x-transparent border-x-8 border-b-0" />
                        </div>
                      </div>
                    </div>

                    {/* Modality Explanation Text (Always visible for clarity) */}
                    <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
                      <span className="opacity-60 block mb-1">Astrolojik Niteliği ({result.quality}):</span>
                      {qualityDesc[result.quality]}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        href={`/burclar/${result.id}`}
                        className={`px-8 py-3.5 rounded-xl bg-gradient-to-r ${theme.gradient.replace('/80', '')} border ${theme.border} text-white font-bold hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all`}
                      >
                        {t(`zodiac.${result.id}`)} {t("zodiac.details")} →
                      </Link>
                      <Link
                        href="/dogum-haritasi"
                        className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                      >
                        <Logo size={16} className="inline-block mr-2" />
                        {t("nav.birthchart")}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* CTA to Birth Chart */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-white mb-3">
                  {t("home.featured.title.1")} {t("home.featured.title.2")}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {t("home.featured.desc")}
                </p>
                <Link
                  href="/dogum-haritasi"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all text-sm"
                >
                  🌟 {t("home.featured.cta")}
                </Link>
              </div>
              <div className="flex-shrink-0">
                <Logo size={80} className="float" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
