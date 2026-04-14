const fs = require('fs');
const path = 'src/lib/gemini.ts';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix parseGeminiJson
const parseSearch = `function parseGeminiJson(text: string) {
  const cleaned = text.replace(/^\`\`\`json?\\s*/i, "").replace(/\`\`\`\\s*$/i, "").trim();
  return JSON.parse(cleaned);
}`;
const parseReplace = `function parseGeminiJson(text: string) {
  let cleaned = text.replace(/<think>[\\s\\S]*?<\\/think>/gi, "").trim();
  cleaned = cleaned.replace(/^\\s*\`\`\`(?:json)?\\s*/i, "").replace(/\\s*\`\`\`\\s*$/i, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}`;
if (code.includes(parseSearch)) {
  code = code.replace(parseSearch, parseReplace);
}

// 2. Insert getSignDistanceScore and rewrite _generateCompatibility
// We will find where _generateCompatibility starts and ends
const funcStart = 'async function _generateCompatibility(';
const startIndex = code.indexOf(funcStart);

if (startIndex !== -1) {
  // Find the end of the function. _generateSynastry usually follows it.
  const nextFuncMatch = code.indexOf('async function _generateSynastry(', startIndex);
  
  if (nextFuncMatch !== -1) {
    // The previous text up to startIndex
    const before = code.substring(0, startIndex);
    // The text after the function
    // Look for the last '}' before nextFuncMatch
    const lastBraceIndex = code.lastIndexOf('}', nextFuncMatch);
    const after = code.substring(lastBraceIndex + 1);

    const newFunc = `
const zodiacOrder = [
  "koc", "boga", "ikizler", "yengec", "aslan", "basak", "terazi", "akrep", "yay", "oglak", "kova", "balik"
];

function getSignDistanceScore(sign1: string, sign2: string) {
  const idx1 = zodiacOrder.indexOf(sign1);
  const idx2 = zodiacOrder.indexOf(sign2);
  if (idx1 === -1 || idx2 === -1) return 50;

  let diff = Math.abs(idx1 - idx2);
  if (diff > 6) diff = 12 - diff;

  const scoreMap: Record<number, number> = {
    0: 90, 1: 55, 2: 80, 3: 45, 4: 95, 5: 35, 6: 75
  };
  return scoreMap[diff] || 50;
}

async function _generateCompatibility(
  sign1: string,
  sign1Name: string,
  sign2: string,
  sign2Name: string,
  language: SupportedLanguage = "tr"
) {
  const lang = languageNames[language];
  const baseScore = getSignDistanceScore(sign1, sign2);
  const loveScore = Math.min(100, Math.max(0, baseScore + (sign1 === sign2 ? 5 : -2)));
  const friendshipScore = Math.min(100, Math.max(0, baseScore + 4));
  const workScore = Math.min(100, Math.max(0, baseScore - 5));

  const prompt = \\\`You are a professional relationship astrologer and synastry expert.

    TASK:
    Analyze the deep astrological alignment and psychological compatibility between these two zodiac signs.
    - Sign 1: "\${sign1Name}" (\${sign1})
    - Sign 2: "\${sign2Name}" (\${sign2})

    CONTEXT:
    - Language: \${lang}
    - Audience: Sophisticated users seeking profound, emotionally intelligent, and realistic relationship guidance.
    - Tone: Balanced, poetic yet grounded, highly analytical, and empathetic. Avoid shallow clichés.
    - IMPORTANT MATHEMATICAL CONSTRAINT: Their core astrological synergy score is EXACTLY \${baseScore}%. You must write the narrative justifying this specific level of compatibility. If the score is low (e.g. 45%), emphasize their square aspect friction. If it's high (e.g. 95%), emphasize their trine harmony. DO NOT HALLUCINATE RANDOM SCORES.
    - CRITICAL LANGUAGE RULE: You MUST write the ENTIRE JSON content precisely in \${lang}. Do NOT use English concepts inside the text (e.g., do not say "core", "square", "score"). Use ONLY proper localized astrological terminology. ABSOLUTELY NO Chinese characters or foreign scripts allowed.

    STRICT OUTPUT RULES:
    - Return ONLY valid JSON.
    - No markdown, no explanations, no extra text.
    - Keep structure EXACTLY as defined.

    OUTPUT FORMAT:
    {
      "description": "7-10 long, analytical sentences. Synthesize their qualities (cardinal, fixed, mutable) and elements (Fire, Earth, Air, Water). Explain the core psychological contract, how they resolve conflict, and what they teach each other on a soul level. Justify the \${baseScore}% compatibility.",
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
    - Write fluently and elegantly in \${lang} without any foreign words. Ensure it feels like a premium authentic session.\\\`;

  try {
    const text = await callGeminiWithFallback(prompt);
    const parsed = parseGeminiJson(text);

    return {
      sign1,
      sign2,
      overallScore: baseScore,
      loveScore,
      friendshipScore,
      workScore,
      description: parsed.description || "",
      strengths: parsed.strengths || [],
      challenges: parsed.challenges || [],
    };
  } catch (error) {
    console.error("Gemini compatibility generation failed:", error);
    return null;
  }
}
`;

    code = before + newFunc + after;
  }
}

fs.writeFileSync(path, code);
console.log('Restoration cleanly executed.');
