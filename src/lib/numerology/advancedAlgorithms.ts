/**
 * Advanced Mathematical and Fraktal Logic for Deep Numerology 
 * incorporating Fibonacci resonance, life matrices (Pythagorean Square), etc.
 */

import { reduceToSingleOrMaster } from './pythagoras';

/**
 * Fibonacci Sequence calculation helper
 */
const FIBONACCI_SEQ = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

function isFibonacci(num: number): boolean {
  return FIBONACCI_SEQ.includes(num);
}

/**
 * Biorhythm & Neuroplasticity Opportunity Algorithm
 * Computes a 'Cosmic Resonance Score' (0-100) based on deep fractals
 */
export function calculateCosmicResonance(lifePath: number, expression: number, currentYear: number): number {
  let score = 50;
  
  // Fibonacci resonance (if Life Path is a Fibonacci core number, they naturally align with organic growth cycles)
  if (isFibonacci(lifePath)) score += 15;
  if (isFibonacci(expression)) score += 10;
  
  // Master number energetic boosts + volatility
  if ([11, 22, 33].includes(lifePath)) score += 20;

  // Yearly alignment (Math resonance between current year digits and core numbers)
  const yearSum = reduceToSingleOrMaster(currentYear);
  if (lifePath === yearSum || expression === yearSum) {
    score += 15;
  } else if ((lifePath + yearSum) % 3 === 0) {
    // Triadic harmonies
    score += 5;
  }
  
  Math.min(100, Math.max(0, score));
  return score > 100 ? 99 : score; 
}

/**
 * Psychological/Nervous System matrix (Pythagorean Square Logic / Missing Numbers) (Simplified adaptation)
 */
export function calculateNeuroMatrix(dobStr: string, name: string) {
  const digits = dobStr.replace(/[^0-9]/g, '');
  const counts: Record<number, number> = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  
  for(const d of digits) {
    if (counts[parseInt(d)] !== undefined) {
      counts[parseInt(d)]++;
    }
  }
  
  // Analysis logic
  const excess = Object.keys(counts).filter(k => counts[parseInt(k)] > 2).map(Number);
  const missing = Object.keys(counts).filter(k => counts[parseInt(k)] === 0).map(Number);
  
  let neuroObservation = "Nöral frekansların ve enerji kanalların oldukça dengeli bir dağılıma sahip.";
  if (missing.includes(4) && missing.includes(5)) {
    neuroObservation = "Gelişime açık yönün: İrade ve odaklanma (Prefrontal Korteks) frekanslarında zaman zaman dalgalanmalar yaşayabilirsin. Topraklanma (Grounding) pratikleriyle bu pasif kanalları çok daha güçlü aktive edebilirsin.";
  } else if (excess.includes(1) || excess.includes(8)) {
    neuroObservation = "Ateş (Amigdala) frekansın oldukça yüksek. Beyin dalgaların hiper-aktif ve aşırı üretken. Zaman zaman dinlenerek zihnini rölantiye alman (Parasempatik denge) sana inanılmaz bir şifa verecektir.";
  } else if (missing.includes(2) && missing.includes(6)) {
    neuroObservation = "Empati ve güven (Oksitosin) kanalların dış dünyaya karşı şimdilik pasif durumda. İkili ilişkilerde güven duvarları inşaa etmiş olabilirsin. Kalp frekansını yavaş yavaş güvene açman önerilir.";
  }

  return { excess, missing, observation: neuroObservation };
}
