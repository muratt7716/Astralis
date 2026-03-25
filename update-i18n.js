const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "lib", "i18n.tsx");
let content = fs.readFileSync(filePath, "utf8");

const keysToAddTr = `
    "home.feature.horoscope.desc": "Yapay zeka analizli günlük yorumunuz",
    "home.feature.chart.desc": "Gezegen ve evlerin size özel analizi",
    "home.feature.compatibility.desc": "İki haritanın detaylı açı analizi",
    "home.feature.planets.desc": "Retro ve ay fazlarının canlı takibi",`;

const keysToAddEn = `
    "home.feature.horoscope.desc": "AI-powered daily horoscope readings",
    "home.feature.chart.desc": "Personalized analysis of planets and houses",
    "home.feature.compatibility.desc": "Detailed synastry aspect analysis",
    "home.feature.planets.desc": "Live tracking of retrogrades and moon phases",`;

const keysToAddAr = `
    "home.feature.horoscope.desc": "قراءات أبراج يومية مدعومة بالذكاء الاصطناعي",
    "home.feature.chart.desc": "تحليل شخصي للكواكب والبيوت",
    "home.feature.compatibility.desc": "تحليل مفصل لتوافق الخرائط الفلكية",
    "home.feature.planets.desc": "تتبع حي لتراجع الكواكب ومراحل القمر",`;

const keysToAddDe = `
    "home.feature.horoscope.desc": "KI-gestützte tägliche Horoskop-Analysen",
    "home.feature.chart.desc": "Persönliche Analyse von Planeten und Häusern",
    "home.feature.compatibility.desc": "Detaillierte Analyse der Synastrie-Aspekte",
    "home.feature.planets.desc": "Live-Tracking von Rückläufigkeiten und Mondphasen",`;

const keysToAddFr = `
    "home.feature.horoscope.desc": "Lectures d'horoscopes quotidiens par IA",
    "home.feature.chart.desc": "Analyse personnalisée des planètes et des maisons",
    "home.feature.compatibility.desc": "Analyse détaillée des aspects de synastrie",
    "home.feature.planets.desc": "Suivi en direct des rétrogradations et phases de la lune",`;

content = content.replace(
  /("home\.explore\.subtitle": "Astroloji dünyasının tüm sırlarını bir tıkla keşfedin",)/,
  "$1" + keysToAddTr
);
content = content.replace(
  /("home\.explore\.subtitle": "Discover all the secrets of astrology with a single click",)/,
  "$1" + keysToAddEn
);
content = content.replace(
  /("home\.explore\.subtitle": "اكتشف كل أسرار علم التنجيم بنقرة واحدة",)/,
  "$1" + keysToAddAr
);
content = content.replace(
  /("home\.explore\.subtitle": "Entdecken Sie alle Geheimnisse der Astrologie mit einem Klick",)/,
  "$1" + keysToAddDe
);
content = content.replace(
  /("home\.explore\.subtitle": "Découvrez tous les secrets de l'astrologie en un clic",)/,
  "$1" + keysToAddFr
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Successfully appended missing keys.");
