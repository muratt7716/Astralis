import { getZodiacByDate, zodiacSigns } from "@/data/zodiac";

export interface BirthChart {
  sunSign: { id: string; name: string; description: string; degree: number };
  moonSign: { id: string; name: string; description: string; degree: number };
  risingSign: { id: string; name: string; description: string; degree: number };
  planetPositions: PlanetPosition[];
  houses: HousePosition[];
  aspects: Aspect[];
  transits: TransitAspect[];
}

export interface PlanetPosition {
  planet: string;
  planetId: string;
  emoji: string;
  sign: string;
  signId: string;
  degree: number;
  fullDegree: number;
  retrograde: boolean;
  meaning: string;
}

export interface HousePosition {
  house: number;
  sign: string;
  signId: string;
  degree: number;
  meaning: string;
}

export interface Aspect {
  planet1: string;
  planet1Id: string;
  planet2: string;
  planet2Id: string;
  type: string;
  typeId: string;
  typeEmoji: string;
  angle: number;
  orb: number;
  description: string;
  harmony: "positive" | "negative" | "neutral";
}

// Safe modulo that always returns a positive value
function safeMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

const signList = [
  { id: "koc", name: "Koç" },
  { id: "boga", name: "Boğa" },
  { id: "ikizler", name: "İkizler" },
  { id: "yengec", name: "Yengeç" },
  { id: "aslan", name: "Aslan" },
  { id: "basak", name: "Başak" },
  { id: "terazi", name: "Terazi" },
  { id: "akrep", name: "Akrep" },
  { id: "yay", name: "Yay" },
  { id: "oglak", name: "Oğlak" },
  { id: "kova", name: "Kova" },
  { id: "balik", name: "Balık" }
];

function toRad(deg: number): number { return deg * Math.PI / 180; }
function toDeg(rad: number): number { return rad * 180 / Math.PI; }

/**
 * Julian Day Number
 */
function calculateJulianDay(year: number, month: number, day: number, hour: number, minute: number, utcOffset: number = 3): number {
  const utHour = hour - utcOffset + minute / 60;
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + utHour / 24 + B - 1524.5;
}

function calculateObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.4393 - 0.013 * T;
}

function calculateSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = safeMod(280.46646 + 36000.76983 * T, 360);
  const M = safeMod(357.52911 + 35999.05029 * T, 360);
  const Mrad = toRad(M);
  const C = (1.914602 - 0.004817 * T) * Math.sin(Mrad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
            0.000289 * Math.sin(3 * Mrad);
  return safeMod(L0 + C, 360);
}

function calculateLST(jd: number, longitude: number): number {
  const T = (jd - 2451545.0) / 36525;
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
             0.000387933 * T * T - T * T * T / 38710000;
  GMST = safeMod(GMST, 360);
  return safeMod(GMST + longitude, 360);
}

function calculateAscendant(jd: number, latitude: number, longitude: number): number {
  const LST = calculateLST(jd, longitude);
  const obliquity = calculateObliquity(jd);
  const LSTrad = toRad(LST);
  const oblRad = toRad(obliquity);
  const latRad = toRad(latitude);
  const y = Math.cos(LSTrad);
  const x = -(Math.sin(LSTrad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad));
  return safeMod(toDeg(Math.atan2(y, x)), 360);
}

function longitudeToSign(longitude: number): { id: string; name: string; degree: number } {
  const norm = safeMod(longitude, 360);
  const signIndex = Math.floor(norm / 30);
  return { ...signList[safeMod(signIndex, 12)], degree: Math.round((norm % 30) * 100) / 100 };
}

/**
 * Calculate Moon longitude with improved perturbation corrections
 * ~11 terms for ~1° accuracy
 */
function calculateMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L = safeMod(218.3165 + 481267.8813 * T, 360);
  const D = safeMod(297.8502 + 445267.1115 * T, 360);
  const M = safeMod(134.9634 + 477198.8676 * T, 360);
  const Ms = safeMod(357.5291 + 35999.0503 * T, 360);
  const F = safeMod(93.272 + 483202.0175 * T, 360);

  const longitude = L
    + 6.289 * Math.sin(toRad(M))
    + 1.274 * Math.sin(toRad(2 * D - M))
    + 0.658 * Math.sin(toRad(2 * D))
    + 0.214 * Math.sin(toRad(2 * M))
    - 0.186 * Math.sin(toRad(Ms))
    - 0.114 * Math.sin(toRad(2 * F))
    + 0.059 * Math.sin(toRad(2 * D - 2 * M))
    + 0.057 * Math.sin(toRad(2 * D - Ms - M))
    + 0.053 * Math.sin(toRad(2 * D + M))
    + 0.046 * Math.sin(toRad(2 * D - Ms))
    - 0.041 * Math.sin(toRad(Ms - M));

  return safeMod(longitude, 360);
}

/**
 * Calculate planet longitude with equation of center correction
 */
function calculatePlanetLongitude(
  jd: number,
  L0: number, L1: number,   // mean longitude coefficients
  M0: number, M1: number,   // mean anomaly coefficients
  e: number                 // eccentricity
): number {
  const T = (jd - 2451545.0) / 36525;
  const L = safeMod(L0 + L1 * T, 360);
  const M = safeMod(M0 + M1 * T, 360);
  const Mrad = toRad(M);
  // Equation of center
  const C = (2 * e - e * e * e / 4) * Math.sin(Mrad)
          + (5 / 4) * e * e * Math.sin(2 * Mrad)
          + (13 / 12) * e * e * e * Math.sin(3 * Mrad);
  return safeMod(L + toDeg(C), 360);
}

/**
 * Calculate all planet longitudes with perturbation corrections
 * Memoized by Julian Day to prevent redundant calculations during retrograde detection
 */
const planetCache: Record<string, Record<string, number>> = {};

function calculateAllPlanetLongitudes(jd: number): Record<string, number> {
  const cacheKey = jd.toString();
  if (planetCache[cacheKey]) return planetCache[cacheKey];

  const T = (jd - 2451545.0) / 36525;
  const sunLong = calculateSunLongitude(jd);
  const moonLong = calculateMoonLongitude(jd);

  // Mercury: e=0.2056, with Jupiter perturbation
  const mercL = calculatePlanetLongitude(jd, 252.2509, 149472.6746, 174.7948, 149472.5153, 0.2056);
  const mercJupCorr = 0.415 * Math.sin(toRad(safeMod(34.351 + 3034.9057 * T, 360) - mercL));
  const mercury = safeMod(mercL + mercJupCorr, 360);

  // Venus: e=0.0068
  const venus = calculatePlanetLongitude(jd, 181.9798, 58517.8157, 50.4161, 58517.8039, 0.0068);

  // Mars: e=0.0934, with Jupiter perturbation
  const marsL = calculatePlanetLongitude(jd, 355.433, 19140.2993, 19.373, 19139.8585, 0.0934);
  const marsJupCorr = 0.658 * Math.sin(toRad(safeMod(34.351 + 3034.9057 * T, 360) - marsL));
  const mars = safeMod(marsL + marsJupCorr, 360);

  // Outer planets with first-order corrections
  const jupM = safeMod(20.020 + 3034.6957 * T, 360);
  const jupiter = safeMod(34.351 + 3034.9057 * T + 5.55 * Math.sin(toRad(jupM)), 360);

  const satM = safeMod(317.021 + 1222.1138 * T, 360);
  const saturn = safeMod(50.077 + 1222.1138 * T + 6.40 * Math.sin(toRad(satM)), 360);

  const uranus  = safeMod(314.055 + 428.4677 * T, 360);
  const neptune = safeMod(304.349 + 218.4862 * T, 360);
  const pluto   = safeMod(238.929 + 145.2078 * T, 360);

  const result = { sun: sunLong, moon: moonLong, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto };
  planetCache[cacheKey] = result;
  return result;
}

/**
 * Detect retrograde by comparing longitude at jd vs jd+1day
 */
