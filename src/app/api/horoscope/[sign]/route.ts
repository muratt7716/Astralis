import { NextRequest, NextResponse } from "next/server";
import { getZodiacById } from "@/data/zodiac";
import { generateHoroscope, type SupportedLanguage } from "@/lib/gemini";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = path.join(process.cwd(), "src", "cache", "horoscopes");

function getCacheKey(sign: string, period: string, lang: string): string {
  const now = new Date();
  let dateKey: string;
  switch (period) {
    case "daily":
      dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`; break;
    case "weekly": {
      const ws = new Date(now); ws.setDate(now.getDate() - now.getDay());
      dateKey = `${ws.getFullYear()}-${ws.getMonth() + 1}-${ws.getDate()}`; break;
    }
    case "monthly":
      dateKey = `${now.getFullYear()}-${now.getMonth() + 1}`; break;
    case "yearly":
      dateKey = `${now.getFullYear()}`; break;
    default:
      dateKey = `${now.getTime()}`;
  }
  return `${sign}_${period}_${lang}_${dateKey}`;
}

function getFromCache(key: string): unknown | null {
  try {
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch { return null; }
}

function setCache(key: string, data: unknown): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(path.join(CACHE_DIR, `${key}.json`), JSON.stringify(data, null, 2));
  } catch (err) { console.error("Cache write error:", err); }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sign: string }> }
) {
  const { sign } = await params;
  const searchParams = request.nextUrl.searchParams;
  const period = (searchParams.get("period") || "daily") as "daily" | "weekly" | "monthly" | "yearly";
  const lang = (searchParams.get("lang") || "tr") as SupportedLanguage;

  const zodiac = getZodiacById(sign);
  if (!zodiac) {
    return NextResponse.json({ error: "Burç bulunamadı" }, { status: 404 });
  }

  // Try cache first
  const cacheKey = getCacheKey(sign, period, lang);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return NextResponse.json({
      success: true,
      data: { sign: zodiac, horoscope: cached },
      source: "cache"
    });
  }

  // Try Vertex AI API
  if (!process.env.GOOGLE_CLOUD_PROJECT) {
    return NextResponse.json({ 
      error: "Sistem yapılandırma hatası: Vertex AI yapılandırması eksik.",
      success: false 
    }, { status: 500 });
  }

  const aiResult = await generateHoroscope(sign, zodiac.name, period, lang);
  if (aiResult) {
    const horoscope = {
      sign,
      period,
      title: period,
      ...aiResult,
    };
    setCache(cacheKey, horoscope);
    return NextResponse.json({
      success: true,
      data: { sign: zodiac, horoscope },
      source: "gemini"
    });
  }

  return NextResponse.json({ 
    error: "Astrolojik analiz şu anda oluşturulamadı. Lütfen daha sonra tekrar deneyin.",
    success: false 
  }, { status: 500 });
}
