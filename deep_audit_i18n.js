
const fs = require('fs');
const content = fs.readFileSync('src/lib/i18n-shared.ts', 'utf8');

function analyze() {
  const languages = ['tr', 'en', 'ar', 'de', 'fr'];
  
  languages.forEach(lang => {
    const startStr = `  ${lang}: {`;
    const startIdx = content.indexOf(startStr);
    if (startIdx === -1) {
      console.log(`\nERROR: Block for ${lang} not found.`);
      return;
    }
    
    let endIdx = -1;
    let depth = 0;
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
    
    const block = content.substring(startIdx, endIdx + 1);
    const lines = block.split('\n');
    const seenKeys = new Map();
    
    lines.forEach((line, i) => {
      // Very loose match for anything that looks like a key
      const match = line.match(/^\s*["']?(.*?)["']?\s*:/);
      if (match) {
        let key = match[1].trim();
        if (key === lang) return; // Skip the lang name at the start
        if (key.endsWith(':')) key = key.slice(0, -1).trim(); // Handle key::
        
        if (seenKeys.has(key)) {
          console.log(`[${lang.toUpperCase()}] DUPLICATE: "${key}" found at block-relative line ${i + 1}`);
        } else {
          seenKeys.set(key, i + 1);
        }
      }
    });

    console.log(`[${lang.toUpperCase()}] Scan complete: ${seenKeys.size} keys found.`);
  });
  
  // Also check the WHOLE FILE for multiple blocks of the same language
  languages.forEach(lang => {
    const regex = new RegExp(`\\s${lang}:\\s*\\{`, 'g');
    const matches = content.match(regex);
    if (matches && matches.length > 1) {
      console.log(`[ROOT] CRITICAL: Language block "${lang}" appears ${matches.length} times in the file!`);
    }
  });
}

analyze();
