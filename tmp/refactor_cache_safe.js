const fs = require('fs');

const path = 'src/lib/gemini.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { unstable_cache }')) {
  code = `import { unstable_cache } from "next/cache";\n` + code;
}

const funcs = [
  "generateHoroscope",
  "generateBirthChartInterpretation",
  "generateCompatibility",
  "generateSynastry",
  "analyzeDream",
  "generateCoffeeReading",
  "generateVirtualCoffeeReading",
  "generateDivinationReading",
  "generateDailyTarotReading",
  "interpretTransitReading"
];

let wrappers = '\n\n// --- NEXT.JS NATIVE CACHING WRAPPERS ---\n';

for (const fn of funcs) {
  // Replace EXACTLY the export declaration with an internal declaration
  const regex = new RegExp(`export\\s+async\\s+function\\s+${fn}\\(`, 'g');
  if (code.match(regex)) {
    code = code.replace(regex, `async function _${fn}(`);
    let revalidate = 86400; // 24 hours
    if (fn === "generateBirthChartInterpretation" || fn === "generateCompatibility" || fn === "generateSynastry") {
      revalidate = 86400 * 30; // 30 days
    }
    wrappers += `export const ${fn} = unstable_cache(_${fn}, ["__gemini_${fn}"], { revalidate: ${revalidate} });\n`;
  }
}

code += wrappers;
fs.writeFileSync(path, code);
console.log("Safely wrapped all Gemini endpoints with unstable_cache!");