function isRetrograde(jd: number, planetKey: string): boolean {
  const pos1 = calculateAllPlanetLongitudes(jd)[planetKey];
  const pos2 = calculateAllPlanetLongitudes(jd + 1)[planetKey];
  if (pos1 === undefined || pos2 === undefined) return false;
  let diff = pos2 - pos1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

const planetInfo: Record<string, { id: string; name: string; emoji: string; meaning: string }> = {
  sun:     { id: "sun",     name: "Güneş",  emoji: "☀️", meaning: "Benlik, kimlik ve yaşam enerjisi" },
  moon:    { id: "moon",    name: "Ay",     emoji: "🌙", meaning: "Duygular, iç dünya ve bilinçaltı" },
  mercury: { id: "mercury", name: "Merkür", emoji: "☿️", meaning: "İletişim, zeka ve düşünce tarzı" },
  venus:   { id: "venus",   name: "Venüs",  emoji: "♀️", meaning: "Aşk, güzellik ve değerler" },
  mars:    { id: "mars",    name: "Mars",   emoji: "♂️", meaning: "Enerji, tutku ve eylem gücü" },
  jupiter: { id: "jupiter", name: "Jüpiter",emoji: "♃",  meaning: "Şans, büyüme ve genişleme" },
  saturn:  { id: "saturn",  name: "Satürn", emoji: "♄",  meaning: "Disiplin, sorumluluk ve yapı" },
  uranus:  { id: "uranus",  name: "Uranüs", emoji: "⚡", meaning: "Yenilik, özgürlük ve devrim" },
  neptune: { id: "neptune", name: "Neptün", emoji: "🔱", meaning: "Hayal gücü, sezgi ve spiritüellik" },
  pluto:   { id: "pluto",   name: "Plüton", emoji: "🔮", meaning: "Dönüşüm, güç ve yenilenme" },
};

const houseDescriptions = [
  "Benlik, fiziksel görünüm, kişilik",
  "Maddi değerler, para, özsaygı",
  "İletişim, kısa yolculuklar, kardeşler",
  "Ev, aile, kökler, iç dünya",
  "Yaratıcılık, romantizm, çocuklar",
  "Sağlık, günlük rutinler, hizmet",
  "İlişkiler, ortaklıklar, evlilik",
  "Dönüşüm, cinsellik, ortak kaynaklar",
  "Felsefe, uzak yolculuklar, yüksek eğitim",
  "Kariyer, toplumsal statü, hedefler",
  "Arkadaşlık, gruplar, umutlar",
  "Bilinçaltı, spiritüellik, yalnızlık",
];

/**
 * Calculate houses using Placidus-like equal house system
 */
function calculateHouses(ascendant: number): HousePosition[] {
  const houses: HousePosition[] = [];
  for (let i = 0; i < 12; i++) {
    const cusp = safeMod(ascendant + i * 30, 360);
    const sign = longitudeToSign(cusp);
    houses.push({
      house: i + 1,
      sign: sign.name,
      signId: sign.id,
      degree: sign.degree,
      meaning: houseDescriptions[i],
    });
  }
  return houses;
}

/**
 * Calculate aspects between planets
 */
function calculateAspects(positions: Record<string, number>): Aspect[] {
  const aspectTypes = [
    { id: "conjunction", name: "Kavuşum", emoji: "☌", angle: 0, orb: 8, harmony: "neutral" as const, desc: "Enerjilerin birleşmesidir; güçlü ve yoğundur" },
    { id: "opposition", name: "Karşıtlık", emoji: "☍", angle: 180, orb: 8, harmony: "negative" as const, desc: "Gerilim ve denge arayışı yaratır" },
    { id: "square", name: "Kare", emoji: "□", angle: 90, orb: 7, harmony: "negative" as const, desc: "Zorluk ve büyüme potansiyeli taşır" },
    { id: "trine", name: "Üçgen", emoji: "△", angle: 120, orb: 8, harmony: "positive" as const, desc: "Uyum ve doğal yetenek gösterir" },
    { id: "sextile", name: "Altmışlık", emoji: "⚹", angle: 60, orb: 6, harmony: "positive" as const, desc: "Fırsat ve işbirliği enerjisi taşır" },
  ];

  const planets = Object.keys(positions);
  const aspects: Aspect[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const diff = Math.abs(positions[p1] - positions[p2]);
      const angle = diff > 180 ? 360 - diff : diff;

      for (const type of aspectTypes) {
        const orb = Math.abs(angle - type.angle);
        if (orb <= type.orb) {
          aspects.push({
            planet1: planetInfo[p1].name,
            planet1Id: planetInfo[p1].id,
            planet2: planetInfo[p2].name,
            planet2Id: planetInfo[p2].id,
            type: type.name,
            typeId: type.id,
            typeEmoji: type.emoji,
            angle: Math.round(angle * 10) / 10,
            orb: Math.round(orb * 10) / 10,
            description: `${planetInfo[p1].name} ${type.emoji} ${planetInfo[p2].name}: ${type.desc}`,
            harmony: type.harmony,
          });
          break;
        }
      }
    }
  }

  return aspects;
}

