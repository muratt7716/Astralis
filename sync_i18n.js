
const fs = require('fs');

const path = 'src/lib/i18n-shared.ts';
let content = fs.readFileSync(path, 'utf8');

const languages = ['tr', 'en', 'ar', 'de', 'fr'];

function getBlock(lang) {
    const startStr = `  ${lang}: {`;
    const startIdx = content.indexOf(startStr);
    if (startIdx === -1) return null;
    
    let depth = 0;
    let endIdx = -1;
    for (let i = startIdx + startStr.length - 1; i < content.length; i++) {
        if (content[i] === '{') depth++;
        else if (content[i] === '}') {
            depth--;
            if (depth === 0) {
                endIdx = i;
                break;
            }
        }
    }
    return { start: startIdx, end: endIdx, text: content.substring(startIdx, endIdx + 1) };
}

// 1. Collect all keys and values from all languages to ensure nothing is lost
const allData = {};
languages.forEach(lang => {
    const block = getBlock(lang);
    if (!block) return;
    
    const lines = block.text.split('\n');
    const data = {};
    lines.forEach(line => {
        const match = line.match(/"(.*?)"\s*:\s*"(.*?)",/);
        if (match) {
            data[match[1]] = match[2];
        }
    });
    allData[lang] = data;
});

// 2. Identify the full set of keys that SHOULD exist (union of all)
const allKeys = new Set();
Object.values(allData).forEach(data => {
    Object.keys(data).forEach(k => allKeys.add(k));
});

// 3. Fix specific known issues (standardization)
languages.forEach(lang => {
    const data = allData[lang];
    
    // Ensure compatibility keys are correct
    if (data['compat.person1'] && !data['compatibility.person1']) data['compatibility.person1'] = data['compat.person1'];
    if (data['compat.person2'] && !data['compatibility.person2']) data['compatibility.person2'] = data['compat.person2'];
    
    // Fill in missing colors if possible (using tr as base if tr has them, or en)
    const baseColors = allData['en']; // en is usually fallback
    Array.from(allKeys).forEach(key => {
        if (!data[key]) {
            data[key] = baseColors[key] || allData['tr'][key] || key;
        }
    });
});

// 4. Reconstruct the file
let newContent = content;
// We need to replace blocks from bottom to top to avoid offset issues
for (let i = languages.length - 1; i >= 0; i--) {
    const lang = languages[i];
    const block = getBlock(lang);
    if (!block) continue;
    
    const data = allData[lang];
    const sortedKeys = Object.keys(data).sort(); // Optional: sort for consistency
    
    let newBlockText = `  ${lang}: {\n`;
    sortedKeys.forEach(key => {
        // Simple escape for double quotes in values if any
        const val = data[key].replace(/"/g, '\\"');
        newBlockText += `    "${key}": "${val}",\n`;
    });
    newBlockText += `  }`;
    
    newContent = newContent.substring(0, block.start) + newBlockText + newContent.substring(block.end + 1);
}

fs.writeFileSync(path, newContent);
console.log("Successfully synced all languages and removed duplicates.");
