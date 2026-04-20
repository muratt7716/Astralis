// src/lib/horary/rules.ts
import type { HoraryChart, HoraryPlanet, HoraryHouse, SignId } from "./engine";

// ─── Types ───────────────────────────────────────────────────
export interface Stricture {
  type: "earlyAsc" | "lateAsc" | "voc" | "viaCombusta" | "saturnIn7";
  severity: "warning" | "info";
  messageKey: string;   // i18n key
  detail: string;       // raw English for AI prompt
}

export type DignityLevel =
  | "domicile" | "exaltation" | "triplicity"
  | "term" | "face" | "peregrine" | "detriment" | "fall";

export interface EssentialDignity {
  level: DignityLevel;
  score: number;  // +5 → -5
}

export interface AccidentalStrength {
  houseStrength: "angular" | "succedent" | "cadent";
  isRetrograde: boolean;
  isCombust: boolean;
  isCazimi: boolean;
  isUnderSunbeams: boolean;
}

export interface Significator {
  role: "querent" | "quesited";
  planet: HoraryPlanet;
  house: number;
  essentialDignity: EssentialDignity;
  accidentalStrength: AccidentalStrength;
}

export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface KeyAspect {
  planet1Id: string;
  planet2Id: string;
  type: AspectType;
  angleDiff: number;   // degrees to exact
  applying: boolean;
  willPerfect: boolean;
}

export interface TimingEstimate {
  value: number;
  unit: "days" | "weeks" | "months" | "years";
}

export type QuestionCategory =
  | "relationship" | "career" | "money" | "health"
  | "property" | "travel" | "legal" | "child" | "lost" | "general";

export interface HoraryAnalysis {
  strictures: Stricture[];
  questionCategory: QuestionCategory;
  questionHouse: number;
  querent: Significator;
  moon: HoraryPlanet;
  quesited: Significator;
  keyAspect: KeyAspect | null;
  timing: TimingEstimate | null;
}

// ─── Essential dignity tables (Lilly / Ptolemaic) ────────────
const DOMICILE: Record<string, string[]> = {
  sun:     ["aslan"],
  moon:    ["yengec"],
  mercury: ["ikizler","basak"],
  venus:   ["boga","terazi"],
  mars:    ["koc","akrep"],
  jupiter: ["yay","balik"],
  saturn:  ["oglak","kova"],
};

const EXALTATION: Record<string, string> = {
  sun:"koc", moon:"boga", mercury:"basak", venus:"balik",
  mars:"oglak", jupiter:"yengec", saturn:"terazi",
};

const DETRIMENT: Record<string, string[]> = {
  sun:["kova"], moon:["oglak"], mercury:["yay","balik"],
  venus:["koc","akrep"], mars:["terazi","boga"],
  jupiter:["ikizler","basak"], saturn:["yengec","aslan"],
};

const FALL: Record<string, string> = {
  sun:"terazi", moon:"akrep", mercury:"balik", venus:"basak",
  mars:"yengec", jupiter:"oglak", saturn:"koc",
};

const SIGN_ELEMENT: Record<string, string> = {
  koc:"fire", aslan:"fire", yay:"fire",
  boga:"earth", basak:"earth", oglak:"earth",
  ikizler:"air", terazi:"air", kova:"air",
  yengec:"water", akrep:"water", balik:"water",
};

const TRIPLICITY: Record<string, string[]> = {
  fire:["sun","jupiter"], earth:["venus","moon"],
  air:["saturn","mercury"], water:["mars","moon"],
};

