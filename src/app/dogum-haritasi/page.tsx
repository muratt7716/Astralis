"use client";

import { useState, useMemo, useCallback } from "react";
import { turkishCities } from "@/data/cities";
import { countries } from "@/data/countries";
import type { BirthChart } from "@/lib/astrology";
import { useTranslation } from "@/lib/i18n";
import BirthChartWheel from "@/components/BirthChartWheel";
import CosmicInput from "@/components/Cosmic/CosmicInput";
import CosmicSelect from "@/components/Cosmic/CosmicSelect";
import { GlassButton } from "@/components/ui/glass-button";
import CosmicLoader from "@/components/Cosmic/CosmicLoader";
import NextImage from "next/image";
import { planets, getPlanetById } from "@/data/planets";
import PlanetIcon from "@/components/PlanetIcon";
import Logo from "@/components/Cosmic/Logo";
import ZodiacIcon from "@/components/Cosmic/ZodiacIcon";
import { useEffect } from "react";
import { getCurrentProfile, useAuth } from "@/lib/auth-helpers";
import { logInteraction } from "@/lib/logging";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Globe,
  ChevronUp,
  BarChart3,
  Orbit,
  Home,
  Link2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  Lightbulb,
  Star,
  Flame,
  RefreshCcw,
  Brain
} from "lucide-react";

const PLANET_ID_MAP: Record<string, string> = {
  sun: "gunes", moon: "ay", mercury: "merkur", venus: "venus",
  mars: "mars", jupiter: "jupiter", saturn: "saturn",
  uranus: "uranus", neptune: "neptun", pluto: "pluton",
};

const ELEMENT_OF_SIGN: Record<string, "fire" | "earth" | "air" | "water"> = {
  koc: "fire", aslan: "fire", yay: "fire",
  boga: "earth", basak: "earth", oglak: "earth",
  ikizler: "air", terazi: "air", kova: "air",
  yengec: "water", akrep: "water", balik: "water",
};

const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
};

