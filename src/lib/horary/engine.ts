// src/lib/horary/engine.ts

const SIGN_IDS = [
  "koc","boga","ikizler","yengec","aslan","basak",
  "terazi","akrep","yay","oglak","kova","balik"
] as const;
export type SignId = typeof SIGN_IDS[number];

export interface HoraryPlanet {
  id: string;
  name: string;
  emoji: string;
  longitude: number;      // 0-360 ekliptik boylamı
  signId: SignId;
  signDegree: number;     // 0-30 burç içi derece
  house: number;          // 1-12
  retrograde: boolean;
  dailyMotion: number;    // günlük hareket (derece)
  combust: boolean;       // Güneş'e 8.5° içinde
  cazimi: boolean;        // Güneş'e 0.283° içinde
  underSunbeams: boolean; // Güneş'e 17° içinde
}

export interface HoraryHouse {
  house: number;
  longitude: number;  // kuspis 0-360
  signId: SignId;
  signDegree: number;
  rulerId: string;    // geleneksel ev yöneticisi
}

export interface HoraryChart {
  timestamp: Date;
  latitude: number;
  longitude: number;
  planets: HoraryPlanet[];
  houses: HoraryHouse[];
  ascendantLongitude: number;
  mcLongitude: number;
}

// ─── Math helpers ────────────────────────────────────────────
function toRad(d: number) { return d * Math.PI / 180; }
function toDeg(r: number) { return r * 180 / Math.PI; }
function mod(x: number, m: number) { return ((x % m) + m) % m; }

function julianDay(date: Date): number {
  const y0 = date.getUTCFullYear();
  const m0 = date.getUTCMonth() + 1;
  const d0 = date.getUTCDate();
  const h  = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  let y = y0, m = m0;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d0 + h / 24 + B - 1524.5;
}

function obliquityMean(jd: number): number {
  const T = (jd - 2451545) / 36525;
  return 23.439291111 - 0.0130042 * T - 0.00000016 * T * T + 0.000000504 * T * T * T;
}

function nutation(jd: number): { dPsi: number; dEps: number } {
  const T = (jd - 2451545) / 36525;
  const omega = mod(125.04452 - 1934.136261 * T, 360);
  const Ls = mod(280.4665 + 36000.7698 * T, 360);
  const Lm = mod(218.3165 + 481267.8813 * T, 360);
  const oR = toRad(omega), lsR = toRad(2 * Ls), lmR = toRad(2 * Lm);
  const dPsi = (-17.20 * Math.sin(oR) - 1.32 * Math.sin(lsR) - 0.23 * Math.sin(lmR) + 0.21 * Math.sin(2 * oR)) / 3600;
  const dEps = (9.20 * Math.cos(oR) + 0.57 * Math.cos(lsR) + 0.10 * Math.cos(lmR) - 0.09 * Math.cos(2 * oR)) / 3600;
  return { dPsi, dEps };
}

function obliquityTrue(jd: number): number {
  return obliquityMean(jd) + nutation(jd).dEps;
}

function sunLong(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L0 = mod(280.46646 + 36000.76983 * T, 360);
  const M  = mod(357.52911 + 35999.05029 * T, 360);
  const C  = (1.914602 - 0.004817 * T) * Math.sin(toRad(M))
           + (0.019993 - 0.000101 * T) * Math.sin(2 * toRad(M))
           + 0.000289 * Math.sin(3 * toRad(M));
  return mod(L0 + C, 360);
}

function moonLong(jd: number): number {
  const T = (jd - 2451545) / 36525;
  const L  = mod(218.3165 + 481267.8813 * T, 360);
  const D  = mod(297.8502 + 445267.1115 * T, 360);
  const M  = mod(134.9634 + 477198.8676 * T, 360);
  const Ms = mod(357.5291 +  35999.0503 * T, 360);
  const F  = mod( 93.272  + 483202.0175 * T, 360);
  return mod(
    L + 6.289  * Math.sin(toRad(M))
      + 1.274  * Math.sin(toRad(2*D - M))
      + 0.658  * Math.sin(toRad(2*D))
      + 0.214  * Math.sin(toRad(2*M))
      - 0.186  * Math.sin(toRad(Ms))
      - 0.114  * Math.sin(toRad(2*F))
      + 0.059  * Math.sin(toRad(2*D - 2*M))
      + 0.057  * Math.sin(toRad(2*D - Ms - M))
      + 0.053  * Math.sin(toRad(2*D + M))
      + 0.046  * Math.sin(toRad(2*D - Ms))
      - 0.041  * Math.sin(toRad(Ms - M)),
    360
  );
}