// Ptolemaic terms (Lilly, Christian Astrology)
const TERMS: Record<string, Array<{ruler:string;to:number}>> = {
  koc:     [{ruler:"jupiter",to:6},{ruler:"venus",to:12},{ruler:"mercury",to:20},{ruler:"mars",to:25},{ruler:"saturn",to:30}],
  boga:    [{ruler:"venus",to:8},{ruler:"mercury",to:14},{ruler:"jupiter",to:22},{ruler:"saturn",to:27},{ruler:"mars",to:30}],
  ikizler: [{ruler:"mercury",to:7},{ruler:"jupiter",to:14},{ruler:"venus",to:21},{ruler:"mars",to:25},{ruler:"saturn",to:30}],
  yengec:  [{ruler:"mars",to:6},{ruler:"jupiter",to:13},{ruler:"mercury",to:20},{ruler:"venus",to:27},{ruler:"saturn",to:30}],
  aslan:   [{ruler:"saturn",to:6},{ruler:"mercury",to:13},{ruler:"venus",to:19},{ruler:"jupiter",to:25},{ruler:"mars",to:30}],
  basak:   [{ruler:"mercury",to:7},{ruler:"venus",to:13},{ruler:"jupiter",to:18},{ruler:"saturn",to:24},{ruler:"mars",to:30}],
  terazi:  [{ruler:"saturn",to:6},{ruler:"venus",to:11},{ruler:"jupiter",to:19},{ruler:"mercury",to:24},{ruler:"mars",to:30}],
  akrep:   [{ruler:"mars",to:7},{ruler:"venus",to:11},{ruler:"mercury",to:19},{ruler:"jupiter",to:24},{ruler:"saturn",to:30}],
  yay:     [{ruler:"jupiter",to:8},{ruler:"venus",to:14},{ruler:"mercury",to:19},{ruler:"saturn",to:25},{ruler:"mars",to:30}],
  oglak:   [{ruler:"mercury",to:7},{ruler:"jupiter",to:14},{ruler:"venus",to:22},{ruler:"saturn",to:26},{ruler:"mars",to:30}],
  kova:    [{ruler:"mercury",to:7},{ruler:"venus",to:13},{ruler:"jupiter",to:20},{ruler:"mars",to:25},{ruler:"saturn",to:30}],
  balik:   [{ruler:"venus",to:8},{ruler:"jupiter",to:14},{ruler:"mercury",to:20},{ruler:"mars",to:26},{ruler:"saturn",to:30}],
};

const FACE_ORDER = ["mars","sun","venus","mercury","moon","saturn","jupiter"];
const SIGN_INDEX: Record<string,number> = {
  koc:0,boga:1,ikizler:2,yengec:3,aslan:4,basak:5,
  terazi:6,akrep:7,yay:8,oglak:9,kova:10,balik:11
};

function getFaceRuler(signId: string, degree: number): string {
  const face = Math.floor(degree / 10);
  return FACE_ORDER[((SIGN_INDEX[signId] || 0) * 3 + face) % 7];
}

export function getEssentialDignity(planetId: string, signId: string, degree: number): EssentialDignity {
  if (DOMICILE[planetId]?.includes(signId))  return { level: "domicile",   score: 5  };
  if (EXALTATION[planetId] === signId)        return { level: "exaltation", score: 4  };
  if (DETRIMENT[planetId]?.includes(signId)) return { level: "detriment",  score: -5 };
  if (FALL[planetId] === signId)              return { level: "fall",       score: -4 };
  const el = SIGN_ELEMENT[signId];
  if (el && TRIPLICITY[el]?.includes(planetId)) return { level: "triplicity", score: 3 };
  const terms = TERMS[signId] || [];
  let from = 0;
  for (const t of terms) {
    if (degree >= from && degree < t.to && t.ruler === planetId) return { level: "term", score: 2 };
    from = t.to;
  }
  if (getFaceRuler(signId, degree) === planetId) return { level: "face", score: 1 };
  return { level: "peregrine", score: 0 };
}

export function getAccidentalStrength(planet: HoraryPlanet): AccidentalStrength {
  const houseStrength =
    [1,4,7,10].includes(planet.house) ? "angular"  :
    [2,5,8,11].includes(planet.house) ? "succedent" : "cadent";
  return {
    houseStrength,
    isRetrograde:    planet.retrograde,
    isCombust:       planet.combust,
    isCazimi:        planet.cazimi,
    isUnderSunbeams: planet.underSunbeams,
  };
}

