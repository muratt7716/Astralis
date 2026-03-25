import { NextRequest, NextResponse } from "next/server";
import { calculateBirthChart, calculateSynastryAspects } from "@/lib/astrology";
import { generateSynastryInterpretation, type SupportedLanguage } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person1, person2, language } = body;

      const errorMsgs: Record<string, string> = {
        tr: "Her iki kişinin de bilgileri gereklidir.",
        en: "Information for both people is required.",
        ar: "معلومات كلا الشخصين مطلوبة.",
        de: "Informationen für beide Personen sind erforderlich.",
        fr: "Les informations pour les deux personnes sont requises."
      };
      return NextResponse.json(
        { error: errorMsgs[language as SupportedLanguage] || errorMsgs.tr },
        { status: 400 }
      );

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
      const fallbackDescs: Record<SupportedLanguage, string> = {
        tr: "Kozmik analizi şu an yükleyemiyoruz. Ancak harita açılarına göre yukarıdaki listelenen gezegen bağlantıları ikili ilişkinizin dinamiklerini belirliyor.",
        en: "We cannot load the cosmic analysis right now. However, the planetary connections listed above determine the dynamics of your relationship according to the chart angles.",
        ar: "لا يمكننا تحميل التحليل الكوني حاليًا. ومع ذلك، فإن الروابط الكوكبية المدرجة أعلاه تحدد ديناميكيات علاقتكما وفقًا لزوايا الخريطة.",
        de: "Wir können die kosmische Analyse derzeit nicht laden. Die oben aufgeführten planetaren Verbindungen bestimmen jedoch die Dynamik Ihrer Beziehung gemäß den Horoskopaspekten.",
        fr: "Nous ne pouvons pas charger l'analyse cosmique pour le moment. Cependant, les connexions planétaires listées ci-dessus déterminent la dynamique de votre relation selon les angles du thème."
      };
      const fallbackStrengths: Record<SupportedLanguage, string[]> = {
        tr: ["Uyumlu açılar keşfedilmeyi bekliyor"],
        en: ["Harmonious aspects are waiting to be explored"],
        ar: ["جوانب متناغمة تنتظر الاستكشاف"],
        de: ["Harmonische Aspekte warten darauf, entdeckt zu werden"],
        fr: ["Des aspects harmonieux attendent d'être explorés"]
      };
      const fallbackChallenges: Record<SupportedLanguage, string[]> = {
        tr: ["Zorlu açılar üzerinde çalışma gerektirir"],
        en: ["Challenging aspects require work"],
        ar: ["الجوانب الصعبة تتطلب العمل"],
        de: ["Herausfordernde Aspekte erfordern Arbeit"],
        fr: ["Les aspects difficiles nécessitent du travail"]
      };

      interpretation = {
        overallScore: 50,
        loveScore: 50,
        friendshipScore: 50,
        workScore: 50,
        description: fallbackDescs[lang],
        strengths: fallbackStrengths[lang],
        challenges: fallbackChallenges[lang]
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
