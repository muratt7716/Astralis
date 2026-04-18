import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithFallback } from "@/lib/gemini";
import type { BirthChart } from "@/lib/astrology";
import { getBirthChartInterpretPrompt } from "@/lib/birth-chart-prompts";
import type { SupportedLanguage } from "@/lib/i18n-shared";

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { chart, language = "en" }: { chart: BirthChart; language?: SupportedLanguage } = body;
    if (!chart) return NextResponse.json({ error: "Harita verisi eksik." }, { status: 400 });

    const planetLines = chart.planetPositions.map((p) => {
      const houseEntry = Object.entries(chart.planetsByHouse).find(([, ps]) => ps.includes(p.planetId));
      return `- ${p.planet}: ${p.sign}, ${houseEntry?.[0] || "?"} Ev${p.retrograde ? " ℞" : ""}`;
    }).join("\n");

    const aspectLines = chart.aspects
      .filter((a) => a.orb <= 5).slice(0, 10)
      .map((a) => `- ${a.planet1} ${a.typeEmoji} ${a.planet2} (orb ${a.orb}°, ${a.applying ? "yaklaşıyor" : "uzaklaşıyor"})`)
      .join("\n");

    const elementLabels: Record<string, string> = { fire: "Ateş", earth: "Toprak", air: "Hava", water: "Su" };
    const modalLabels: Record<string, string> = { cardinal: "Öncü", fixed: "Sabit", mutable: "Değişken" };
    const dp = chart.planetPositions.find((p) => p.planetId === chart.dominantPlanet);

    const stelliums = chart.stelliums.length > 0
      ? `Stellium: ${chart.stelliums.map((s) => `${s.signName} (${s.planets.join(", ")})`).join("; ")}`
      : "";

    const prompt = getBirthChartInterpretPrompt({
      language,
      sunSignName: chart.sunSign.name,
      sunSignDegree: chart.sunSign.degree,
      moonSignName: chart.moonSign.name,
      moonSignDegree: chart.moonSign.degree,
      risingSignName: chart.risingSign.name,
      risingSignDegree: chart.risingSign.degree,
      planetLines,
      aspectLines,
      elementBalance: chart.elementBalance,
      elementLabels,
      modalBalance: chart.modalBalance,
      modalLabels,
      dominantPlanet: dp?.planet || chart.dominantPlanet,
      dominantPlanetSign: dp?.sign,
      stelliums,
      retrogradeCount: chart.retrogradeCount,
    });

    const raw = await callGeminiWithFallback(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "AI yanıtı işlenemedi." }, { status: 500 });

    return NextResponse.json({ success: true, data: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    console.error("Birth chart interpret error:", error);
    return NextResponse.json({ error: "Yorum oluşturulamadı." }, { status: 500 });
  }
}
