"use client";

import { useState, useMemo, useEffect } from "react";
import { turkishCities } from "@/data/cities";
import { countries } from "@/data/countries";
import { useTranslation } from "@/lib/i18n";
import { getZodiacById } from "@/data/zodiac";
import CosmicInput from "@/components/Cosmic/CosmicInput";
import CosmicSelect from "@/components/Cosmic/CosmicSelect";
import CosmicButton from "@/components/Cosmic/CosmicButton";
import CosmicLoader from "@/components/Cosmic/CosmicLoader";
import PlanetIcon from "@/components/PlanetIcon";
import Logo from "@/components/Cosmic/Logo";

const SignIcon = ({ signId, size = 80 }: { signId: string; size?: number }) => {
  const sign = getZodiacById(signId);
  if (!sign) return <div className="w-20 h-20 rounded-full bg-white/5" />;

  const elementColors: Record<string, string> = {
    "astrology.element.fire": "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    "astrology.element.water": "border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    "astrology.element.air": "border-indigo-400/50 shadow-[0_0_20px_rgba(129,140,248,0.3)]",
    "astrology.element.earth": "border-emerald-600/50 shadow-[0_0_20px_rgba(5,150,105,0.3)]",
  };

  const ringStyle = elementColors[sign.elementKey] || "border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.3)]";

  return (
    <div className="relative group">
      <div
        className={`rounded-full border-2 ${ringStyle} bg-black/40 backdrop-blur-md flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-all duration-700 shadow-2xl relative z-10`}
        style={{ width: size, height: size }}
      >
        <span className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ fontSize: size * 0.45 }}>{sign.symbol}</span>
      </div>
      {/* Decorative Outer Glow Ring */}
      <div className="absolute inset-0 rounded-full border border-white/5 scale-110 animate-pulse-slow pointer-events-none" />
    </div>
  );
};