function planetaryLong(
  jd: number, L0: number, L1: number,
  M0: number, M1: number, e: number
): number {
  const T = (jd - 2451545) / 36525;
  const L = mod(L0 + L1 * T, 360);
  const M = mod(M0 + M1 * T, 360);
  const Mrad = toRad(M);
  const C = (2*e - e**3/4) * Math.sin(Mrad)
          + (5/4 * e**2)   * Math.sin(2*Mrad)
          + (13/12 * e**3) * Math.sin(3*Mrad);
  return mod(L + toDeg(C), 360);
}

function allPlanetLongs(jd: number): Record<string, number> {
  const T  = (jd - 2451545) / 36525;
  const sun  = sunLong(jd);
  const moon = moonLong(jd);

  const mercL   = planetaryLong(jd, 252.2509, 149472.6746, 174.7948, 149472.5153, 0.2056);
  const mercury = mod(mercL + 0.415 * Math.sin(toRad(mod(34.351 + 3034.9057*T, 360) - mercL)), 360);

  const venus = planetaryLong(jd, 181.9798, 58517.8157, 50.4161, 58517.8039, 0.0068);

  const marsL = planetaryLong(jd, 355.433, 19140.2993, 19.373, 19139.8585, 0.0934);
  const mars  = mod(marsL + 0.658 * Math.sin(toRad(mod(34.351 + 3034.9057*T, 360) - marsL)), 360);

  const jupM    = mod(20.020 + 3034.6957*T, 360);
  const jupiter = mod(34.351 + 3034.9057*T + 5.55 * Math.sin(toRad(jupM)), 360);

  const satM   = mod(317.021 + 1222.1138*T, 360);
  const saturn = mod(50.077  + 1222.1138*T + 6.40 * Math.sin(toRad(satM)), 360);

  return { sun, moon, mercury, venus, mars, jupiter, saturn };
}

function ramc(jd: number, geoLng: number): number {
  const T = (jd - 2451545) / 36525;
  const gmst = 280.46061837 + 360.98564736629*(jd - 2451545)
             + 0.000387933*T*T - T**3/38710000;
  const { dPsi } = nutation(jd);
  const eps = obliquityTrue(jd);
  const eqEq = dPsi * Math.cos(toRad(eps));
  return mod(gmst + eqEq + geoLng, 360);
}

function mcLong(ramcDeg: number, eps: number): number {
  const ra = toRad(ramcDeg), e = toRad(eps);
  return mod(toDeg(Math.atan2(Math.sin(ra), Math.cos(ra) * Math.cos(e))), 360);
}

/**
 * Regiomontanus house cusp formula (Lilly standard):
 * tan(λ) = sin(θ) / (cos(θ)·cos(ε) − tan(φ)·sin(ε))
 * where θ = RAMC + (houseNum − 10) × 30°
 */
function regiomontanusCusp(houseNum: number, ramcDeg: number, eps: number, lat: number): number {
  const thetaDeg = mod(ramcDeg + (houseNum - 10) * 30, 360);
  const theta = toRad(thetaDeg);
  const e     = toRad(eps);
  const phi   = toRad(lat);
  const y = Math.sin(theta);
  const x = Math.cos(theta) * Math.cos(e) - Math.tan(phi) * Math.sin(e);
  let lambda = mod(toDeg(Math.atan2(y, x)), 360);
  // Quadrant fix: lambda must be in same ecliptic half as theta
  const tNorm = mod(thetaDeg, 360);
  if (tNorm >= 180 && lambda < 180) lambda += 180;
  else if (tNorm < 180 && lambda >= 180) lambda -= 180;
  return mod(lambda, 360);
}

function longToSign(long: number): { signId: SignId; signDegree: number } {
  const norm = mod(long, 360);
  const idx  = Math.floor(norm / 30);
  return { signId: SIGN_IDS[idx], signDegree: norm % 30 };
}

