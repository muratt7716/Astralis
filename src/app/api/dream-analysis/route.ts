import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithFallback, SupportedLanguage } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { dream, language = "tr", userId } = body;

    const lang: SupportedLanguage = ["tr", "en", "ar", "de", "fr"].includes(language)
      ? (language as SupportedLanguage)
      : "tr";

    if (!dream || dream.trim().length < 10) {
      return NextResponse.json({
        error: lang === "tr" 
          ? "Lütfen rüyanızı en az birkaç cümleyle anlatın." 
          : "Please describe your dream in at least a few sentences.",
        success: false,
      }, { status: 400 });
    }

    // AI API check
    if (!process.env.GOOGLE_CLOUD_PROJECT && !process.env.GROQ_API_KEY) {
      return NextResponse.json({
        error: "Sistem yapılandırma hatası: AI yapılandırması eksik.",
        success: false,
      }, { status: 500 });
    }

    const langNames: Record<SupportedLanguage, string> = {
      tr: "Türkçe", en: "English", ar: "العربية", de: "Deutsch", fr: "Français",
    };

    const prompt = `You are an elite, interdisciplinary dream analysis expert. Your approach combines three distinct layers of interpretation:
1. Archeological/Historical (Mesopotamia, Ancient Egypt, Dream Books): Treating dreams as a foundational warning or coding system of the ancients.
2. Psychological (Carl Jung, Artemidorus, Henri Bergson): Treating dreams as subconscious data. Focus on Jungian archetypes, collective unconscious, shadow elements, and Bergson's memory release concepts.
3. Cultural/Contextual (Ibn Sirin): Contextual and situational interpretation based on the dreamer's dynamic situation and temperament.

Language: ${langNames[lang]}

The user describes the following dream:
"${dream}"

Analyze this dream deeply and return ONLY valid JSON.
CRITICAL RULES:
- DO NOT output any prefix text like "Here is the analysis" or "Bütünsel Sentez". Output ONLY the JSON object.
- Write in flawless, native ${langNames[lang]}. DO NOT USE repetitive filler words (like "various", "çeşitli", "aynı şekilde", "benzemektedir").
- Every sentence must contain unique, deep, and brilliant insight. Do not repeat the same concepts in different categories.
- Use explicit '\\n' characters if you need line breaks inside strings, otherwise keep as a single continuous string.

{
  "key_symbol": "The most prominent symbol from the dream (1-2 words)",
  "layer_archaeological": "Write 1-2 detailed paragraphs interpreting the dream via Ancient Mesopotamian/Egyptian context. Elaborate historically and mythologically. No filler.",
  "layer_psychological": "Write 1-2 detailed paragraphs on Jungian archetypes, collective unconscious and Artemidorus. Be analytical and deeply psychological. No filler.",
  "layer_cultural": "Write 1-2 detailed paragraphs in the style of Ibn Sirin, contextualizing to the user's real-life situation, struggles, and temperament. No filler.",
  "synthesis": "Write 1-2 detailed paragraphs providing a holistic philosophical summary tying everything together.",
  "actionable_advice": "Write 1 actionable paragraph ('The Dream\\'s Whisper') detailing exactly what the user should practically DO in their waking life based on this dream.",
  "energy_chakra": "Write 2 sentences explaining exactly which Chakra (e.g., Root) and which Element (Fire/Air/Water/Earth) was most active in this dream and WHY.",
  "color_therapy": "Write 2 sentences suggesting a specific balancing color (e.g., Indigo Blue) and a sound frequency (e.g., 432 Hz), explaining how it heals the dreamer's current state.",
  "reflection_questions": ["3 deep, unique, thought-provoking questions"]
}`;

    const text = await callGeminiWithFallback(prompt);

    // Parse JSON from AI response robustly
    let analysis;
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const jsonStr = text.substring(start, end + 1);
        analysis = JSON.parse(jsonStr);
      } else {
        throw new Error("No JSON boundaries found");
      }
    } catch {
      analysis = { synthesis: text, symbols: [], reflection_questions: [] };
    }

    if (userId) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase");
        await supabaseAdmin.from("interaction_logs").insert({
          user_id: userId,
          action_type: "dream",
          description: "Rüya analizi gerçekleştirildi.",
          metadata: {
            question: dream,
            answer: analysis.synthesis || "Analiz tamamlandı."
          }
        });
      } catch (logErr) {
        console.error("Post-dream logging failed:", logErr);
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
    });

  } catch (error) {
    console.error("Dream analysis error:", error);
    return NextResponse.json({
      error: "Rüya analizi oluşturulamadı. Lütfen tekrar deneyin.",
      success: false,
    }, { status: 500 });
  }
}
