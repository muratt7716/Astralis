/**
 * Pythagorean System based on Hans Decoz and classic methodologies.
 * Accommodates Turkish characters for name calculations.
 */

// Turkish adapted Pythagorean Letter Mapping
export const PYTHAGOREAN_LETTER_VALUES: Record<string, number> = {
  'A': 1, 'J': 1, 'S': 1, 'Ş': 1,
  'B': 2, 'K': 2, 'T': 2,
  'C': 3, 'Ç': 3, 'L': 3, 'U': 3, 'Ü': 3,
  'D': 4, 'M': 4, 'V': 4,
  'E': 5, 'N': 5, 'W': 5,
  'F': 6, 'O': 6, 'Ö': 6, 'X': 6,
  'G': 7, 'Ğ': 7, 'P': 7, 'Y': 7,
  'H': 8, 'Q': 8, 'Z': 8,
  'I': 9, 'İ': 9, 'R': 9
};

const VOWELS = new Set(['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü']);

/**
 * Reduces a number to a single digit, maintaining Master Numbers (11, 22, 33).
 */
export function reduceToSingleOrMaster(num: number): number {
  if (num === 0) return 0;
  if (num === 11 || num === 22 || num === 33) return num;

  let sum = num;
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return sum;
}

/**
 * Normal basic reduce without preserving Master numbers (used for certain cyclic or raw checks)
 */
export function reduceToSingle(num: number): number {
  if (num === 0) return 0;
  let sum = num;
  while (sum > 9) {
    sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  return sum;
}

/**
 * Calculates Life Path Number based on Hans Decoz method
 * (Reduce Month, Day, Year separately first, then sum, then reduce).
 */
export function calculateLifePath(dateStr: string): number {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 0;

  const month = reduceToSingleOrMaster(date.getMonth() + 1);
  const day = reduceToSingleOrMaster(date.getDate());
  const year = reduceToSingleOrMaster(date.getFullYear());

  return reduceToSingleOrMaster(month + day + year);
}

/**
 * Cleans the input name for calculations.
 */
function normalizeName(name: string): string {
  // We keep spaces to potentially look at individual names if needed, but remove other non-letters
  return name.toLocaleUpperCase('tr-TR').replace(/[^A-ZÇĞİÖŞÜ\s]/g, '');
}

/**
 * Calculates Expression/Destiny Number
 * Sum of all letters in the full birth name.
 */
export function calculateExpression(name: string): number {
  const cleanName = normalizeName(name).replace(/\s+/g, '');
  const sum = cleanName.split('').reduce((acc, char) => {
    return acc + (PYTHAGOREAN_LETTER_VALUES[char] || 0);
  }, 0);
  return reduceToSingleOrMaster(sum);
}

/**
 * Calculates Soul Urge / Heart's Desire Number
 * Sum of vowels.
 */
export function calculateSoulUrge(name: string): number {
  const cleanName = normalizeName(name).replace(/\s+/g, '');
  const sum = cleanName.split('').reduce((acc, char) => {
    if (VOWELS.has(char)) {
      return acc + (PYTHAGOREAN_LETTER_VALUES[char] || 0);
    }
    return acc;
  }, 0);
  return reduceToSingleOrMaster(sum);
}

/**
 * Calculates Personality Number
 * Sum of consonants.
 */
export function calculatePersonality(name: string): number {
  const cleanName = normalizeName(name).replace(/\s+/g, '');
  const sum = cleanName.split('').reduce((acc, char) => {
    if (!VOWELS.has(char)) {
      return acc + (PYTHAGOREAN_LETTER_VALUES[char] || 0);
    }
    return acc;
  }, 0);
  return reduceToSingleOrMaster(sum);
}

/**
 * Pre-calculates all core Pythagorean numbers.
 */
export function getPythagoreanCore(name: string, dobString: string) {
  const lifePath = calculateLifePath(dobString);
  const expression = calculateExpression(name);
  const soulUrge = calculateSoulUrge(name);
  const personality = calculatePersonality(name);
  const maturity = reduceToSingleOrMaster(lifePath + expression);

  return {
    lifePath,
    expression,
    soulUrge,
    personality,
    maturity
  };
}
