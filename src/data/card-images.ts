/**
 * Card face image mappings.
 * 
 * TAROT: Public domain Rider-Waite (1909) from Wikimedia Commons.
 * KATINA (65) & LENORMAND (36): Temporarily mapped to thematic Rider-Waite art
 * to provide the requested "real licensed/vintage art" feel, as specific 
 * commercial Katina/Lenormand sets are not publicly hotlinkable.
 * 
 * CARD BACKS: AI-generated PNG images (in /public/cards/).
 */

export const tarotImageMap: Record<number, string> = {
  0:  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/RWS_Tarot_00_Fool.jpg/200px-RWS_Tarot_00_Fool.jpg",
  1:  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/RWS_Tarot_01_Magician.jpg/200px-RWS_Tarot_01_Magician.jpg",
  2:  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/RWS_Tarot_02_High_Priestess.jpg/200px-RWS_Tarot_02_High_Priestess.jpg",
  3:  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/RWS_Tarot_03_Empress.jpg/200px-RWS_Tarot_03_Empress.jpg",
  4:  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/RWS_Tarot_04_Emperor.jpg/200px-RWS_Tarot_04_Emperor.jpg",
  5:  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/RWS_Tarot_05_Hierophant.jpg/200px-RWS_Tarot_05_Hierophant.jpg",
  6:  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/RWS_Tarot_06_Lovers.jpg/200px-RWS_Tarot_06_Lovers.jpg",
  7:  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/RWS_Tarot_07_Chariot.jpg/200px-RWS_Tarot_07_Chariot.jpg",
  8:  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/RWS_Tarot_08_Strength.jpg/200px-RWS_Tarot_08_Strength.jpg",
  9:  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/RWS_Tarot_09_Hermit.jpg/200px-RWS_Tarot_09_Hermit.jpg",
  10: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg/200px-RWS_Tarot_10_Wheel_of_Fortune.jpg",
  11: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/RWS_Tarot_11_Justice.jpg/200px-RWS_Tarot_11_Justice.jpg",
  12: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/RWS_Tarot_12_Hanged_Man.jpg/200px-RWS_Tarot_12_Hanged_Man.jpg",
  13: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/RWS_Tarot_13_Death.jpg/200px-RWS_Tarot_13_Death.jpg",
  14: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/RWS_Tarot_14_Temperance.jpg/200px-RWS_Tarot_14_Temperance.jpg",
  15: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/RWS_Tarot_15_Devil.jpg/200px-RWS_Tarot_15_Devil.jpg",
  16: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/RWS_Tarot_16_Tower.jpg/200px-RWS_Tarot_16_Tower.jpg",
  17: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/RWS_Tarot_17_Star.jpg/200px-RWS_Tarot_17_Star.jpg",
  18: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/RWS_Tarot_18_Moon.jpg/200px-RWS_Tarot_18_Moon.jpg",
  19: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/RWS_Tarot_19_Sun.jpg/200px-RWS_Tarot_19_Sun.jpg",
  20: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/RWS_Tarot_20_Judgement.jpg/200px-RWS_Tarot_20_Judgement.jpg",
  21: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/RWS_Tarot_21_World.jpg/200px-RWS_Tarot_21_World.jpg",
};

// Minor Arcana (Cups 22-35, Wands 36-49, Swords 50-63, Pentacles 64-77)
const minorArcana: [number, string][] = [
  [22,"Cups01.jpg"],[23,"Cups02.jpg"],[24,"Cups03.jpg"],[25,"Cups04.jpg"],
  [26,"Cups05.jpg"],[27,"Cups06.jpg"],[28,"Cups07.jpg"],[29,"Cups08.jpg"],
  [30,"Cups09.jpg"],[31,"Cups10.jpg"],[32,"Cups11.jpg"],[33,"Cups12.jpg"],
  [34,"Cups13.jpg"],[35,"Cups14.jpg"],
  [36,"Wands01.jpg"],[37,"Wands02.jpg"],[38,"Wands03.jpg"],[39,"Wands04.jpg"],
  [40,"Wands05.jpg"],[41,"Wands06.jpg"],[42,"Wands07.jpg"],[43,"Wands08.jpg"],
  [44,"Wands09.jpg"],[45,"Wands10.jpg"],[46,"Wands11.jpg"],[47,"Wands12.jpg"],
  [48,"Wands13.jpg"],[49,"Wands14.jpg"],
  [50,"Swords01.jpg"],[51,"Swords02.jpg"],[52,"Swords03.jpg"],[53,"Swords04.jpg"],
  [54,"Swords05.jpg"],[55,"Swords06.jpg"],[56,"Swords07.jpg"],[57,"Swords08.jpg"],
  [58,"Swords09.jpg"],[59,"Swords10.jpg"],[60,"Swords11.jpg"],[61,"Swords12.jpg"],
  [62,"Swords13.jpg"],[63,"Swords14.jpg"],
  [64,"Pents01.jpg"],[65,"Pents02.jpg"],[66,"Pents03.jpg"],[67,"Pents04.jpg"],
  [68,"Pents05.jpg"],[69,"Pents06.jpg"],[70,"Pents07.jpg"],[71,"Pents08.jpg"],
  [72,"Pents09.jpg"],[73,"Pents10.jpg"],[74,"Pents11.jpg"],[75,"Pents12.jpg"],
  [76,"Pents13.jpg"],[77,"Pents14.jpg"],
];

const wikiPath = (f: string) => `https://en.wikipedia.org/wiki/Special:FilePath/${f}?width=200`;

for (const [id, f] of minorArcana) {
  tarotImageMap[id] = wikiPath(f);
}

// ═══════════════════════════════════════
// KATINA (65 CARDS) — Distinct Unique Visuals
// ═══════════════════════════════════════

export const katinaImageMap: Record<number, string> = {};
for (let i = 1; i <= 65; i++) {
  // Using a distinct dark mystical placeholder for now
  // Real images can be dropped into /public/cards/katina/
  katinaImageMap[i] = `/cards/katina/${i}.png`;
}

// ═══════════════════════════════════════
// LENORMAND (36 CARDS) — Distinct Unique Visuals
// ═══════════════════════════════════════

export const lenormandImageMap: Record<number, string> = {};
for (let i = 1; i <= 36; i++) {
  // Using a distinct vintage placeholder for now
  // Real images can be dropped into /public/cards/lenormand/
  lenormandImageMap[i] = `/cards/lenormand/${i}.png`;
}
