
import fs from 'fs';

const content = fs.readFileSync('c:/Users/Administrator/Desktop/Falcı Bacı/src/lib/i18n.tsx', 'utf8');

const languages = ['tr', 'en', 'ar', 'de', 'fr'];
const results = {};

languages.forEach(lang => {
    const regex = new RegExp(`${lang}: \\{([\\s\\S]*?)\\},`, 'g');
    const match = regex.exec(content);
    if (match) {
        const block = match[1];
        const lines = block.split('\n');
        const keys = [];
        const duplicates = [];
        lines.forEach(line => {
            const keyMatch = line.match(/"(.*?)"/);
            if (keyMatch) {
                const key = keyMatch[1];
                if (keys.includes(key)) {
                    duplicates.push(key);
                } else {
                    keys.push(key);
                }
            }
        });
        results[lang] = duplicates;
    }
});

console.log(JSON.stringify(results, null, 2));