export default function UyumlulukPage() {
  const { t, language } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      const p1City = p1.country === "TR" ? p1.city : p1.manualCity;
      const p2City = p2.country === "TR" ? p2.city : p2.manualCity;

      const p1LatLn = getCityData(p1.country, p1City);
      const p2LatLn = getCityData(p2.country, p2City);

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
      <div className="glass-card p-6 border-t-4 border-t-pink-500 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="p-2 rounded-lg bg-pink-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">{emoji}</span> {title}
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
            {renderPersonForm(p1, updateP1, t("compatibility.person1"), "✨")}
            {renderPersonForm(p2, updateP2, t("compatibility.person2"), "🌟")}
          </div>

          {error && <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-center">{error}</div>}

          <CosmicButton
            fullWidth
            onClick={handleCalculate}
            disabled={loading}
            className="mt-8 group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? t("compatibility.calculating") : t("compatibility.calculate")}
              {!loading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </CosmicButton>

          {loading && (
            <div className="mt-12 fade-in">
              <CosmicLoader label={t("compatibility.calculating")} />
            </div>
          )}
        </div>
      </section>

      {result && result.interpretation && (
        <section className="pb-20 px-4">
          <div className="max-w-5xl mx-auto space-y-16 fade-in-up">

            {/* Main Analysis Grid: Cosmic Bond + Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-8 items-stretch">
              {/* Premium Cosmic Bond Section v2 */}
              <div className="relative glass-card overflow-hidden group flex flex-col items-center justify-center p-6 md:p-10 border-b-2 border-b-pink-500/20 shadow-2xl min-h-[580px]">
                {/* Animated Starfield Background - Client Only for stability */}
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  {isMounted && (
                    <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                      <defs>
                        <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="white" stopOpacity="1" />
                          <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      {[...Array(80)].map((_, i) => (
                        <circle
                          key={i}
                          cx={((i * 137.5) % 800)}
                          cy={((i * 137.5) % 600)}
                          r={0.5 + (i % 2)}
                          fill="url(#starGradient)"
                          className="animate-pulse"
                          style={{ animationDelay: `${(i % 5)}s`, animationDuration: `${2 + (i % 3)}s` }}
                        />
                      ))}
                    </svg>
                  )}
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/5 blur-[120px] rounded-full animate-pulse-slow" />

                <h2 className="text-xl md:text-3xl font-black text-white mb-12 relative z-10 tracking-[0.3em] uppercase text-center font-brand">
                  {t("compatibility.bond")}
                </h2>

                <div className="flex flex-col items-center justify-center gap-10 relative z-10 w-full">
                  <div className="flex items-center justify-center gap-4 md:gap-10 w-full">
                    {/* Person 1 Profile */}
                    <div className="flex flex-col items-center space-y-5">
                      <div className="relative group/p1">
                        <div className="absolute -inset-4 bg-pink-500/10 blur-3xl rounded-full opacity-60 group-hover/p1:opacity-100 transition-opacity duration-1000" />
                        <SignIcon signId={result.chart1.sunSign.id} size={100} />
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-xl z-20">
                          <span className="text-lg">{getZodiacById(result.chart1.risingSign.id)?.symbol}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-white tracking-[0.1em] uppercase">{t(`zodiac.${result.chart1.sunSign.id}`)}</p>
                      </div>
                    </div>

                    {/* Central Connector Score */}
                    <div className="relative z-20 transform hover:scale-110 transition-transform duration-700 cursor-default">
                      <div className="absolute -inset-8 bg-pink-600/20 blur-[30px] animate-pulse" />
                      <div className="relative w-32 h-32 flex items-center justify-center bg-black/40 backdrop-blur-2xl rounded-full border-2 border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                          <circle cx="64" cy="64" r="58" className="stroke-white/5 fill-none" strokeWidth="6" />
                          <circle
                            cx="64" cy="64" r="58"
                            className="stroke-pink-500 fill-none transition-all duration-1000"
                            strokeWidth="6"
                            strokeDasharray={2 * Math.PI * 58}
                            strokeDashoffset={2 * Math.PI * 58 * (1 - result.interpretation.overallScore / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-black text-white leading-none tracking-tighter">{result.interpretation.overallScore}%</span>
                          <span className="text-[8px] text-pink-400 font-black tracking-[0.2em] uppercase mt-2">{t("compat.overall").split(" ")[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Person 2 Profile */}
                    <div className="flex flex-col items-center space-y-5">
                      <div className="relative group/p2">
                        <div className="absolute -inset-4 bg-purple-500/10 blur-3xl rounded-full opacity-60 group-hover/p2:opacity-100 transition-opacity duration-1000" />
                        <SignIcon signId={result.chart2.sunSign.id} size={100} />
                        <div className="absolute -bottom-1 -left-1 w-10 h-10 rounded-full bg-black/80 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-xl z-20">
                          <span className="text-lg">{getZodiacById(result.chart2.risingSign.id)?.symbol}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-white tracking-[0.1em] uppercase">{t(`zodiac.${result.chart2.sunSign.id}`)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-scores Orbit */}
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-full bg-black/60 border border-red-500/30 backdrop-blur-xl flex items-center gap-2">
                      <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">AŞK</span>
                      <span className="text-xs font-black text-white">{result.interpretation.loveScore}%</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-xl flex items-center gap-2">
                      <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">DOST</span>
                      <span className="text-xs font-black text-white">{result.interpretation.friendshipScore}%</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-black/60 border border-amber-500/30 backdrop-blur-xl flex items-center gap-2">
                      <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">İŞ</span>
                      <span className="text-xs font-black text-white">{result.interpretation.workScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Galactic Seal */}
                <div className="flex items-center gap-6 opacity-30 mt-12 leading-none pb-4 scale-75 md:scale-90">
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[8px] text-pink-300 tracking-[0.5em] font-black uppercase mb-1 whitespace-nowrap">Astralis Galactic Synastry</span>
                    <span className="text-[6px] text-gray-500 tracking-[0.2em] font-light italic">Planetary Alignment Protocol v4.0</span>
                  </div>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
              </div>

              {/* Sinastri Özeti (Summary) Section */}
              <div className="glass-card p-8 md:p-12 relative overflow-hidden shadow-2xl border-t-2 border-t-pink-500/20 h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/5 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none" />
                <h3 className="text-xl md:text-2xl font-brand font-bold text-white mb-8 flex items-center gap-4">
                  <div className="p-2 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 shadow-lg border border-white/5"><Logo size={24} /></div>
                  <span className="tracking-[0.15em] uppercase text-pink-100">{t("compatibility.summary")}</span>
                </h3>
                <div className="relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 via-purple-600 to-transparent rounded-full opacity-60" />
                  <p className="text-gray-300 leading-relaxed text-lg md:text-xl font-light italic pl-4 opacity-90">
                    "{result.interpretation.description}"
                  </p>
                </div>
              </div>
            </div>

            {/* Analysis Grid (Strengths & Challenges) */}
            <div className="grid md:grid-cols-2 gap-10">
              <div className="glass-card p-10 border-l-8 border-l-green-500 bg-gradient-to-br from-green-500/10 via-transparent to-black/10 shadow-2xl group hover:transform hover:translate-y-[-4px] transition-all duration-500">
                <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30 shadow-inner">✅</div>
                  <span className="tracking-widest uppercase">{t("compatibility.strengths")}</span>
                </h3>
                <ul className="space-y-8">
                  {result.interpretation.strengths?.map((s: string, i: number) => (
                    <li key={i} className="text-gray-300 text-lg flex items-start gap-5 group/item">
                      <span className="text-green-500 font-bold mt-1.5 animate-pulse text-2xl group-hover/item:scale-125 transition-transform">✦</span>
                      <span className="leading-relaxed group-hover/item:text-white transition-colors duration-300">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-10 border-l-8 border-l-amber-500 bg-gradient-to-br from-amber-500/10 via-transparent to-black/10 shadow-2xl group hover:transform hover:translate-y-[-4px] transition-all duration-500">
                <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30 shadow-inner">⚠️</div>
                  <span className="tracking-widest uppercase">{t("compatibility.challenges")}</span>
                </h3>
                <ul className="space-y-8">
                  {result.interpretation.challenges?.map((c: string, i: number) => (
                    <li key={i} className="text-gray-300 text-lg flex items-start gap-5 group/item">
                      <span className="text-amber-500 font-bold mt-1.5 animate-pulse text-2xl group-hover/item:scale-125 transition-transform">◈</span>
                      <span className="leading-relaxed group-hover/item:text-white transition-colors duration-300">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Synastry Exact Aspects Section */}
            <div className="glass-card p-8 md:p-14 border-t-2 border-t-white/5 shadow-2xl bg-white/[0.01]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-white/5 pb-10">
                <div>
                  <h3 className="text-3xl md:text-4xl font-brand font-bold text-white mb-3 tracking-[0.2em] uppercase">{t("compatibility.aspects")}</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1 bg-pink-500 rounded-full" />
                    <div className="w-4 h-1 bg-purple-500 rounded-full" />
                  </div>
                </div>
                <p className="text-gray-400 text-base max-w-sm md:text-right font-light leading-relaxed">
                  {t("compatibility.aspects.desc")}
                </p>
              </div>

              <div className="space-y-12">
                {result.synastryAspects?.map((aspect: any, idx: number) => {
                  // Find matching AI insight
                  const insight = result.interpretation.aspectInterpretations?.find(
                    (i: any) => i.p1 === aspect.planet1Id && i.p2 === aspect.planet2Id && i.type === aspect.typeId
                  )?.insight;

                  return (
                    <div key={idx} className="group relative">
                      <div className="relative z-10 p-8 md:p-12 bg-black/40 hover:bg-black/60 border border-white/5 hover:border-pink-500/30 rounded-[3rem] transition-all duration-700 shadow-2xl backdrop-blur-md">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                          {/* Visual Icons Block */}
                          <div className="flex items-center justify-center shrink-0">
                            <div className="flex -space-x-10">
                               <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center transform rotate-[-12deg] group-hover:rotate-[-6deg] transition-all duration-500 shadow-2xl relative z-10 backdrop-blur-xl">
                                 <PlanetIcon name={aspect.planet1Id} size={56} />
                               </div>
                               <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center transform rotate-[12deg] group-hover:rotate-[6deg] transition-all duration-500 shadow-2xl relative z-0 backdrop-blur-xl">
                                 <PlanetIcon name={aspect.planet2Id} size={56} />
                               </div>
                            </div>
                            <div className="ml-8 flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 text-4xl shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                              {aspect.typeEmoji}
                            </div>
                          </div>

                          {/* Content Block */}
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                              <div>
                                <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mb-2">
                                  {t(`astrology.aspect.${aspect.typeId}`)}
                                </h4>
                                <p className="text-[13px] text-gray-400 font-black tracking-[0.2em] uppercase">
                                  {t(`astrology.planet.${aspect.planet1Id}`)} & {t(`astrology.planet.${aspect.planet2Id}`)} 
                                  <span className="mx-4 opacity-30">•</span> 
                                  Orb: {aspect.orb}°
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                {aspect.harmony === "positive" && <span className="px-6 py-2.5 bg-green-500/10 text-green-400 text-xs font-black rounded-full border border-green-500/20 uppercase tracking-widest shadow-[0_0_20px_rgba(74,222,128,0.2)]">Uyumlu</span>}
                                {aspect.harmony === "negative" && <span className="px-6 py-2.5 bg-red-500/10 text-red-400 text-xs font-black rounded-full border border-red-500/20 uppercase tracking-widest shadow-[0_0_20px_rgba(248,113,113,0.2)]">Zorlayıcı</span>}
                                {aspect.harmony === "neutral" && <span className="px-6 py-2.5 bg-indigo-500/10 text-indigo-400 text-xs font-black rounded-full border border-indigo-500/20 uppercase tracking-widest shadow-[0_0_20px_rgba(129,140,248,0.2)]">Nötr</span>}
                              </div>
                            </div>

                            {/* Detailed AI Insight */}
                            <div className="bg-white/[0.03] p-8 md:p-10 rounded-[2.5rem] border border-white/5 group-hover:border-pink-500/20 transition-all duration-500 shadow-inner">
                               <p className="text-gray-200 text-lg md:text-xl leading-relaxed font-light italic opacity-95">
                                 {insight ? (
                                   insight
                                 ) : (
                                   `${t(`astrology.planet.${aspect.planet1Id}`)} ile ${t(`astrology.planet.${aspect.planet2Id}`)} arasındaki bu ${t(`astrology.aspect.${aspect.typeId}`)} açısı, ilişkinizin kadersel dokusunu şekillendiren en temel etkilerden biridir.`
                                 )}
                               </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>
      )}
    </div>
  );
}
