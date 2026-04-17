import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateDeepCosmicInsight, SupportedLanguage } from "@/lib/gemini";
import { calculateBirthChart, getCurrentCelestialEvents } from "@/lib/astrology";
import fs from "fs/promises";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "src/cache/daily-insights");

async function readFileCache(userId: string, date: string, lang: string) {
  try {
    const filePath = path.join(CACHE_DIR, `${userId}_${date}_${lang}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function writeFileCache(userId: string, date: string, lang: string, data: any) {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, `${userId}_${date}_${lang}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("File cache write failed:", err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // 1. Get user profile
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // 2. Determine today (Europe/Istanbul timezone)
  const today = new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Istanbul'
  }).format(new Date()).split('.').reverse().join('-');

  const language = (profile.language || "tr") as SupportedLanguage;

  // 3. Check DB cache first
  const cached = profile.daily_horoscope as {
    text?: string;
    title?: string;
    advice?: string;
    planetOfTheDay?: { name: string; reason: string };
    energyScores?: { love: number; career: number; health: number; spiritual: number };
    luckyElements?: { color: string; number: number; time: string };
    date?: string;
    language?: string;
  };

  if (cached?.date === today && cached?.language === language) {
    return NextResponse.json({ horoscope: cached });
  }

  // 4. Check file cache as fallback
  const fileCached = await readFileCache(userId, today, language);
  if (fileCached) {
    // Sync back to DB
    await supabaseAdmin.from("profiles").update({ daily_horoscope: fileCached }).eq("id", userId);
    return NextResponse.json({ horoscope: fileCached });
  }

  // 5. Need birth_date to generate
  if (!profile.birth_date) {
    return NextResponse.json({ error: "Birth date is required for horoscope generation" }, { status: 400 });
  }

  try {
    const birthDate = new Date(profile.birth_date);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json({ error: "Invalid birth date" }, { status: 400 });
    }

    const birthTime = profile.birth_time || "12:00";
    const hasBirthTime = !!profile.birth_time;
    const [hours, minutes] = birthTime.split(":").map(Number);

    // 6. Calculate natal chart
    const chart = calculateBirthChart(
      birthDate.getFullYear(),
      birthDate.getMonth() + 1,
      birthDate.getDate(),
      hours,
      minutes,
      profile.latitude || 39.9,
      profile.longitude || 32.8
    );

    const celestial = getCurrentCelestialEvents();

    // 7. If birth_time exists, save rising & moon signs to profile (if not already saved)
    if (hasBirthTime && (!profile.rising_sign || !profile.moon_sign)) {
      await supabaseAdmin
        .from("profiles")
        .update({
          rising_sign: chart.risingSign.name,
          moon_sign: chart.moonSign.name,
          sun_sign: chart.sunSign.name,
        })
        .eq("id", userId);
    }

    // 8. Build rich context for AI
    const topPlanets = chart.planetPositions.slice(0, 5).map(p =>
      `${p.planet} in ${p.sign} (${p.degree.toFixed(1)}°${p.retrograde ? " ℞" : ""})`
    ).join(", ");

    const activeAspects = chart.aspects.slice(0, 4).map(a =>
      `${a.planet1} ${a.typeEmoji} ${a.planet2} (${a.type})`
    ).join(", ");

    const transitDescriptions = chart.transits.slice(0, 5).map(t => t.description).join("; ");

    const retroList = celestial.retrogrades.map(r => `${r.planet} ${r.emoji}`).join(", ") || "Yok";

    const userData = {
      sunSign: chart.sunSign.name,
      sunDegree: chart.sunSign.degree,
      moonSign: chart.moonSign.name,
      moonDegree: chart.moonSign.degree,
      risingSign: hasBirthTime ? chart.risingSign.name : null,
      risingDegree: hasBirthTime ? chart.risingSign.degree : null,
      topPlanets,
      activeAspects,
      lifeFocus: profile.life_focus || "general",
      gender: profile.gender || "secret",
      relationshipStatus: profile.relationship_status || "single",
      name: profile.full_name || "",
    };

    const celestialData = {
      moonPhase: `${celestial.moonPhase.name} (${celestial.moonPhase.emoji}) - ${celestial.moonPhase.description}`,
      transits: transitDescriptions,
      retrogrades: retroList,
    };

    const result = await generateDeepCosmicInsight(userData, celestialData, language);

    if (!result) {
      throw new Error("AI failed to generate deep insight");
    }

    const horoscopeData = {
      text: result.content,
      title: result.title,
      advice: result.advice,
      planetOfTheDay: result.planetOfTheDay,
      energyScores: result.energyScores,
      luckyElements: result.luckyElements,
      date: today,
      language: language,
    };

    // 9. Save to DB and file cache in parallel
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .update({ daily_horoscope: horoscopeData })
        .eq("id", userId),
      writeFileCache(userId, today, language, horoscopeData),
    ]);

    return NextResponse.json({ horoscope: horoscopeData });
  } catch (err: any) {
    console.error("Deep Horoscope API Error:", err);
    return NextResponse.json({ error: "Failed to generate deep insight" }, { status: 500 });
  }
}
