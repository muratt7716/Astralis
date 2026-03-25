"use client";

import { useState, useMemo } from "react";
import { turkishCities } from "@/data/cities";
import { countries } from "@/data/countries";
import { useTranslation } from "@/lib/i18n";
import CosmicInput from "@/components/Cosmic/CosmicInput";
import CosmicSelect from "@/components/Cosmic/CosmicSelect";
import CosmicButton from "@/components/Cosmic/CosmicButton";
import CosmicLoader from "@/components/Cosmic/CosmicLoader";
import PlanetIcon from "@/components/PlanetIcon";
import Logo from "@/components/Cosmic/Logo";

export default function UyumlulukPage() {
  const { t, language } = useTranslation();
  
  // Person 1 State
  const [p1, setP1] = useState({
    day: "", month: "", year: "", hour: "", minute: "", country: "TR", city: "", manualCity: ""
  });
  
  // Person 2 State
  const [p2, setP2] = useState({
    day: "", month: "", year: "", hour: "", minute: "", country: "TR", city: "", manualCity: ""
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateP1 = (field: string, val: string) => setP1(prev => ({ ...prev, [field]: val }));
  const updateP2 = (field: string, val: string) => setP2(prev => ({ ...prev, [field]: val }));

  const getCityData = (countryCode: string, cityName: string) => {
    if (countryCode === "TR") {
      const city = turkishCities.find(c => c.name === cityName);
      return { lat: city?.lat || 39.9, lng: city?.lng || 32.8 };
    }
    return { lat: 41.0, lng: 28.9 }; // Default fallback for manual cities
  };

  const handleCalculate = async () => {
    if (!p1.day || !p1.month || !p1.year || !p2.day || !p2.month || !p2.year) {
      setError(t("error.date.both"));
      return;
    }
    setError("");
    setLoading(true);

    try {
      const p1LatLn = getCityData(p1.country, p1.city);
      const p2LatLn = getCityData(p2.country, p2.city);

      const requestBody = {
        language,
        person1: {
          year: parseInt(p1.year), month: parseInt(p1.month), day: parseInt(p1.day),
          hour: parseInt(p1.hour || "12"), minute: parseInt(p1.minute || "0"),
          latitude: p1LatLn.lat, longitude: p1LatLn.lng,
          utcOffset: countries.find(c => c.code === p1.country)?.utcOffset || 3
        },
        person2: {
          year: parseInt(p2.year), month: parseInt(p2.month), day: parseInt(p2.day),
          hour: parseInt(p2.hour || "12"), minute: parseInt(p2.minute || "0"),
          latitude: p2LatLn.lat, longitude: p2LatLn.lng,
          utcOffset: countries.find(c => c.code === p2.country)?.utcOffset || 3
        }
      };

      const res = await fetch("/api/calculate-synastry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || t("error.calc"));
      }
    } catch (err) {
      console.error(err);
      setError(t("error.connection"));
    } finally {
      setLoading(false);
    }
  };

  const ScoreBar = ({ label, score, emoji }: { label: string; score: number; emoji: string }) => {
    const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-300 text-sm">{emoji} {label}</span>
          <span className="text-white font-bold">{score}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <div className={`h-full rounded-full ${color} animate-fill-bar`} style={{ width: `${score}%` }} />
        </div>
      </div>
    );
  };

  const renderPersonForm = (person: any, updateFn: any, title: string, emoji: string) => {
    const isTr = person.country === "TR";
    return (
      <div className="glass-card p-6 border-t-4 border-t-pink-500">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>{emoji}</span> {title}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <CosmicSelect
              label={t("chart.day")}
              value={person.day}
              onChange={e => updateFn("day", e.target.value)}
              options={[
                { value: "", label: t("chart.day") },
                ...Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }))
              ]}
            />
            <CosmicSelect
              label={t("chart.month")}
              value={person.month}
              onChange={e => updateFn("month", e.target.value)}
              options={[
                { value: "", label: t("chart.month") },
                ...Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }))
              ]}
            />
            <CosmicSelect
              label={t("chart.year")}
              value={person.year}
              onChange={e => updateFn("year", e.target.value)}
              options={[
                { value: "", label: t("chart.year") },
                ...Array.from({ length: 100 }, (_, i) => ({ value: (new Date().getFullYear() - i).toString(), label: (new Date().getFullYear() - i).toString() }))
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-400 text-xs font-medium uppercase tracking-widest pl-1">
              {t("chart.time")} ({t("chart.optional")})
            </label>
            <div className="grid grid-cols-2 gap-3">
              <CosmicSelect
                value={person.hour}
                onChange={e => updateFn("hour", e.target.value)}
                options={[
                  { value: "", label: t("chart.hour") },
                  ...Array.from({ length: 24 }, (_, i) => ({ value: i.toString(), label: i.toString().padStart(2, "0") }))
                ]}
              />
              <CosmicSelect
                value={person.minute}
                onChange={e => updateFn("minute", e.target.value)}
                options={[
                  { value: "", label: t("chart.minute") },
                  ...Array.from({ length: 60 }, (_, i) => ({ value: i.toString(), label: i.toString().padStart(2, "0") }))
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CosmicSelect
              label={t("chart.location")}
              value={person.country}
              onChange={e => { updateFn("country", e.target.value); updateFn("city", ""); }}
              options={countries.map(c => ({ value: c.code, label: c.name }))}
            />
            {isTr ? (
              <CosmicSelect
                label={t("chart.city")}
                value={person.city}
                onChange={e => updateFn("city", e.target.value)}
                options={[
                  { value: "", label: t("chart.city") },
                  ...turkishCities.map(c => ({ value: c.name, label: c.name }))
                ]}
              />
            ) : (
              <CosmicInput
                label={t("chart.city")}
                placeholder={t("chart.city")}
                value={person.manualCity}
                onChange={e => updateFn("manualCity", e.target.value)}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="cosmic-gradient min-h-screen">
      <section className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Logo size={80} className="mx-auto mb-4 float" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t("compatibility.title")}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t("compatibility.desc")}
          </p>
        </div>
      </section>

      <section className="pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {renderPersonForm(p1, updateP1, t("compat.person1"), "✨")}
            {renderPersonForm(p2, updateP2, t("compat.person2"), "🌟")}
          </div>

          {error && <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-center">{error}</div>}

          <CosmicButton
            fullWidth
            onClick={handleCalculate}
            disabled={loading}
            className="mt-8"
          >
            {loading ? t("compatibility.calculating") : t("compatibility.calculate")}
          </CosmicButton>

          {loading && (
            <div className="mt-12 fade-in">
              <CosmicLoader label={t("chart.transits.loading")} />
            </div>
          )}
        </div>
      </section>

      {result && result.interpretation && (
        <section className="pb-20 px-4">
          <div className="max-w-4xl mx-auto space-y-6 fade-in-up">
            
            {/* Summary Score Head */}
            <div className="glass-card p-8 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none"></div>
               <h2 className="text-3xl font-bold text-white mb-2">{t("compatibility.bond")}</h2>
               <div className="flex flex-col sm:flex-row justify-center items-center gap-8 my-8">
                  <div className="text-center group min-w-[120px]">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-xl">
                      <PlanetIcon name="Sun" size={48} />
                    </div>
                    <p className="text-gray-500 text-xs text-center font-light tracking-wide">{t("chart.rising")}: {t(`zodiac.${result.chart1.risingSign.id}`)}</p>
                  </div>
                  
                  <div className="relative group">
                    <div className="text-5xl animate-pulse drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">❤️‍🔥</div>
                    <div className="absolute -inset-4 bg-pink-500/20 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
                  </div>

                  <div className="text-center group min-w-[120px]">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-xl">
                      <PlanetIcon name="Sun" size={48} />
                    </div>
                    <p className="text-gray-500 text-xs text-center font-light tracking-wide">{t("chart.rising")}: {t(`zodiac.${result.chart2.risingSign.id}`)}</p>
                  </div>
               </div>
            </div>

            {/* Holistic Reading */}
            <div className="glass-card p-8">
               <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <Logo size={24} /> {t("compatibility.summary")}
               </h3>
              <p className="text-gray-300 leading-relaxed text-lg">{result.interpretation.description}</p>
            </div>

            {/* Detailed Scores */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-6">{t("compatibility.pct")}</h3>
                <ScoreBar label={t("compatibility.potential.general")} score={result.interpretation.overallScore} emoji="🌟" />
                <ScoreBar label={t("compatibility.potential.love")} score={result.interpretation.loveScore} emoji="💕" />
                <ScoreBar label={t("compatibility.potential.friendship")} score={result.interpretation.friendshipScore} emoji="🤝" />
                <ScoreBar label={t("compatibility.potential.goals")} score={result.interpretation.workScore} emoji="🎯" />
              </div>

              {/* Strengths & Challenges */}
              <div className="space-y-6">
                <div className="glass-card p-6 border-l-4 border-l-green-500">
                  <h3 className="text-lg font-bold text-white mb-4">{t("compatibility.strengths")}</h3>
                  <ul className="space-y-2">
                    {result.interpretation.strengths?.map((s: string, i: number) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-6 border-l-4 border-l-amber-500">
                  <h3 className="text-lg font-bold text-white mb-4">⚠️ {t("compatibility.challenges")}</h3>
                  <ul className="space-y-2">
                    {result.interpretation.challenges?.map((c: string, i: number) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Synastry Exact Aspects */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-2">{t("compatibility.aspects")}</h3>
              <p className="text-gray-400 text-sm mb-4">{t("compatibility.aspects.desc")}</p>
              <div className="grid md:grid-cols-2 gap-4">
                {result.synastryAspects?.map((aspect: any, idx: number) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-pink-500/30 transition-all duration-300 group">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                         <div className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center group-hover:translate-x-[-2px] transition-transform">
                           <PlanetIcon name={aspect.planet1Id} size={20} />
                         </div>
                         <div className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center group-hover:translate-x-[2px] transition-transform">
                           <PlanetIcon name={aspect.planet2Id} size={20} />
                         </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white flex items-center gap-1.5">
                          {t(`astrology.planet.${aspect.planet1Id}`)} 
                          <span className="text-pink-400 text-lg">{aspect.typeEmoji}</span> 
                          {t(`astrology.planet.${aspect.planet2Id}`)}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{t(`astrology.aspect.${aspect.typeId}`)} (Orb: {aspect.orb}°)</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {aspect.harmony === "positive" && <span className="px-2.5 py-1 bg-green-500/20 text-green-300 text-[10px] font-bold rounded-lg border border-green-500/30 uppercase">{t("chart.aspect.harmonious").split(" ")[0]}</span>}
                      {aspect.harmony === "negative" && <span className="px-2.5 py-1 bg-red-500/20 text-red-300 text-[10px] font-bold rounded-lg border border-red-500/30 uppercase">{t("chart.aspect.challenging").split(" ")[0]}</span>}
                      {aspect.harmony === "neutral" && <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-lg border border-blue-500/30 uppercase">{t("chart.aspect.conjunction").split(" ")[0]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      )}
    </div>
  );
}