export function calculateBirthChart(
  year: number, month: number, day: number,
  hour: number = 12, minute: number = 0,
  latitude: number = 39.9334, longitude: number = 32.8597,
  utcOffset: number = 3
): BirthChart {
  const jd = calculateJulianDay(year, month, day, hour, minute, utcOffset);
  const ascendant = calculateAscendant(jd, latitude, longitude);
  const sunLong = calculateSunLongitude(jd);
  const moonLong = calculateMoonLongitude(jd);
  const allPositions = calculateAllPlanetLongitudes(jd);

  // Sun sign
  const sunSign = getZodiacByDate(month, day);
  const sunData = longitudeToSign(sunLong);
  const sunSignResult = sunSign
    ? { id: sunSign.id, name: sunSign.name, description: "", degree: sunData.degree }
    : { id: "unknown", name: "Bilinmiyor", description: "", degree: 0 };

  // Moon sign
  const moonData = longitudeToSign(moonLong);
  const moonZodiac = zodiacSigns.find(s => s.id === moonData.id);

  // Rising sign
  const risingData = longitudeToSign(ascendant);
  const risingZodiac = zodiacSigns.find(s => s.id === risingData.id);

  // Planet positions with retrograde detection
  const planetPositions: PlanetPosition[] = Object.entries(allPositions).map(([key, lng]) => {
    const info = planetInfo[key];
    const signData = longitudeToSign(lng);
    const retro = (key !== "sun" && key !== "moon") ? isRetrograde(jd, key) : false;
    return {
      planet: info.name,
      planetId: info.id,
      emoji: info.emoji,
      sign: signData.name,
      signId: signData.id,
      degree: signData.degree,
      fullDegree: Math.round(lng * 100) / 100,
      retrograde: retro,
      meaning: info.meaning,
    };
  });

  // Houses
  const houses = calculateHouses(ascendant);

  // Aspects
  const aspects = calculateAspects(allPositions);

  return {
    sunSign: sunSignResult,
    moonSign: {
      id: moonData.id,
      name: moonData.name,
      description: "",
      degree: moonData.degree,
    },
    risingSign: {
      id: risingData.id,
      name: risingData.name,
      description: "",
      degree: risingData.degree,
    },
    planetPositions,
    houses,
    aspects,
    transits: calculateTransits(planetPositions),
  };
}

export interface TransitAspect {
  transitPlanet: string;
  transitPlanetId: string;
  transitEmoji: string;
  natalPlanet: string;
  natalPlanetId: string;
  natalEmoji: string;
  type: string;
  typeId: string;
  typeEmoji: string;
  angle: number;
  orb: number;
  description: string;
  harmony: "positive" | "negative" | "neutral";
}

/**
 * Compare real-time UTC transits to a user's natal chart longitudes
 */
