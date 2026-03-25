import { NextRequest, NextResponse } from "next/server";
import {
  generateDivinationReading,
  generateCoffeeReading,
  generateVirtualCoffeeReading,
  type DivinationType,
  type SupportedLanguage,
} from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, cards, question, language, imageBase64, mimeType, virtual, persona } = body;
    const lang = (language || "tr") as SupportedLanguage;

    // Coffee reading (photo or virtual)
    if (type === "coffee") {
      if (virtual) {
        const result = await generateVirtualCoffeeReading(question || "", lang, persona);
        if (!result) {
          return NextResponse.json({ success: false, error: "AI yorumu başarısız oldu." }, { status: 500 });
        }
        return NextResponse.json({ success: true, data: result });
      }

      if (!imageBase64 || !mimeType) {
        return NextResponse.json({ success: false, error: "Fotoğraf gerekli." }, { status: 400 });
      }

      try {
        const result = await generateCoffeeReading(imageBase64, mimeType, question || "", lang, persona);
        if (result?.error === "INVALID_IMAGE") {
          return NextResponse.json({ success: false, error: "Lütfen geçerli bir kahve fincanı fotoğrafı yükleyin. Sistemimiz gönderdiğiniz görselde telve tespit edemedi." }, { status: 400 });
        }
        return NextResponse.json({ success: true, data: result });
      } catch (error) {
        return NextResponse.json({ success: false, error: "Kahve falı yorumlanamadı." }, { status: 500 });
      }
    }

    // Text-based divination (tarot, katina, lenormand, rune, iching, crystal)
    if (!type || !cards || !Array.isArray(cards)) {
      return NextResponse.json({ success: false, error: "Tip ve kart bilgisi gerekli." }, { status: 400 });
    }

    const result = await generateDivinationReading(
      type as DivinationType,
      cards,
      question || "",
      lang,
      persona
    );

    if (!result) {
      return NextResponse.json({ success: false, error: "AI yorumu başarısız oldu." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Divination API error:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
