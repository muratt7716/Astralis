const fs = require('fs');

const path = 'src/lib/i18n-shared.ts';
let content = fs.readFileSync(path, 'utf8');

const locales = {
  tr: {
    start: '  tr: {',
    keys: `
    "bio.time_travel": "Zaman Yolculuğu 🔮",
    "bio.target_date": "Hedef Tarih",
    "bio.intuitional": "Sezgisel",
    "bio.aesthetic": "Estetik",
    "bio.spiritual": "Ruhsal",
    "bio.compat.title": "Biyoritim Uyumu",
    "bio.compat.desc": "İki kişi arasındaki Fiziksel, Duygusal ve Zihinsel enerji frekanslarının uyum analizi.",
    "bio.compat.score": "Uyum Skoru:",
    "bio.insight.title": "Üstat Notu",
    "bio.insight.desc": "Biyoritim kurucuları Fliess ve Swoboda'ya göre;",`
  },
  en: {
    start: '  en: {',
    keys: `
    "bio.time_travel": "Time Travel 🔮",
    "bio.target_date": "Target Date",
    "bio.intuitional": "Intuitional",
    "bio.aesthetic": "Aesthetic",
    "bio.spiritual": "Spiritual",
    "bio.compat.title": "Biorhythm Compatibility",
    "bio.compat.desc": "Compatibility analysis of Physical, Emotional, and Intellectual energy frequencies between two people.",
    "bio.compat.score": "Match Score:",
    "bio.insight.title": "Master's Insight",
    "bio.insight.desc": "According to biorhythm pioneers Fliess and Swoboda;",`
  },
  ar: {
    start: '  ar: {',
    keys: `
    "bio.time_travel": "السفر عبر الزمن 🔮",
    "bio.target_date": "التاريخ المستهدف",
    "bio.intuitional": "حدسي",
    "bio.aesthetic": "جمالي",
    "bio.spiritual": "روحي",
    "bio.compat.title": "توافق الإيقاع الحيوي",
    "bio.compat.desc": "تحليل توافق الترددات الحيوية (الجسدية، العاطفية، العقلية) بين شخصين.",
    "bio.compat.score": "درجة التوافق:",
    "bio.insight.title": "رؤية الخبير",
    "bio.insight.desc": "وفقًا لرواد الإيقاع الحيوي فليس وسوبودا؛",`
  },
  de: {
    start: '  de: {',
    keys: `
    "bio.time_travel": "Zeitreise 🔮",
    "bio.target_date": "Zieldatum",
    "bio.intuitional": "Intuitiv",
    "bio.aesthetic": "Ästhetisch",
    "bio.spiritual": "Spirituell",
    "bio.compat.title": "Biorhythmus-Kompatibilität",
    "bio.compat.desc": "Kompatibilitätsanalyse von physischen, emotionalen und intellektuellen Energiefrequenzen zwischen zwei Personen.",
    "bio.compat.score": "Übereinstimmung:",
    "bio.insight.title": "Notiz des Meisters",
    "bio.insight.desc": "Nach den Biorhythmus-Pionieren Fliess und Swoboda;",`
  },
  fr: {
    start: '  fr: {',
    keys: `
    "bio.time_travel": "Voyage dans le Temps 🔮",
    "bio.target_date": "Date cible",
    "bio.intuitional": "Intuitif",
    "bio.aesthetic": "Esthétique",
    "bio.spiritual": "Spirituel",
    "bio.compat.title": "Compatibilité Biorhythme",
    "bio.compat.desc": "Analyse de compatibilité des fréquences d'énergie physiques, émotionnelles et intellectuelles entre deux personnes.",
    "bio.compat.score": "Score de compatibilité :",
    "bio.insight.title": "Note du Maître",
    "bio.insight.desc": "Selon les pionniers du biorythme Fliess et Swoboda;",`
  }
};

for (const [lang, info] of Object.entries(locales)) {
  const parts = content.split(info.start);
  if (parts.length > 1) {
    // Insert just after the start
    content = parts[0] + info.start + info.keys + parts[1];
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully injected translated keys safely!');
