import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithFallback } from "@/lib/gemini";
import type { BirthChart } from "@/lib/astrology";
import { getPlanetsInterpretPrompt } from "@/lib/birth-chart-prompts";
import type { SupportedLanguage } from "@/lib/i18n-shared";

const PLANET_NAME_MAP: Record<string, Record<SupportedLanguage, string>> = {
  sun:     { tr: "Güneş",   en: "Sun",     de: "Sonne",    fr: "Soleil",  ar: "الشمس" },
  moon:    { tr: "Ay",      en: "Moon",    de: "Mond",     fr: "Lune",    ar: "القمر" },
  mercury: { tr: "Merkür",  en: "Mercury", de: "Merkur",   fr: "Mercure", ar: "عطارد" },
  venus:   { tr: "Venüs",   en: "Venus",   de: "Venus",    fr: "Vénus",   ar: "الزهرة" },
  mars:    { tr: "Mars",    en: "Mars",    de: "Mars",     fr: "Mars",    ar: "المريخ" },
  jupiter: { tr: "Jüpiter", en: "Jupiter", de: "Jupiter",  fr: "Jupiter", ar: "المشتري" },
  saturn:  { tr: "Satürn",  en: "Saturn",  de: "Saturn",   fr: "Saturne", ar: "زحل" },
  uranus:  { tr: "Uranüs",  en: "Uranus",  de: "Uranus",   fr: "Uranus",  ar: "أورانوس" },
  neptune: { tr: "Neptün",  en: "Neptune", de: "Neptun",   fr: "Neptune", ar: "نبتون" },
  pluto:   { tr: "Plüton",  en: "Pluto",   de: "Pluto",    fr: "Pluton",  ar: "بلوتو" },
};

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 10, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { chart, language = "tr" }: { chart: BirthChart; language?: SupportedLanguage } = body;
    if (!chart) return NextResponse.json({ error: "Harita verisi eksik." }, { status: 400 });

    // Build house lookup: planetId → house number
    const planetHouseMap: Record<string, string> = {};
    Object.entries(chart.planetsByHouse).forEach(([houseNum, planetIds]) => {
      (planetIds as string[]).forEach((pid) => { planetHouseMap[pid] = houseNum; });
    });

    const planetsForPrompt = chart.planetPositions.map((p) => ({
      key: p.planetId,
      name: PLANET_NAME_MAP[p.planetId]?.[language] || p.planetId,
      sign: p.sign,
      house: planetHouseMap[p.planetId] || "?",
      degree: p.degree,
      retrograde: p.retrograde,
    }));

    const prompt = getPlanetsInterpretPrompt({
      language,
      sunSignName: chart.sunSign.name,
      moonSignName: chart.moonSign.name,
      risingSignName: chart.risingSign.name,
      planets: planetsForPrompt,
    });

    const raw = await callGeminiWithFallback(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "AI yanıtı işlenemedi." }, { status: 500 });

    return NextResponse.json({ success: true, data: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    console.error("Planets interpret error:", error);
    return NextResponse.json({ error: "Yorum oluşturulamadı." }, { status: 500 });
  }
}
