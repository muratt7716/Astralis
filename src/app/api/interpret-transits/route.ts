import { NextRequest, NextResponse } from "next/server";
import { generateTransitInterpretation, type SupportedLanguage } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transits, language } = body;

    if (!transits || !Array.isArray(transits) || transits.length === 0) {
      return NextResponse.json(
        { error: "Transit verisi eksik veya geçersiz." },
        { status: 400 }
      );
    }

    const lang: SupportedLanguage = ["tr", "en", "ar", "de", "fr"].includes(language)
      ? (language as SupportedLanguage)
      : "tr";

    // Try Gemini API
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_api_key_here") {
      return NextResponse.json({ 
        error: "Sistem yapılandırma hatası: AI API anahtarı eksik.",
        success: false 
      }, { status: 500 });
    }

    const aiResult = await generateTransitInterpretation(transits, lang);

    if (aiResult) {
      return NextResponse.json({
        success: true,
        data: aiResult,
        source: "gemini",
      });
    }

    return NextResponse.json({ 
      error: "Transit analizi şu anda oluşturulamadı. Lütfen daha sonra tekrar deneyin.",
      success: false 
    }, { status: 500 });

  } catch (error) {
    console.error("Transit interpretation API error:", error);
    return NextResponse.json(
      { error: "Geçersiz istek formatı." },
      { status: 400 }
    );
  }
}
