const fs = require('fs');

let path = 'src/lib/gemini.ts';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix parseGeminiJson
code = code.replace(
  /function parseGeminiJson\(text: string\) \{[\s\S]*?return JSON\.parse\(cleaned\);\n\}/,
  \`function parseGeminiJson(text: string) {
  // Strip <think>...</think> blocks which some reasoning/Qwen models generate
  let cleaned = text.replace(/<think>[\\s\\S]*?<\\/think>/gi, "").trim();
  
  // Strip markdown formatting if present
  cleaned = cleaned.replace(/^\\s*\`\`\`(?:json)?\\s*/i, "").replace(/\\s*\`\`\`\\s*$/i, "").trim();
  
  // Extract strictly from the first '{' to the last '}' 
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return JSON.parse(cleaned);
}\`
);

// 2. Fix generateCompatibility to include mathematical limits + language override
const compatRegex = /async function _generateCompatibility\(([\s\S]*?)\)\s*\{([\s\S]*?)const prompt = \`Y([\s\S]*?)QUALITY REQUIREMENTS:[\s\S]*?Ensure it feels like a premium session.\`;([\s\S]*?)\}/;

code = code.replace(compatRegex, (match, args, beforePrompt, promptMid, afterPrompt) => {
  return \`
const zodiacOrder = [
  "koc", "boga", "ikizler", "yengec", "aslan", "basak", "terazi", "akrep", "yay", "oglak", "kova", "balik"
];

function getSignDistanceScore(sign1: string, sign2: string) {
  const idx1 = zodiacOrder.indexOf(sign1);
  const idx2 = zodiacOrder.indexOf(sign2);
  if (idx1 === -1 || idx2 === -1) return 50;

  let diff = Math.abs(idx1 - idx2);
  if (diff > 6) diff = 12 - diff;

  // 0: Kavuşum (90), 1: Yarı-Sekstil (55), 2: Sekstil (80), 3: Kare (45)
  // 4: Üçgen (95), 5: Quincunx (35), 6: Karşıt (75)
  const scoreMap: Record<number, number> = {
    0: 90, 1: 55, 2: 80, 3: 45, 4: 95, 5: 35, 6: 75
  };
  return scoreMap[diff] || 50;
}

async function _generateCompatibility(\${args}) {
  const lang = languageNames[language];
  const baseScore = getSignDistanceScore(sign1, sign2);
  // Add some slight deterministic variation (±3) for love/friendship/work so it feels organic
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
}\`;
});

fs.writeFileSync(path, code);
console.log('Restored lost Gemini modifications.')
