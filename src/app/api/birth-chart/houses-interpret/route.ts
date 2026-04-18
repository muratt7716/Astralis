import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithFallback } from "@/lib/gemini";
import type { BirthChart } from "@/lib/astrology";
import { getHousesInterpretPrompt } from "@/lib/birth-chart-prompts";
import type { SupportedLanguage } from "@/lib/i18n-shared";

// House themes by language
const HOUSE_THEMES: Record<SupportedLanguage, string[]> = {
  tr: [
    "Kimlik ve Dış Görünüş", "Değerler ve Maddiyat", "İletişim ve Yakın Çevre",
    "Yuva ve Kökler", "Yaratıcılık ve Aşk", "Sağlık ve Hizmet",
    "İlişkiler ve Ortaklık", "Dönüşüm ve Paylaşılan Değerler",
    "Bilgelik ve İnanç", "Kariyer ve Toplum", "Sosyal Çevre ve Hayaller",
    "Bilinçaltı ve Ruhsallık"
  ],
  en: [
    "Identity and Appearance", "Values and Material", "Communication and Neighbors",
    "Home and Roots", "Creativity and Love", "Health and Service",
    "Relationships and Partnership", "Transformation and Shared Resources",
    "Wisdom and Beliefs", "Career and Society", "Social Circle and Dreams",
    "Subconscious and Spirituality"
  ],
  de: [
    "Identität und Erscheinung", "Werte und Materielles", "Kommunikation und Umgebung",
    "Heim und Wurzeln", "Kreativität und Liebe", "Gesundheit und Dienst",
    "Beziehungen und Partnerschaft", "Transformation und gemeinsame Ressourcen",
    "Weisheit und Glaube", "Karriere und Gesellschaft", "Soziales Umfeld und Träume",
    "Unterbewusstsein und Spiritualität"
  ],
  fr: [
    "Identité et Apparence", "Valeurs et Matériel", "Communication et Voisinage",
    "Foyer et Racines", "Créativité et Amour", "Santé et Service",
    "Relations et Partenariat", "Transformation et Ressources Partagées",
    "Sagesse et Croyances", "Carrière et Société", "Cercle Social et Rêves",
    "Subconscient et Spiritualité"
  ],
  ar: [
    "الهوية والمظهر", "القيم والمادة", "التواصل والجوار",
    "البيت والجذور", "الإبداع والحب", "الصحة والخدمة",
    "العلاقات والشراكة", "التحول والموارد المشتركة",
    "الحكمة والمعتقدات", "المهنة والمجتمع", "الدائرة الاجتماعية والأحلام",
    "العقل الباطن والروحانية"
  ],
};

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 10, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { chart, language = "tr" }: { chart: BirthChart; language?: SupportedLanguage } = body;
    if (!chart) return NextResponse.json({ error: "Harita verisi eksik." }, { status: 400 });

    const themes = HOUSE_THEMES[language] || HOUSE_THEMES.tr;

    const housesForPrompt = chart.houses.map((house) => {
      const planetsInHouse = (chart.planetsByHouse[house.house] || [])
        .map((pid: string) => {
          const pos = chart.planetPositions.find((p) => p.planetId === pid);
          return pos?.planet || pid;
        });

      return {
        key: `house_${house.house}`,
        number: house.house,
        houseName: themes[house.house - 1] || `House ${house.house}`,
        signName: house.sign,
        signId: house.signId,
        planets: planetsInHouse,
      };
    });

    const prompt = getHousesInterpretPrompt({
      language,
      sunSignName: chart.sunSign.name,
      moonSignName: chart.moonSign.name,
      risingSignName: chart.risingSign.name,
      houses: housesForPrompt,
    });

    const raw = await callGeminiWithFallback(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "AI yanıtı işlenemedi." }, { status: 500 });

    return NextResponse.json({ success: true, data: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    console.error("Houses interpret error:", error);
    return NextResponse.json({ error: "Yorum oluşturulamadı." }, { status: 500 });
  }
}
