const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const languages = ['en', 'fr', 'de', 'ar'];

function getLocaleData(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const keys = {};
    const regex = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        keys[match[1]] = match[2];
    }
    return keys;
}

const trData = getLocaleData(path.join(localesDir, 'tr.ts'));
const trKeys = Object.keys(trData);

console.log(`Master (tr) has ${trKeys.length} keys.`);

languages.forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.ts`);
    if (!fs.existsSync(filePath)) return;

    const currentData = getLocaleData(filePath);
    const newData = {};

    // Use current data if it exists, otherwise use tr as fallback
    trKeys.forEach(key => {
        newData[key] = currentData[key] || trData[key];
    });

    let newContent = `import type { TranslationDict } from "@/lib/i18n-shared";\n\n`;
    newContent += `export const ${lang}: TranslationDict = {\n`;
    
    trKeys.forEach(key => {
        newContent += `  "${key}": "${newData[key]}",\n`;
    });
    
    newContent += `};\n`;
    
    fs.writeFileSync(filePath, newContent);
    console.log(`[✓] ${lang}.ts synced. Keys: ${trKeys.length}`);
});
