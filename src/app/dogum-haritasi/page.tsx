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
import NextImage from "next/image";
import { planets } from "@/data/planets";
import PlanetIcon from "@/components/PlanetIcon";
import Logo from "@/components/Cosmic/Logo";
import { useEffect } from "react";

const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
};

export default function DogumHaritasiPage() {
  const isClient = useIsClient();
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
    if (!day || !month || !year) { setError(t("error.date")); return; }
    if (!hour || minute === "") { setError(t("error.time")); return; }
    if (isTurkey && !city) { setError(t("error.city")); return; }
    if (!isTurkey && !manualCity) { setError(t("error.city")); return; }

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
      else { setError(data.error || t("error.generic")); }
    } catch { setError(t("error.connection")); }
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
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                options={[
                  { value: "", label: t("chart.hour") },
                  ...Array.from({ length: 24 }, (_, i) => ({ value: i.toString(), label: i.toString().padStart(2, "0") }))
                ]}
              />
              <CosmicSelect
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
      {isClient && result && (
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
              {[
                { id: result.sunSign.id, type: "sun", label: t("chart.sun"), degree: result.sunSign.degree, color: "amber" },
                { id: result.moonSign.id, type: "moon", label: t("chart.moon"), degree: result.moonSign.degree, color: "blue" },
                { id: result.risingSign.id, type: "ascendant", label: t("chart.rising"), degree: result.risingSign.degree, color: "purple" }
              ].map((item, i) => {
                const planetIdMap: Record<string, string> = {
                  sun: "gunes",
                  moon: "ay",
                  mercury: "merkur",
                  neptune: "neptun",
                  pluto: "pluton"
                };
                const mappedId = planetIdMap[item.type] || item.type;
                const planetData = (item.type !== "ascendant" && item.type !== "rising") ? planets.find(p => p.id === mappedId) : null;
                return (
                  <div key={item.type} className={`glass-card p-6 fade-in-up group hover:border-${item.color}-500/30 transition-all duration-300`} style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-full bg-${item.color}-500/5 border border-${item.color}-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500 overflow-hidden relative shadow-lg`}>
                        {planetData?.imageUrl ? (
                          <NextImage 
                            src={planetData.imageUrl} 
                            alt={item.label} 
                            fill 
                            sizes="(max-width: 768px) 64px, 64px"
                            className="object-cover opacity-90 group-hover:scale-110 transition-transform" 
                          />
                        ) : (
                           <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center text-3xl">
                             {item.type === "ascendant" ? "⬆️" : "✨"}
                           </div>
                        )}
                      </div>
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-2xl font-bold gradient-text leading-tight">{t(`zodiac.${item.id}`)}</p>
                      <p className="text-gray-500 text-xs mt-1">{item.degree}°</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-2 flex-wrap fade-in-up-delay-3">
              {([
                { key: "overview", label: `📊 ${t("chart.overview")}` },
                { key: "planets", label: `🪐 ${t("chart.planets")}` },
                { key: "houses", label: `🏠 ${t("chart.houses")}` },
                { key: "aspects", label: `🔗 ${t("chart.aspects")}` },
                { key: "transits", label: `✨ ${t("chart.transits")}` },
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
                <div className="glass-card p-6 border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2 text-center text-gradient">{t("chart.wheel")}</h3>
                  <p className="text-gray-400 text-sm text-center mb-6 max-w-2xl mx-auto">
                    {t("chart.wheel.desc")}
                  </p>
                  <BirthChartWheel chart={result} />
                </div>

                {/* Planet Summary Table */}
                <div className="glass-card p-6 overflow-x-auto">
                  <h3 className="text-lg font-bold text-white mb-4">🪐 {t("chart.planets")}</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="pb-3 text-gray-500 font-medium">{t("astrology.planet.sun").replace("Güneş", "Gezegen")}</th>
                        <th className="pb-3 text-gray-500 font-medium">{t("astrology.month.1").replace("Ocak", "Burç")}</th>
                        <th className="pb-3 text-gray-500 font-medium">°</th>
                        <th className="pb-3 text-gray-500 font-medium hidden md:table-cell">{t("planet.influence")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.planetPositions.map((pos) => {
                        const planetIdMap: Record<string, string> = {
                          sun: "gunes",
                          moon: "ay",
                          mercury: "merkur",
                          neptune: "neptun",
                          pluto: "pluton"
                        };
                        const mappedId = planetIdMap[pos.planetId] || pos.planetId.toLowerCase();
                        const planetData = planets.find(p => p.id === mappedId);
                        return (
                          <tr key={pos.planetId} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                            <td className="py-4 text-white">
                              <div className="flex items-center gap-3">
                                {planetData?.imageUrl ? (
                                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 group-hover:scale-110 transition-transform">
                                    <NextImage 
                                      src={planetData.imageUrl} 
                                      alt={pos.planetId} 
                                      width={32} 
                                      height={32} 
                                      sizes="32px"
                                      className="object-cover" 
                                    />
                                  </div>
                                ) : (
                                  <PlanetIcon name={pos.planetId} size={24} className="group-hover:scale-110 transition-transform" />
                                )}
                                <span className="font-medium">{t(`astrology.planet.${pos.planetId}`)}</span>
                              </div>
                            </td>
                            <td className="py-4 text-amber-400 font-medium">{t(`zodiac.${pos.signId}`)}</td>
                            <td className="py-4 text-gray-400">
                              {pos.degree}° {pos.retrograde && <span className="text-red-400 font-bold ml-1 text-[10px]">℞</span>}
                            </td>
                            <td className="py-4 text-gray-500 hidden md:table-cell text-xs leading-relaxed">{t(`astrology.planet.meaning.${pos.planetId}`)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Aspect Summary */}
                <div className="glass-card p-6 border-l-4 border-amber-500/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <span className="text-2xl">🔗</span> {t("chart.aspects")} ({result.aspects.length})
                    </h3>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Kozmik Enerji Dengesi</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="relative p-4 rounded-2xl bg-green-500/5 border border-green-500/10 group hover:bg-green-500/10 transition-colors">
                      <div className="absolute top-2 right-2 text-green-500/20 text-xl font-black">POS</div>
                      <p className="text-3xl font-black text-green-400 mb-1">{result.aspects.filter(a => a.harmony === "positive").length}</p>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter">Uyumlu (Akış)</p>
                      <div className="h-1 w-full bg-green-500/20 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" style={{ width: `${(result.aspects.filter(a => a.harmony === "positive").length / result.aspects.length) * 100}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="relative p-4 rounded-2xl bg-red-500/5 border border-red-500/10 group hover:bg-red-500/10 transition-colors">
                      <div className="absolute top-2 right-2 text-red-500/20 text-xl font-black">NEG</div>
                      <p className="text-3xl font-black text-red-400 mb-1">{result.aspects.filter(a => a.harmony === "negative").length}</p>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter">Zorlayıcı (Gelişim)</p>
                      <div className="h-1 w-full bg-red-500/20 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" style={{ width: `${(result.aspects.filter(a => a.harmony === "negative").length / result.aspects.length) * 100}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="relative p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 group hover:bg-blue-500/10 transition-colors">
                      <div className="absolute top-2 right-2 text-blue-500/20 text-xl font-black">NEU</div>
                      <p className="text-3xl font-black text-blue-400 mb-1">{result.aspects.filter(a => a.harmony === "neutral").length}</p>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter">Nötr (Odak)</p>
                      <div className="h-1 w-full bg-blue-500/20 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" style={{ width: `${(result.aspects.filter(a => a.harmony === "neutral").length / result.aspects.length) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 italic leading-relaxed">
                    ✨ {t("chart.aspects.desc.natal")} Bu açılar, karakterinizdeki farklı güçlerin birbiriyle nasıl yardımlaştığını veya nerede sürtünme yarattığını gösterir.
                  </div>
                </div>
              </div>
            )}

            {/* Planets Tab */}
            {activeTab === "planets" && (
              <div className="space-y-4 fade-in-up">
                <div className="glass-card p-6 mb-4 border-l-4 border-purple-500">
                  <h3 className="text-lg font-bold text-white mb-2">{t("chart.planets")}</h3>
                  <p className="text-gray-400 text-sm">
                    {t("chart.planets.desc")}
                  </p>
                </div>
                {result.planetPositions.map((pos) => {
                  const planetIdMap: Record<string, string> = {
                    sun: "gunes",
                    moon: "ay",
                    mercury: "merkur",
                    neptune: "neptun",
                    pluto: "pluton"
                  };
                  const mappedId = planetIdMap[pos.planetId] || pos.planetId.toLowerCase();
                  const planetData = planets.find(p => p.id === mappedId);
                  return (
                    <div key={pos.planetId} className="glass-card p-6 border-white/5 hover:border-white/10 transition-all group shadow-xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 overflow-hidden relative shadow-2xl">
                            {planetData?.imageUrl ? (
                              <NextImage 
                                src={planetData.imageUrl} 
                                alt={pos.planetId} 
                                fill 
                                sizes="56px"
                                className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" 
                              />
                            ) : (
                                <PlanetIcon name={pos.planetId} size={32} />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white flex items-center gap-2">
                               {t(`astrology.planet.${pos.planetId}`)}
                              {pos.retrograde && <span className="text-amber-400 text-sm" title="Retrograde">℞</span>}
                            </h4>
                            <p className="text-amber-400 font-medium text-sm">
                                {t(`zodiac.${pos.signId}`)} {pos.degree}°
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Mistik Öz</div>
                          <p className="text-xs text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 shadow-inner">{t(`astrology.planet.meaning.${pos.planetId}`)}</p>
                        </div>
                      </div>

                      {/* Deep Interpretation */}
                      <div className="space-y-4 mt-6 pt-6 border-t border-white/5">
                        <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-amber-500/30 pl-4 py-1">
                          "{t(`astrology.planet.${pos.planetId}.desc`)}"
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-colors">
                            <p className="text-[10px] uppercase font-bold text-green-400 mb-2 tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(74,222,128,0.5)]"></span>
                                Olumlu Akış
                            </p>
                            <p className="text-xs text-gray-400 leading-tight">{t(`astrology.planet.${pos.planetId}.traits.pos`)}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                            <p className="text-[10px] uppercase font-bold text-red-400 mb-2 tracking-widest flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(248,113,113,0.5)]"></span>
                                Zorlayıcı Alan
                            </p>
                            <p className="text-xs text-gray-400 leading-tight">{t(`astrology.planet.${pos.planetId}.traits.neg`)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between text-[10px] text-gray-500 font-medium tracking-widest uppercase opacity-50">
                        <span>Boylam Verisi</span>
                        <span>{pos.fullDegree}° {pos.retrograde ? "(RE)" : "(DIR)"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Houses Tab */}
            {activeTab === "houses" && (
              <div className="space-y-3 fade-in-up">
                <div className="glass-card p-6 mb-4 border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold text-white mb-2">{t("chart.houses")}</h3>
                  <p className="text-gray-400 text-sm">
                    {t("chart.houses.desc")}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.houses.map((house) => (
                    <div key={house.house} className="glass-card p-4 hover:border-purple-500/30 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-bold">
                            {house.house}
                          </span>
                          <span className="text-white font-medium text-sm">{t(`astrology.house.${house.house}`)}</span>
                        </div>
                        <span className="text-amber-400 text-xs font-medium">{t(`zodiac.${house.signId}`)} {house.degree}°</span>
                      </div>
                      <p className="text-gray-400 text-[11px] leading-relaxed italic opacity-80">
                        {t(`astrology.house.${house.house}.desc`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aspects Tab */}
            {activeTab === "aspects" && (
              <div className="space-y-3 fade-in-up">
                <div className="glass-card p-6 mb-4 border-l-4 border-pink-500">
                  <h3 className="text-lg font-bold text-white mb-2">{t("chart.aspects")}</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {t("chart.aspects.desc.natal")}
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                     <li><strong className="text-green-400">{t("chart.aspect.harmonious")}</strong></li>
                     <li><strong className="text-red-400">{t("chart.aspect.challenging")}</strong></li>
                     <li><strong className="text-blue-400">{t("chart.aspect.conjunction")}</strong></li>
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
                          <span className="text-white text-sm font-medium">{t(`astrology.planet.${aspect.planet1Id}`)} — {t(`astrology.planet.${aspect.planet2Id}`)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${harmonyColor(aspect.harmony)}`}>
                            {t(`astrology.aspect.${aspect.typeId}`)}
                          </span>
                         </div>
                      </div>
                      <p className="text-gray-500 text-xs">
                        {t(`astrology.planet.${aspect.planet1Id}`)} {aspect.typeEmoji} {t(`astrology.planet.${aspect.planet2Id}`)}: {t(`astrology.aspect.${aspect.typeId}.desc`)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Transits Tab */}
            {activeTab === "transits" && (
              <div className="space-y-6 fade-in-up">
                <div className="glass-card p-6 border-l-4 border-amber-500">
                  <h3 className="text-xl font-bold text-white mb-2">{t("chart.transits")}</h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-2xl">
                    {t("chart.transits.desc")}
                  </p>
                  
                  {result.transits && result.transits.length > 0 ? (
                    <div className="space-y-4 mb-8">
                      {result.transits.map((transit: any, idx: number) => {
                        const summary = t("astrology.transit.desc_pattern", {
                          transitPlanet: t(`astrology.planet.${transit.transitPlanetId}`),
                          natalPlanet: t(`astrology.planet.${transit.natalPlanetId}`),
                          aspect: t(`astrology.aspect.${transit.typeId}`), // Changed aspectType to aspect to match placeholder bug
                          effect: t(`astrology.aspect.${transit.typeId}.action`) // Changed action to effect to match placeholder bug
                        });

                        return (
                          <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{transit.transitEmoji}</span>
                                <div>
                                  <p className="text-white font-medium text-sm">Transit {t(`astrology.planet.${transit.transitPlanetId}`)}</p>
                                  <p className="text-gray-400 text-xs">{t(`astrology.aspect.${transit.typeId}`)} ({transit.typeEmoji})</p>
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-white font-medium text-sm">Natal {t(`astrology.planet.${transit.natalPlanetId}`)}</p>
                                  <p className="text-gray-400 text-xs">{t("chart.yours")}</p>
                                </div>
                                <span className="text-2xl text-purple-400">{transit.natalEmoji}</span>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-white/5">
                              <p className="text-gray-400 text-xs leading-relaxed">
                                <span className="text-purple-300 font-medium">{t("chart.short_effect")}:</span> {summary}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-gray-500 mb-8">
                      {t("chart.transits.none")}
                    </div>
                  )}

                  {!transitInterpretation ? (
                    <div className="mt-8">
                       {transitLoading ? (
                         <CosmicLoader label={t("chart.transits.loading")} />
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
                          {t("chart.transits.btn")}
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
                          <span className="font-semibold text-pink-400 block mb-1">💡 {t("chart.advice.day")}:</span>
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
                ⚠️ {t("chart.disclaimer")}
                Coord: {selectedCity?.lat.toFixed(4)}°N, {selectedCity?.lng.toFixed(4)}°E
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
