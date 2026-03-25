import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type SupportedLanguage = "tr" | "en" | "ar" | "de" | "fr";

const languageNames: Record<SupportedLanguage, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
  de: "Deutsch",
  fr: "Français",
};

/**
 * Helper to call Gemini with a fallback model if the primary fails.
 */
async function callGeminiWithFallback(prompt: string): Promise<string> {
  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
  let lastError: any;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.warn(`Gemini API failed with model ${modelName}. Trying next...`, error);
      lastError = error;
    }
  }

  console.error("All Gemini API models failed.", lastError);
  throw new Error("All AI models failed to respond.");
}

/**
 * Parses and cleans JSON output from Gemini.
 */
function parseGeminiJson(text: string) {
  const cleaned = text.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

function getDeterministicNumber(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const random = Math.abs(Math.sin(hash)) * 10000;
  return Math.floor((random - Math.floor(random)) * (max - min + 1)) + min;
}

/**
 * Generate daily/weekly/monthly/yearly horoscope reading
 */
export async function generateHoroscope(
  sign: string,
  signName: string,
  period: "daily" | "weekly" | "monthly" | "yearly",
  language: SupportedLanguage = "tr"
) {
  const lang = languageNames[language];
  const periodMap = { daily: "günlük/daily", weekly: "haftalık/weekly", monthly: "aylık/monthly", yearly: "yıllık/yearly" };
  const dateStr = new Date().toISOString().split("T")[0];

  const prompt = `You are a senior professional astrologer with deep knowledge of real-time planetary transits, psychological astrology, and predictive techniques.

TASK:
Generate a highly personalized, emotionally engaging, and astrologically accurate ${periodMap[period]} horoscope for the zodiac sign:
- Sign: "${signName}" (${sign})

CONTEXT:
- Language: ${lang}
- Date: ${dateStr}
- Audience: modern users who expect insightful, relatable, and specific guidance
- Tone: natural, human-like, non-generic, intuitive but grounded in astrology

STRICT OUTPUT RULES:
- Return ONLY valid JSON
- No markdown, no explanations, no extra text
- Keep structure EXACTLY as defined

OUTPUT FORMAT:
{
  "content": "4-6 sentences. Deep, specific, and non-generic horoscope. Include emotional nuance and real-life situations.",
  "love": "2-3 sentences. Relationship dynamics, emotional shifts, or advice.",
  "career": "2-3 sentences. Career, money, decision-making insights.",
  "health": "1-2 sentences. Mental/physical well-being guidance."
}

QUALITY REQUIREMENTS:
- Avoid generic astrology phrases (e.g. 'today is a good day')
- Reference plausible planetary influences (Mercury retrograde, Moon phases, Venus aspects, etc.)
- Make each section feel distinct and meaningful
- Write fluently in ${lang}
- Make the user feel personally addressed`;

  try {
    const text = await callGeminiWithFallback(prompt);
    const parsed = parseGeminiJson(text);

    const seed = `${sign}_${period}_${dateStr}`;
    const rating = getDeterministicNumber(seed + "_rating", 3, 5);
    const luckyNumber = getDeterministicNumber(seed + "_lucky", 1, 99);

    return {
      content: parsed.content || "",
      love: parsed.love || "",
      career: parsed.career || "",
      health: parsed.health || "",
      rating,
      luckyNumber,
    };
  } catch (error) {
    console.error("Gemini horoscope generation failed:", error);
    return null; // Caller handles fallback
  }
}

/**
 * Generate detailed birth chart interpretation
 */
export async function generateBirthChartInterpretation(
  chartData: {
    sunSign: string;
    moonSign: string;
    risingSign: string;
    planetPositions: Array<{ planet: string; sign: string; degree: number }>;
    houses: Array<{ house: number; sign: string }>;
    aspects: Array<{ planet1: string; planet2: string; type: string; angle: number }>;
  },
  language: SupportedLanguage = "tr"
) {
  const lang = languageNames[language];

  const planetsText = chartData.planetPositions
    .map(p => `${p.planet}: ${p.sign} ${p.degree}°`)
    .join(", ");
  const housesText = chartData.houses
    .map(h => `House ${h.house}: ${h.sign}`)
    .join(", ");
  const aspectsText = chartData.aspects
    .map(a => `${a.planet1} ${a.type} ${a.planet2} (${a.angle}°)`)
    .join(", ");

  const prompt = `You are an expert-level astrologer specializing in natal chart analysis, psychological astrology, and life-pattern interpretation.

TASK:
Provide a deep and structured interpretation of the following birth chart.

LANGUAGE: ${lang}

CHART DATA:
- Sun Sign: ${chartData.sunSign}
- Moon Sign: ${chartData.moonSign}
- Rising Sign: ${chartData.risingSign}
- Planets: ${planetsText}
- Houses: ${housesText}
- Aspects: ${aspectsText}

STRICT OUTPUT RULES:
- Return ONLY valid JSON
- No markdown, no explanations
- Follow structure EXACTLY

OUTPUT FORMAT:
{
  "summary": "2-3 sentences summarizing the overall personality and life theme",
  "sunInterpretation": "4-5 sentences explaining identity, ego, life direction",
  "moonInterpretation": "4-5 sentences explaining emotional world and inner needs",
  "risingInterpretation": "4-5 sentences explaining outward personality and first impressions",
  "planetInterpretations": {
    "<planet>": "2-3 sentences per planet, specific to its sign placement"
  },
  "houseInterpretations": {
    "<house_number>": "2-3 sentences per house meaning"
  },
  "aspectInterpretations": [
    {
      "aspect": "<planet1> <type> <planet2>",
      "meaning": "2-3 sentences explaining the psychological and life impact"
    }
  ],
  "strengths": ["3-5 specific strengths"],
  "challenges": ["3-5 realistic challenges"],
  "lifeAdvice": "4-5 sentences of grounded, practical life guidance"
}

QUALITY REQUIREMENTS:
- Interpret ONLY based on given chart data
- Avoid vague or generic statements
- Connect placements with real-life personality patterns
- Use psychologically insightful language
- Make interpretations feel personal and specific`;

  try {
    const text = await callGeminiWithFallback(prompt);
    return parseGeminiJson(text);
  } catch (error) {
    console.error("Gemini birth chart interpretation failed:", error);
    return null;
  }
}

/**
 * Generate relationship compatibility between two signs
 */
export async function generateCompatibility(
  sign1: string,
  sign1Name: string,
  sign2: string,
  sign2Name: string,
  language: SupportedLanguage = "tr"
) {
  const lang = languageNames[language];

  const prompt = `You are a professional relationship astrologer and synastry expert.

TASK:
Analyze the astrological compatibility between two zodiac signs.
- Sign 1: "${sign1Name}" (${sign1})
- Sign 2: "${sign2Name}" (${sign2})

CONTEXT:
- Language: ${lang}
- Audience: modern users who want insightful, emotionally intelligent, and realistic relationship advice.
- Tone: balanced (highlighting both magic and friction), engaging, and specific.

STRICT OUTPUT RULES:
- Return ONLY valid JSON
- No markdown, no explanations, no extra text
- Keep structure EXACTLY as defined

OUTPUT FORMAT:
{
  "overallScore": number (0-100),
  "loveScore": number (0-100),
  "friendshipScore": number (0-100),
  "workScore": number (0-100),
  "description": "5-7 sentences detailing the core dynamic, how they interact emotionally, mentally, and practically.",
  "strengths": ["3-5 specific bullet points emphasizing what makes them great together"],
  "challenges": ["3-5 specific bullet points emphasizing potential friction or misunderstandings"]
}

QUALITY REQUIREMENTS:
- Do not be overly generic. Mention elemental interactions (Fire vs Water, Earth vs Air etc) subtly.
- Ensure the scores roughly reflect traditional astrological synastry.
- Write fluently and naturally in ${lang}.`;

  try {
    const text = await callGeminiWithFallback(prompt);
    const parsed = parseGeminiJson(text);

    return {
      sign1,
      sign2,
      overallScore: Math.min(100, Math.max(0, Number(parsed.overallScore) || 50)),
      loveScore: Math.min(100, Math.max(0, Number(parsed.loveScore) || 50)),
      friendshipScore: Math.min(100, Math.max(0, Number(parsed.friendshipScore) || 50)),
      workScore: Math.min(100, Math.max(0, Number(parsed.workScore) || 50)),
      description: parsed.description || "",
      strengths: parsed.strengths || [],
      challenges: parsed.challenges || [],
    };
  } catch (error) {
    console.error("Gemini compatibility generation failed:", error);
    return null;
  }
}

/**
 * Generate an advanced Synastry (Relationship) Interpretation
 */
export async function generateSynastryInterpretation(
  chart1: any,
  chart2: any,
  synastryAspects: any[],
  language: SupportedLanguage = "tr"
) {
  const lang = languageNames[language];
  
  // Send cross-aspects with clear IDs for model context
  const aspectListStr = synastryAspects.slice(0, 8).map(a => 
    `- Planet 1 ${a.planet1Id} ⯈ Planet 2 ${a.planet2Id}: ${a.typeId} (${a.orb}° orb) - ${a.harmony}`
  ).join("\n");

  const prompt = `You are a master synastry astrologer specializing in relationship dynamics.
TASK:
Analyze the deep relationship compatibility (Synastry) between two individuals based on their exact astrological birth charts and cross-aspects.

DATA:
Person 1: Sun in ${chart1.sunSign.name}, Moon in ${chart1.moonSign.name}, ASC in ${chart1.risingSign.name}.
Person 2: Sun in ${chart2.sunSign.name}, Moon in ${chart2.moonSign.name}, ASC in ${chart2.risingSign.name}.

KEY CROSS-ASPECTS (Person 1 to Person 2):
${aspectListStr}

CONTEXT:
- Language: ${lang}
- Audience: Adults seeking deep, psychological, and realistic relationship insights. Not fluffy pop-astrology.
- Tone: Empathetic, analytical, profound.

OUTPUT MUST BE VALID JSON:
{
  "overallScore": 0-100, // Evaluate based on aspects
  "loveScore": 0-100, // Evaluate Moon/Venus/Mars contacts
  "friendshipScore": 0-100, // Evaluate Sun/Mercury/Jupiter contacts
  "workScore": 0-100, // Evaluate Saturn/Sun/Mars contacts
  "description": "3-4 sentences of deep holistic overview of the relationship chemistry.",
  "strengths": ["A detailed strength of this bond", "Another major strength"],
  "challenges": ["A potential friction point and how to heal it", "A communication block"]
}

Write elegantly and naturally in ${lang}. Ensure it sounds like an expert astrologer reading the exact angles between them.`;

  try {
    const text = await callGeminiWithFallback(prompt);
    return parseGeminiJson(text);
  } catch (error) {
    console.error("Gemini synastry interpretation failed:", error);
    return null;
  }
}

/**
 * Generate a personalized daily transit interpretation based on exact aspects
 */
export async function generateTransitInterpretation(
  transits: any[],
  language: SupportedLanguage = "tr"
) {
  const lang = languageNames[language];
  const dateStr = new Date().toISOString().split("T")[0];

  // We only send the top 5 transits so we don't overwhelm the prompt
  const transitListStr = transits.slice(0, 5).map(t => 
    `- Transit ${t.transitPlanetId} ${t.typeId} Natal ${t.natalPlanetId} (Orb: ${t.orb}°, Harmony: ${t.harmony})`
  ).join("\n");

  const prompt = `You are an expert predictive astrologer. 
TASK: 
Generate a personalized daily horoscope based on EXACT real-time planetary transits to a user's natal chart.

TRANSIT DATA (Today: ${dateStr}):
${transitListStr}

CONTEXT:
- Language: ${lang}
- Audience: modern users who expect accurate, psychological, and predictive guidance
- Tone: empathetic, highly specific, insightful

STRICT OUTPUT RULES:
- Return ONLY valid JSON
- No markdown, no explanations, no extra text

OUTPUT FORMAT:
{
  "title": "A catchy, personalized daily theme (e.g. 'A Day of Sudden Insights')",
  "content": "A 5-6 sentence predictive and psychological reading of how these specific transits will impact them today. Explain WHAT is happening astrologically and HOW it feels.",
  "advice": "1-2 sentences of practical advice on how to handle today's energy."
}

QUALITY REQUIREMENTS:
- Clearly reference 1 or 2 of the specific planetary transits provided (e.g. 'With transiting Mars squaring your natal Sun...')
- Ensure the reading reflects the actual 'harmony' (positive = flow/opportunity, negative = friction/action, neutral = blending)
- Write fluently and elegantly in ${lang}`;

  try {
    const text = await callGeminiWithFallback(prompt);
    return parseGeminiJson(text);
  } catch (error) {
    console.error("Gemini transit interpretation failed:", error);
    return null;
  }
}

// ===== DIVINATION SYSTEM =====

export type DivinationType = "tarot" | "katina" | "lenormand" | "rune" | "iching" | "crystal";

interface DivinationCard {
  name: string;
  meaning?: string;
  reversed?: boolean;
  combinationHint?: string;
}

/**
 * Generate an AI divination reading for text-based systems.
 * Uses standard 2.5-lite → 2.5-flash fallback.
 */
export async function generateDivinationReading(
  type: DivinationType,
  cards: DivinationCard[],
  question: string,
  lang: SupportedLanguage,
  persona?: { name: string; style: string }
) {
  const langName = languageNames[lang];

  const typeDescriptions: Record<DivinationType, string> = {
    tarot: "Tarot card reader (Rider-Waite tradition). Interpret major and minor arcana with depth and psychological insight.",
    katina: "Katina (Turkish Oracle) card reader. Mystical, insightful, and deep psychic medium style. Maintain a professional, universally profound, and spiritual tone without using overly familiar or maternal terms.",
    lenormand: "Lenormand card reader. CRITICAL: Read cards IN COMBINATION — adjacent cards modify each other's meaning. Context flows left to right.",
    rune: "Elder Futhark Norse Rune caster. Channel ancient Viking wisdom with modern relevance.",
    iching: "I Ching (Book of Changes) interpreter. Blend traditional Chinese philosophy with practical modern guidance.",
    crystal: "Mystical crystal ball seer. Purely intuitive, poetic, and deeply personal mystical oracle.",
  };

  const cardList = cards.map((c, i) => {
    let entry = `${i + 1}. ${c.name}`;
    if (c.reversed) entry += " (REVERSED / TERS)";
    if (c.meaning) entry += ` — ${c.meaning}`;
    if (c.combinationHint) entry += ` [Combo hint: ${c.combinationHint}]`;
    return entry;
  }).join("\n");

  const personaSection = persona 
    ? `\nCRITICAL PERSONALITY: You are interpreting as "${persona.name}". ${persona.style}\n`
    : "";

  const prompt = `You are a master ${typeDescriptions[type]}
${personaSection}
Selected cards/symbols:
${cardList}

User's question: "${question || (lang === 'tr' ? 'Genel bir rehberlik istiyorum' : 'I want general guidance')}"
Language: ${langName}

STRICT OUTPUT RULES:
- Return ONLY valid JSON, no markdown, no extra text

OUTPUT FORMAT:
{
  "title": "A dramatic, thematic title for this reading",
  "cards": [
    {
      "name": "Card name",
      "position": "Position label (e.g. Past, Present, Future — or just 'Card 1' if single)",
      "interpretation": "2-3 sentences unique interpretation for THIS card in THIS position, in context of the question"
    }
  ],
  "synthesis": "A 4-6 sentence holistic reading weaving ALL cards together into a unified narrative. Be specific, dramatic, and insightful.",
  "advice": "1-2 sentences of practical, actionable advice based on this reading."
}

QUALITY REQUIREMENTS:
- Each card interpretation must be UNIQUE — do NOT repeat the same phrases
- Reference the user's question directly
- If cards are reversed, clearly explain the reversed meaning
- For Lenormand: explicitly describe how adjacent cards interact/combine
- Write fluently and elegantly in ${langName}`;

  try {
    const text = await callGeminiWithFallback(prompt);
    return parseGeminiJson(text);
  } catch (error) {
    console.error(`Gemini ${type} reading failed:`, error);
    return null;
  }
}

/**
 * Generate a coffee reading from an uploaded image.
 * Uses premium 3-model Vision chain: gemini-3-flash → 2.5-flash → 2.5-flash-lite
 * Includes dual-layer safety guardrails.
 */
export async function generateCoffeeReading(
  imageBase64: string,
  mimeType: string,
  question: string,
  lang: SupportedLanguage,
  persona?: { name: string; style: string }
) {
  const langName = languageNames[lang];

  const personaSection = persona 
    ? `\nCRITICAL PERSONALITY: You are interpreting as "${persona.name}". ${persona.style}\n`
    : "";

  const prompt = `You are a master Turkish coffee fortune teller (kahve falcısı).
${personaSection}
CRITICAL SAFETY RULE:
First, analyze this image. If the image does NOT clearly contain a coffee cup, coffee grounds (telve), a saucer, or anything related to Turkish coffee fortune telling, you MUST respond with EXACTLY this JSON and nothing else:
{"error": "INVALID_IMAGE"}

Do NOT interpret non-coffee images as fortune telling under ANY circumstances.

If the image IS a valid coffee cup/grounds:
User's question: "${question || (lang === 'tr' ? 'Genel falıma bak' : 'Give me a general reading')}"
Language: ${langName}

Carefully examine the coffee grounds. Identify 3-5 distinct shapes/symbols you see in the telve patterns.

STRICT OUTPUT RULES:
- Return ONLY valid JSON, no markdown

OUTPUT FORMAT:
{
  "symbols": [
    { "name": "Symbol name", "location": "Where in the cup (bottom, side, rim, handle-side)", "interpretation": "2-3 sentences about what this symbol means for the person" }
  ],
  "synthesis": "A 5-7 sentence holistic narrative weaving all symbols into a unified fortune reading. Be dramatic, warm, and culturally authentic.",
  "love": "1-2 sentences about love/relationships based on what you see",
  "career": "1-2 sentences about career/money",
  "health": "1-2 sentences about health/energy",
  "advice": "A warm, grandmother-like piece of advice"
}`;

  const visionModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
  let lastError: any;

  for (const modelName of visionModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings: [
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any, threshold: "BLOCK_LOW_AND_ABOVE" as any },
          { category: "HARM_CATEGORY_HARASSMENT" as any, threshold: "BLOCK_LOW_AND_ABOVE" as any },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any, threshold: "BLOCK_MEDIUM_AND_ABOVE" as any },
        ],
      });

      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType, data: imageBase64 } },
      ]);

      const text = result.response.text().trim();
      return parseGeminiJson(text);
    } catch (error) {
      console.warn(`Coffee reading failed with ${modelName}:`, error);
      lastError = error;
    }
  }

  console.error("All Vision models failed for coffee reading:", lastError);
  throw new Error("Kahve falı için tüm modeller başarısız oldu.");
}

