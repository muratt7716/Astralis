import { NextRequest, NextResponse } from "next/server";
import { calculateBirthChart, calculateSynastryAspects } from "@/lib/astrology";
import { generateSynastryInterpretation, type SupportedLanguage } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person1, person2, language } = body;

    if (!person1 || !person2) {
      return NextResponse.json(
        { error: "Her iki kişinin de bilgileri gereklidir." },
        { status: 400 }
      );
    }

    const lang: SupportedLanguage = ["tr", "en", "ar", "de", "fr"].includes(language)
      ? (language as SupportedLanguage)
      : "tr";

    // 1. Calculate Individual Birth Charts
    const chart1 = calculateBirthChart(
      person1.year, person1.month, person1.day,
      person1.hour, person1.minute,
      person1.latitude, person1.longitude, person1.utcOffset
    );

    const chart2 = calculateBirthChart(
      person2.year, person2.month, person2.day,
      person2.hour, person2.minute,
      person2.latitude, person2.longitude, person2.utcOffset
    );

    // 2. Calculate Synastry Aspects
    const synastryAspects = calculateSynastryAspects(chart1.planetPositions, chart2.planetPositions);

    // 3. Generate Interpretation with Gemini
    let interpretation = null;
    
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_api_key_here") {
      interpretation = await generateSynastryInterpretation(chart1, chart2, synastryAspects, lang);
    }
    
    // Fallback if Gemini fails
    if (!interpretation) {
      interpretation = {
        overallScore: 50,
        loveScore: 50,
        friendshipScore: 50,
        workScore: 50,
        description: "Kozmik analizi şu an yükleyemiyoruz. Ancak harita açılarına göre yukarıdaki listelenen gezegen bağlantıları ikili ilişkinizin dinamiklerini belirliyor.",
        strengths: ["Uyumlu açılar keşfedilmeyi bekliyor"],
        challenges: ["Zorlu açılar üzerinde çalışma gerektirir"]
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        chart1,
        chart2,
        synastryAspects,
        interpretation
      }
    });

  } catch (error) {
    console.error("Synastry API error:", error);
    return NextResponse.json(
      { error: "Harita uyumu hesaplanırken hata oluştu." },
      { status: 500 }
    );
  }
}
