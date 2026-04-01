/**
 * Advanced Neuro-Psychological Numerological Compatibility Logic
 * Incorporates Jungian Shadow Projection and Neurochemical Resonance principles.
 */

export type CompatibilityResult = {
  score: number; // 0-100
  typeId: 'soulmate' | 'harmonious' | 'challenging' | 'neutral';
  type: string;
  description: string;
};

/**
 * Calculates neuro-astrological and numerological compatibility between two single/master numbers.
 */
export function getLifePathCompatibility(lp1: number, lp2: number, lang: string = 'tr'): CompatibilityResult {
  let score = 50;
  let typeId: CompatibilityResult['typeId'] = 'neutral';
  
  // Localized defaults (fallback)
  const defaults: Record<string, { type: string, desc: string }> = {
    tr: { type: 'Nötr / Otonom', desc: 'Dengeli ve bilinçli çaba gerektiren bir kortikal (mantıksal) bağ.' },
    en: { type: 'Neutral / Autonomous', desc: 'A cortical (logical) bond requiring balanced and conscious effort.' },
    ar: { type: 'محايد / مستقل', desc: 'رابط قشري (منطقي) يتطلب جهداً متوازناً وواعياً.' },
    de: { type: 'Neutral / Autonom', desc: 'Eine kortikale (logische) Bindung, die ausgewogene ve bewusste Anstrengung erfordert.' },
    fr: { type: 'Neutre / Autonome', desc: 'Un lien cortical (logique) nécessitant un effort équilibré et conscient.' }
  };

  const d = defaults[lang] || defaults.tr;
  let type = d.type;
  let description = d.desc;

  // A simple map of natural matches, compatible, and challenging for core numbers 1-9
  // Upgraded to reflect Psychological types (Introverted/Extroverted, Feeling/Thinking)
  const compatMatrix: Record<number, { natural: number[], toxic: number[], soul: number[] }> = {
    1: { natural: [3, 5], soul: [1, 9], toxic: [2, 4, 6, 8] },
    2: { natural: [4, 8, 6], soul: [2], toxic: [1, 5, 7, 9] },
    3: { natural: [1, 5, 7], soul: [3, 6, 9], toxic: [4, 8] },
    4: { natural: [2, 6, 8], soul: [4, 7], toxic: [1, 3, 5, 9] },
    5: { natural: [1, 3, 7], soul: [5], toxic: [2, 4, 6] },
    6: { natural: [2, 4, 8], soul: [3, 6, 9], toxic: [1, 5, 7] },
    7: { natural: [3, 5], soul: [4, 7], toxic: [2, 6, 8, 9] },
    8: { natural: [2, 4, 6], soul: [8], toxic: [1, 3, 7, 9] },
    9: { natural: [3, 6], soul: [1, 9], toxic: [2, 4, 7, 8] },
    11: { natural: [2, 4, 6, 8], soul: [11, 22, 33], toxic: [1, 5, 7] },
    22: { natural: [2, 6, 8, 11, 33], soul: [4, 22], toxic: [1, 5, 7, 9] },
    33: { natural: [3, 6, 9], soul: [33, 11, 22], toxic: [1, 5, 7] }
  };

  const matrix1 = compatMatrix[lp1] || compatMatrix[String(lp1).split('').reduce((a,b)=>a+parseInt(b),0)];
  
  if (!matrix1) return { score, typeId, type, description };

  if (matrix1.soul.includes(lp2)) {
    score = 95;
    typeId = 'soulmate';
    const dict: any = {
      tr: { t: 'Kuantum Bağlantısı (Ruh İkizi)', d: "Arketiplerinizin yuvaya dönüşü. Ayna nöronlarınız birbirini kelimesiz düzeyde okuyabiliyor. Bu bağ, Jungian anlamda Anima ve Animus'unuzun mükemmel bir hizalanmasıdır." },
      en: { t: 'Quantum Connection (Soulmate)', d: "A homecoming of your archetypes. Your mirror neurons can read each other at a wordless level. This bond is a perfect alignment of Anima and Animus." },
      ar: { t: 'اتصال الكم (رفيق الروح)', d: "عودة نماذجك البدائية إلى الوطن. يمكن للخلايا العصبية المرآتية قراءة بعضها البعض دون كلمات." },
      de: { t: 'Quantenverbindung (Seelenverwandte)', d: "Eine Heimkehr deiner Archetypen. Deine Spiegelneuronen können einander wortlos lesen." },
      fr: { t: 'Connexion Quantique (Âme Sœur)', d: "Un retour aux sources de vos archétypes. Vos neurones miroirs peuvent se lire mutuellement sans paroles." }
    };
    type = dict[lang]?.t || dict.tr.t;
    description = dict[lang]?.d || dict.tr.d;
  } else if (matrix1.natural.includes(lp2)) {
    score = 80;
    typeId = 'harmonious';
    const dict: any = {
      tr: { t: 'Oksitosin Rezonansı (Uyumlu)', d: "Limbik sistemleriniz birbiriyle savaşmadan, güven içinde oksitosin sentezleyebiliyor. Şifalı bir birliktelik." },
      en: { t: 'Oxytocin Resonance (Harmonious)', d: "Your limbic systems can synthesize oxytocin in trust without fighting each other. A healing partnership." },
      ar: { t: 'رنين الأوكسيتوسين (متناغم)', d: "يمكن لأنظمة الطرفي الخاصة بك تصنيع الأوكسيتوسين بثقة دون قتال بعضها البعض." },
      de: { t: 'Oxytocin-Resonanz (Harmonisch)', d: "Eure limbischen Systeme können Oxytocin im Vertrauen synthetisieren, ohne einander zu bekämpfen." },
      fr: { t: 'Résonance Oxytocine (Harmonieux)', d: "Vos systèmes limbiques peuvent synthétiser de l'oxytocine en toute confiance sans s'affronter." }
    };
    type = dict[lang]?.t || dict.tr.t;
    description = dict[lang]?.d || dict.tr.d;
  } else if (matrix1.toxic.includes(lp2)) {
    score = 35;
    typeId = 'challenging';
    const dict: any = {
      tr: { t: 'Karmik / Gölge Projeksiyonu', d: "Bastırdığınız karanlık yönleri (Gölge Benlik) birbirinize yansıtıyorsunuz. Devasa bir Nöroplastisite (İyileşme) sınavıdır." },
      en: { t: 'Karmic / Shadow Projection', d: "You project your suppressed dark aspects onto each other. This is a massive Neuroplasticity (Healing) test." },
      ar: { t: 'كرمي / إسقاط الظل', d: "أنت تسقط جوانبك المظلمة المكبوتة على بعضكما البعض. هذا اختبار ضخم للمرونة العصبية." },
      de: { t: 'Karmische / Schattenprojektion', d: "Ihr projiziert eure unterdrückten dunklen Aspekte aufeinander. Dies ist ein massiver Neuroplastizitätstest." },
      fr: { t: 'Karmique / Projection de l\'Ombre', d: "Vous projetez vos aspects sombres refoulés l'un sur l'autre. C'est un test massif de neuroplasticité." }
    };
    type = dict[lang]?.t || dict.tr.t;
    description = dict[lang]?.d || dict.tr.d;
  }

  return { score, typeId, type, description };
}

/**
 * Overall synastry based on Life Path and Expression
 */
export function getFullNumerologySynastry(p1LP: number, p1Exp: number, p2LP: number, p2Exp: number, lang: string = 'tr') {
  const lpCompat = getLifePathCompatibility(p1LP, p2LP, lang);
  const expCompat = getLifePathCompatibility(p1Exp, p2Exp, lang); 
  
  // Weight Life Path more (Life Path 60%, Expression 40%)
  const totalScore = Math.round((lpCompat.score * 0.6) + (expCompat.score * 0.4));

  return {
    lifePathResult: lpCompat,
    expressionResult: expCompat,
    totalScore
  };
}