// ─── Question detection ──────────────────────────────────────
const CATEGORY_PATTERNS: Array<[QuestionCategory, RegExp]> = [
  ["relationship", /sevgil|evlil|evli|partner|aşk|ilişki|nikah|boşan|nişan|wife|husband|marriage|love|partner/i],
  ["career",       /iş|kariyer|terfi|işe|işten|meslek|çalış|görev|pozisyon|job|work|career|promotion/i],
  ["money",        /para|borç|gelir|maaş|satış|kira|kredi|ödeme|kazanç|money|debt|salary|financial/i],
  ["health",       /sağlık|hasta|ameliyat|iyileş|tedavi|doktor|hastalık|health|illness|surgery|recover/i],
  ["property",     /ev|daire|mülk|arsa|gayrimenkul|house|property|apartment|real estate/i],
  ["travel",       /seyahat|yolculuk|gitmek|taşınmak|vize|uçuş|travel|journey|trip|move/i],
  ["legal",        /dava|mahkeme|hukuk|avukat|anlaşmazlık|legal|lawsuit|court|attorney/i],
  ["child",        /çocuk|bebek|hamile|doğum|gebelik|child|baby|pregnant|pregnancy/i],
  ["lost",         /kayıp|kaybet|bulamıyor|nerede|çalındı|lost|missing|stolen|find/i],
];

export function detectCategory(question: string): QuestionCategory {
  for (const [cat, re] of CATEGORY_PATTERNS) {
    if (re.test(question)) return cat;
  }
  return "general";
}

export function getQuestionHouse(cat: QuestionCategory): number {
  const map: Record<QuestionCategory, number> = {
    relationship:7, career:10, money:2, health:6,
    property:4, travel:9, legal:7, child:5, lost:2, general:1,
  };
  return map[cat];
}

// ─── Strictures ──────────────────────────────────────────────
const PLANET_ORBS: Record<string, number> = {
  sun:10, moon:10, mercury:7, venus:8, mars:9, jupiter:8, saturn:9
};
const ASPECT_ANGLES = [0, 60, 90, 120, 180];

function mod360(x: number) { return ((x % 360) + 360) % 360; }

function moonIsVOC(moon: HoraryPlanet, planets: HoraryPlanet[]): boolean {
  const degsLeft = 30 - moon.signDegree;
  for (const planet of planets) {
    if (planet.id === "moon") continue;
    for (const angle of ASPECT_ANGLES) {
      const diff = mod360(planet.longitude - moon.longitude);
      const toExact = Math.min(diff, 360 - diff);
      if (Math.abs(toExact - angle) < (PLANET_ORBS[planet.id] || 8)) {
        // Check applying: Moon moves faster, moving toward aspect
        const futDiff = mod360(planet.longitude - mod360(moon.longitude + 0.5));
        const futToExact = Math.min(futDiff, 360 - futDiff);
        if (futToExact < toExact && toExact <= degsLeft) return false;
      }
    }
  }
  return true;
}

export function checkStrictures(chart: HoraryChart): Stricture[] {
  const result: Stricture[] = [];
  const asc   = chart.houses[0];
  const moon  = chart.planets.find(p => p.id === "moon")!;
  const saturn= chart.planets.find(p => p.id === "saturn")!;

  if (asc.signDegree < 3)
    result.push({ type:"earlyAsc",  severity:"warning", messageKey:"horary.stricture.earlyAsc",
      detail:`ASC at ${asc.signDegree.toFixed(1)}° — too early, situation not yet formed` });
  if (asc.signDegree > 27)
    result.push({ type:"lateAsc",   severity:"warning", messageKey:"horary.stricture.lateAsc",
      detail:`ASC at ${asc.signDegree.toFixed(1)}° — late in sign, matter may be decided` });
  if (moonIsVOC(moon, chart.planets))
    result.push({ type:"voc",        severity:"warning", messageKey:"horary.stricture.voc",
      detail:"Moon Void of Course — nothing will come of the matter (consider context)" });

  const moonLong = moon.longitude;
  if (moonLong >= 195 && moonLong <= 225) // 15° Libra to 15° Scorpio
    result.push({ type:"viaCombusta",severity:"warning", messageKey:"horary.stricture.viaCombusta",
      detail:"Moon in Via Combusta (15° Libra – 15° Scorpio) — chart is unreliable" });
  if (saturn.house === 7)
    result.push({ type:"saturnIn7", severity:"info",    messageKey:"horary.stricture.saturnIn7",
      detail:"Saturn in 7th — traditional warning about astrologer's judgment" });

  return result;
}

// ─── Significators ───────────────────────────────────────────
const TRAD_RULERS: Record<string, string> = {
  koc:"mars",   boga:"venus",   ikizler:"mercury", yengec:"moon",
  aslan:"sun",  basak:"mercury",terazi:"venus",    akrep:"mars",
  yay:"jupiter",oglak:"saturn", kova:"saturn",     balik:"jupiter",
};

