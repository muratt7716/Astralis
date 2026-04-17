import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import {
  generateDivinationReading,
  generateCoffeeReading,
  generateVirtualCoffeeReading,
  type DivinationType,
  type SupportedLanguage,
} from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    console.log("[DivinationAPI] Request Body:", JSON.stringify(body, null, 2));

    const { type, cards, question, language, imageBase64, mimeType, virtual, persona, userId } = body;
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Kullanıcı kimliği gerekli." }, { status: 400 });
    }

    const lang = (language || "tr") as SupportedLanguage;

    let result: any = null;

    // Text-based divination (tarot, katina, lenormand, rune, iching, crystal)
    if (!type || !cards || !Array.isArray(cards)) {
      return NextResponse.json({ success: false, error: "Tip ve kart bilgisi gerekli." }, { status: 400 });
    }
    result = await generateDivinationReading(type as DivinationType, cards, question || "", lang, persona);

    if (!result) {
      return NextResponse.json({ success: false, error: "AI yorumu başarısız oldu." }, { status: 500 });
    }

    // New: Logical logging to interaction_logs
    if (userId) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase");
        // Normalize types to match logging.ts and ProfilePage icons
        const typeMap: Record<string, string> = {
          "rune": "runler",
          "crystal": "sphere",
          "sphere": "sphere",
          "iching": "iching",
          "coffee": "kahve"
        };
        const actionType = typeMap[type] || type;

        console.log(`[DivinationLog] Attempting to log: user=${userId}, type=${actionType}`);

        const { error: logErr } = await supabaseAdmin.from("interaction_logs").insert({
          user_id: userId,
          action_type: actionType,
          description: `Kullanıcı ${type} aracı ile yeni bir analiz gerçekleştirdi.`,
          metadata: {
            question: question || (type === "coffee" ? "Kahve Falı" : "Genel Rehberlik"),
            answer: result.synthesis || result.content || "Analiz tamamlandı.",
            full_result: result // Store the entire object for detailed viewing
          }
        });

        if (logErr) {
          console.error("[DivinationLog] Database error:", logErr);
        } else {
          console.log(`[DivinationLog] Successfully logged ${actionType} for ${userId}`);
        }
      } catch (logErr) {
        console.error("[DivinationLog] Caught exception:", logErr);
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Divination API error:", error);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