export function calculateTransits(birthPositions: PlanetPosition[]): TransitAspect[] {
  const now = new Date();
  const currentJd = calculateJulianDay(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    0 // UTC
  );

  const transitPositions = calculateAllPlanetLongitudes(currentJd);
  
  const aspectTypes = [
    { id: "conjunction", name: "Kavuşum", emoji: "☌", angle: 0, orb: 3, harmony: "neutral" as const },
    { id: "opposition", name: "Karşıtlık", emoji: "☍", angle: 180, orb: 3, harmony: "negative" as const },
    { id: "square", name: "Kare", emoji: "□", angle: 90, orb: 3, harmony: "negative" as const },
    { id: "trine", name: "Üçgen", emoji: "△", angle: 120, orb: 3, harmony: "positive" as const },
    { id: "sextile", name: "Altmışlık", emoji: "⚹", angle: 60, orb: 3, harmony: "positive" as const },
  ];

  const transits: TransitAspect[] = [];
  const planets = Object.keys(transitPositions);

  for (const tp of planets) {
    for (const np of birthPositions) {
      if (!np.fullDegree) continue;

      const diff = Math.abs(transitPositions[tp] - np.fullDegree);
      const angle = diff > 180 ? 360 - diff : diff;

      for (const type of aspectTypes) {
        let maxOrb = type.orb;
        if (tp === "sun" || tp === "moon") maxOrb += 1;

        const orb = Math.abs(angle - type.angle);
        if (orb <= maxOrb) {
          transits.push({
            transitPlanet: planetInfo[tp].name,
            transitPlanetId: planetInfo[tp].id,
            transitEmoji: planetInfo[tp].emoji,
            natalPlanet: np.planet,
            natalPlanetId: np.planetId,
            natalEmoji: np.emoji,
            type: type.name,
            typeId: type.id,
            typeEmoji: type.emoji,
            angle: Math.round(angle * 10) / 10,
            orb: Math.round(orb * 10) / 10,
            description: `Transit ${planetInfo[tp].name} ⯈ Natal ${np.planet} (${type.name})`,
            harmony: type.harmony,
          });
          break;
        }
      }
    }
  }

  transits.sort((a, b) => a.orb - b.orb);
  return transits.slice(0, 15);
}

export interface SynastryAspect {
  planet1: string;
  planet1Id: string;
  emoji1: string;
  planet2: string;
  planet2Id: string;
  emoji2: string;
  type: string;
  typeId: string;
  typeEmoji: string;
  angle: number;
  orb: number;
  intensity: number; // 1 to 5 based on orb and planet importance
  harmony: "positive" | "negative" | "neutral";
}

/**
 * Compare two natal charts for Synastry Aspects
 */
export function calculateSynastryAspects(p1Positions: PlanetPosition[], p2Positions: PlanetPosition[]): SynastryAspect[] {
  const aspectTypes = [
    { id: "conjunction", name: "Kavuşum", emoji: "☌", angle: 0, orb: 8, harmony: "neutral" as const },
    { id: "opposition", name: "Karşıtlık", emoji: "☍", angle: 180, orb: 8, harmony: "negative" as const },
    { id: "square", name: "Kare", emoji: "□", angle: 90, orb: 7, harmony: "negative" as const },
    { id: "trine", name: "Üçgen", emoji: "△", angle: 120, orb: 8, harmony: "positive" as const },
    { id: "sextile", name: "Altmışlık", emoji: "⚹", angle: 60, orb: 6, harmony: "positive" as const },
  ];

  const synastry: SynastryAspect[] = [];

  for (const p1 of p1Positions) {
    if (!p1.fullDegree) continue;
    for (const p2 of p2Positions) {
      if (!p2.fullDegree) continue;

      const diff = Math.abs(p1.fullDegree - p2.fullDegree);
      const angle = diff > 180 ? 360 - diff : diff;

      for (const type of aspectTypes) {
        // Tighten orb for synastry (max 8 for Sun/Moon, 5-6 for others)
        let maxOrb = type.orb - 1; 
        if (p1.planet === "Güneş" || p1.planet === "Ay" || p2.planet === "Güneş" || p2.planet === "Ay") {
          maxOrb += 2;
        }

        const orb = Math.abs(angle - type.angle);
        if (orb <= maxOrb) {
          // Calculate intensity: smaller orb = higher intensity (5 max). Luminaries add +1.
          let intensity = Math.max(1, 5 - Math.floor(orb));
          if (p1.planet === "Venüs" || p2.planet === "Venüs" || p1.planet === "Mars" || p2.planet === "Mars") {
            intensity += 1; // Romance planets are very important in synastry
          }

          synastry.push({
            planet1: p1.planet,
            planet1Id: p1.planetId,
            emoji1: p1.emoji,
            planet2: p2.planet,
            planet2Id: p2.planetId,
            emoji2: p2.emoji,
            type: type.name,
            typeId: type.id,
            typeEmoji: type.emoji,
            angle: Math.round(angle * 10) / 10,
            orb: Math.round(orb * 10) / 10,
            intensity: Math.min(5, intensity),
            harmony: type.harmony,
          });
          break;
        }
      }
    }
  }

  // Sort by intensity descending (strongest aspects first), then by orb ascending
  synastry.sort((a, b) => {
    if (b.intensity !== a.intensity) return b.intensity - a.intensity;
    return a.orb - b.orb;
  });

  return synastry;
}

