const fs = require('fs');

const path = 'src/lib/gemini.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('unstable_cache')) {
  code = `import { unstable_cache } from "next/cache";\n` + code;
}

// 1. generateHoroscope
code = code.replace(
  /export async function generateHoroscope\(([\s\S]*?)\)\s*\{([\s\S]*?return\s*\{[\s\S]*?\};\s*\}\s*catch\s*\(error\)\s*\{[\s\S]*?return\s*null;\s*\})\s*\}/,
  (match, args, body) => {
    return `export const generateHoroscope = unstable_cache(async (${args}) => {${body}}, ["generateHoroscope"], { revalidate: 86400 });`;
  }
);

// 2. generateBirthChartInterpretation
code = code.replace(
  /export async function generateBirthChartInterpretation\(([\s\S]*?)\)\s*\{([\s\S]*?return\s*parseGeminiJson[\s\S]*?catch\s*\(error\)\s*\{[\s\S]*?return\s*null;\s*\})\s*\}/,
  (match, args, body) => {
    return `export const generateBirthChartInterpretation = unstable_cache(async (${args}) => {${body}}, ["generateBirthChart"], { revalidate: 86400 * 30 }); // cache 30 days`;
  }
);

// 3. generateCompatibility
code = code.replace(
  /export async function generateCompatibility\(([\s\S]*?)\)\s*\{([\s\S]*?return\s*\{[\s\S]*?\};\s*\}\s*catch\s*\(error\)\s*\{[\s\S]*?return\s*null;\s*\})\s*\}/,
  (match, args, body) => {
    return `export const generateCompatibility = unstable_cache(async (${args}) => {${body}}, ["generateCompatibility"], { revalidate: 86400 * 30 });`;
  }
);

// 4. generateSynastry
code = code.replace(
  /export async function generateSynastry\(([\s\S]*?)\)\s*\{([\s\S]*?return\s*\{[\s\S]*?\};\s*\}\s*catch\s*\(error\)\s*\{[\s\S]*?return\s*null;\s*\})\s*\}/,
  (match, args, body) => {
    return `export const generateSynastry = unstable_cache(async (${args}) => {${body}}, ["generateSynastry"], { revalidate: 86400 * 30 });`;
  }
);

// 5. analyzeDream
code = code.replace(
  /export async function analyzeDream\(([\s\S]*?)\)\s*\{([\s\S]*?return\s*parseGeminiJson[\s\S]*?catch\s*\(error\)\s*\{[\s\S]*?return\s*null;\s*\})\s*\}/,
  (match, args, body) => {
    return `export const analyzeDream = unstable_cache(async (${args}) => {${body}}, ["analyzeDream"], { revalidate: 86400 * 30 });`;
  }
);

// 6. generateDivinationReading
code = code.replace(
  /export async function generateDivinationReading\(([\s\S]*?)\)\s*\{([\s\S]*?return\s*\{[\s\S]*?\};\s*\}\s*catch\s*\(error\)\s*\{[\s\S]*?return\s*null;\s*\})\s*\}/,
  (match, args, body) => {
    return `export const generateDivinationReading = unstable_cache(async (${args}) => {${body}}, ["generateDivinationReading"], { revalidate: 86400 * 7 }); // cache 7 days`;
  }
);

fs.writeFileSync(path, code);
console.log('Gemini AI caching implemented successfully');
