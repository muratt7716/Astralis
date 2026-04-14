import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { generateCompatibility, SupportedLanguage } from "@/lib/gemini";
import { zodiacSigns } from "@/data/zodiac";

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get("lang") || "tr") as SupportedLanguage;

    const body = await request.json();
    const { sign1, sign2 } = body;

    if (!sign1 || !sign2) {
      return NextResponse.json(
        { error: "İki burç seçmeniz gerekmektedir." },
        { status: 400 }
      );
    }

    const s1 = zodiacSigns.find(s => s.id === sign1);
    const s2 = zodiacSigns.find(s => s.id === sign2);

    if (!s1 || !s2) {
      return NextResponse.json(
        { error: "Geçersiz burç seçimi." },
        { status: 400 }
      );
    }

    const result = await generateCompatibility(s1.id, s1.name, s2.id, s2.name, lang);

    if (!result) {
       return NextResponse.json(
        { error: "Uyumluluk yorumu oluşturulurken Gemini API hatası." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error("Compatibility API error:", err);
    return NextResponse.json(
      { error: "Uyumluluk hesaplanırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
