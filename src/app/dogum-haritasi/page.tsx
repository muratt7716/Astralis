"use client";

import { useState, useMemo } from "react";
import { turkishCities } from "@/data/cities";
import { countries } from "@/data/countries";
import type { BirthChart } from "@/lib/astrology";
import { useTranslation } from "@/lib/i18n";
import BirthChartWheel from "@/components/BirthChartWheel";
import CosmicInput from "@/components/Cosmic/CosmicInput";
import CosmicSelect from "@/components/Cosmic/CosmicSelect";
import CosmicButton from "@/components/Cosmic/CosmicButton";
import CosmicLoader from "@/components/Cosmic/CosmicLoader";
import PlanetIcon from "@/components/PlanetIcon";
import Logo from "@/components/Cosmic/Logo";

export default function DogumHaritasiPage() {
  const { t, language } = useTranslation();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [country, setCountry] = useState("TR");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [result, setResult] = useState<BirthChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "planets" | "houses" | "aspects" | "transits">("overview");
  const [transitInterpretation, setTransitInterpretation] = useState<any>(null);
  const [transitLoading, setTransitLoading] = useState(false);

  const isTurkey = country === "TR";
  const selectedCountry = useMemo(() => countries.find(c => c.code === country), [country]);
  const selectedCity = useMemo(() => turkishCities.find(c => c.name === city), [city]);
  const districts = useMemo(() => selectedCity?.districts || [], [selectedCity]);

  const handleCalculate = async () => {
    if (!day || !month || !year) { setError("Lütfen doğum tarihinizi eksiksiz girin."); return; }
    if (!hour || minute === "") { setError("Doğum saatinizi ve dakikasını girin."); return; }
    if (isTurkey && !city) { setError("Doğum yerinizi seçin."); return; }
    if (!isTurkey && !manualCity) { setError("Doğum şehrinizi girin."); return; }

    setLoading(true); setError(""); setResult(null);
    try {
      const cityData = isTurkey ? turkishCities.find(c => c.name === city) : null;
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(year), month: parseInt(month), day: parseInt(day),
          hour: parseInt(hour), minute: parseInt(minute),
          latitude: cityData?.lat || 39.9334,
          longitude: cityData?.lng || 32.8597,
          utcOffset: selectedCountry?.utcOffset ?? 3,
        }),
      });
      const data = await response.json();
      if (data.success) { setResult(data.data); setActiveTab("overview"); }
      else { setError(data.error || "Bir hata oluştu."); }
    } catch { setError("Bağlantı hatası."); }
    finally { setLoading(false); }
  };

  const harmonyColor = (h: string) =>
    h === "positive" ? "text-green-400 bg-green-500/10 border-green-500/20" :
    h === "negative" ? "text-red-400 bg-red-500/10 border-red-500/20" :
    "text-blue-400 bg-blue-500/10 border-blue-500/20";

  return (
    <div className="cosmic-gradient min-h-screen">
      {/* Header */}
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Logo size={80} className="mx-auto mb-4 float" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t("chart.title")}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t("chart.subtitle")}
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8">
            {/* Date */}
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">📅 {t("chart.date")}</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <CosmicSelect
                label={t("chart.day")}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                options={[
                  { value: "", label: t("chart.day") },
                  ...Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }))
                ]}
              />
              <CosmicSelect
                label={t("chart.month")}
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                options={[
                  { value: "", label: t("chart.month") },
                  ...[t("month.jan"), t("month.feb"), t("month.mar"), t("month.apr"), t("month.may"), t("month.jun"), t("month.jul"), t("month.aug"), t("month.sep"), t("month.oct"), t("month.nov"), t("month.dec")].map((m, i) => ({ value: (i + 1).toString(), label: m }))
                ]}
              />
              <CosmicSelect
                label={t("chart.year")}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                options={[
                  { value: "", label: t("chart.year") },
                  ...Array.from({ length: 80 }, (_, i) => ({ value: (2026 - i).toString(), label: (2026 - i).toString() }))
                ]}
              />
            </div>

            {/* Time */}
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">🕐 {t("chart.time")} <span className="text-red-400 text-xs font-normal">({t("chart.required")})</span></h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <CosmicSelect
                label={t("chart.hour")}
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                options={[
                  { value: "", label: t("chart.hour") },
                  ...Array.from({ length: 24 }, (_, i) => ({ value: i.toString(), label: i.toString().padStart(2, "0") }))
                ]}
              />
              <CosmicSelect
                label={t("chart.minute")}
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                options={[
                  { value: "", label: t("chart.minute") },
                  ...Array.from({ length: 60 }, (_, i) => ({ value: i.toString(), label: i.toString().padStart(2, "0") }))
                ]}
              />
            </div>

            {/* Location */}
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">📍 {t("chart.location")} <span className="text-red-400 text-xs font-normal">({t("chart.required")})</span></h2>

            {/* Country */}
            <div className="mb-4">
              <CosmicSelect
                label={t("chart.country")}
                value={country}
                onChange={(e) => { setCountry(e.target.value); setCity(""); setDistrict(""); setManualCity(""); }}
                options={countries.map(c => ({ value: c.code, label: c.name }))}
              />
            </div>

            {/* City/District - for Turkey */}
            {isTurkey ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <CosmicSelect
                  label={t("chart.city")}
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setDistrict(""); }}
                  options={[
                    { value: "", label: `${t("chart.city")}...` },
                    ...turkishCities.map(c => ({ value: c.name, label: c.name }))
                  ]}
                />
                <CosmicSelect
                  label={`${t("chart.district")} (${t("chart.optional")})`}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={districts.length === 0}
                  options={[
                    { value: "", label: districts.length === 0 ? "..." : `${t("chart.district")}...` },
                    ...districts.map(d => ({ value: d, label: d }))
                  ]}
                />
              </div>
            ) : (
              <div className="mb-6">
                <CosmicInput
                  label={t("chart.city")}
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  placeholder={`${t("chart.city")}...`}
                />
              </div>
            )}

            {isTurkey && selectedCity && (
              <div className="mb-6 p-3 rounded-lg bg-white/3 border border-white/5 text-gray-500 text-xs">
                📍 Koordinatlar: {selectedCity.lat.toFixed(4)}°N, {selectedCity.lng.toFixed(4)}°E | Saat dilimi: UTC+{selectedCountry?.utcOffset}
              </div>
            )}
            {!isTurkey && selectedCountry && (
              <div className="mb-6 p-3 rounded-lg bg-white/3 border border-white/5 text-gray-500 text-xs">
                🌍 {selectedCountry.name} | Saat dilimi: UTC{selectedCountry.utcOffset >= 0 ? "+" : ""}{selectedCountry.utcOffset}
              </div>
            )}

            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

            <CosmicButton 
              fullWidth 
              onClick={handleCalculate} 
              disabled={loading}
            >
              {loading ? t("chart.calculating") : t("chart.calculate")}
            </CosmicButton>
          </div>

          {loading && (
            <div className="mt-12 fade-in">
              <CosmicLoader label={t("chart.calculating")} />
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      {result && (
        <section className="pb-20 px-4">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Birth Info */}
            <div className="text-center fade-in-up">
              <p className="text-gray-500 text-sm">
                📍 {selectedCountry?.name}{isTurkey ? `, ${city}` : (manualCity ? `, ${manualCity}` : "")}{district ? ` / ${district}` : ""} — {day}/{month}/{year}, {hour?.toString().padStart(2, "0")}:{minute?.toString().padStart(2, "0")}
              </p>
            </div>

            {/* Big Three */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="glass-card p-6 fade-in-up group hover:border-amber-500/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/5 border border-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                    <PlanetIcon name="Sun" size={40} />
                  </div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">{t("chart.sun")}</p>
                  <p className="text-2xl font-bold gradient-text leading-tight">{t(`zodiac.${result.sunSign.id}`)}</p>
                  <p className="text-gray-500 text-xs mt-1">{result.sunSign.degree}°</p>
                </div>
              </div>
              <div className="glass-card p-6 fade-in-up-delay-1 group hover:border-blue-500/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500/5 border border-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                    <PlanetIcon name="Moon" size={40} />
                  </div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">{t("chart.moon")}</p>
                  <p className="text-2xl font-bold gradient-text leading-tight">{t(`zodiac.${result.moonSign.id}`)}</p>
                  <p className="text-gray-500 text-xs mt-1">{result.moonSign.degree}°</p>
                </div>
              </div>
              <div className="glass-card p-6 fade-in-up-delay-2 group hover:border-purple-500/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/5 border border-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-4xl">⬆️</span>
                  </div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">{t("chart.rising")}</p>
                  <p className="text-2xl font-bold gradient-text leading-tight">{t(`zodiac.${result.risingSign.id}`)}</p>
                  <p className="text-gray-500 text-xs mt-1">{result.risingSign.degree}°</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-2 flex-wrap fade-in-up-delay-3">
              {([
                { key: "overview", label: `📊 ${t("chart.overview")}` },
                { key: "planets", label: `🪐 ${t("chart.planets")}` },
                { key: "houses", label: `🏠 ${t("chart.houses")}` },
                { key: "aspects", label: `🔗 ${t("chart.aspects")}` },
                { key: "transits", label: `✨ Canlı Gökyüzü` },
              ] as const).map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6 fade-in-up">
                
                {/* Zodiac Wheel Visualization */}
                <div className="glass-card p-6 overflow-hidden">
                  <h3 className="text-xl font-bold text-white mb-2 text-center text-gradient">Kişisel Zodyak Çarkınız</h3>
                  <p className="text-gray-400 text-sm text-center mb-6 max-w-2xl mx-auto">
                    Bu çark, tam olarak doğduğunuz dakika ve koordinatta gökyüzünün nasıl göründüğünün 360 derecelik haritasıdır. Gezegenlerin dizilimi, sizin parmak iziniz kadar benzersiz olan kozmik potansiyelinizi yansıtır.
                  </p>
                  <BirthChartWheel chart={result} />
                </div>

                {/* Planet Summary Table */}
                <div className="glass-card p-6 overflow-x-auto">
                  <h3 className="text-lg font-bold text-white mb-4">🪐 {t("chart.planets")}</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="pb-3 text-gray-500 font-medium">{t("chart.planets")?.replace(/s$/, "") || "Planet"}</th>
                        <th className="pb-3 text-gray-500 font-medium">{t("nav.zodiac")?.replace(/lar$/, "") || "Sign"}</th>
                        <th className="pb-3 text-gray-500 font-medium">°</th>
                        <th className="pb-3 text-gray-500 font-medium hidden md:table-cell">Etki / Effect</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.planetPositions.map((pos) => (
                        <tr key={pos.planet} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                          <td className="py-4 text-white">
                            <div className="flex items-center gap-3">
                              <PlanetIcon name={pos.planet} size={24} className="group-hover:scale-110 transition-transform" />
                              <span className="font-medium">{pos.planet}</span>
                            </div>
                          </td>
                          <td className="py-4 text-amber-400 font-medium">{pos.sign}</td>
                          <td className="py-4 text-gray-400">{pos.degree}°</td>
                          <td className="py-4 text-gray-500 hidden md:table-cell text-xs leading-relaxed">{pos.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Aspect Summary */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-4">🔗 {t("chart.aspects")} ({result.aspects.length})</h3>
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                      <p className="text-2xl font-bold text-green-400">{result.aspects.filter(a => a.harmony === "positive").length}</p>
                      <p className="text-gray-500 text-xs">+</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                      <p className="text-2xl font-bold text-red-400">{result.aspects.filter(a => a.harmony === "negative").length}</p>
                      <p className="text-gray-500 text-xs">-</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <p className="text-2xl font-bold text-blue-400">{result.aspects.filter(a => a.harmony === "neutral").length}</p>
                      <p className="text-gray-500 text-xs">=</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Planets Tab */}
            {activeTab === "planets" && (
              <div className="space-y-4 fade-in-up">
                <div className="glass-card p-6 mb-4 border-l-4 border-purple-500">
                  <h3 className="text-lg font-bold text-white mb-2">Gezegenler Ne Anlama Geliyor?</h3>
                  <p className="text-gray-400 text-sm">
                    Gezegenler, içinizdeki farklı "karakterleri" temsil eder. Güneş temel kimliğinizi, Ay duygusal ihtiyaçlarınızı, Merkür iletişim tarzınızı, Venüs nasıl sevdiğinizi ve Mars nasıl eyleme geçtiğinizi gösterir. Aşağıda her bir gezegenin haritanızda hangi burca yerleştiğini ve size nasıl bir enerji verdiğini görebilirsiniz.
                  </p>
                </div>
                {result.planetPositions.map((pos) => (
                  <div key={pos.planet} className="glass-card p-6 group lg:hover:border-white/20 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <PlanetIcon name={pos.planet} size={32} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <h3 className="text-white font-bold">{pos.planet}</h3>
                          <span className="text-amber-400 text-sm font-medium px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/15">
                            {pos.sign} {pos.degree}°
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{pos.meaning}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>Ekliptik: {pos.fullDegree}°</span>
                          {pos.retrograde && <span className="text-red-400">℞ Gerileyici</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Houses Tab */}
            {activeTab === "houses" && (
              <div className="space-y-3 fade-in-up">
                <div className="glass-card p-6 mb-4 border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold text-white mb-2">Hayat Alanlarınız (Evler)</h3>
                  <p className="text-gray-400 text-sm">
                    🏠 Doğum haritanız 12 farklı "Ev"e bölünmüştür. Her ev, kariyer, evlilik, para, sağlık gibi hayatınızın farklı bir sahnesini temsil eder. 1. Ev (Yükselen Burcunuz) dışarıya yansıttığınız maskedir. Evleri yöneten burçlar, o yaşam alanına nasıl yaklaştığınızı gösterir.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.houses.map((house) => (
                    <div key={house.house} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-purple-300 text-sm font-bold">
                            {house.house}
                          </span>
                          <span className="text-white font-medium text-sm">{house.house}. Ev</span>
                        </div>
                        <span className="text-amber-400 text-sm">{house.sign} {house.degree}°</span>
                      </div>
                      <p className="text-gray-500 text-xs">{house.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aspects Tab */}
            {activeTab === "aspects" && (
              <div className="space-y-3 fade-in-up">
                <div className="glass-card p-6 mb-4 border-l-4 border-pink-500">
                  <h3 className="text-lg font-bold text-white mb-2">Gezegenlerin Sohbeti (Açılar)</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    🔗 Gezegenler gökyüzünde dururken birbirlerine belirli geometrik açılar yaparlar. Bu açılar, içinizdeki farklı enerjilerin birbiriyle nasıl anlaştığını veya nasıl çatıştığını gösterir.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                     <li><strong className="text-green-400">Üçgen (△) & Altmışlık (⚹):</strong> Uyumlu ve akıcı enerjiler, doğal yeteneklerinizdir.</li>
                     <li><strong className="text-red-400">Kare (□) & Karşıtlık (☍):</strong> Zorlayıcı ama sizi büyütecek ve aksiyona geçirecek gerilimlerdir.</li>
                     <li><strong className="text-blue-400">Kavuşum (☌):</strong> İki enerjinin tek bir güç olarak birleşmesidir. Oldukça yoğundur.</li>
                  </ul>
                </div>
                {result.aspects.length === 0 ? (
                  <div className="glass-card p-6 text-center text-gray-500">Belirgin açı bulunamadı.</div>
                ) : (
                  result.aspects.map((aspect, i) => (
                    <div key={i} className={`glass-card p-4 border ${harmonyColor(aspect.harmony).split(" ").filter(c => c.startsWith("border-")).join(" ")}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg ${harmonyColor(aspect.harmony).split(" ").filter(c => c.startsWith("text-")).join(" ")}`}>
                            {aspect.typeEmoji}
                          </span>
                          <span className="text-white text-sm font-medium">{aspect.planet1} — {aspect.planet2}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${harmonyColor(aspect.harmony)}`}>
                            {aspect.type}
                          </span>
                          <span className="text-gray-600 text-xs">{aspect.angle}° (orb: {aspect.orb}°)</span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs">{aspect.description}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Transits Tab */}
            {activeTab === "transits" && (
              <div className="space-y-6 fade-in-up">
                <div className="glass-card p-6 border-l-4 border-amber-500">
                  <h3 className="text-xl font-bold text-white mb-2">Bugünün Etkileri (Canlı Gökyüzü / Transitler)</h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-2xl">
                    Siz doğduğunuz andan itibaren gökyüzündeki gezegenler dönmeye devam etti. "Transitler", şu an gökyüzünde hareket eden güncel gezegenlerin, sizin sabit doğum haritanızla yaptığı anlık etkileşimlerdir. 
                    Bu liste, bugünün enerjilerinin SİZE ÖZEL nasıl yansıyacağını gösterir.
                  </p>
                  
                  {result.transits && result.transits.length > 0 ? (
                    <div className="space-y-4 mb-8">
                      {result.transits.map((transit: any, idx: number) => {
                        let action = "";
                        if (transit.type === "Kavuşum") action = "yoğun bir şekilde tetikliyor ve her iki gücü birleştiriyor.";
                        else if (transit.type === "Karşıtlık") action = "karşı karşıya getirerek bir denge bulmanızı ve karar vermenizi istiyor.";
                        else if (transit.type === "Kare") action = "zorlayarak sizi konfor alanınızdan çıkmaya ve harekete geçmeye itiyor.";
                        else if (transit.type === "Üçgen") action = "su gibi akan, koruyucu ve son derece şanslı bir şekilde destekliyor.";
                        else if (transit.type === "Altmışlık") action = "eğer adım atarsanız size fayda sağlayacak olumlu bir fırsat sunuyor.";

                        const summary = `Gökyüzündeki güncel ${transit.transitPlanet} enerjisi, sizin haritanızdaki köklü ${transit.natalPlanet} doğanızı ${action}`;

                        return (
                          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{transit.transitEmoji}</span>
                                <div>
                                  <p className="text-white font-medium text-sm">Transit {transit.transitPlanet}</p>
                                  <p className="text-gray-400 text-xs">{transit.type} ({transit.typeEmoji})</p>
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-white font-medium text-sm">Natal {transit.natalPlanet}</p>
                                  <p className="text-gray-400 text-xs">Doğum Haritanız</p>
                                </div>
                                <span className="text-2xl text-purple-400">{transit.natalEmoji}</span>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-white/5">
                              <p className="text-gray-400 text-xs leading-relaxed">
                                <span className="text-purple-300 font-medium">Kısa Etki:</span> {summary}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-gray-500 mb-8">
                      Bugün haritanıza tam açı yapan çok önemli bir transit bulunmuyor. Gökyüzü sizin için sakin.
                    </div>
                  )}

                  {!transitInterpretation ? (
                    <div className="mt-8">
                       {transitLoading ? (
                         <CosmicLoader label="Yıldızlar Yorumluyor... ✨" />
                       ) : (
                        <CosmicButton 
                          fullWidth 
                          onClick={async () => {
                            setTransitLoading(true);
                            try {
                              const res = await fetch("/api/interpret-transits", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ transits: result.transits, language })
                              });
                              const json = await res.json();
                              if (json.success) setTransitInterpretation(json.data);
                            } catch (e) {}
                            setTransitLoading(false);
                          }}
                          disabled={transitLoading || !result.transits || result.transits.length === 0}
                          icon="✨"
                        >
                          Bugüne Özel Transit Yorumumu Al
                        </CosmicButton>
                       )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-purple-900/20 border border-purple-500/20 relative overflow-hidden group glow mt-6">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                      <h4 className="text-xl font-bold text-white mb-2">{transitInterpretation.title}</h4>
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">{transitInterpretation.content}</p>
                      
                      {transitInterpretation.advice && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <span className="font-semibold text-pink-400 block mb-1">💡 Günün Tavsiyesi:</span>
                          <span className="text-gray-300 text-sm">{transitInterpretation.advice}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="text-center pt-4">
              <p className="text-gray-600 text-xs max-w-2xl mx-auto">
                ⚠️ Hesaplamalar Julian Day, Yerel Yıldız Zamanı (LST), Ekliptik Assendan formülü,
                ortalama yörünge elemanları ve gezegen ortalama boylamları kullanılarak yapılmıştır.
                Ev sistemi olarak eşit ev sistemi kullanılmaktadır. Koordinatlar: {selectedCity?.lat.toFixed(4)}°N, {selectedCity?.lng.toFixed(4)}°E
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