export default function DogumHaritasiPage() {
  const isClient = useIsClient();
  const { t, language } = useTranslation();

  const [showFinder, setShowFinder] = useState(false);
  const [fDay, setFDay] = useState("");
  const [fMonth, setFMonth] = useState("");
  const [fResult, setFResult] = useState<any>(null);

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
  type AspectFilter = "all" | "positive" | "negative" | "neutral";
  const [activeTab, setActiveTab] = useState<"overview" | "planets" | "houses" | "aspects" | "ai-yorumu">("overview");
  const [transitInterpretation, setTransitInterpretation] = useState<any>(null);
  const [transitLoading, setTransitLoading] = useState(false);
  const [aspectFilter, setAspectFilter] = useState<AspectFilter>("all");
  const [chartInterpretation, setChartInterpretation] = useState<any>(null);
  const [interpretError, setInterpretError] = useState("");
  const [aspectInterpretations, setAspectInterpretations] = useState<Record<string, string> | null>(null);
  const [aspectInterpretLoading, setAspectInterpretLoading] = useState(false);
  const [houseInterpretations, setHouseInterpretations] = useState<Record<string, string> | null>(null);
  const [houseInterpretLoading, setHouseInterpretLoading] = useState(false);
  const [planetInterpretations, setPlanetInterpretations] = useState<Record<string, string> | null>(null);

  const { user, profile } = useAuth();

  // Auto-fill form from profile data when logged in
  useEffect(() => {
    if (!profile) return;
    // Only fill if form is empty (don't overwrite user edits)
    if (day || month || year) return;

    if (profile.birth_date) {
      try {
        const d = new Date(profile.birth_date);
        setDay(d.getDate().toString());
        setMonth((d.getMonth() + 1).toString());
        setYear(d.getFullYear().toString());
      } catch {}
    }

    if (profile.birth_time) {
      try {
        const [h, m] = profile.birth_time.split(":");
        setHour(parseInt(h, 10).toString());
        setMinute(parseInt(m, 10).toString());
      } catch {}
    }

    if (profile.birth_country) {
      setCountry(profile.birth_country);
    }

    if (profile.birth_city) {
      // Check if it's a known Turkish city
      const found = turkishCities.find(c => c.name === profile.birth_city);
      if (found) {
        setCity(profile.birth_city);
      } else {
        setManualCity(profile.birth_city);
      }
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tab-switching auto-load removed; interpretations are prefetched on calculate.

  const isTurkey = country === "TR";
  const selectedCountry = useMemo(() => countries.find(c => c.code === country), [country]);
  const selectedCity = useMemo(() => turkishCities.find(c => c.name === city), [city]);
  const districts = useMemo(() => selectedCity?.districts || [], [selectedCity]);

  const filteredAspects = useMemo(() => {
    if (!result) return [];
    if (aspectFilter === "all") return result.aspects;
    return result.aspects.filter(a => a.harmony === aspectFilter);
  }, [result, aspectFilter]);

  const handleCalculate = async () => {
    if (!day || !month || !year) { setError(t("error.date")); return; }
    if (!hour || minute === "") { setError(t("error.time")); return; }
    if (isTurkey && !city) { setError(t("error.city")); return; }
    if (!isTurkey && !manualCity) { setError(t("error.city")); return; }

    setLoading(true); setError(""); setResult(null);
    setAspectInterpretations(null);
    setHouseInterpretations(null);
    setPlanetInterpretations(null);
    setChartInterpretation(null);
    setInterpretError("");
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
      if (data.success) {
        const chartData = data.data;
        const lang = language;

        // Helper: fetch with 60s timeout
        const fetchWithTimeout = (url: string, body: object) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 60000);
          return fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          })
            .then(r => r.json())
            .catch(() => ({ success: false }))
            .finally(() => clearTimeout(timer));
        };

        // Wait for all AI interpretations before showing results (hard 55s ceiling)
        const hardTimeout = new Promise<void>(resolve => setTimeout(resolve, 55000));
        await Promise.race([
          Promise.all([
            fetchWithTimeout("/api/birth-chart/aspects-interpret", { chart: chartData, language: lang })
              .then(d => { if (d.success) setAspectInterpretations(d.data); }),
            fetchWithTimeout("/api/birth-chart/houses-interpret", { chart: chartData, language: lang })
              .then(d => { if (d.success) setHouseInterpretations(d.data); }),
            fetchWithTimeout("/api/birth-chart/interpret", { chart: chartData, language: lang })
              .then(d => { if (d.success) setChartInterpretation(d.data); }),
            fetchWithTimeout("/api/birth-chart/planets-interpret", { chart: chartData, language: lang })
              .then(d => { if (d.success) setPlanetInterpretations(d.data); }),
          ]),
          hardTimeout,
        ]);

        setResult(chartData);
        setActiveTab("overview");

        if (user?.id) {
          syncBirthChart(chartData, user.id);
        }

        // Log Interaction
        try {
          const profile = await getCurrentProfile();
          if (profile) {
            logInteraction(profile.id, "astrology", "Doğum haritası hesaplaması yapıldı");
          }
        } catch (err) {
          console.error("Log failed", err);
        }
      }
      else { setError(data.error || t("error.generic")); }
    } catch { setError(t("error.connection")); }
    finally { setLoading(false); }
  };

  const syncBirthChart = useCallback(async (chart: BirthChart, userId: string) => {
    try {
      await fetch("/api/birth-chart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chart, userId }),
      });
    } catch (err) {
      console.error("Birth chart sync failed:", err);
    }
  }, []);

  const findSunSign = () => {
    if (!fDay || !fMonth) return;
    const { getZodiacByDate } = require("@/data/zodiac");
    const sign = getZodiacByDate(parseInt(fMonth), parseInt(fDay));
    setFResult(sign);
  };

  const harmonyColor = (h: string) =>
    h === "positive" ? "text-green-400 bg-green-500/10 border-green-500/20" :
      h === "negative" ? "text-red-400 bg-red-500/10 border-red-500/20" :
        "text-blue-400 bg-blue-500/10 border-blue-500/20";

  return (
    <div className="cosmic-gradient min-h-screen">
      {/* Header */}
      <section className="pt-32 pb-8 px-4">
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
          {/* Quick Finder Toggle */}
          <div className="mb-6 text-center">
            <button
              onClick={() => setShowFinder(!showFinder)}
              className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 hover:text-purple-300 transition-all duration-300 flex items-center gap-2 mx-auto bg-purple-500/5 px-4 py-2 rounded-full border border-purple-500/10 group"
            >
              <Sparkles className="size-3.5 group-hover:rotate-12 transition-transform" /> {showFinder ? "Hızlı Bulucuyu Kapat" : "Burcunu Hemen Öğren"}
            </button>
          </div>

          {showFinder && (
            <div className="glass-card p-6 mb-8 border-purple-500/30 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-sm font-bold text-white mb-4 text-center uppercase tracking-widest">{t("chart.quick_finder")}</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <CosmicSelect
                    label={t("chart.day")}
                    value={fDay}
                    onChange={e => setFDay(e.target.value)}
                    options={[
                      { value: "", label: t("chart.day") },
                      ...Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }))
                    ]}
                  />
                </div>
                <div className="flex-1 w-full">
                  <CosmicSelect
                    label={t("chart.month")}
                    value={fMonth}
                    onChange={e => setFMonth(e.target.value)}
                    options={[
                      { value: "", label: t("chart.month") },
                      ...[t("month.jan"), t("month.feb"), t("month.mar"), t("month.apr"), t("month.may"), t("month.jun"), t("month.jul"), t("month.aug"), t("month.sep"), t("month.oct"), t("month.nov"), t("month.dec")].map((m, i) => ({ value: (i + 1).toString(), label: m }))
                    ]}
                  />
                </div>
                <button
                  onClick={findSunSign}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-8 h-[50px] rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-900/40 whitespace-nowrap active:scale-95"
                >
                  {t("chart.find_btn")}
                </button>
              </div>

              {fResult && (
                <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 shrink-0">
                    <ZodiacIcon signId={fResult.id} size={64} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{t(`zodiac.${fResult.id}`)}</p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">{fResult.dateRange}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDay(fDay);
                      setMonth(fMonth);
                      setShowFinder(false);
                    }}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-[10px] font-black uppercase text-pink-400 hover:bg-pink-500/20 transition-all group"
                  >
                    {t("chart.copy_to_form")} <Sparkles className="size-3 group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="glass-card p-8">
            {/* Date */}
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Calendar className="size-4 text-purple-400" />
              </div>
              {t("chart.date")}
            </h2>
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
                  ...Array.from({ length: 120 }, (_, i) => ({ value: (new Date().getFullYear() - i).toString(), label: (new Date().getFullYear() - i).toString() }))
                ]}
              />
            </div>

            {/* Time */}
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20">
                <Clock className="size-4 text-pink-400" />
              </div>
              {t("chart.time")} <span className="text-red-400 text-xs font-normal">({t("chart.required")})</span>
            </h2>
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
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <MapPin className="size-4 text-cyan-400" />
              </div>
              {t("chart.location")} <span className="text-red-400 text-xs font-normal">({t("chart.required")})</span>
            </h2>

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
              <div className="mb-6 p-3 rounded-lg bg-white/3 border border-white/5 text-gray-500 text-xs flex items-center gap-2">
                <MapPin className="size-3 text-cyan-500" /> {t("chart.coordinates")}: {selectedCity.lat.toFixed(4)}°N, {selectedCity.lng.toFixed(4)}°E | {t("chart.timezone")}: UTC+{selectedCountry?.utcOffset}
              </div>
            )}
            {!isTurkey && selectedCountry && (
              <div className="mb-6 p-3 rounded-lg bg-white/3 border border-white/5 text-gray-500 text-xs flex items-center gap-2">
                <Globe className="size-3 text-indigo-500" /> {selectedCountry.name} | {t("chart.timezone")}: UTC{selectedCountry.utcOffset >= 0 ? "+" : ""}{selectedCountry.utcOffset}
              </div>
            )}

            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

            <GlassButton
              fullWidth
              onClick={handleCalculate}
              disabled={loading}
            >
              {loading ? t("chart.calculating") : t("chart.calculate")}
            </GlassButton>
          </div>

          {loading && (
            <div className="mt-12 fade-in">
              <div className="flex flex-col items-center gap-6 py-8">
                {/* Animated wheel rings */}
                <div className="relative w-32 h-32">
                  {/* Outer ring */}
                  <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "8s" }} viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="2" />
                    <circle cx="64" cy="64" r="60" fill="none" stroke="url(#loadGrad1)" strokeWidth="2"
                      strokeDasharray="80 300" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="loadGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Middle ring */}
                  <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "5s", animationDirection: "reverse" }} viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="44" fill="none" stroke="rgba(236,72,153,0.15)" strokeWidth="2" />
                    <circle cx="64" cy="64" r="44" fill="none" stroke="url(#loadGrad2)" strokeWidth="2"
                      strokeDasharray="50 226" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="loadGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#38bdf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Inner ring */}
                  <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "3s" }} viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="28" fill="none" stroke="rgba(56,189,248,0.15)" strokeWidth="2" />
                    <circle cx="64" cy="64" r="28" fill="none" stroke="url(#loadGrad3)" strokeWidth="2"
                      strokeDasharray="30 145" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="loadGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Center star */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30 flex items-center justify-center">
                      <Sparkles className="size-4 text-purple-400 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="flex flex-col items-center gap-2">
                  <p className="text-white font-medium text-sm">{t("chart.calculating")}</p>
                  <div className="flex flex-col gap-1.5 mt-1">
                    {[
                      t("chart.loading.step1"),
                      t("chart.loading.step2"),
                      t("chart.loading.step3"),
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500/60 animate-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
              <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                <MapPin className="size-3 text-cyan-500/50" /> {selectedCountry?.name}{isTurkey ? `, ${city}` : (manualCity ? `, ${manualCity}` : "")}{district ? ` / ${district}` : ""} — {day}/{month}/{year}, {hour?.toString().padStart(2, "0")}:{minute?.toString().padStart(2, "0")}
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
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center">
                            {item.type === "ascendant" ? <ChevronUp className="size-8 text-purple-400 animate-bounce" /> : <Sparkles className="size-8 text-white animate-pulse" />}
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
                { key: "overview", label: t("chart.overview"), icon: BarChart3 },
                { key: "planets", label: t("chart.planets"), icon: Orbit },
                { key: "houses", label: t("chart.houses"), icon: Home },
                { key: "aspects", label: t("chart.aspects"), icon: Link2 },
                { key: "ai-yorumu", label: "Harita Yorumu", icon: Brain },
              ] as const).map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                    }`}>
                  <tab.icon className="size-4 mr-2 inline-block" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6 fade-in-up">

                {/* Zodiac Wheel Visualization — TOP */}
                <div className="glass-card p-6 border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2 text-center text-gradient">{t("chart.wheel")}</h3>
                  <p className="text-gray-400 text-sm text-center mb-6 max-w-2xl mx-auto">
                    {t("chart.wheel.desc")}
                  </p>
                  <BirthChartWheel chart={result} />
                </div>

                {/* Element Balance */}
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                    <Flame size={16} className="text-orange-400" />
                    {t("chart.element_balance")}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">{t("chart.element_balance.desc")}</p>
                  {([
                    { key: "fire" as const, text: "text-orange-400", bar: "bg-orange-500", bgActive: "bg-orange-500/10", border: "border-orange-500/20" },
                    { key: "earth" as const, text: "text-emerald-400", bar: "bg-emerald-500", bgActive: "bg-emerald-500/10", border: "border-emerald-500/20" },
                    { key: "air" as const, text: "text-sky-400", bar: "bg-sky-400", bgActive: "bg-sky-400/10", border: "border-sky-400/20" },
                    { key: "water" as const, text: "text-blue-400", bar: "bg-blue-500", bgActive: "bg-blue-500/10", border: "border-blue-500/20" },
                  ]).map((el) => {
                    const pct = result.elementBalance[el.key];
                    const isDominant = result.elementBalance.dominant === el.key;
                    const contributing = result.planetPositions.filter(
                      (p) => ELEMENT_OF_SIGN[p.signId] === el.key
                    );
                    return (
                      <div key={el.key} className={`mb-3 p-3 rounded-xl border ${isDominant ? `${el.bgActive} ${el.border}` : "bg-white/[0.02] border-white/5"}`}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className={el.text}>{t(`astrology.element.${el.key}`)}</span>
                          <span className={`font-mono font-bold ${isDominant ? el.text : "text-gray-400"}`}>
                            %{pct}{isDominant ? " ★" : ""}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                          <div className={`h-full rounded-full ${el.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-500 mb-1">{t(`chart.element.${el.key}.desc`)}</p>
                        {contributing.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contributing.map((p) => {
                              const pd = getPlanetById(PLANET_ID_MAP[p.planetId] || p.planetId);
                              return (
                                <span key={p.planetId} className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                                  {pd?.imageUrl && (
                                    <img src={pd.imageUrl} alt={p.planet} className="w-3 h-3 rounded-full object-cover" />
                                  )}
                                  {p.planet}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Modal Balance */}
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                    <BarChart3 size={16} className="text-purple-400" />
                    {t("chart.modality_balance")}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">{t("chart.modality_balance.desc")}</p>
                  {([
                    { key: "cardinal" as const, color: "bg-red-500", text: "text-red-400" },
                    { key: "fixed" as const, color: "bg-purple-500", text: "text-purple-400" },
                    { key: "mutable" as const, color: "bg-teal-500", text: "text-teal-400" },
                  ]).map((m) => {
                    const pct = result.modalBalance[m.key];
                    const isDominant = result.modalBalance.dominant === m.key;
                    return (
                      <div key={m.key} className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={`${m.text}${isDominant ? " font-bold" : ""}`}>
                            {t(`astrology.modality.${m.key}`)}
                            {isDominant ? " ★" : ""}
                          </span>
                          <span className="text-gray-400 font-mono">%{pct}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                          <div className={`h-full rounded-full ${m.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-500">{t(`chart.modality.${m.key}.desc`)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Dominant Planet */}
                {(() => {
                  const dp = result.planetPositions.find(p => p.planetId === result.dominantPlanet);
                  if (!dp) return null;
                  const dpHouse = Object.entries(result.planetsByHouse).find(([, ps]) => ps.includes(dp.planetId));
                  const dpData = getPlanetById(PLANET_ID_MAP[dp.planetId] || dp.planetId);
                  return (
                    <div className="glass-card p-5 rounded-2xl border border-yellow-500/20 flex items-center gap-5">
                      <div
                        className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10"
                        style={{ boxShadow: `0 0 24px ${dpData?.glow || "rgba(255,200,0,0.15)"}` }}
                      >
                        {dpData?.imageUrl ? (
                          <img src={dpData.imageUrl} alt={dp.planet} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">{dp.emoji}</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-yellow-400/60 mb-0.5">
                          {t("chart.dominant_planet")}
                        </p>
                        <h4 className="text-xl font-bold text-yellow-300">{dp.planet}</h4>
                        <p className="text-gray-400 text-xs">
                          {dp.sign} · {dpHouse ? t("chart.planet.in_house", { n: dpHouse[0] }) : ""}
                          {dp.retrograde ? " · ℞" : ""}
                        </p>
                        <p className="text-gray-500 text-[11px] mt-1">{t("chart.dominant_planet.desc")}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Stelliums */}
                {result.stelliums.length > 0 && (
                  <div className="glass-card p-5 rounded-2xl border border-purple-500/20">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="size-4 text-purple-400" />
                      Stellium
                    </h3>
                    {result.stelliums.map((s) => (
                      <div key={s.signId} className="mb-3">
                        <div className="text-purple-300 font-medium">
                          {t("chart.stellium.of_sign", { sign: s.signName })}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {s.planets.map(pid => {
                            const pp = result.planetPositions.find(p => p.planetId === pid);
                            const ppd = getPlanetById(PLANET_ID_MAP[pid] || pid);
                            return pp ? (
                              <span key={pid} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                                {ppd?.imageUrl && (
                                  <img src={ppd.imageUrl} alt={pp.planet} className="w-3.5 h-3.5 rounded-full object-cover" />
                                )}
                                {pp.planet}
                              </span>
                            ) : null;
                          })}
                        </div>
                        <p className="text-gray-500 text-[10px] mt-1.5">{t("chart.stellium.desc")}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Retrograde Summary */}
                {result.retrogradeCount > 0 && (
                  <div className="glass-card p-5 rounded-2xl">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <RefreshCcw size={16} className="text-amber-400" />
                      {t("chart.retrograde_planets")} ({result.retrogradeCount})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.planetPositions.filter(p => p.retrograde).map(p => {
                        const pd = getPlanetById(PLANET_ID_MAP[p.planetId] || p.planetId);
                        return (
                          <span key={p.planetId} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300">
                            {pd?.imageUrl && (
                              <img src={pd.imageUrl} alt={p.planet} className="w-3.5 h-3.5 rounded-full object-cover" />
                            )}
                            {p.planet} ℞
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">{t("chart.retrograde.explanation")}</p>
                  </div>
                )}

                {/* Top Aspects */}
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Link2 size={16} className="text-pink-400" />
                    En Güçlü Açılar
                  </h3>
                  {aspectInterpretLoading ? (
                    <div className="flex items-center gap-2 text-purple-400 text-xs">
                      <span className="inline-block w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                      Açı yorumları hazırlanıyor...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {result.aspects.filter(a => a.orb <= 4).sort((a, b) => a.orb - b.orb).slice(0, 4).map((aspect, i) => {
                        const p1d = getPlanetById(PLANET_ID_MAP[aspect.planet1Id] || aspect.planet1Id);
                        const p2d = getPlanetById(PLANET_ID_MAP[aspect.planet2Id] || aspect.planet2Id);
                        const aspectKey = `${aspect.planet1Id}_${aspect.planet2Id}_${aspect.typeId}`;
                        const aiText = aspectInterpretations?.[aspectKey];
                        const harmCol = aspect.harmony === "positive" ? "text-green-400" : aspect.harmony === "negative" ? "text-red-400" : "text-blue-400";
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <div className="flex items-center gap-1 shrink-0 mt-0.5">
                              {p1d?.imageUrl && <img src={p1d.imageUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-white/10" />}
                              <span className={`text-lg ${harmCol}`}>{aspect.typeEmoji}</span>
                              {p2d?.imageUrl && <img src={p2d.imageUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-white/10" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-medium">{t(`astrology.planet.${aspect.planet1Id}`)} {aspect.type} {t(`astrology.planet.${aspect.planet2Id}`)} <span className="text-gray-600 font-mono text-[10px]">{aspect.orb}°</span></p>
                              {aiText && <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">{aiText}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Planet Distribution in Houses */}
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Home size={16} className="text-indigo-400" />
                    Hayat Alanlarınızdaki Gezegenler
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {result.houses.slice(0, 10).map((house) => {
                      const planetsInHouse = result.planetsByHouse[house.house] || [];
                      return (
                        <div key={house.house} className={`p-2.5 rounded-xl border ${planetsInHouse.length > 0 ? "border-purple-500/20 bg-purple-500/5" : "border-white/5 bg-white/[0.02]"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{house.house}. Ev</span>
                            <span className="text-[9px] text-amber-400/60">{t(`zodiac.${house.signId}`)}</span>
                          </div>
                          <p className="text-[9px] text-gray-600 mb-1.5">{t(`astrology.house.${house.house}`)}</p>
                          {planetsInHouse.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {planetsInHouse.map(pid => {
                                const pd = getPlanetById(PLANET_ID_MAP[pid] || pid);
                                const pp = result.planetPositions.find(p => p.planetId === pid);
                                return (
                                  <span key={pid} className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                                    {pd?.imageUrl && <img src={pd.imageUrl} alt="" className="w-3 h-3 rounded-full object-cover" />}
                                    {pp?.planet}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[9px] text-white/15 italic">Boş</span>
                          )}
                        </div>
                      );
                    })}
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
                            <h4 className="text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                              {t(`astrology.planet.${pos.planetId}`)}
                              {pos.retrograde && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
                                  ℞ {t("chart.planet.retrograde_badge")}
                                </span>
                              )}
                              {(() => {
                                const houseEntry = Object.entries(result.planetsByHouse).find(([, ps]) => ps.includes(pos.planetId));
                                return houseEntry ? (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                                    {t("chart.planet.in_house", { n: houseEntry[0] })}
                                  </span>
                                ) : null;
                              })()}
                            </h4>
                            <div className="flex items-center gap-2 text-amber-400 font-medium text-sm">
                              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                                <ZodiacIcon signId={pos.signId} size={24} className="w-full h-full object-cover" />
                              </div>
                              {t(`zodiac.${pos.signId}`)} {pos.degree}°
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">{t("chart.planet.mystic_essence")}</div>
                          <p className="text-xs text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 shadow-inner">{t(`astrology.planet.meaning.${pos.planetId}`)}</p>
                        </div>
                      </div>

                      {/* Deep Interpretation */}
                      <div className="space-y-4 mt-6 pt-6 border-t border-white/5">
                        {planetInterpretations?.[pos.planetId] ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-purple-400 font-bold">
                              <Sparkles size={10} />
                              {t("chart.planet.personal_reading")}

                            </div>
                            <p className="text-sm text-gray-200 leading-relaxed">
                              {planetInterpretations[pos.planetId]}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-amber-500/30 pl-4 py-1">
                            "{t(`astrology.planet.${pos.planetId}.desc`)}"
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-colors">
                            <p className="text-[10px] uppercase font-bold text-green-400 mb-2 tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(74,222,128,0.5)]"></span>
                              {t("chart.planet.flow_pos")}
                            </p>
                            <p className="text-xs text-gray-400 leading-tight">{t(`astrology.planet.${pos.planetId}.traits.pos`)}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                            <p className="text-[10px] uppercase font-bold text-red-400 mb-2 tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(248,113,113,0.5)]"></span>
                              {t("chart.planet.flow_neg")}
                            </p>
                            <p className="text-xs text-gray-400 leading-tight">{t(`astrology.planet.${pos.planetId}.traits.neg`)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between text-[10px] text-gray-500 font-medium tracking-widest uppercase opacity-50">
                        <span>{t("chart.planet.longitude")}</span>
                        <span className="font-mono">{pos.fullDegree}° {pos.retrograde ? "(℞)" : "(D)"}</span>
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
                {houseInterpretLoading && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400 text-xs mb-2">
                    <span className="inline-block w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />
                    Ev yorumları hazırlanıyor...
                  </div>
                )}
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
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
                          <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <ZodiacIcon signId={house.signId} size={20} className="w-full h-full object-cover" />
                          </div>
                          {t(`zodiac.${house.signId}`)} {house.degree}°
                        </div>
                      </div>
                      {houseInterpretations?.[`house_${house.house}`] ? (
                        <p className="text-gray-300 text-[12px] leading-relaxed mt-1">
                          {houseInterpretations[`house_${house.house}`]}
                        </p>
                      ) : (
                        <>
                          <p className="text-gray-400 text-[11px] leading-relaxed italic opacity-80">
                            {t(`astrology.house.${house.house}.desc`)}
                          </p>
                          <p className="text-amber-300/40 text-[10px] mt-1 leading-relaxed">
                            {t(`zodiac.${house.signId}`)} — {t(`zodiac.${house.signId}.energy`)}
                          </p>
                        </>
                      )}
                      {/* Ruler info and planets in house */}
                      {(() => {
                        const rulership = result.houseRulerships[house.house - 1];
                        const rulerPlanet = rulership ? result.planetPositions.find(p => p.planetId === rulership.rulerPlanetId) : null;
                        const rulerPd = rulerPlanet ? getPlanetById(PLANET_ID_MAP[rulerPlanet.planetId] || rulerPlanet.planetId) : null;
                        const planetsInHouse = result.planetsByHouse[house.house] || [];
                        return (
                          <>
                            {rulerPlanet && (
                              <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                                <div
                                  className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 shrink-0"
                                  style={{ boxShadow: `0 0 8px ${rulerPd?.glow || "transparent"}` }}
                                >
                                  {rulerPd?.imageUrl && (
                                    <img src={rulerPd.imageUrl} alt={rulerPlanet.planet} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-500">{t("chart.house.ruler")}:</span>
                                <span className="text-[11px] text-purple-300 font-medium">{rulerPlanet.planet}</span>
                                <span className="text-[10px] text-gray-500">
                                  {t("chart.planet.in_house", { n: String(rulership.rulerHouse) })}
                                  {rulership.rulerRetrograde ? " ℞" : ""}
                                </span>
                              </div>
                            )}
                            {planetsInHouse.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {planetsInHouse.map(pid => {
                                  const pp = result.planetPositions.find(p => p.planetId === pid);
                                  const ppd = getPlanetById(PLANET_ID_MAP[pid] || pid);
                                  return pp ? (
                                    <span key={pid} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                                      {ppd?.imageUrl && (
                                        <img src={ppd.imageUrl} alt={pp.planet} className="w-3.5 h-3.5 rounded-full object-cover" />
                                      )}
                                      {pp.planet}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              <p className="text-[10px] text-white/20 italic mt-2">{t("chart.house.empty")}</p>
                            )}
                          </>
                        );
                      })()}
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
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {([
                      { id: "all" as const, labelKey: "chart.filter.all" },
                      { id: "positive" as const, labelKey: "chart.filter.harmonious" },
                      { id: "negative" as const, labelKey: "chart.filter.challenging" },
                      { id: "neutral" as const, labelKey: "chart.filter.neutral" },
                    ] as const).map(f => (
                      <button
                        key={f.id}
                        onClick={() => setAspectFilter(f.id)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all ${aspectFilter === f.id ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}
                      >
                        {t(f.labelKey)}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{filteredAspects.length}</span>
                </div>
                {/* AI loading indicator */}
                {aspectInterpretLoading && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-purple-400 text-xs mb-2">
                    <span className="inline-block w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin shrink-0" />
                    Açılar kişiselleştiriliyor...
                  </div>
                )}
                {filteredAspects.length === 0 ? (
                  <div className="glass-card p-6 text-center text-gray-500">{t("chart.aspect.none")}</div>
                ) : (
                  filteredAspects.map((aspect, i) => {
                    const p1d = getPlanetById(PLANET_ID_MAP[aspect.planet1Id] || aspect.planet1Id);
                    const p2d = getPlanetById(PLANET_ID_MAP[aspect.planet2Id] || aspect.planet2Id);
                    const harmonyBorderClass =
                      aspect.harmony === "positive" ? "border-green-500/20" :
                        aspect.harmony === "negative" ? "border-red-500/20" : "border-blue-500/20";
                    const harmonyTextClass =
                      aspect.harmony === "positive" ? "text-green-400" :
                        aspect.harmony === "negative" ? "text-red-400" : "text-blue-400";
                    const aspectKey = `${aspect.planet1Id}_${aspect.planet2Id}_${aspect.typeId}`;
                    const aiText = aspectInterpretations?.[aspectKey];
                    return (
                      <div key={i} className={`glass-card p-4 border ${harmonyBorderClass}`}>
                        <div className="flex items-center gap-3">
                          {/* Planet 1 photo */}
                          <div
                            className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10"
                            style={{ boxShadow: `0 0 12px ${p1d?.glow || "transparent"}` }}
                          >
                            {p1d?.imageUrl && <img src={p1d.imageUrl} alt={aspect.planet1Id} className="w-full h-full object-cover" />}
                          </div>
                          {/* Aspect symbol */}
                          <div className="flex flex-col items-center gap-0.5 shrink-0 min-w-[56px]">
                            <span className={`text-xl ${harmonyTextClass}`}>{aspect.typeEmoji}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${harmonyTextClass}`}>
                              {t(`astrology.aspect.${aspect.typeId}`)}
                            </span>
                            <span className="text-[8px] font-mono text-gray-500">{aspect.orb}° {t("chart.aspect.orb")}</span>
                          </div>
                          {/* Planet 2 photo */}
                          <div
                            className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10"
                            style={{ boxShadow: `0 0 12px ${p2d?.glow || "transparent"}` }}
                          >
                            {p2d?.imageUrl && <img src={p2d.imageUrl} alt={aspect.planet2Id} className="w-full h-full object-cover" />}
                          </div>
                          {/* Names + applying badge */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {t(`astrology.planet.${aspect.planet1Id}`)} — {t(`astrology.planet.${aspect.planet2Id}`)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${aspect.applying
                                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                                  : "border-gray-500/30 bg-gray-500/10 text-gray-400"
                                }`}>
                                {aspect.applying ? `↗ ${t("chart.aspect.applying")}` : `↘ ${t("chart.aspect.separating")}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Interpretation */}
                        <div className="mt-3 pt-3 border-t border-white/5">
                          {aiText ? (
                            <p className="text-gray-300 text-[12px] leading-relaxed">{aiText}</p>
                          ) : (
                            <p className="text-gray-600 text-[11px] leading-relaxed italic">
                              {t(`astrology.aspect.${aspect.typeId}.desc`)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* AI Yorumu Tab */}
            {activeTab === "ai-yorumu" && (
              <div className="space-y-6 fade-in-up">

                {chartInterpretation ? (
                  <div className="space-y-4">
                    {([
                      { key: "general" as const, titleKey: "chart.interpretation.general_title", icon: <Star size={16} className="text-yellow-400" /> },
                      { key: "strengths" as const, titleKey: "chart.interpretation.strengths_title", icon: <Zap size={16} className="text-green-400" /> },
                      { key: "challenges" as const, titleKey: "chart.interpretation.challenges_title", icon: <Info size={16} className="text-amber-400" /> },
                      { key: "advice" as const, titleKey: "chart.interpretation.advice_title", icon: <Lightbulb size={16} className="text-blue-400" /> },
                    ]).map(section => (
                      <div key={section.key} className="glass-card p-5 rounded-2xl">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          {section.icon}
                          {t(section.titleKey)}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                          {chartInterpretation[section.key]}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 rounded-2xl text-center text-gray-500">
                    <Brain size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">{t("chart.interpretation.personal_desc")}</p>
                  </div>
                )}

                {/* Transit section - moved here from old transits tab */}
                <div className="glass-card p-6 border-l-4 border-amber-500">
                  <h3 className="text-xl font-bold text-white mb-2">{t("chart.transits")}</h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-2xl">
                    {t("chart.transits.desc")}
                  </p>

                  {result.transits && result.transits.length > 0 ? (
                    <div className="space-y-3 mb-8">
                      {result.transits.map((transit: any, idx: number) => {
                        const tpd = getPlanetById(PLANET_ID_MAP[transit.transitPlanetId] || transit.transitPlanetId);
                        const npd = getPlanetById(PLANET_ID_MAP[transit.natalPlanetId] || transit.natalPlanetId);
                        const harmonyColor =
                          transit.harmony === "positive" ? "#4ade80" :
                            transit.harmony === "negative" ? "#f87171" : "#60a5fa";
                        return (
                          <div key={idx} className="glass-card p-4">
                            <div className="flex items-center gap-3 mb-2">
                              {/* Transit planet */}
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <div
                                  className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10"
                                  style={{ boxShadow: `0 0 16px ${tpd?.glow || "transparent"}` }}
                                >
                                  {tpd?.imageUrl && (
                                    <img src={tpd.imageUrl} alt={transit.transitPlanetId} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <span className="text-[8px] text-gray-500 uppercase tracking-wider">
                                  {t("chart.transit.transit_planet")}
                                </span>
                                <span className="text-[10px] text-white font-medium">
                                  {t(`astrology.planet.${transit.transitPlanetId}`)}
                                </span>
                              </div>
                              {/* Aspect center */}
                              <div className="flex flex-col items-center gap-1 flex-1">
                                <span className="text-2xl">{transit.typeEmoji}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: harmonyColor }}>
                                  {t(`astrology.aspect.${transit.typeId}`)}
                                </span>
                                {transit.applying !== undefined && (
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${transit.applying
                                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                                      : "border-gray-500/30 bg-gray-500/10 text-gray-400"
                                    }`}>
                                    {transit.applying
                                      ? `↗ ${t("chart.transit.applying")}`
                                      : `↘ ${t("chart.transit.separating")}`}
                                  </span>
                                )}
                              </div>
                              {/* Natal planet */}
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <div
                                  className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10"
                                  style={{ boxShadow: `0 0 16px ${npd?.glow || "transparent"}` }}
                                >
                                  {npd?.imageUrl && (
                                    <img src={npd.imageUrl} alt={transit.natalPlanetId} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <span className="text-[8px] text-gray-500 uppercase tracking-wider">
                                  {t("chart.transit.natal_planet")}
                                </span>
                                <span className="text-[10px] text-white font-medium">
                                  {t(`astrology.planet.${transit.natalPlanetId}`)}
                                </span>
                              </div>
                            </div>
                            {/* Transit description */}
                            <p className="text-gray-500 text-[11px] leading-relaxed px-1 border-t border-white/5 pt-2">
                              {t(`astrology.planet.meaning.${transit.transitPlanetId}`)}
                              {" "}→{" "}
                              <span style={{ color: harmonyColor }} className="font-medium">
                                {t(`astrology.aspect.${transit.typeId}.action`)}
                              </span>
                              {" "}→{" "}
                              {t(`astrology.planet.meaning.${transit.natalPlanetId}`)}
                            </p>
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
                    <div>
                      {transitLoading ? (
                        <CosmicLoader label={t("chart.transits.loading")} />
                      ) : (
                        <GlassButton
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
                            } catch (e) { }
                            setTransitLoading(false);
                          }}
                          disabled={transitLoading || !result.transits || result.transits.length === 0}
                        >
                          {t("chart.transits.btn")}
                        </GlassButton>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-purple-900/20 border border-purple-500/20 relative overflow-hidden mt-6">
                      <h4 className="text-xl font-bold text-white mb-2">{transitInterpretation.title}</h4>
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">{transitInterpretation.content}</p>
                      <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/10 flex items-start gap-2">
                        <Lightbulb className="size-4 text-pink-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{transitInterpretation.advice}</span>
                      </div>
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