/**
 * Generate a virtual (no-photo) coffee reading.
 * Gemini imagines the symbols itself.
 */
export async function generateVirtualCoffeeReading(
  question: string,
  lang: SupportedLanguage,
  persona?: { name: string; style: string }
) {
  const langName = languageNames[lang];

  const prompt = `You are a master Turkish coffee fortune teller. A virtual coffee cup has just been turned over.

IMAGINE that you are looking at fresh coffee grounds in a cup. Invent 3-5 completely random, creative, and vividly described telve shapes/symbols that you "see" in this imaginary cup. Make each symbol unique and surprising.

User's question: "${question || (lang === 'tr' ? 'Genel falıma bak' : 'Give me a general reading')}"
Language: ${langName}

STRICT OUTPUT RULES:
- Return ONLY valid JSON

OUTPUT FORMAT:
{
  "symbols": [
    { "name": "Symbol name", "location": "Where in the cup", "interpretation": "2-3 sentences" }
  ],
  "synthesis": "5-7 sentence holistic fortune reading weaving all imagined symbols together",
  "love": "1-2 sentences about love",
  "career": "1-2 sentences about career",
  "health": "1-2 sentences about health",
  "advice": "A warm piece of advice"
}

QUALITY: Every reading must be completely unique and never repeat patterns.
Write fluently and elegantly in ${langName}`;

  try {
    const text = await callGeminiWithFallback(prompt);
    return parseGeminiJson(text);
  } catch (error) {
    console.error("Virtual coffee reading failed:", error);
    return null;
  }
}
