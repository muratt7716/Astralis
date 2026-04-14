const fs = require('fs');

// 1. Fix the 404 router on the home page
const pagePath = 'src/app/page.tsx';
let pageCode = fs.readFileSync(pagePath, 'utf8');
pageCode = pageCode.replace(/href="\/hesaplayici"/g, 'href="/dogum-haritasi"');
fs.writeFileSync(pagePath, pageCode);
console.log("Fixed homepage 404 redirect.");

// 2. Add linguistic purity rules to gemini.ts
const geminiPath = 'src/lib/gemini.ts';
let geminiCode = fs.readFileSync(geminiPath, 'utf8');

const linguisticRule = `
CRITICAL LINGUISTIC RULE:
- You MUST maintain absolute linguistic purity in \${langName}.
- NEVER use English buzzwords, corporate jargon, or direct translations. 
- Example: Do NOT use English phrases like "self-confident" or "over-thinking" in Turkish texts; use natural equivalents like "özgüvenli" and "aşırı düşünme".
- Output must read as if written by a culturally native expert astrologer.
`;

// Inject into Horoscope prompt
geminiCode = geminiCode.replace(
  /LANGUAGE: \$\{langName\}/,
  `LANGUAGE: \${langName}\n${linguisticRule}`
);

// Inject into other prominent prompts where language strictness is missing (like compatibility, divination, etc.)
// Some prompts use \${lang} instead of \${langName}
const linguisticRuleLang = `
CRITICAL LINGUISTIC RULE:
- You MUST maintain absolute linguistic purity in \${lang}.
- NEVER use English buzzwords, corporate jargon, or direct translations. 
- Output must read as if written by a culturally native expert astrologer.
`;

geminiCode = geminiCode.replace(
  /LANGUAGE: \$\{lang\}\n/,
  `LANGUAGE: \${lang}\n${linguisticRuleLang}`
);

fs.writeFileSync(geminiPath, geminiCode);
console.log("Injected senior prompt engineering rules.");
