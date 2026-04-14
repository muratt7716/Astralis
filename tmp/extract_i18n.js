const fs = require('fs');
const path = require('path');

try {
  const { translations } = require('./i18n-cjs.js');
  
  const localesDir = path.join(__dirname, '..', 'src', 'locales');
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }

  for (const lang in translations) {
    const dict = translations[lang];
    const tsCode = `import type { TranslationDict } from "@/lib/i18n-shared";

export const ${lang}: TranslationDict = ${JSON.stringify(dict, null, 2)};
`;
    fs.writeFileSync(path.join(localesDir, `${lang}.ts`), tsCode);
    console.log(`Generated src/locales/${lang}.ts`);
  }
} catch (err) {
  console.error("Extraction failed:", err);
}
