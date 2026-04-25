import { unstable_cache } from "next/cache";
import { GoogleGenAI, Type } from "@google/genai";
import { calculateBaseCompatibilityScore } from "./astrology/compatibility-logic";

// 1. Çevre değişkeninden JSON'ı ayrıştır
let credentials: any = {};
try {
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
  // 2. OpenSSL hatasını (DECODER routines::unsupported) önlemek için 
  // private_key içindeki bozuk satır sonlarını (escaped newlines) düzelt
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }
} catch (error) {
  console.error("Google Service Account JSON ayrıştırma hatası:", error);
}

const ai = new GoogleGenAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
  vertexai: true,
  googleAuthOptions: {
    credentials,
  },
});

export type SupportedLanguage = "tr" | "en" | "ar" | "de" | "fr";

const languageNames: Record<SupportedLanguage, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
  de: "Deutsch",
  fr: "Français",
};

// JSON schema type — schema nesnesi olduğu sürece @google/genai bunu kabul eder
export type GeminiSchema = Record<string, any>;

/**
 * Companion chat yanıtı için zorunlu JSON şeması.
 * Structured Output ile API seviyesinde kilitleniyor — parseGeminiJson artık
 * fallback olarak çalışır, birincil güvence bu şema.
 */
export const CHAT_RESPONSE_SCHEMA: GeminiSchema = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING },
    visual: { type: Type.STRING, nullable: true },
    memories_to_save: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          fact: { type: Type.STRING },
          importance: { type: Type.INTEGER },
        },
        required: ["category", "fact", "importance"],
      },
    },
  },
  required: ["message", "memories_to_save"],
};

/**
 * Tek seferlik (non-streaming) Gemini çağrısı.
 * schema verilirse API seviyesinde JSON şeması kilitlenir.
 */
export async function callGeminiWithFallback(
  prompt: string,
  schema?: GeminiSchema
): Promise<string> {
  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
  let lastError: any;

  for (const modelName of models) {
    try {
      const result = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        ...(schema && {
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
      });
      return result.text?.trim() || "";
    } catch (error) {
      console.warn(`Gemini model ${modelName} failed, trying next...`, error);
      lastError = error;
    }
  }

  throw new Error(`All Gemini models failed: ${lastError?.message}`);
}

/**
 * Streaming Gemini çağrısı — her chunk'ı yield eder.
 * Chat route'u bu fonksiyonu kullanarak SSE stream oluşturur.
 * NOT: Structured Output schema ile streaming birlikte kullanılmıyor çünkü
 * JSON token'larını client'ta parse etmek karmaşıklığı artırır. Bunun yerine
 * backend tam metni biriktirip parseGeminiJson ile parse eder.
 * Mid-stream iteration errors propagate to the caller — chat route's STREAM_FAILED handler is the fallback.
 */