function getPlanetHouse(pLong: number, houses: HoraryHouse[]): number {
  const sorted = [...houses].sort((a, b) => a.house - b.house);
  const norm = mod(pLong, 360);
  for (let i = 0; i < 12; i++) {
    const curr = sorted[i].longitude;
    const next = sorted[(i + 1) % 12].longitude;
    if (curr <= next) {
      if (norm >= curr && norm < next) return sorted[i].house;
    } else {
      if (norm >= curr || norm < next) return sorted[i].house;
    }
  }
  return 1;
}

function isRetrograde(jd: number, key: string): boolean {
  const p1 = allPlanetLongs(jd)[key];
  const p2 = allPlanetLongs(jd + 1)[key];
  let diff = p2 - p1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function getDailyMotion(jd: number, key: string): number {
  const p1 = allPlanetLongs(jd)[key];
  const p2 = allPlanetLongs(jd + 1)[key];
  let diff = p2 - p1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return Math.abs(diff);
}

const PLANET_META: Record<string, { name: string; emoji: string }> = {
  sun:     { name: "Güneş",   emoji: "☀️" },
  moon:    { name: "Ay",      emoji: "🌙" },
  mercury: { name: "Merkür",  emoji: "☿"  },
  venus:   { name: "Venüs",   emoji: "♀"  },
  mars:    { name: "Mars",    emoji: "♂"  },
  jupiter: { name: "Jüpiter", emoji: "♃"  },
  saturn:  { name: "Satürn",  emoji: "♄"  },
};

const TRAD_RULERS: Record<string, string> = {
  koc:"mars",   boga:"venus",   ikizler:"mercury", yengec:"moon",
  aslan:"sun",  basak:"mercury",terazi:"venus",    akrep:"mars",
  yay:"jupiter",oglak:"saturn", kova:"saturn",     balik:"jupiter",
};

// ─── Main export ─────────────────────────────────────────────
export function computeHoraryChart(lat: number, lng: number, now: Date = new Date()): HoraryChart {
  const jd  = julianDay(now);
  const eps = obliquityTrue(jd);
  const r   = ramc(jd, lng);
  const longs = allPlanetLongs(jd);
  const sunL  = longs.sun;

  // Build Regiomontanus houses
  const houses: HoraryHouse[] = [];
  for (let h = 1; h <= 12; h++) {
    let cusp: number;
    if      (h === 10) cusp = mcLong(r, eps);
    else if (h === 4)  cusp = mod(mcLong(r, eps) + 180, 360);
    else               cusp = regiomontanusCusp(h, r, eps, lat);
    const { signId, signDegree } = longToSign(cusp);
    houses.push({ house: h, longitude: cusp, signId, signDegree, rulerId: TRAD_RULERS[signId] });
  }
  // Recalculate ASC/DSC correctly
  const ascCusp = regiomontanusCusp(1, r, eps, lat);
  houses[0].longitude = ascCusp;
  Object.assign(houses[0], longToSign(ascCusp));
  houses[0].rulerId = TRAD_RULERS[houses[0].signId];
  houses[6].longitude = mod(ascCusp + 180, 360);
  Object.assign(houses[6], longToSign(houses[6].longitude));
  houses[6].rulerId = TRAD_RULERS[houses[6].signId];

  // Build planets
  const planets: HoraryPlanet[] = Object.entries(longs).map(([id, long]) => {
    const { signId, signDegree } = longToSign(long);
    const house       = getPlanetHouse(long, houses);
    const retrograde  = id !== "sun" && id !== "moon" ? isRetrograde(jd, id) : false;
    const dailyMotion = getDailyMotion(jd, id);

    let combust = false, cazimi = false, underSunbeams = false;
    if (id !== "sun") {
      let diff = mod(long - sunL + 180, 360) - 180;
      const abs = Math.abs(diff);
      cazimi        = abs <= 0.283;
      combust       = !cazimi && abs <= 8.5;
      underSunbeams = !cazimi && !combust && abs <= 17;
    }

    return {
      id, ...PLANET_META[id],
      longitude: long, signId, signDegree, house,
      retrograde, dailyMotion, combust, cazimi, underSunbeams,
    };
  });

  return {
    timestamp: now, latitude: lat, longitude: lng,
    planets, houses,
    ascendantLongitude: ascCusp,
    mcLongitude: mcLong(r, eps),
  };
}
