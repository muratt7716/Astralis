import { NextRequest, NextResponse } from "next/server";
import { generateBirthChartInterpretation, type SupportedLanguage } from "@/lib/gemini";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = path.join(process.cwd(), "src", "cache", "interpretations");

function getCacheKey(chartData: Record<string, unknown>, lang: string): string {
  const hash = JSON.stringify(chartData).split("").reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return `chart_${Math.abs(hash)}_${lang}`;
}

function getFromCache(key: string): unknown | null {
  try {
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
    if (ageHours > 720) return null; // 30 days cache
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch { return null; }
}

function setCache(key: string, data: unknown): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(path.join(CACHE_DIR, `${key}.json`), JSON.stringify(data, null, 2));
  } catch (err) { console.error("Cache write error:", err); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chartData, language = "tr" } = body;

    if (!chartData) {
      return NextResponse.json({ error: "Chart data is required." }, { status: 400 });
    }

    const cacheKey = getCacheKey(chartData, language);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached, cached: true });
    }

    const interpretation = await generateBirthChartInterpretation(
      chartData,
      language as SupportedLanguage
    );

    if (!interpretation) {
      return NextResponse.json({ error: "AI interpretation failed." }, { status: 500 });
    }

    setCache(cacheKey, interpretation);

    return NextResponse.json({ success: true, data: interpretation, cached: false });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
