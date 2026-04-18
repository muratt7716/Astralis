import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithFallback } from "@/lib/gemini";
import type { BirthChart } from "@/lib/astrology";
import { getAspectsInterpretPrompt } from "@/lib/birth-chart-prompts";
import type { SupportedLanguage } from "@/lib/i18n-shared";

const ZODIAC_SIGNS_ORDER = [
  "koc","boga","ikizler","yengec","aslan","basak",
  "terazi","akrep","yay","oglak","kova","balik"
];

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

    // Build sign name lookup from planetPositions
    const planetSignMap: Record<string, string> = {};
    chart.planetPositions.forEach((p) => { planetSignMap[p.planetId] = p.sign; });

    // Filter meaningful aspects (orb ≤ 6°) and take top 15 by orb
    const meaningfulAspects = chart.aspects
      .filter((a) => a.orb <= 6)
      .sort((a, b) => a.orb - b.orb)
      .slice(0, 15);

    if (meaningfulAspects.length === 0) {
      return NextResponse.json({ success: true, data: {} });
    }

    const aspectsForPrompt = meaningfulAspects.map((a) => ({
      key: `${a.planet1Id}_${a.planet2Id}_${a.typeId}`,
      p1Name: a.planet1,
      p1Sign: planetSignMap[a.planet1Id] || "?",
      p1House: planetHouseMap[a.planet1Id] ? `${planetHouseMap[a.planet1Id]}. Ev` : "?",
      p2Name: a.planet2,
      p2Sign: planetSignMap[a.planet2Id] || "?",
      p2House: planetHouseMap[a.planet2Id] ? `${planetHouseMap[a.planet2Id]}. Ev` : "?",
      aspectType: a.type,
      orb: a.orb,
      harmony: a.harmony as "positive" | "negative" | "neutral",
    }));

    const prompt = getAspectsInterpretPrompt({
      language,
      sunSignName: chart.sunSign.name,
      moonSignName: chart.moonSign.name,
      risingSignName: chart.risingSign.name,
      aspects: aspectsForPrompt,
    });

    const raw = await callGeminiWithFallback(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "AI yanıtı işlenemedi." }, { status: 500 });

    return NextResponse.json({ success: true, data: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    console.error("Aspects interpret error:", error);
    return NextResponse.json({ error: "Yorum oluşturulamadı." }, { status: 500 });
  }
}
