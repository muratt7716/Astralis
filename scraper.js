const https = require('https');

https.get('https://labyrinthos.co/blogs/lenormand-cards-meanings-list', (res) => {
    if (res.statusCode !== 200) {
        console.log("Status:", res.statusCode);
        return;
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const matches = data.match(/https:\/\/cdn\.shopify\.com\/s\/files\/[a-zA-Z0-9_\/-]+\.jpg/g);
        if (matches) {
            const unique = [...new Set(matches)].filter(url => url.toLowerCase().includes('lenormand'));
            console.log(unique.slice(0, 10)); // just output first 10
        } else {
            console.log("No matches");
        }
    });
}).on('error', err => console.log('Error:', err));
