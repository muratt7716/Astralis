import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { BirthChart } from "@/lib/astrology";

const ALL_GUIDE_IDS = ["melisa", "aras", "umut", "hekate", "selin"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chart, userId }: { chart: BirthChart; userId: string } = body;
    if (!chart || !userId) return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });

    const dominantPlanetInfo = chart.planetPositions.find((p) => p.planetId === chart.dominantPlanet);
    const notableAspects = chart.aspects
      .filter((a) => a.orb <= 3).slice(0, 5)
      .map((a) => `${a.planet1} ${a.typeEmoji} ${a.planet2}`);
    const retrogradePlanets = chart.planetPositions.filter((p) => p.retrograde).map((p) => p.planetId);

    const summary = {
      calculatedAt: new Date().toISOString(),
      sunSign: chart.sunSign.id,
      moonSign: chart.moonSign.id,
      risingSign: chart.risingSign.id,
      dominantPlanet: chart.dominantPlanet,
      dominantElement: chart.elementBalance.dominant,
      stelliums: chart.stelliums.map((s) => `${s.signName}: ${s.planets.join(", ")}`),
      notableAspects,
      retrogradePlanets,
    };

    await supabaseAdmin.from("profiles").update({ birth_chart_summary: summary }).eq("id", userId);

    // Delete old astrology memories for this user (avoid duplicates)
    await supabaseAdmin.from("memories").delete().eq("user_id", userId).eq("category", "astroloji");

    const elementLabels: Record<string, string> = { fire: "Ateş", earth: "Toprak", air: "Hava", water: "Su" };
    const facts = [
      `Dominant element: ${elementLabels[chart.elementBalance.dominant] || chart.elementBalance.dominant}`,
      `Dominant gezegen: ${dominantPlanetInfo?.planet || chart.dominantPlanet} (${dominantPlanetInfo?.sign || ""})`,
      ...chart.stelliums.map((s) => `${s.signName} stelliumu: ${s.planets.join(", ")}`),
    ];

    const memories = ALL_GUIDE_IDS.flatMap((guideId) =>
      facts.map((fact) => ({
        user_id: userId,
        guide_id: guideId,
        category: "astroloji",
        fact,
        importance: 4,
        tags: ["doğum-haritası"],
      }))
    );

    if (memories.length > 0) await supabaseAdmin.from("memories").insert(memories);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Birth chart sync error:", error);
    return NextResponse.json({ error: "Senkronizasyon hatası." }, { status: 500 });
  }
}
