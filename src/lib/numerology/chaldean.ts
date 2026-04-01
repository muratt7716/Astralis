/**
 * Chaldean System based on Cheiro.
 * Non-sequential, no number 9.
 * Focuses on Compound (Birleşik) numbers for mystic destiny.
 */
import { getChaldeanMeaning } from '@/data/numerology/meanings';
import { SupportedLanguage } from '@/lib/i18n-shared';

export const CHALDEAN_LETTER_VALUES: Record<string, number> = {
  'A': 1, 'I': 1, 'İ': 1, 'J': 1, 'Q': 1, 'Y': 1,
  'B': 2, 'K': 2, 'R': 2,
  'C': 3, 'Ç': 3, 'G': 3, 'Ğ': 3, 'L': 3, 'S': 3, 'Ş': 3,
  'D': 4, 'M': 4, 'T': 4,
  'E': 5, 'H': 5, 'N': 5, 'X': 5,
  'U': 6, 'Ü': 6, 'V': 6, 'W': 6,
  'O': 7, 'Ö': 7, 'Z': 7,
  'F': 8, 'P': 8
};

function normalizeName(name: string): string {
  return name.toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ\s]/g, '');
}

/**
 * Calculates Chaldean Compound and Single numbers with full analysis.
 */
export function getChaldeanAnalysis(name: string, lang: SupportedLanguage = 'tr') {
  const cleanNames = normalizeName(name).split(/\s+/).filter(Boolean);
  
  const breakdown = cleanNames.map(word => {
    const compound = word.split('').reduce((acc, char) => acc + (CHALDEAN_LETTER_VALUES[char] || 0), 0);
    let root = compound;
    while (root > 9) {
      root = String(root).split('').reduce((a, b) => a + parseInt(b), 0);
    }
    return { word, compound, root };
  });

  const compoundNumber = breakdown.reduce((acc, w) => acc + w.compound, 0);
  let rootNumber = compoundNumber;
  while (rootNumber > 9) {
    rootNumber = String(rootNumber).split('').reduce((a, b) => a + parseInt(b), 0);
  }

  return {
    breakdown,
    compoundNumber,
    rootNumber,
    destinyPlanet: getChaldeanPlanet(rootNumber, lang),
    meaning: getChaldeanMeaning(compoundNumber, lang)
  };
}

export function getChaldeanPlanet(num: number, lang: SupportedLanguage = 'tr'): string {
  const planets = {
    tr: { 1: 'Güneş', 2: 'Ay', 3: 'Jüpiter', 4: 'Uranüs', 5: 'Merkür', 6: 'Venüs', 7: 'Neptün', 8: 'Satürn', 9: 'Mars' },
    en: { 1: 'Sun', 2: 'Moon', 3: 'Jupiter', 4: 'Uranus', 5: 'Mercury', 6: 'Venus', 7: 'Neptune', 8: 'Saturn', 9: 'Mars' },
    ar: { 1: 'الشمس', 2: 'القمر', 3: 'المشتري', 4: 'أورانوس', 5: 'عطارد', 6: 'الزهرة', 7: 'نبتون', 8: 'زحل', 9: 'المريخ' },
    de: { 1: 'Sonne', 2: 'Mond', 3: 'Jupiter', 4: 'Uranus', 5: 'Merkur', 6: 'Venus', 7: 'Neptun', 8: 'Saturn', 9: 'Mars' },
    fr: { 1: 'Soleil', 2: 'Lune', 3: 'Jupiter', 4: 'Uranus', 5: 'Mercure', 6: 'Vénus', 7: 'Neptune', 8: 'Saturne', 9: 'Mars' }
  }[lang] as Record<number, string>;
  return planets[num] || (lang === 'tr' ? 'Bilinmiyor' : 'Unknown');
}
