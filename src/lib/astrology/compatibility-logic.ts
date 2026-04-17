import { getZodiacById } from "@/data/zodiac";

/**
 * Deterministic compatibility score calculation used across the system.
 * Based on the fixed matrix logic in SynastryMatrix.tsx.
 */
export const calculateBaseCompatibilityScore = (s1Id: string, s2Id: string): number => {
  if (s1Id === s2Id) return 100;

  const sign1 = getZodiacById(s1Id);
  const sign2 = getZodiacById(s2Id);

  if (!sign1 || !sign2) return 50;

  // Elemental Compatibility
  const el1 = sign1.elementKey.split(".").pop();
  const el2 = sign2.elementKey.split(".").pop();

  if (el1 === el2) return 90;

  const compatiblePairs = [
    ["fire", "air"],
    ["earth", "water"],
  ];

  const isCompatible = compatiblePairs.some(
    (pair) => (pair[0] === el1 && pair[1] === el2) || (pair[0] === el2 && pair[1] === el1)
  );

  if (isCompatible) return 80;

  // Squares and Oppositions (simplified)
  const q1 = sign1.qualityKey.split(".").pop();
  const q2 = sign2.qualityKey.split(".").pop();

  if (q1 === q2) return 45; // Tension

  return 65; // Default neutral-ish
};
