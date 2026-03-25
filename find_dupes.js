
import fs from 'fs';

const content = fs.readFileSync('c:/Users/Administrator/Desktop/Falcı Bacı/src/lib/i18n.tsx', 'utf8');

const languages = ['tr', 'en', 'ar', 'de', 'fr'];
const lines = content.split('\n');

languages.forEach(lang => {
    console.log(`--- Checking ${lang} ---`);
    let inBlock = false;
    let found = false;
    const seenKeys = new Map();
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes(`${lang}: {`)) {
            inBlock = true;
            continue;
        }
        if (inBlock && (line.trim() === '},' || line.trim() === '}' || line.trim() === '};')) {
            inBlock = false;
        }
        if (inBlock) {
            const match = line.match(/"(.*?)"/);
            if (match) {
                const key = match[1];
                if (seenKeys.has(key)) {
                    console.log(`Duplicate found in ${lang}: "${key}" at line ${i + 1}. Previously at ${seenKeys.get(key)}`);
                    found = true;
                } else {
                    seenKeys.set(key, i + 1);
                }
            }
        }
    }
    if (!found) console.log(`No duplicates in ${lang}`);
});
