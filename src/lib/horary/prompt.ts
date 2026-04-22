// src/lib/horary/prompt.ts
import type { SupportedLanguage } from "@/lib/gemini";
import type { HoraryChart }       from "./engine";
import type { HoraryAnalysis, DignityLevel, TimingEstimate } from "./rules";
import { getEssentialDignity } from "./rules";

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

function moonAspectStr(analysis: HoraryAnalysis): string {
  const parts: string[] = [];
  if (analysis.moonLastAspect) {
    parts.push(`  Last (separating) aspect: Moon ${analysis.moonLastAspect.aspectType} ${analysis.moonLastAspect.planetName} (orb ${analysis.moonLastAspect.orb}°) — this shows what has recently happened or what triggered the question`);
  } else {
    parts.push("  Last aspect: none detected within orb");
  }
  if (analysis.moonNextAspect) {
    parts.push(`  Next (applying) aspect: Moon ${analysis.moonNextAspect.aspectType} ${analysis.moonNextAspect.planetName} (orb ${analysis.moonNextAspect.orb}°) — this shows what will happen next or where events are heading`);
  } else {
    parts.push("  Next aspect: none within orb (Moon may be Void of Course)");
  }
  return parts.join("\n");
}

export function buildHoraryPrompt(
  question: string,
  chart: HoraryChart,
  analysis: HoraryAnalysis,
  lang: SupportedLanguage,
  userLocalDatetime?: string,
): string {
  const { querent, quesited, moon, keyAspect, timing, reception } = analysis;
  const langName = LANG_NAMES[lang];
  const ts = chart.timestamp.toISOString();

  // Format the local time for display
  // userLocalDatetime comes as "2026-04-22T04:17" from datetime-local picker
  const localTimeStr = userLocalDatetime
    ? userLocalDatetime.replace("T", " ")
    : ts;

  const chartContext = `
HORARY CHART DATA
=================
Question asked: "${question}"
Chart cast for (UTC): ${ts}
User's local time when question was asked: ${localTimeStr}
NOTE: This chart is calculated for the EXACT moment the querent conceived the question. You MUST mention the USER'S LOCAL TIME (${localTimeStr}) in your reading, NOT the UTC time.
Location: ${chart.latitude.toFixed(4)}°N, ${chart.longitude.toFixed(4)}°E
House system: Regiomontanus (Lilly tradition) | Planetary set: 7 classical planets

ASCENDANT: ${chart.houses[0].signId.toUpperCase()} ${chart.houses[0].signDegree.toFixed(1)}°
MC (Medium Coeli): ${chart.houses[9].signId.toUpperCase()} ${chart.houses[9].signDegree.toFixed(1)}°

ALL HOUSE CUSPS:
${chart.houses.map(h => `  House ${h.house}: ${h.signId.toUpperCase()} ${h.signDegree.toFixed(1)}° (ruler: ${h.rulerId})`).join("\n")}

ALL PLANET POSITIONS:
${chart.planets.map(p =>
  `  ${p.name} (${p.id}): ${p.signId.toUpperCase()} ${p.signDegree.toFixed(1)}° | House ${p.house} | Daily motion: ${p.dailyMotion.toFixed(2)}°${p.retrograde?" [RETROGRADE]":""}${p.combust?" [COMBUST]":""}${p.cazimi?" [CAZIMI — in the heart of the Sun, extremely powerful]":""}${p.underSunbeams?" [UNDER SUNBEAMS]":""}`
).join("\n")}

STRICTURES (chart validity warnings):
${stricturesStr(analysis)}

===== SIGNIFICATOR ANALYSIS =====

QUERENT SIGNIFICATOR (rules House 1 — represents the person asking):
  Planet: ${querent.planet.name} (${querent.planet.id})
  Position: ${querent.planet.signId.toUpperCase()} ${querent.planet.signDegree.toFixed(1)}° | House ${querent.planet.house}
  Essential dignity: ${DIGNITY_DESC[querent.essentialDignity.level]} (score: ${querent.essentialDignity.score}/5)
  Accidental strength: house position=${querent.accidentalStrength.houseStrength}${querent.accidentalStrength.isRetrograde?", RETROGRADE (weakened, hesitant)":""}${querent.accidentalStrength.isCombust?", COMBUST (hidden, weakened by Sun)":""}${querent.accidentalStrength.isCazimi?", CAZIMI (extremely empowered)":""}${querent.accidentalStrength.isUnderSunbeams?", UNDER BEAMS (partially obscured)":""}

MOON (universal co-significator of the querent and flow of events):
  Position: ${moon.signId.toUpperCase()} ${moon.signDegree.toFixed(1)}° | House ${moon.house}
  Daily motion: ${moon.dailyMotion.toFixed(2)}°${moon.retrograde?" [R]":""}
  Essential dignity: ${DIGNITY_DESC[getEssentialDignity(moon.id, moon.signId, moon.signDegree).level]} (score: ${getEssentialDignity(moon.id, moon.signId, moon.signDegree).score}/5)
MOON'S ASPECT FLOW:
${moonAspectStr(analysis)}

QUESITED SIGNIFICATOR (rules House ${analysis.questionHouse} — represents: ${analysis.questionCategory}):
  Planet: ${quesited.planet.name} (${quesited.planet.id})
  Position: ${quesited.planet.signId.toUpperCase()} ${quesited.planet.signDegree.toFixed(1)}° | House ${quesited.planet.house}
  Essential dignity: ${DIGNITY_DESC[quesited.essentialDignity.level]} (score: ${quesited.essentialDignity.score}/5)
  Accidental strength: house position=${quesited.accidentalStrength.houseStrength}${quesited.accidentalStrength.isRetrograde?", RETROGRADE":""}${quesited.accidentalStrength.isCombust?", COMBUST":""}${quesited.accidentalStrength.isCazimi?", CAZIMI":""}${quesited.accidentalStrength.isUnderSunbeams?", UNDER BEAMS":""}

===== KEY ASPECT BETWEEN SIGNIFICATORS =====
${keyAspect
  ? `  ${keyAspect.planet1Id} ${keyAspect.type} ${keyAspect.planet2Id} | ${keyAspect.angleDiff.toFixed(1)}° to exact | applying=${keyAspect.applying} | will perfect=${keyAspect.willPerfect}`
  : "  No major aspect between significators within orb — significators are disconnected."}

===== RECEPTION ANALYSIS =====
  ${reception.detail}

TIMING ESTIMATE: ${timingStr(timing)}
`;

  return `You are a master horary astrologer trained in the tradition of William Lilly (Christian Astrology, 1647), John Frawley (The Horary Textbook), and Bonatti. You have been given a fully calculated Regiomontanus horary chart with significators, dignities, receptions, and Moon aspects pre-computed. Your task is to deliver an EXHAUSTIVE, deeply structured, premium-quality horary reading worthy of a paid consultation.

${chartContext}

STRICT RULES:
- Write ONLY in ${langName}. Every word must be in ${langName}.
- DO NOT use filler phrases like "certainly", "of course", "as we can see". Every sentence must carry unique insight.
- ⚠️ CRITICAL: You MUST use the EXACT dignity scores and levels provided above. If the data says "exalted — score: 4/5", you MUST say the planet is exalted with score 4. DO NOT CHANGE, INVERT, OR CONTRADICT any computed data. If a planet is listed as "exalted", do NOT say it is "in fall" or "in detriment". COPY THE EXACT VALUES.
- ⚠️ CRITICAL: You MUST mention the specific date and time the chart was cast for in Section 1.
- Base your reasoning on the provided chart data above — do NOT invent planet positions.
- Follow Lilly's tradition: use the 7 classical planets only, interpret applying aspects, respect the dignity scores AS GIVEN.
- You MUST be DETAILED — each section must be comprehensive. This is a PREMIUM paid reading.
- Do NOT abbreviate or rush. Write as if this is a full consultation. Minimum 400 words per major section.
- You MUST produce ONLY valid JSON. No text before or after the JSON object.

Produce a JSON object with exactly these 8 keys. Each value is a string. Use \\n for line breaks within strings.

{
  "section1": "HARITANIN RADİKALLİĞİ VE İLK İZLENİM — Write 3-4 paragraphs (minimum 250 words). START by stating the exact date and time the chart was cast for (use the 'Chart local time' value above). Then analyze: (1) Is the chart radical (fit to judge)? Check the Ascendant degree — is it too early (<3°) meaning the situation hasn't formed, or too late (>27°) meaning the matter is already decided? (2) Check EVERY stricture listed above and explain in detail what Lilly says about each. (3) Is Moon Void of Course? What does Lilly say about VOC in this type of question? (4) Via Combusta? Saturn in 7th? (5) What is the general atmospheric mood of this chart — does it feel urgent, stagnant, promising, dangerous? The querent MUST understand whether the chart is ready to give an answer.",

  "section2": "SORAN KİŞİ — QUERENT ANALİZİ — Write 3-4 paragraphs (minimum 250 words). Deep dive into the querent's significator: name the planet, its sign, its house, its essential dignity level. What does domicile/exaltation/peregrine/detriment/fall mean for this particular situation? Is the planet angular (powerful to act), succedent (moderate), or cadent (weak)? Is it retrograde (hesitating, reconsidering)? Combust (hidden, weakened, under someone's shadow)? What does this tell us about the querent's current psychological state, their ability to influence the outcome, and their true intention behind the question? Use concrete language — 'you are in a position of strength' or 'you feel trapped and unable to act'.",

  "section3": "KONU — QUESITED ANALİZİ — Write 3-4 paragraphs (minimum 250 words). Same deep analysis for the quesited significator. Which planet represents the subject of the question? What house does it rule and why? What is its essential dignity — is the thing the querent seeks healthy, accessible, willing? Is it in an angular house (visible, accessible) or cadent (hidden, difficult to reach)? If retrograde, the matter may be reversing or changing. If combust, the subject is hidden or under pressure. Connect these findings to the real-world question — what does the planet's condition say about the actual thing being asked about?",

  "section4": "AY ANALİZİ — OLAYLARIN AKIŞI — Write 3-4 paragraphs (minimum 250 words). The Moon is the single most important planet in horary — it is the universal co-significator and the 'messenger' who shows the flow of events. Analyze: (1) The Moon's sign and house — what emotional atmosphere does this create? (2) The Moon's LAST SEPARATING ASPECT: which planet did it last touch? This reveals what has JUST happened, what triggered the question, what recent event brought this to the querent's mind. (3) The Moon's NEXT APPLYING ASPECT: which planet will it contact next? This reveals what will happen SOON, the next event in the chain. (4) Is the Moon collecting light between the two significators? Is it transferring light? Does a third planet frustrate or prohibit the aspect? Be very specific about the aspect types (trine=ease, square=conflict, opposition=confrontation).",

  "section5": "RESEPSİYON VE İLİŞKİ DİNAMİĞİ — Write 2-3 paragraphs (minimum 200 words). Analyze the RECEPTION between the two significators. Reception answers the crucial question: 'Do these two parties WANT to connect?' If there is mutual reception (by domicile or exaltation), it is a powerful indicator of cooperation and eventual success even without a direct aspect. If one-way reception exists, explain who has power over whom. If no reception exists, explain what this means — indifference, lack of willingness, no natural connection. Connect this to the real question: does the other person care? Is the opportunity genuinely available? Is there willingness to cooperate?",

  "section6": "KESİN HÜKÜM — Write 4-5 paragraphs (minimum 350 words). This is the MAIN VERDICT. Start with an UNAMBIGUOUS answer: 'EVET — olacak', 'HAYIR — olmayacak', 'BELİRSİZ — koşullara bağlı', or 'ZAMAN İSTER — sabır gerekiyor'. Then justify this verdict by synthesizing ALL previous sections: the significator conditions, the key aspect (applying vs separating, will it perfect?), the reception, the Moon's testimony, and any strictures. Address each piece of evidence FOR and AGAINST the outcome. Be HONEST — if the chart says no, say it clearly and compassionately. If the chart says yes, show exactly why. If conditions must be met, state them precisely. This section must feel like a trusted advisor giving their final, definitive opinion.",

  "section7": "ZAMANLAMA — Write 2-3 paragraphs (minimum 200 words). Use the timing estimate (${timingStr(timing)}) and explain the astrological logic: which planets, which signs (cardinal=fast/days, mutable=medium/weeks, fixed=slow/months), which houses (angular=fast, cadent=slow) determine the time unit. If timing is unclear, explain why — perhaps there is no perfecting aspect, or the significator is retrograde. Give a range: 'within the next X to Y [unit]'. Explain what the querent should watch for as a real-world signal that events are unfolding.",

  "section8": "STRATEJİK TAVSİYE VE KOZMIK REHBERLIK — Write 3-4 paragraphs (minimum 250 words). This is the actionable wisdom section. Based on EVERYTHING the chart reveals: (1) What should the querent DO? What specific action is supported by the planetary conditions? (2) What should they AVOID? Which timing or approach would work against them? (3) What planetary energy should they align with — if Venus is strong, focus on diplomacy; if Mars, take direct action; if Saturn, be patient and structured. (4) If the answer was negative, what can the querent do to change the conditions? What aspect of their situation needs to shift? (5) Give a closing spiritual/philosophical reflection drawn from the chart's symbolism — something meaningful and personal that the querent can carry with them."
}`;
}
