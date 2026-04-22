// src/app/api/horary/route.ts
import { NextRequest, NextResponse }        from "next/server";
import { checkRateLimit }                   from "@/lib/rate-limit";
import { callGeminiWithFallback, SupportedLanguage } from "@/lib/gemini";
import { supabaseAdmin }                    from "@/lib/supabase-admin";
import { computeHoraryChart }              from "@/lib/horary/engine";
import { analyzeHoraryChart }              from "@/lib/horary/rules";
import { buildHoraryPrompt }               from "@/lib/horary/prompt";

const SUPPORTED_LANGS: SupportedLanguage[] = ["tr","en","ar","de","fr"];

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(request);
  if (rl) return rl;

  try {
    const body = await request.json();
    const { question, latitude, longitude, language = "tr", userId, datetime } = body;

    const lang: SupportedLanguage = SUPPORTED_LANGS.includes(language) ? language : "tr";

    // Validation
    if (!question || question.trim().length < 5) {
      return NextResponse.json({ success: false, error: "Soru çok kısa." }, { status: 400 });
    }
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ success: false, error: "Konum bilgisi eksik." }, { status: 400 });
    }

    // 1. Compute chart for the given datetime or current moment
    const questionDate = datetime ? new Date(datetime) : new Date();
    const chart = computeHoraryChart(latitude, longitude, questionDate);

    // 2. Apply Lilly rules
    const analysis = analyzeHoraryChart(chart, question);

    // 3. Build prompt and call Gemini
    const prompt = buildHoraryPrompt(question, chart, analysis, lang, typeof datetime === "string" ? datetime : undefined);
    const aiText  = await callGeminiWithFallback(prompt);

    // 4. Parse JSON response
    let reading: Record<string, string> = {};
    try {
      const start = aiText.indexOf("{");
      const end   = aiText.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        reading = JSON.parse(aiText.substring(start, end + 1));
      }
    } catch {
      reading = { section4: aiText };
    }

    // 5. Optional logging
    if (userId) {
      (async () => {
        // Prepare full reading text instead of just section4 truncations
        let fullReadingText = "";
        try {
          fullReadingText = Object.values(reading)
            .filter((v): v is string => typeof v === "string")
            .join("\n\n");
        } catch (e) {
          fullReadingText = JSON.stringify(reading);
        }

        try {
          await supabaseAdmin.from("interaction_logs").insert({
            user_id:     userId,
            action_type: "horary",
            description: "Horary açılımı yapıldı.",
            metadata:    { question, answer: fullReadingText },
          });
        } catch (e) {
          console.error("Supabase log error:", e);
        }
      })();
    }

    // 6. Serialize chart for frontend (only what's needed)
    const chartData = {
      timestamp:          chart.timestamp.toISOString(),
      ascendantLongitude: chart.ascendantLongitude,
      mcLongitude:        chart.mcLongitude,
      planets: chart.planets.map(p => ({
        id: p.id, name: p.name, emoji: p.emoji,
        longitude: p.longitude, signId: p.signId,
        signDegree: p.signDegree, house: p.house,
        retrograde: p.retrograde, combust: p.combust, cazimi: p.cazimi,
      })),
      houses: chart.houses.map(h => ({
        house: h.house, longitude: h.longitude,
        signId: h.signId, signDegree: h.signDegree, rulerId: h.rulerId,
      })),
    };

    return NextResponse.json({
      success: true,
      chartData,
      analysis: {
        strictures:       analysis.strictures,
        questionCategory: analysis.questionCategory,
        questionHouse:    analysis.questionHouse,
        querent: {
          planetId: analysis.querent.planet.id,
          planetName: analysis.querent.planet.name,
          signId: analysis.querent.planet.signId,
          signDegree: analysis.querent.planet.signDegree,
          house: analysis.querent.planet.house,       // actual planet position in chart
          representsHouse: 1,                          // rules/represents this house
          dignityLevel: analysis.querent.essentialDignity.level,
          dignityScore: analysis.querent.essentialDignity.score,
        },
        quesited: {
          planetId: analysis.quesited.planet.id,
          planetName: analysis.quesited.planet.name,
          signId: analysis.quesited.planet.signId,
          signDegree: analysis.quesited.planet.signDegree,
          house: analysis.quesited.planet.house,      // actual planet position in chart
          representsHouse: analysis.questionHouse,     // rules/represents this house
          dignityLevel: analysis.quesited.essentialDignity.level,
          dignityScore: analysis.quesited.essentialDignity.score,
        },
        timing: analysis.timing,
        keyAspect: analysis.keyAspect,
      },
      reading,
    });

  } catch (err) {
    console.error("[horary] route error:", err);
    return NextResponse.json({ success: false, error: "Horary analizi yapılamadı." }, { status: 500 });
  }
}
