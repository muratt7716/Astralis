
const fs = require('fs');

const content = fs.readFileSync('src/lib/i18n-shared.ts', 'utf8');

const languages = ['tr', 'en', 'ar', 'de', 'fr'];
const results = {};

function getKeys(lang) {
    // Robust way to find the object block for a language
    const startIdx = content.indexOf(`  ${lang}: {`);
    if (startIdx === -1) return null;
    
    // Find the matching closing brace for this block
    let depth = 0;
    let endIdx = -1;
    let inObject = false;
    
    for (let i = startIdx; i < content.length; i++) {
        if (content[i] === '{') {
            depth++;
            inObject = true;
        } else if (content[i] === '}') {
            depth--;
            if (inObject && depth === 0) {
                endIdx = i;
                break;
            }
        }
    }
    
    if (endIdx === -1) return null;
    
    const block = content.substring(startIdx, endIdx + 1);
    const lines = block.split('\n');
    const keys = [];
    const duplicates = [];
    
    lines.forEach((line, lineNum) => {
        const keyMatch = line.match(/"(.*?)"/);
        if (keyMatch) {
            const key = keyMatch[1];
            // Check if it's actually a key (followed by colon)
            if (line.includes(`"${key}":`)) {
                if (keys.includes(key)) {
                    duplicates.push({ key, line: line.trim() });
                } else {
                    keys.push(key);
                }
            }
        }
    });
    
    return { keys, duplicates };
}

const langData = {};
languages.forEach(lang => {
    langData[lang] = getKeys(lang);
});

console.log("=== DUPLICATE KEYS WITHIN LANGUAGES ===");
languages.forEach(lang => {
    if (langData[lang] && langData[lang].duplicates.length > 0) {
        console.log(`\n[${lang.toUpperCase()}] Duplicates:`);
        langData[lang].duplicates.forEach(d => console.log(`  - ${d.key}`));
    }
});

console.log("\n=== CROSS-LANGUAGE CONSISTENCY CHECK ===");
const baseLang = 'tr';
const baseKeys = langData[baseLang].keys;

languages.forEach(lang => {
    if (lang === baseLang) return;
    if (!langData[lang]) {
        console.log(`\n[${lang.toUpperCase()}] ERROR: Language block not found.`);
        return;
    }
    
    const currentKeys = langData[lang].keys;
    const missing = baseKeys.filter(k => !currentKeys.includes(k));
    const extra = currentKeys.filter(k => !baseKeys.includes(k));
    
    if (missing.length > 0 || extra.length > 0) {
        console.log(`\n[${lang.toUpperCase()}] vs [${baseLang.toUpperCase()}]:`);
        if (missing.length > 0) {
            console.log(`  MISSING keys (${missing.length}):`);
            missing.forEach(k => console.log(`    - ${k}`));
        }
        if (extra.length > 0) {
            console.log(`  EXTRA keys (${extra.length}):`);
            extra.forEach(k => console.log(`    - ${k}`));
        }
    } else {
        console.log(`\n[${lang.toUpperCase()}] Match: OK (${baseKeys.length} keys)`);
    }
});