export async function callGeminiStream(prompt: string): Promise<AsyncIterable<string>> {
  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
  let lastError: any;

  for (const modelName of models) {
    let streamResult: any;
    try {
      streamResult = await ai.models.generateContentStream({
        model: modelName,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
    } catch (error) {
      console.warn(`Gemini stream model ${modelName} failed to connect, trying next...`, error);
      lastError = error;
      continue;
    }

    return (async function* () {
      for await (const chunk of streamResult) {
        // Fix 2: check finishReason — safety/recitation stops should surface as errors
        const finishReason = chunk.candidates?.[0]?.finishReason;
        if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") {
          throw new Error(`Gemini stream stopped: ${finishReason}`);
        }
        const text = chunk.text ?? "";
        if (text) yield text;
      }
    })();
  }

  // Fix 3: handle non-Error lastError gracefully
  throw new Error(`All Gemini stream models failed: ${lastError?.message ?? String(lastError)}`);
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
async function _generateHoroscope(
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
async function _generateBirthChartInterpretation(
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
async function _generateCompatibility(
  sign1: string,
  sign1Name: string,
  sign2: string,
  sign2Name: string,
  language: SupportedLanguage = "tr"
) {
  const lang = languageNames[language];
  const matrixScore = calculateBaseCompatibilityScore(sign1, sign2);

  const prompt = `You are a professional relationship astrologer and synastry expert.

TASK:
Analyze the astrological compatibility between two zodiac signs.
- Sign 1: "${sign1Name}" (${sign1})
- Sign 2: "${sign2Name}" (${sign2})
- SYSTEM COMPATIBILITY SCORE: ${matrixScore}% (Historical/System baseline). Your analysis MUST explain why they have this specific score.

CONTEXT:
- Language: ${lang}
- Audience: modern users who want insightful, emotionally intelligent, and realistic relationship advice.
    TASK:
    Analyze the deep astrological alignment and psychological compatibility between these two zodiac signs.
    - Sign 1: "${sign1Name}" (${sign1})
    - Sign 2: "${sign2Name}" (${sign2})

    CONTEXT:
    - Language: ${lang}
    - Audience: Sophisticated users seeking profound, emotionally intelligent, and realistic relationship guidance.
    - Tone: Balanced, poetic yet grounded, highly analytical, and empathetic. Avoid shallow clichés.

    STRICT OUTPUT RULES:
    - Return ONLY valid JSON.
    - No markdown, no explanations, no extra text.
    - Keep structure EXACTLY as defined.

    OUTPUT FORMAT:
    {
      "overallScore": ${matrixScore},
      "loveScore": number (0-100),
      "friendshipScore": number (0-100),
      "workScore": number (0-100),
      "description": "7-10 long, analytical sentences. Synthesize their qualities (cardinal, fixed, mutable) and elements (Fire, Earth, Air, Water). Explain the core psychological contract, how they resolve conflict, and what they teach each other on a soul level. Use sophisticated language. Reference the ${matrixScore}% compatibility score in your analysis to justify why it's not higher or lower.",
      "strengths": [
        "A detailed point about emotional or psychic resonance (2-3 sentences).",
        "A detailed point about intellectual or social synergy (2-3 sentences).",
        "A detailed point about their shared life vision or growth potential (2-3 sentences)."
      ],
      "challenges": [
        "A profound analysis of a potential shadow dynamic or ego clash (2-3 sentences).",
        "A specific communication or value-based friction point (2-3 sentences).",
        "Practical advice on what usually causes a breakdown and how to avoid it (2-3 sentences)."
      ]
    }

    QUALITY REQUIREMENTS:
    - Focus on the 'Why' behind the attraction and friction.
    - Use the elemental/quality archetypes to explain behavior.
    - Ensure the scores are astrologically sound and justify the system score of ${matrixScore}%.
    - Write fluently and elegantly in ${lang}. Ensure it feels like a premium session.`;

  try {
    const text = await callGeminiWithFallback(prompt);
    const parsed = parseGeminiJson(text);

    return {
      sign1,
      sign2,
      overallScore: matrixScore, // Force alignment with system score
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

  // Sort aspects by importance (intensity) and send top 18 for comprehensive reading
  const sortedAspects = [...synastryAspects].sort((a, b) => b.intensity - a.intensity);
  const aspectListStr = sortedAspects.slice(0, 18).map(a =>
    `- Planet 1 ${a.planet1Id} ⯈ Planet 2 ${a.planet2Id}: ${a.typeId} (${a.orb}° orb) - ${a.harmony}`
  ).join("\n");

  const prompt = `You are a master synastry astrologer specializing in relationship dynamics and psychological compatibility.
TASK:
Analyze the deep relationship compatibility (Synastry) between two individuals based on their exact astrological birth charts and the provided planetary aspects.

DATA:
Siz (You): Sun in ${chart1.sunSign.name}, Moon in ${chart1.moonSign.name}, ASC in ${chart1.risingSign.name}.
Partneriniz (Your Partner): Sun in ${chart2.sunSign.name}, Moon in ${chart2.moonSign.name}, ASC in ${chart2.risingSign.name}.

PLANETARY CONNECTIONS (Cross-Aspects):
${aspectListStr}

CONTEXT:
- Language: ${lang}
- Audience: Adults seeking deep, psychological, and realistic relationship insights. 
- Tone: Empathetic, analytical, profound, and professional. Use "Siz" and "Partneriniz".
- Goal: provide HIGHLY DETAILED, analytical interpretations. Avoid short bullet points.

STRICT FORMATTING RULES:
- Return ONLY valid JSON.
- No markdown, no explanations.
- DO NOT use double emojis.

OUTPUT STRUCTURE:
{
  "overallScore": 0-100, 
  "loveScore": 0-100, 
  "friendshipScore": 0-100, 
  "workScore": 0-100, 
  "description": "6-8 long sentences providing a profound holistic overview of the connection. Synthesize the Sun/Moon/ASC energies.",
  "strengths": [
    "A detailed strength focused on general relationship dynamics and personality synergy (3-4 analytical sentences). DO NOT mention technical aspect names or specific planetary degrees here.", 
    "Another major strength focusing on emotional or intellectual harmony (3-4 sentences). Focus on the 'human' side of the bond."
  ],
  "challenges": [
    "A potential friction point explained deeply through personality traits and behavioral patterns (3-4 sentences). DO NOT mention technical aspect names or specific planetary degrees here.", 
    "A communication or emotional block analyzed with depth (3-4 sentences). Focus on how their characters clash or need adjustment."
  ],
  "aspectInterpretations": [
     {
       "p1": "planet1Id",
       "p2": "planet2Id",
       "type": "aspectTypeId",
       "insight": "Explain exactly what this {planet1} and {planet2} interaction ({aspect}) means in reality. VARY YOUR OPENINGS; do not repeat the same sentence structure for every aspect. You can start with descriptors like 'Doğum haritalarınızdaki {planet1} ve {planet2} arasındaki bu {aspect} yerleşimi...', or 'Partnerinizin {planet2} konumu sizin {planet1} enerjinizle {aspect} yaparak...', etc. Add 2-3 sentences of deep, factual, and informative consequence. Focus on what they feel and how they interact."
     }
  ]
}

Write elegantly and naturally in ${lang}. Ensure every interpretation is professional, insightful, and comprehensive.`;

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
 * I Ching and Runes have dedicated deep prompts; other types use the standard prompt.
 */
async function _generateDivinationReading(
  type: DivinationType,
  cards: DivinationCard[],
  question: string,
  lang: SupportedLanguage,
  persona?: { name: string; style: string }
) {
  const langName = languageNames[lang];

  if (type === "iching") {
    return _generateIChingReading(cards, question, lang, langName);
  }
  if (type === "rune") {
    return _generateRuneReading(cards, question, lang, langName);
  }
  if (type === "crystal") {
    return _generateCrystalReading(question, lang, langName);
  }

  const typeDescriptions: Record<DivinationType, string> = {
    tarot: "Tarot card reader (Rider-Waite tradition). Interpret major and minor arcana with depth and psychological insight.",
    katina: "Katina (Turkish Oracle) card reader. Mystical, insightful, and deep psychic medium style. Maintain a professional, universally profound, and spiritual tone without using overly familiar or maternal terms.",
    lenormand: "Lenormand card reader. CRITICAL: Read cards IN COMBINATION — adjacent cards modify each other's meaning. Context flows left to right.",
    rune: "Elder Futhark Norse Rune caster.",
    iching: "I Ching interpreter.",
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
 * Dedicated crystal ball reading — no card language, fully vision-based.
 * Output: opening, visions (3 symbols), message, guidance.
 */
async function _generateCrystalReading(
  question: string,
  lang: SupportedLanguage,
  langName: string
) {
  const defaultQuestion = lang === "tr" ? "Genel bir rehberlik istiyorum" : "I seek general guidance";

  const prompt = `You are a mystical crystal ball seer — an ancient oracle who gazes into the swirling mists of a crystal sphere and translates what you see into deeply personal visions. You do NOT read cards. You do NOT use tarot language. You see living images, symbols, colors, light, and movement inside the crystal.

RESPONSE LANGUAGE: ${langName} — Write ALL output fields in ${langName} only.

The seeker's question: "${question || defaultQuestion}"

Your task: Gaze into the crystal. Describe exactly what you see — not what cards say, not what symbols traditionally mean, but what you personally witness in the swirling mists of this sphere as it responds to this specific question and this specific person.

STRICT OUTPUT RULES:
- Return ONLY valid JSON, no markdown, no extra text
- Never use the word "kart", "card", "tarot", "rün", "rune" anywhere
- Never start with "Bu kart" or any card-referencing phrase
- Always write in first person as the seer ("Kürede görüyorum...", "Sisler aralandığında...")
- Be vivid, poetic, intimate — not generic

OUTPUT FORMAT:
{
  "title": "A short evocative title for this vision (max 8 words)",
  "opening": "2 sentences: describe the atmosphere of the crystal as you gaze into it for this person — the colors, the mist, the energy you feel before the visions begin",
  "visions": [
    {
      "image": "A specific visual symbol or scene you see in the crystal — a concrete image (e.g. 'a door half-open in golden light', 'two hands reaching but not quite touching', 'a river splitting into two paths')",
      "meaning": "2-3 sentences: what this vision reveals about the seeker's question — intimate, personal, direct"
    },
    {
      "image": "Second distinct vision seen in the crystal",
      "meaning": "2-3 sentences: its meaning for the seeker"
    },
    {
      "image": "Third vision — often the most clarifying or forward-looking",
      "meaning": "2-3 sentences: what this suggests about the path ahead"
    }
  ],
  "message": "3-4 sentences: the crystal's unified message — weave all three visions into a single flowing narrative that speaks directly to the heart of the question",
  "guidance": "1 sentence of clear, grounded wisdom — the one thing the crystal most wants this person to know or do"
}

QUALITY REQUIREMENTS:
- Each vision image must be CONCRETE and UNIQUE — a real thing you see, not an abstraction
- The message must reference the question directly and feel personally addressed to the seeker
- Guidance must be actionable and specific, not vague ("Trust yourself" is too vague — "Begin the conversation you have been postponing" is specific)
- Write with warmth, gravity, and poetic intimacy throughout
- Vary sentence rhythm — short, powerful sentences for visions; flowing prose for the message`;

  try {
    const text = await callGeminiWithFallback(prompt);
    return parseGeminiJson(text);
  } catch (error) {
    console.error("Gemini crystal reading failed:", error);
    return null;
  }
}

/**
 * Deep I Ching reading with full philosophical depth.
 * Output includes trigram_reading, synthesis (10-12 sentences), spiritual_message, warning, advice, timeframe.
 */
async function _generateIChingReading(
  cards: DivinationCard[],
  question: string,
  lang: SupportedLanguage,
  langName: string
) {
  const cardList = cards.map((c, i) => {
    let entry = `${i + 1}. ${c.name}`;
    if (c.meaning) entry += ` — ${c.meaning}`;
    return entry;
  }).join("\n");

  const defaultQuestion = lang === "tr" ? "Genel bir rehberlik istiyorum" : "I seek general guidance";

  const prompt = `You are a master I Ching oracle — a living bridge between the Book of Changes and the modern soul. You embody the wisdom of King Wen, the Duke of Zhou, and Confucius's Ten Wings. You understand Yin and Yang not as opposites but as complementary movements. You bridge a millennium of Chinese philosophical tradition with the needs of the contemporary spirit.

RESPONSE LANGUAGE: ${langName} — Write ALL output fields in ${langName} only.

Hexagram drawn:
${cardList}

User's question: "${question || defaultQuestion}"

INTERPRETIVE DEPTH — Weave in all of the following:
- The hexagram's core energy: the dialogue between upper and lower trigrams
- The Judgement (Tuan): its specific meaning for the current situation
- The Image (Xiang): what does nature show and teach us?
- The moment of change: I Ching reads transitions, not fixed states — what transition is happening now?
- Wu Wei: resist the flow or surrender to it — which direction aligns with the hexagram's energy?
- Practical Tao: how to align with this energy?

OUTPUT RULE: Return ONLY valid JSON, no markdown, no extra text.

{
  "title": "A poetic, striking title that captures the hexagram's essence — in ${langName}",
  "cards": [
    {
      "name": "Hexagram name",
      "position": "The Hexagram of This Cast",
      "interpretation": "4-5 sentences: the hexagram's essence, how the trigram energies speak to each other, how this hexagram relates to the user's question and what it says right now"
    }
  ],
  "trigram_reading": "3-4 sentences examining the upper and lower trigrams as distinct symbolic forces. Which element is above, which below, and what does this positioning mean? What does the dialogue of these two forces tell us?",
  "synthesis": "10-12 sentences: a rich, philosophical narrative weaving the hexagram's wisdom with the user's specific question. Reference specific I Ching concepts. Naturally incorporate the Judgement and Image. Like a wise elder's deep but warm conversation — texture, not a list.",
  "spiritual_message": "The core spiritual teaching this hexagram offers this soul right now — what the Tao whispers to this person",
  "warning": "The shadow aspect: the trap or misunderstanding this hexagram warns against. What does incorrectly applied Wu Wei look like here? What should be avoided?",
  "advice": "2-3 sentences of concrete, actionable Taoist guidance. What practical step aligns with the hexagram's energy?",
  "timeframe": "Temporal wisdom: is this a moment of waiting, acting, or transforming? Offer a framework through I Ching's seasonal rhythm."
}

QUALITY REQUIREMENTS:
- Reference specific I Ching concepts: Wu Wei, Yin/Yang balance, trigram meanings
- Rich, unhurried tone: this is ancient wisdom, not a newspaper horoscope
- synthesis must be 10-12 full sentences — do not shorten
- Fluent, elevated ${langName}: not formal, but wise and warm
- Address the user's question directly`;

  try {
    const text = await callGeminiWithFallback(prompt);
    return parseGeminiJson(text);
  } catch (error) {
    console.error("Gemini I Ching reading failed:", error);
    return null;
  }
}

/**
 * Deep Elder Futhark Rune reading with Norse mythology depth.
 * Output includes runic_pattern, synthesis (10-12 sentences), odin_wisdom, spiritual_message, warning, advice, timeframe.
 */
async function _generateRuneReading(
  cards: DivinationCard[],
  question: string,
  lang: SupportedLanguage,
  langName: string
) {
  const cardList = cards.map((c, i) => {
    let entry = `${i + 1}. ${c.name}`;
    if (c.reversed) entry += " (MERKSTAVE / REVERSED)";
    if (c.meaning) entry += ` — ${c.meaning}`;
    return entry;
  }).join("\n");

  const defaultQuestion = lang === "tr" ? "Genel bir rehberlik istiyorum" : "I seek general guidance";

  const prompt = `You are a völva — a Norse seeress who has walked the roots of Yggdrasil and learned the runes directly from Odin's sacrifice. You carry the 24 mysteries of the Elder Futhark and the wisdom of the Norns — Urd, Verdandi, Skuld. You speak with the directness of Norse tradition: no false comfort, but fierce compassion.

RESPONSE LANGUAGE: ${langName} — Write ALL output fields in ${langName} only.

Runes drawn:
${cardList}

User's question: "${question || defaultQuestion}"

MYTHOLOGICAL DEPTH — Weave in all of the following:
- Each rune's mythological connection (which god, which realm, which myth)
- Runes as living forces — not symbols but entities
- Merkstave (reversed) runes: blocked/shadow/inverted energy, not merely "bad omens"
- The runes speaking to each other — what wyrd (fate-weaving) do they together form?
- Odin's nine-day sacrifice: each rune is sacred, earned at great cost
- The Three Norns: what was past-woven, what is present-weaving, what may come to pass

OUTPUT RULE: Return ONLY valid JSON, no markdown, no extra text.

{
  "title": "A poetic title evoking Norse myth — in ${langName}",
  "cards": [
    {
      "name": "Rune name and symbol",
      "position": "Position label",
      "interpretation": "4-5 sentences: the rune's mythological lineage (which god or realm), what it means in this position, what it tells about the question. For merkstave: explicitly address the shadow energy."
    }
  ],
  "runic_pattern": "3-4 sentences: how do these specific runes cast together form a pattern? What wyrd do they weave? Do they confirm, contradict, or amplify each other?",
  "synthesis": "10-12 sentences: a rich völva prophecy weaving Norse mythology into the querent's situation. Reference specific runes, their gods/realms, and what the Nine Worlds reveal. Be bold and poetic.",
  "odin_wisdom": "A single sentence — ancient wisdom as if whispered by Odin himself. Cryptic but clear.",
  "spiritual_message": "The runic teaching for this soul right now — what the Elder Futhark reveals beyond the immediate question",
  "warning": "The shadow runes or reversed energy: what force threatens to disrupt the weaving? Speak plainly.",
  "advice": "2-3 sentences of Norse-tradition practical guidance. What step aligns with the wyrd being woven?",
  "timeframe": "The Norns' perspective: Urd's thread (past-woven), Verdandi's needle (present-weaving), Skuld's scissors (what may come to pass)"
}

QUALITY REQUIREMENTS:
- Reference specific Norse mythology: Odin, Freya, Thor, Yggdrasil, the Norns, the Nine Worlds
- Each rune interpretation must mention its mythological lineage
- Merkstave runes must be handled distinctly from upright — not just "negative" but "blocked/inverted/shadow"
- Bold and direct tone: Norse culture was not timid
- Vivid, powerful ${langName}: lyrical but not flowery
- synthesis must be 10-12 full sentences — do not shorten`;

  try {
    const text = await callGeminiWithFallback(prompt);
    return parseGeminiJson(text);
  } catch (error) {
    console.error("Gemini Rune reading failed:", error);
    return null;
  }
}

/**
 * Generate a coffee reading from an uploaded image.
 * Uses premium 3-model Vision chain: gemini-3-flash → 2.5-flash → 2.5-flash-lite
 * Includes dual-layer safety guardrails.
 */
async function _generateCoffeeReading(
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
User's question: "${question || (lang === 'tr' ? 'Genel yorumuma bak' : 'Give me a general reading')}"
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
      const result = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: imageBase64 } },
            ],
          },
        ],
        config: {
          safetySettings: [
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any, threshold: "BLOCK_LOW_AND_ABOVE" as any },
            { category: "HARM_CATEGORY_HARASSMENT" as any, threshold: "BLOCK_LOW_AND_ABOVE" as any },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any, threshold: "BLOCK_MEDIUM_AND_ABOVE" as any },
          ],
        },
      });

      return parseGeminiJson(result.text?.trim() || "");
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
async function _generateVirtualCoffeeReading(
  question: string,
  lang: SupportedLanguage,
  persona?: { name: string; style: string }
) {
  const langName = languageNames[lang];

  const prompt = `You are a master Turkish coffee fortune teller. A virtual coffee cup has just been turned over.

IMAGINE that you are looking at fresh coffee grounds in a cup. Invent 3-5 completely random, creative, and vividly described telve shapes/symbols that you "see" in this imaginary cup. Make each symbol unique and surprising.

User's question: "${question || (lang === 'tr' ? 'Genel yorumuma bak' : 'Give me a general reading')}"
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

// --- NEXT.JS NATIVE CACHING WRAPPERS ---
export const generateHoroscope = unstable_cache(_generateHoroscope, ["__gemini_generateHoroscope"], { revalidate: 86400 });
export const generateBirthChartInterpretation = unstable_cache(_generateBirthChartInterpretation, ["__gemini_generateBirthChartInterpretation"], { revalidate: 2592000 });
export const generateCompatibility = unstable_cache(_generateCompatibility, ["__gemini_generateCompatibility"], { revalidate: 2592000 });
export const generateCoffeeReading = unstable_cache(_generateCoffeeReading, ["__gemini_generateCoffeeReading"], { revalidate: 86400 });
export const generateVirtualCoffeeReading = unstable_cache(_generateVirtualCoffeeReading, ["__gemini_generateVirtualCoffeeReading"], { revalidate: 86400 });
export const generateDivinationReading = unstable_cache(_generateDivinationReading, ["__gemini_generateDivinationReading"], { revalidate: 86400 });

/**
 * Generate a hyper-personalized daily cosmic insight synthesizing natal data and transits.
 */
export async function generateDeepCosmicInsight(
  userData: {
    sunSign: string;
    sunDegree: number;
    moonSign: string;
    moonDegree: number;
    risingSign: string | null;
    risingDegree: number | null;
    topPlanets: string;
    activeAspects: string;
    lifeFocus: string;
    gender: string;
    relationshipStatus: string;
    name: string;
  },
  celestialData: {
    moonPhase: string;
    transits: string;
    retrogrades: string;
  },
  language: SupportedLanguage = "tr"
) {
  const lang = languageNames[language];
  const dateStr = new Date().toISOString().split("T")[0];

  const risingBlock = userData.risingSign
    ? `- Yükselen (Ascendant): ${userData.risingSign} (${userData.risingDegree?.toFixed(1)}°) — dış dünyaya yansıyan maske, ilk izlenim`
    : "- Yükselen: Bilinmiyor (doğum saati girilmemiş)";

  const prompt = `Sen, yüzyılların bilgeliğini taşıyan bir Kozmik Kahin'sin. Natal astroloji, transit analiz ve Jungcu psikoloji sentezinde uzmansın. Kullanıcıya özel, derinlikli bir günlük kozmik rehberlik oluşturacaksın.

══════════════════════════════════════
KULLANICININ NATAL HARİTASI
══════════════════════════════════════
- İsim: ${userData.name || "Yolcu"}
- Güneş: ${userData.sunSign} (${userData.sunDegree.toFixed(1)}°) — öz kimlik, ego, yaşam amacı
- Ay: ${userData.moonSign} (${userData.moonDegree.toFixed(1)}°) — duygusal dünya, bilinçaltı, ihtiyaçlar
${risingBlock}
- Yaşam Odağı: ${userData.lifeFocus}
- İlişki Durumu: ${userData.relationshipStatus}
- Cinsiyet: ${userData.gender}

NATAL GEZEGEN YERLEŞİMLERİ:
${userData.topPlanets}

AKTİF NATAL AÇILAR:
${userData.activeAspects || "Hesaplanamadı"}

══════════════════════════════════════
BUGÜNKÜ GÖK HARİTASI (${dateStr})
══════════════════════════════════════
- Ay Evresi: ${celestialData.moonPhase}
- Aktif Transitler: ${celestialData.transits || "Belirgin transit yok"}
- Retrograd Gezegenler: ${celestialData.retrogrades}

══════════════════════════════════════
TALİMATLAR
══════════════════════════════════════

ADIM 1 — SENTEZ:
Kullanıcının natal haritasını bugünkü gök olaylarıyla sentezle. Hangi transit hangi natal gezegeni tetikliyor? Bugünkü ay evresi kullanıcının Ay burcuyla nasıl etkileşiyor? Güneş burcunun derecesi ile transit gezegenler arasında orb var mı?

ADIM 2 — KİŞİSELLEŞTİRME:
"${userData.lifeFocus}" odağına göre içeriği ağırlıklandır:
- "love" → ilişki dinamikleri, Venüs transitlerini öne çıkar
- "career" → kariyer, Satürn/Jüpiter/10. ev etkileri
- "health" → beden-zihin dengesi, Mars/6. ev
- "spiritual" → ruhsal uyanış, Neptün/Plüton/12. ev
- "general" → dengeli bir karışım

ADIM 3 — YAZIM:
${lang} dilinde yaz. Ton: Bilge, şiirsel ama havada kalmayan, otoriter ama şefkatli. Klişelerden kaçın. Spesifik gezegen ve burç isimlerini kullan. Kullanıcıya "sen" diye hitap et.

══════════════════════════════════════
ÇIKTI FORMATI (SADECE JSON)
══════════════════════════════════════

{
  "title": "Bugün için çağrışımsal, kısa ve etkileyici bir başlık (örn: 'Sabır Simyası', 'Gölgelerin Dansı', 'Ateşin Fısıltısı')",
  "content": "6-8 cümle. İlk cümlede bugünün kozmik atmosferini çiz. Ortada en az 1 spesifik transit-natal etkileşimini açıkla (örn: 'Transit Satürn senin natal Venüs'üne kare yapıyor — bu da...'). Son cümlelerde psikolojik derinlik ve somut yönlendirme ver. Paragraflar arasında \\n\\n kullan.",
  "advice": "Bugün için 1-2 cümlelik pratik, uygulanabilir bilgelik. Soyut değil somut olsun.",
  "planetOfTheDay": {
    "name": "Bugün kullanıcı için en etkili gezegenin ADI (Türkçe)",
    "reason": "1 kısa cümle: neden bu gezegen bugün baskın?"
  },
  "energyScores": {
    "love": "1-100 arası puan — bugünkü aşk/ilişki enerjisi",
    "career": "1-100 arası puan — kariyer/iş enerjisi",
    "health": "1-100 arası puan — sağlık/enerji seviyesi",
    "spiritual": "1-100 arası puan — ruhsal farkındalık"
  },
  "luckyElements": {
    "color": "Bugünün şanslı rengi",
    "number": "Bugünün şanslı sayısı (1-99)",
    "time": "Günün en güçlü saati (örn: '14:00-16:00')"
  },
  "signInsights": {
    "sun": {
      "hook": "Max 6 kelimelik çarpıcı başlık — bugün güneş burcunu etkileyen en belirgin kozmik durumu yansıtıyor. Heyecan verici, kişisel, enerji hissettiren. ${lang} dilinde.",
      "insight": "2 cümle. Bugün güneş burcunu etkileyen transit veya kozmik durumu somut, günlük hayata dokunan bir dille anlat. Teknik bir gezegen ya da açı adı kullanacaksan HEMEN arkasına 've bu şu anlama geliyor: ...' şeklinde açıkla. Soyut kelimeler yasak. ${lang} dilinde.",
      "watch": "1 cümle. Bugün dikkat edilmesi gereken tek şey — uyarı değil, nazik bir hatırlatma tonu. ${lang} dilinde."
    },
    "moon": {
      "hook": "Max 6 kelimelik çarpıcı başlık — bugün ay burcunun duygusal enerjisini yansıtıyor. ${lang} dilinde.",
      "insight": "2 cümle. Bugün ay burcunun iç dünyaya, duygulara ve ilişkilere yansımasını anlat. Teknik terim kullanacaksan hemen açıkla: 'X yapıyor, yani bu şu anlama geliyor: ...' ${lang} dilinde.",
      "watch": "1 cümle. Duygusal açıdan bugün akılda tutulması gereken tek şey. Nazik ton. ${lang} dilinde."
    },
    "rising": {
      "hook": "Max 6 kelimelik çarpıcı başlık — bugün yükselen burcun dış dünyaya yansımasını özetliyor. ${lang} dilinde.",
      "insight": "2 cümle. Bugün yükselen burcun insanlara nasıl göründüğünü, dış enerjiyi ve sosyal alanı nasıl etkilediğini anlat. Teknik terim kullanacaksan hemen açıkla. ${lang} dilinde.",
      "watch": "1 cümle. Sosyal ya da dış dünya açısından bugün dikkat edilmesi gereken tek şey. Nazik ton. ${lang} dilinde."
    }
  }
}

KALİTE KRİTERLERİ:
- "Bu benim için yazılmış" hissi ZORUNLU. Genel burç yorumu YASAK.
- Enerji puanları rastgele değil, transit ve natal etkileşimlere dayansın.
- Şanslı elementler de kozmik verilere göre belirlensin.
- content alanında en az 1 yerde kullanıcının natal gezegen yerleşimine atıf yap.
- signInsights: Hiçbir teknik terim açıklanmadan bırakılmaz. Jargon varsa "yani bu şu anlama geliyor: ..." ile anında çözülür.
- signInsights: Günlük hook başlıklar transit verilerine dayanır — her gün farklı, klişe değil.
- JSON dışında HİÇBİR ŞEY yazma.`;

  try {
    const text = await callGeminiWithFallback(prompt);
    return parseGeminiJson(text);
  } catch (error) {
    console.error("Gemini deep insight generation failed:", error);
    return null;
  }
}