function getHouseRuler(house: HoraryHouse, planets: HoraryPlanet[]): HoraryPlanet {
  const id = TRAD_RULERS[house.signId] || "sun";
  return planets.find(p => p.id === id) || planets[0];
}

// ─── Aspect detection ────────────────────────────────────────
const ASPECT_NAMES: Record<number, AspectType> = {
  0:"conjunction", 60:"sextile", 90:"square", 120:"trine", 180:"opposition"
};

export function findKeyAspect(sig1: HoraryPlanet, sig2: HoraryPlanet): KeyAspect | null {
  const orb = Math.min(PLANET_ORBS[sig1.id]||8, PLANET_ORBS[sig2.id]||8);
  const faster = sig1.dailyMotion >= sig2.dailyMotion ? sig1 : sig2;
  const slower  = faster === sig1 ? sig2 : sig1;

  for (const angle of ASPECT_ANGLES) {
    const diff = mod360(faster.longitude - slower.longitude);
    const toExact = Math.min(diff, 360 - diff);
    if (toExact <= orb) {
      const applying     = diff < 180 ? diff < angle + orb : (360 - diff) < angle + orb;
      const willPerfect  = applying && !faster.retrograde;
      return {
        planet1Id: sig1.id, planet2Id: sig2.id,
        type: ASPECT_NAMES[angle] || "conjunction",
        angleDiff: toExact, applying, willPerfect,
      };
    }
  }
  return null;
}

// ─── Timing ──────────────────────────────────────────────────
const SIGN_MODAL: Record<string,string> = {
  koc:"cardinal",yengec:"cardinal",terazi:"cardinal",oglak:"cardinal",
  boga:"fixed",  aslan:"fixed",   akrep:"fixed",    kova:"fixed",
  ikizler:"mutable",basak:"mutable",yay:"mutable",  balik:"mutable",
};

export function estimateTiming(aspect: KeyAspect, faster: HoraryPlanet): TimingEstimate | null {
  if (!aspect.applying || !aspect.willPerfect) return null;
  const days = aspect.angleDiff / (faster.dailyMotion || 1);
  const modal   = SIGN_MODAL[faster.signId];
  const angular = [1,4,7,10].includes(faster.house);

  let unit: TimingEstimate["unit"];
  if (modal === "cardinal" && angular)        unit = "days";
  else if (modal === "fixed" || !angular)     unit = days > 30 ? "months" : "weeks";
  else                                         unit = "weeks";

  const value = Math.max(1, Math.round(
    unit === "days" ? days : unit === "weeks" ? days/7 : days/30
  ));
  return { value, unit };
}

// ─── Main analysis function ──────────────────────────────────
export function analyzeHoraryChart(chart: HoraryChart, question: string): HoraryAnalysis {
  const strictures    = checkStrictures(chart);
  const cat           = detectCategory(question);
  const qHouse        = getQuestionHouse(cat);

  const asc1          = chart.houses[0];
  const querentPlanet = getHouseRuler(asc1, chart.planets);
  const moon          = chart.planets.find(p => p.id === "moon")!;
  const quesHouse     = chart.houses.find(h => h.house === qHouse) || chart.houses[0];
  const quesitedPlanet= getHouseRuler(quesHouse, chart.planets);

  const querent: Significator = {
    role: "querent", planet: querentPlanet, house: 1,
    essentialDignity:  getEssentialDignity(querentPlanet.id, querentPlanet.signId, querentPlanet.signDegree),
    accidentalStrength:getAccidentalStrength(querentPlanet),
  };
  const quesited: Significator = {
    role: "quesited", planet: quesitedPlanet, house: qHouse,
    essentialDignity:  getEssentialDignity(quesitedPlanet.id, quesitedPlanet.signId, quesitedPlanet.signDegree),
    accidentalStrength:getAccidentalStrength(quesitedPlanet),
  };

  const keyAspect = findKeyAspect(querentPlanet, quesitedPlanet);
  const faster = (querentPlanet.dailyMotion >= quesitedPlanet.dailyMotion) ? querentPlanet : quesitedPlanet;
  const timing  = keyAspect ? estimateTiming(keyAspect, faster) : null;

  return { strictures, questionCategory: cat, questionHouse: qHouse, querent, moon, quesited, keyAspect, timing };
}
