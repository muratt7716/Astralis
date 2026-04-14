const fs = require('fs');

const path = 'src/lib/i18n-shared.ts';
let content = fs.readFileSync(path, 'utf8');

const locales = {
  tr: {
    start: '  tr: {',
    keys: `    "bio.main_desc": "Kendinizi tesadüflere bırakmayın. Biyoritim; fiziksel enerjinizin, duygu durumunuzun ve zihinsel açıklığınızın günlük matematiksel şablonunu çıkarır. Hangi gün risk almalı, hangi gün dinlenmelisiniz? Öğrenin.",
    "bio.time_travel_desc": "Geçmişte veya gelecekteki spesifik bir günü (örn: sınav günü, ameliyat, toplantı) seçerek o gündeki enerjinizi öngörün.",\n`
  },
  en: {
    start: '  en: {',
    keys: `    "bio.main_desc": "Don't leave your life to chance. Biorhythm maps the daily mathematical patterns of your physical energy, emotional state, and mental clarity. Learn when to take risks and when to rest.",
    "bio.time_travel_desc": "Select a specific past or future date (e.g. an exam, meeting, or surgery) to forecast your energy levels on that exact day.",\n`
  },
  ar: {
    start: '  ar: {',
    keys: `    "bio.main_desc": "لا تترك حياتك للصدفة. يرسم الإيقاع الحيوي الأنماط الرياضية اليومية لطاقتك الجسدية، وحالتك العاطفية، ووضوحك العقلي. تعلم متى تخاطر ومتى ترتاح.",
    "bio.time_travel_desc": "حدد تاريخاً ماضياً أو مستقبلياً (مثل يوم امتحان، اجتماع، أو عملية) لتوقع مستويات طاقتك في ذلك اليوم بالضبط.",\n`
  },
  de: {
    start: '  de: {',
    keys: `    "bio.main_desc": "Überlassen Sie Ihr Leben nicht dem Zufall. Der Biorhythmus kartiert die täglichen mathematischen Muster Ihrer physischen Energie, Ihres emotionalen Zustands und Ihrer mentalen Klarheit. Lernen Sie, wann Sie Risiken eingehen und wann Sie sich ausruhen sollten.",
    "bio.time_travel_desc": "Wählen Sie ein bestimmtes vergangenes oder zukünftiges Datum (z.B. eine Prüfung, ein Meeting oder eine Operation), um Ihre Energiewerte an genau diesem Tag vorherzusagen.",\n`
  },
  fr: {
    start: '  fr: {',
    keys: `    "bio.main_desc": "Ne laissez pas votre vie au hasard. Le biorythme cartographie les modèles mathématiques quotidiens de votre énergie physique, de votre état émotionnel et de votre clarté mentale. Apprenez quand prendre des risques et quand vous reposer.",
    "bio.time_travel_desc": "Sélectionnez une date passée ou future précise (ex. un examen, une réunion ou une opération) pour prévoir vos niveaux d'énergie ce jour-là.",\n`
  }
};

for (const [lang, info] of Object.entries(locales)) {
  const parts = content.split(info.start);
  if (parts.length > 1) {
    content = parts[0] + info.start + '\n' + info.keys + parts[1];
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully injected translated descriptive keys safely!');
