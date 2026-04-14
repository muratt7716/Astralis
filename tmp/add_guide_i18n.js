const fs = require('fs');
const path = 'src/lib/i18n-shared.ts';
let content = fs.readFileSync(path, 'utf8');

const locales = {
  tr: {
    start: '  tr: {',
    keys: `    "bio.guide.critical_title": "Kritik Günler (0 Çizgisi)",
    "bio.guide.critical_desc": "Dalgaların grafikteki orta (0) yatay ekseni kestiği günler geçiş ve dengesizlik anlarıdır. Bugünlerde önemli kararlar almaktan kaçınılmalı, rölantide kalınmalıdır.",
    "bio.guide.phases_title": "Yüksek ve Düşük Fazlar",
    "bio.guide.phases_desc": "Çizgi sıfırın üstündeyken (+) enerjik, yaratıcı ve şanslıdır. Sıfırın altındayken (-) ise deşarj (dinlenme) sürecindesinizdir; risk almamalı ve bedeni zorlamamalısınız.",
    "bio.cycle": "Döngü",
    "bio.days": "Gün",
    "bio.chart_subtitle": "Hedef tarihe göre ±15 günlük enerji frekansı",
    "bio.target_marker": "HEDEF",\n`
  },
  en: {
    start: '  en: {',
    keys: `    "bio.guide.critical_title": "Critical Days (Zero Line)",
    "bio.guide.critical_desc": "Days when the waves cross the middle (0) horizontal axis are moments of transition and instability. Avoid major decisions and take it easy.",
    "bio.guide.phases_title": "High and Low Phases",
    "bio.guide.phases_desc": "When the line is above zero (+), you are energetic, creative, and lucky. Below zero (-), you are in a discharge (resting) phase; avoid taking risks and straining your body.",
    "bio.cycle": "Cycle",
    "bio.days": "Days",
    "bio.chart_subtitle": "±15 days energy frequency based on target date",
    "bio.target_marker": "TARGET",\n`
  },
  ar: {
    start: '  ar: {',
    keys: `    "bio.guide.critical_title": "الأيام الحرجة (خط الصفر)",
    "bio.guide.critical_desc": "الأيام التي تعبر فيها الأمواج المحور الأفقي الأوسط (0) هي لحظات انتقال وعدم استقرار. تجنب القرارات الكبرى وخذ الأمور ببساطة.",
    "bio.guide.phases_title": "المراحل المرتفعة والمنخفضة",
    "bio.guide.phases_desc": "عندما يكون الخط فوق الصفر (+)، فأنت مليء بالطاقة ومبتكر ومحظوظ. وتحت الصفر (-)، أنت في مرحلة تفريغ (راحة)؛ تجنب المخاطرة وإجهاد جسمك.",
    "bio.cycle": "دورة",
    "bio.days": "أيام",
    "bio.chart_subtitle": "تردد الطاقة لمدة ±15 يومًا بناءً على التاريخ المستهدف",
    "bio.target_marker": "الهدف",\n`
  },
  de: {
    start: '  de: {',
    keys: `    "bio.guide.critical_title": "Kritische Tage (Nulllinie)",
    "bio.guide.critical_desc": "Tage, an denen die Wellen die mittlere (0) horizontale Achse kreuzen, sind Momente des Übergangs und der Instabilität. Vermeiden Sie wichtige Entscheidungen und lassen Sie es ruhig angehen.",
    "bio.guide.phases_title": "Hohe und niedrige Phasen",
    "bio.guide.phases_desc": "Wenn die Linie über Null liegt (+), sind Sie energisch, kreativ und haben Glück. Unter Null (-) befinden Sie sich in einer Entladungsphase; vermeiden Sie Risiken und schonen Sie Ihren Körper.",
    "bio.cycle": "Zyklus",
    "bio.days": "Tage",
    "bio.chart_subtitle": "±15 Tage Energiefrequenz basierend auf Zieldatum",
    "bio.target_marker": "ZIEL",\n`
  },
  fr: {
    start: '  fr: {',
    keys: `    "bio.guide.critical_title": "Jours Critiques (Ligne Zéro)",
    "bio.guide.critical_desc": "Les jours où les vagues traversent l'axe horizontal du milieu (0) sont des moments de transition et d'instabilité. Évitez les décisions importantes et détendez-vous.",
    "bio.guide.phases_title": "Phases Hautes et Basses",
    "bio.guide.phases_desc": "Lorsque la ligne est au-dessus de zéro (+), vous êtes énergique, créatif et chanceux. En dessous de zéro (-), vous êtes en phase de décharge (repos) ; évitez les risques et ménagez votre corps.",
    "bio.cycle": "Cycle",
    "bio.days": "Jours",
    "bio.chart_subtitle": "Fréquence énergétique de ±15 jours basée sur la date cible",
    "bio.target_marker": "CIBLE",\n`
  }
};

for (const [lang, info] of Object.entries(locales)) {
  const parts = content.split(info.start);
  if (parts.length > 1) {
    content = parts[0] + info.start + '\n' + info.keys + parts[1];
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done mapping.');