export interface CelestialEvents {
  moonPhase: {
    emoji: string;
    id: string;
    name: string;
    description: string;
    illumination: number;
  };
  retrogrades: Array<{
    planet: string;
    planetId: string;
    emoji: string;
    description: string;
  }>;
}

/**
 * Get real-time moon phase and planetary retrogrades for today
 */
export function getCurrentCelestialEvents(): CelestialEvents {
  const now = new Date();
  const currentJd = calculateJulianDay(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    0
  );

  const positions = calculateAllPlanetLongitudes(currentJd);
  
  // Moon Phase Calculation
  const phaseAngle = safeMod(positions.moon - positions.sun, 360);
  const illumination = Math.round((1 - Math.cos(toRad(phaseAngle))) / 2 * 100);
  
  let phaseName = "";
  let phaseEmoji = "";
  let phaseDesc = "";
  let phaseId = "";

  if (phaseAngle >= 0 && phaseAngle < 45) {
    phaseId = "new"; phaseName = "Yeni Ay"; phaseEmoji = "🌑"; phaseDesc = "Yeni başlangıçlar ve niyet tohumları ekmek için mükemmel zaman.";
  } else if (phaseAngle >= 45 && phaseAngle < 90) {
    phaseId = "crescent"; phaseName = "Büyüyen Hilal"; phaseEmoji = "🌒"; phaseDesc = "Niyetlerinizi eyleme dökme ve ilk adımları atma evresi.";
  } else if (phaseAngle >= 90 && phaseAngle < 135) {
    phaseId = "first_quarter"; phaseName = "İlk Dördün"; phaseEmoji = "🌓"; phaseDesc = "Karşılaşılan ilk engelleri aşma ve kararlılık gösterme zamanı.";
  } else if (phaseAngle >= 135 && phaseAngle < 180) {
    phaseId = "gibbous"; phaseName = "Büyüyen Ay (Gibbous)"; phaseEmoji = "🌔"; phaseDesc = "Hedeflerinize ulaşmadan önceki son analiz ve mükemmelleştirme evresi.";
  } else if (phaseAngle >= 180 && phaseAngle < 225) {
    phaseId = "full"; phaseName = "Dolunay"; phaseEmoji = "🌕"; phaseDesc = "Sonuçların görünür olduğu, uyanış, hasat ve kutlama zamanı.";
  } else if (phaseAngle >= 225 && phaseAngle < 270) {
    phaseId = "disseminating"; phaseName = "Küçülen Ay (Disseminating)"; phaseEmoji = "🌖"; phaseDesc = "Bilgeliği paylaşma, şükretme ve elde edilenleri değerlendirme zamanı.";
  } else if (phaseAngle >= 270 && phaseAngle < 315) {
    phaseId = "last_quarter"; phaseName = "Son Dördün"; phaseEmoji = "🌗"; phaseDesc = "Bırakma, affetme ve gereksiz yüklerden arınma evresi.";
  } else {
    phaseId = "balsamic"; phaseName = "Balzamik Ay (Balsamic)"; phaseEmoji = "🌘"; phaseDesc = "Dinlenme, teslimiyet ve yenilenmeden önceki ruhsal kapanış zamanı.";
  }

  // Retrogrades
  const retrogrades = [];
  const planetsToCheck = ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
  
  for (const p of planetsToCheck) {
    if (isRetrograde(currentJd, p)) {
      retrogrades.push({
        planet: planetInfo[p].name,
        planetId: planetInfo[p].id,
        emoji: planetInfo[p].emoji,
        description: `${planetInfo[p].name} şu an geri harekette (Retro). ${planetInfo[p].meaning.toLowerCase()} konularında içsel değerlendirme zamanı.`
      });
    }
  }

  return {
    moonPhase: {
      id: phaseId,
      name: phaseName,
      emoji: phaseEmoji,
      description: phaseDesc,
      illumination
    },
    retrogrades
  };
}
