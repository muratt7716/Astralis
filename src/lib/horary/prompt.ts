// src/lib/horary/prompt.ts
import type { SupportedLanguage } from "@/lib/gemini";
import type { HoraryChart }       from "./engine";
import type { HoraryAnalysis, DignityLevel, TimingEstimate } from "./rules";

const LANG_NAMES: Record<SupportedLanguage, string> = {
  tr:"Türkçe", en:"English", ar:"العربية", de:"Deutsch", fr:"Français",
};

const DIGNITY_DESC: Record<DignityLevel, string> = {
  domicile:   "in its own sign — very strong, free to act",
  exaltation: "exalted — strong, acts proudly",
  triplicity: "in triplicity — moderately strong",
  term:       "in its term — minor strength",
  face:       "in its face — very weak strength",
  peregrine:  "peregrine — no essential dignity, unreliable",
  detriment:  "in detriment — weakened, in hostile territory",
  fall:       "in fall — weakened, humiliated",
};

function timingStr(t: TimingEstimate | null): string {
  if (!t) return "timing unclear — no perfecting aspect found";
  return `approximately ${t.value} ${t.unit}`;
}

function stricturesStr(analysis: HoraryAnalysis): string {
  if (!analysis.strictures.length) return "No strictures present. Chart is radical and readable.";
  return analysis.strictures.map(s => `⚠ ${s.detail}`).join("\n");
}

export function buildHoraryPrompt(
  question: string,
  chart: HoraryChart,
  analysis: HoraryAnalysis,
  lang: SupportedLanguage
): string {
  const { querent, quesited, moon, keyAspect, timing } = analysis;
  const langName = LANG_NAMES[lang];
  const ts = chart.timestamp.toISOString();

  const chartContext = `
HORARY CHART DATA
=================
Question asked: "${question}"
Time of question (UTC): ${ts}
Location: ${chart.latitude.toFixed(2)}°N, ${chart.longitude.toFixed(2)}°E
House system: Regiomontanus | Planetary set: 7 classical planets (Lilly tradition)

ASCENDANT: ${chart.houses[0].signId.toUpperCase()} ${chart.houses[0].signDegree.toFixed(1)}°
MC: ${chart.houses[9].signId.toUpperCase()} ${chart.houses[9].signDegree.toFixed(1)}°

ALL PLANET POSITIONS:
${chart.planets.map(p =>
  `  ${p.name} (${p.id}): ${p.signId.toUpperCase()} ${p.signDegree.toFixed(1)}° | House ${p.house}${p.retrograde?" [R]":""}${p.combust?" [COMBUST]":""}${p.cazimi?" [CAZIMI]":""}`
).join("\n")}

STRICTURES:
${stricturesStr(analysis)}

QUERENT SIGNIFICATOR: ${querent.planet.name} (${querent.planet.id})
  Position: ${querent.planet.signId.toUpperCase()} ${querent.planet.signDegree.toFixed(1)}° | House ${querent.planet.house}
  Essential dignity: ${DIGNITY_DESC[querent.essentialDignity.level]} (score: ${querent.essentialDignity.score})
  Accidental: house=${querent.accidentalStrength.houseStrength}${querent.accidentalStrength.isRetrograde?", retrograde":""}${querent.accidentalStrength.isCombust?", combust":""}

MOON (co-significator of querent):
  ${moon.signId.toUpperCase()} ${moon.signDegree.toFixed(1)}° | House ${moon.house}${moon.retrograde?" [R]":""}

QUESITED SIGNIFICATOR (${analysis.questionCategory} → House ${analysis.questionHouse}): ${quesited.planet.name} (${quesited.planet.id})
  Position: ${quesited.planet.signId.toUpperCase()} ${quesited.planet.signDegree.toFixed(1)}° | House ${quesited.planet.house}
  Essential dignity: ${DIGNITY_DESC[quesited.essentialDignity.level]} (score: ${quesited.essentialDignity.score})
  Accidental: house=${quesited.accidentalStrength.houseStrength}${quesited.accidentalStrength.isRetrograde?", retrograde":""}${quesited.accidentalStrength.isCombust?", combust":""}

KEY ASPECT BETWEEN SIGNIFICATORS:
${keyAspect
  ? `  ${keyAspect.planet1Id} ${keyAspect.type} ${keyAspect.planet2Id} | ${keyAspect.angleDiff.toFixed(1)}° to exact | applying=${keyAspect.applying} | will perfect=${keyAspect.willPerfect}`
  : "  No major aspect between significators within orb."}

TIMING ESTIMATE: ${timingStr(timing)}
`;

  return `You are a master horary astrologer working in the tradition of William Lilly (Christian Astrology, 1647) and John Frawley (The Horary Textbook, 2014). You have been given a fully calculated horary chart with all significator data already computed. Your task is to deliver a deep, structured, expert reading.

${chartContext}

STRICT RULES:
- Write ONLY in ${langName}. Every word must be in ${langName}.
- DO NOT use filler phrases like "certainly", "of course", "as we can see". Every sentence must carry unique insight.
- Base your reasoning on the provided chart data above — do NOT invent planet positions.
- Follow Lilly's tradition: use the 7 classical planets only, interpret applying aspects, respect the dignity scores.
- You MUST produce ONLY valid JSON. No text before or after the JSON object.

Produce a JSON object with exactly these 5 keys. Each value is a string. Use \\n for line breaks within strings.

{
  "section1": "HARITANIN İLK SESİ — Write 2-3 paragraphs. Address: are there strictures? If yes, name each one specifically and explain what Lilly says about it. What is the general atmosphere of this chart? Is it radical (fit to be read)? Tone: observant, careful, like an expert studying a manuscript.",

  "section2": "SEN VE KONU — Write 2-3 paragraphs. Describe the querent significator in detail: which planet, what sign, what house, what is its essential dignity (use the score), what does this say about the querent's current state and power to act? Then describe the quesited significator the same way. Explain what each planet's condition reveals about the real-world situation. Tone: personal, explanatory, insightful.",

  "section3": "GEZEGENLER NE ANLATIYOR? — Write 2-3 paragraphs. Analyze the Moon: its sign, house, dignity, what its last and next aspects suggest about the flow of events. Then analyze the key aspect between the two significators: is it applying or separating? Will it perfect? Are there any planets that could translate light, collect light, or prohibit the aspect? What does this web of aspects tell us? Tone: analytical, step-by-step, like a master explaining their reasoning.",

  "section4": "CEVAP — Write 3-4 paragraphs minimum (at least 200 words). Start with a clear verdict: 'Evet', 'Hayır', 'Belirsiz', or 'Zaman İster'. Then justify the verdict deeply using the significator conditions, the aspect analysis, and any receptions. Address what must change for a yes/no. Be honest — if the chart shows difficulty, say so clearly. Tone: decisive, expert, honest, like a trusted advisor.",

  "section5": "ZAMAN VE TAVSİYE — Write 2 paragraphs. First paragraph: give the timing estimate (use the computed value: ${timingStr(timing)}) and explain the astrological basis for it (which planets, which signs, which houses determine the time unit). Second paragraph: give the querent a practical, grounded piece of advice based on what the chart shows — what should they do, what should they avoid, what to watch for. Tone: constructive, supportive, forward-looking."
}`;
}
