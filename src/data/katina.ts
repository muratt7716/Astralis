export interface KatinaCard {
  id: number;
  name: string;
  nameEn?: string;
  nameAr?: string;
  nameDe?: string;
  nameFr?: string;
  theme: 'yakut' | 'zumrut' | 'elmas' | 'abanoz' | 'sembol' | 'ruh';
  meaning: string;
  reversedMeaning?: string;
  element?: string;
}

export const katinaCards: KatinaCard[] = [
  // 1-4: Ruhlar (Ana Karakterler)
  { id: 1, name: "Attart", nameEn: "Attart", nameAr: "أتارت", nameDe: "Attart", nameFr: "Attart", theme: "ruh", meaning: "İyi şans, mutluluk, doğurganlık, bilgelik ve güzellik. Saf ve temiz duygular." },
  { id: 2, name: "Valide", nameEn: "Valide", nameAr: "فالد", nameDe: "Valide", nameFr: "Valide", theme: "ruh", meaning: "Güçlü ve otoriter bir kadın. Çıkar ilişkileri kuran ve kendi bildiğini okuyan yapı." },
  { id: 3, name: "Derviş", nameEn: "Dervish", nameAr: "درويش", nameDe: "Derwisch", nameFr: "Derviche", theme: "ruh", meaning: "Manevi rehberlik, bilgelik, sabır ve kendini bulma. Bekleyişin sonu." },
  { id: 4, name: "Büyücü", nameEn: "Magician", nameAr: "الساحر", nameDe: "Zauberer", nameFr: "Magicien", theme: "ruh", meaning: "Kaderi değiştirme gücü, illüzyon, manipülasyon ve etkileme." },

  // 5-18: Yakut Serisi (Ateş Elementi / Tutku ve Aşk)
  { id: 5, name: "Yakut", nameEn: "Ruby", nameAr: "ياقوت", nameDe: "Rubin", nameFr: "Rubis", theme: "yakut", element: "Ateş", meaning: "Büyük, tutkulu ve karşılıklı aşk. Ruh eşiyle birleşme, duygusal zirve." },
  { id: 6, name: "Selçuksassa", nameEn: "Selçuksassa", nameAr: "سلكوكساسا", nameDe: "Selçuksassa", nameFr: "Selçuksassa", theme: "yakut", element: "Ateş", meaning: "Arzu edilen hedefe ulaşma, cinsel çekim ve tutku." },
  { id: 7, name: "Kalif", nameEn: "Kalif", nameAr: "كاليف", nameDe: "Kalif", nameFr: "Kalif", theme: "yakut", element: "Ateş", meaning: "Yakutun Atı. Maddi zevklere düşkünlük, geçici ve tutkulu ilişkiler." },
  { id: 8, name: "Suna", nameEn: "Suna", nameAr: "سونا", nameDe: "Suna", nameFr: "Suna", theme: "yakut", element: "Ateş", meaning: "Baştan çıkarıcı, çekici ve kendine güvenen dişil enerji." },
  { id: 9, name: "Yakutun Tılsımı", nameEn: "Talisman of Ruby", nameAr: "طلسم الياقوت", nameDe: "Talisman des Rubins", nameFr: "Talisman du Rubis", theme: "yakut", element: "Ateş", meaning: "Aşkta koruma, ilişkinin güçlenmesi ve sıcaklık." },
  { id: 10, name: "Yakutun Anahtarı", nameEn: "Key of Ruby", nameAr: "مفتاح الياقوت", nameDe: "Schlüssel des Rubins", nameFr: "Clé du Rubis", theme: "yakut", element: "Ateş", meaning: "Kalbin kapılarının açılması, yeni bir aşkın başlangıcı." },
  { id: 11, name: "Yakutun Yolu", nameEn: "Path of Ruby", nameAr: "طريق الياقوت", nameDe: "Weg des Rubins", nameFr: "Chemin du Rubis", theme: "yakut", element: "Ateş", meaning: "Aşkta ilerleme, doğru kişiye doğru atılan adım." },
  { id: 12, name: "Yakutun Ağacı", nameEn: "Tree of Ruby", nameAr: "شجرة الياقوت", nameDe: "Baum des Rubins", nameFr: "Arbre du Rubis", theme: "yakut", element: "Ateş", meaning: "Köklü ve güçlü aşk, tutkunun meyve vermesi." },
  { id: 13, name: "Yakutun Dağı", nameEn: "Mountain of Ruby", nameAr: "جبل الياقوت", nameDe: "Berg des Rubins", nameFr: "Montagne du Rubis", theme: "yakut", element: "Ateş", meaning: "Aşkta aşılan büyük engeller, zorluklara rağmen süren sevgi." },
  { id: 14, name: "Yakutun Çiçeği", nameEn: "Flower of Ruby", nameAr: "زهرة الياقوت", nameDe: "Blume des Rubins", nameFr: "Fleur du Rubis", theme: "yakut", element: "Ateş", meaning: "Aşkın filizlenmesi, heyecan ve romantizm." },
  { id: 15, name: "Yakutun Yıldızı", nameEn: "Star of Ruby", nameAr: "نجمة الياقوت", nameDe: "Stern des Rubins", nameFr: "Étoile du Rubis", theme: "yakut", element: "Ateş", meaning: "Aşkta şans, umut ve parlayan bir gelecek." },
  { id: 16, name: "Yakutun Ayı", nameEn: "Moon of Ruby", nameAr: "قمر الياقوت", nameDe: "Mond des Rubins", nameFr: "Lune du Rubis", theme: "yakut", element: "Ateş", meaning: "Aşkta sezgiler, gizli duyguların ortaya çıkması." },
  { id: 17, name: "Yakutun Güneşi", nameEn: "Sun of Ruby", nameAr: "شمس الياقوت", nameDe: "Sonne des Rubins", nameFr: "Soleil du Rubis", theme: "yakut", element: "Ateş", meaning: "Aşkta netlik, sevinç, aydınlık ve sıcaklık." },
  { id: 18, name: "Yakutun Evi", nameEn: "House of Ruby", nameAr: "بيت الياقوت", nameDe: "Haus des Rubins", nameFr: "Maison du Rubis", theme: "yakut", element: "Ateş", meaning: "Aşkta huzur, evlilik veya aynı evi paylaşmak." },

  // 19-32: Zümrüt Serisi (Su Elementi / Duygu ve Şifa)
  { id: 19, name: "Zümrüt", nameEn: "Emerald", nameAr: "زمرد", nameDe: "Smaragd", nameFr: "Émeraude", theme: "zumrut", element: "Su", meaning: "Şifa, aşkta başarı ve sağlıkta iyileşme. Kötü durumdan toparlanma." },
  { id: 20, name: "Mida", nameEn: "Mida", nameAr: "ميدا", nameDe: "Mida", nameFr: "Mida", theme: "zumrut", element: "Su", meaning: "Zümrüdün Hanımı. Kıskanç, güvenilmez ve mutsuz bir kadın." },
  { id: 21, name: "Hesse", nameEn: "Hesse", nameAr: "هيسي", nameDe: "Hesse", nameFr: "Hesse", theme: "zumrut", element: "Su", meaning: "Kendi içine dönük, durgun ve melankolik su enerjisi." },
  { id: 22, name: "İshafan", nameEn: "Ishafan", nameAr: "إصفهان", nameDe: "Isfahan", nameFr: "Ispahan", theme: "zumrut", element: "Su", meaning: "Geçmişin yüklerinden kurtulma, arınma ve temizlenme." },
  { id: 23, name: "Zümrüdün Tılsımı", nameEn: "Talisman of Emerald", nameAr: "طلسم الزمرد", nameDe: "Talisman des Smaragds", nameFr: "Talisman de l'Émeraude", theme: "zumrut", element: "Su", meaning: "Duygusal koruma, yaraların sarılması." },
  { id: 24, name: "Zümrüdün Balığı", nameEn: "Fish of Emerald", nameAr: "سمكة الزمرد", nameDe: "Fisch des Smaragds", nameFr: "Poisson de l'Émeraude", theme: "zumrut", element: "Su", meaning: "Duygusal bereket, akışta kalma ve kısmet." },
  { id: 25, name: "Zümrüdün Yelkenlisi", nameEn: "Sailboat of Emerald", nameAr: "شراع الزمرد", nameDe: "Segelboot des Smaragds", nameFr: "Voilier de l'Émeraude", theme: "zumrut", element: "Su", meaning: "Duygusal yolculuk, yeni sulara yelken açma." },
  { id: 26, name: "Zümrüdün Gülü", nameEn: "Rose of Emerald", nameAr: "وردة الزمرد", nameDe: "Rose des Smaragds", nameFr: "Rose de l'Émeraude", theme: "zumrut", element: "Su", meaning: "Derin sevgi, estetik ve duygusal tatmin." },
  { id: 27, name: "Zümrüdün Çapası", nameEn: "Anchor of Emerald", nameAr: "مرساة الزمرد", nameDe: "Anker des Smaragds", nameFr: "Ancre de l'Émeraude", theme: "zumrut", element: "Su", meaning: "Duygusal bağlılık, güven ve sadakat." },
  { id: 28, name: "Zümrüdün Kulesi", nameEn: "Tower of Emerald", nameAr: "برج الزمرد", nameDe: "Turm des Smaragds", nameFr: "Tour de l'Émeraude", theme: "zumrut", element: "Su", meaning: "Duygusal izolasyon, yalnızlık ve korunma ihtiyacı." },
  { id: 29, name: "Zümrüdün Kuşu", nameEn: "Bird of Emerald", nameAr: "طائر الزمرد", nameDe: "Vogel des Smaragds", nameFr: "Oiseau de l'Émeraude", theme: "zumrut", element: "Su", meaning: "Duygusal haberler, sevgi dolu mesajlar." },
  { id: 30, name: "Zümrüdün Yılanı", nameEn: "Snake of Emerald", nameAr: "ثعبان الزمرد", nameDe: "Schlange des Smaragds", nameFr: "Serpent de l'Émeraude", theme: "zumrut", element: "Su", meaning: "Duygusal ihanet, sinsi kurnazlıklar." },
  { id: 31, name: "Zümrüdün Çocuğu", nameEn: "Child of Emerald", nameAr: "طفل الزمرد", nameDe: "Kind des Smaragds", nameFr: "Enfant de l'Émeraude", theme: "zumrut", element: "Su", meaning: "Duygusal masumiyet, yeni ve saf bir başlangıç." },
  { id: 32, name: "Zümrüdün Leyleği", nameEn: "Stork of Emerald", nameAr: "لقلق الزمرد", nameDe: "Storch des Smaragds", nameFr: "Cigogne de l'Émeraude", theme: "zumrut", element: "Su", meaning: "Duygusal değişim, hamilelik veya taşınma." },

  // 33-46: Elmas Serisi (Hava Elementi / Zihin ve İletişim)
  { id: 33, name: "Elmas", nameEn: "Diamond", nameAr: "الماس", nameDe: "Diamant", nameFr: "Diamant", theme: "elmas", element: "Hava", meaning: "Maddi zenginlik, başarı, zeka, para ve mal sahibi olmak." },
  { id: 34, name: "Dastar", nameEn: "Dastar", nameAr: "دستار", nameDe: "Dastar", nameFr: "Dastar", theme: "elmas", element: "Hava", meaning: "Elmasın Hanımı. Güçlü, hareketli, çalışkan ve çıkar ilişkisi kuran yapı." },
  { id: 35, name: "Munzur", nameEn: "Munzur", nameAr: "منذر", nameDe: "Munzur", nameFr: "Munzur", theme: "elmas", element: "Hava", meaning: "Ani haberler, beklenmedik iletişim veya tartışmalar." },
  { id: 36, name: "Turhan", nameEn: "Turhan", nameAr: "تورهان", nameDe: "Turhan", nameFr: "Turhan", theme: "elmas", element: "Hava", meaning: "Zihinsel netlik, hedefe odaklanma ve stratejik düşünme." },
  { id: 37, name: "Elmasın Tılsımı", nameEn: "Talisman of Diamond", nameAr: "طلسم الماس", nameDe: "Talisman des Diamanten", nameFr: "Talisman du Diamant", theme: "elmas", element: "Hava", meaning: "Zihinsel koruma, kurnazca yapılan planlardan sakınma." },
  { id: 38, name: "Elmasın Kitabı", nameEn: "Book of Diamond", nameAr: "كتاب الماس", nameDe: "Buch des Diamanten", nameFr: "Livre du Diamant", theme: "elmas", element: "Hava", meaning: "Sırların açığa çıkması, gizli belgeler veya resmi işler." },
  { id: 39, name: "Elmasın Mektubu", nameEn: "Letter of Diamond", nameAr: "رسالة الماس", nameDe: "Brief des Diamanten", nameFr: "Lettre du Diamant", theme: "elmas", element: "Hava", meaning: "Önemli yazılı sözleşmeler, mesajlar veya belgeler." },
  { id: 40, name: "Elmasın Yüzüğü", nameEn: "Ring of Diamond", nameAr: "خاتم الماس", nameDe: "Ring des Diamanten", nameFr: "Bague du Diamant", theme: "elmas", element: "Hava", meaning: "Resmiyet kazanan ilişkiler, nişan veya imzalı anlaşma." },
  { id: 41, name: "Elmasın Köpeği", nameEn: "Dog of Diamond", nameAr: "كلب الماس", nameDe: "Hund des Diamanten", nameFr: "Chien du Diamant", theme: "elmas", element: "Hava", meaning: "Düşünsel sadakat, güvenilir bir dost tavsiyesi." },
  { id: 42, name: "Elmasın Kaması", nameEn: "Dagger of Diamond", nameAr: "خنجر الماس", nameDe: "Dolch des Diamanten", nameFr: "Poignard du Diamant", theme: "elmas", element: "Hava", meaning: "Zihinsel saldırı, keskin sözler ve ani bitişler." },
  { id: 43, name: "Elmasın Süpürgesi", nameEn: "Broom of Diamond", nameAr: "مكنسة الماس", nameDe: "Besen des Diamanten", nameFr: "Balai du Diamant", theme: "elmas", element: "Hava", meaning: "Zihinsel dağınıklığı temizleme, sorunları çözme." },
  { id: 44, name: "Elmasın Haçı", nameEn: "Cross of Diamond", nameAr: "صليب الماس", nameDe: "Kreuz des Diamanten", nameFr: "Croix du Diamant", theme: "elmas", element: "Hava", meaning: "Ağır zihinsel yük, vicdan azabı veya zihinsel kriz." },
  { id: 45, name: "Elmasın Baykuşu", nameEn: "Owl of Diamond", nameAr: "بومة الماس", nameDe: "Eule des Diamanten", nameFr: "Hibou du Diamant", theme: "elmas", element: "Hava", meaning: "Derin sezgilerle gelen zihinsel aydınlanma ve bilgelik." },
  { id: 46, name: "Elmasın Tilkisi", nameEn: "Fox of Diamond", nameAr: "ثعلب الماس", nameDe: "Fuchs des Diamanten", nameFr: "Renard du Diamant", theme: "elmas", element: "Hava", meaning: "Kurnazlık, dikkat gerektiren zekice oyunlar." },

  // 47-59: Abanoz Serisi (Toprak Elementi / Maddiyat ve Zorluklar)
  { id: 47, name: "Abanoz", nameEn: "Ebony", nameAr: "أبنوس", nameDe: "Ebenholz", nameFr: "Ébène", theme: "abanoz", element: "Toprak", meaning: "Büyük sıkıntılar, üzüntü, öfke, bitişler ve yapısal krizler." },
  { id: 48, name: "Tattaret", nameEn: "Tattaret", nameAr: "تتارت", nameDe: "Tattaret", nameFr: "Tattaret", theme: "abanoz", element: "Toprak", meaning: "Abanozun Hanımı. Kötücül enerji, engeller ve inatçı kadın figürü." },
  { id: 49, name: "Selana", nameEn: "Selana", nameAr: "سيلانا", nameDe: "Selana", nameFr: "Selana", theme: "abanoz", element: "Toprak", meaning: "Çift karakterlilik, güvenilmez toprak enerjisi, gizli niyetler." },
  { id: 50, name: "Bedes", nameEn: "Bedes", nameAr: "بيديس", nameDe: "Bedes", nameFr: "Bedes", theme: "abanoz", element: "Toprak", meaning: "Fiziksel zorluklar, yorgunluk ve engellerle mücadele." },
  { id: 51, name: "Abanozun Çarkı", nameEn: "Wheel of Ebony", nameAr: "عجلة الأبنوس", nameDe: "Rad des Ebenholzes", nameFr: "Roue de l'Ébène", theme: "abanoz", element: "Toprak", meaning: "Zorlu bir dönemin başlangıcı, karmik sınavlar." },
  { id: 52, name: "Abanozun Leyleği", nameEn: "Stork of Ebony", nameAr: "لقلق الأبنوس", nameDe: "Storch des Ebenholzes", nameFr: "Cigogne de l'Ébène", theme: "abanoz", element: "Toprak", meaning: "Kaçınılmaz ve zorlu değişim, geciken taşınma." },
  { id: 53, name: "Abanozun İp", nameEn: "Rope of Ebony", nameAr: "حبل الأبنوس", nameDe: "Seil des Ebenholzes", nameFr: "Corde de l'Ébène", theme: "abanoz", element: "Toprak", meaning: "Bağımlılıklar, takıntılar ve çözülmesi gereken bağlar." },
  { id: 54, name: "Abanozun Bulutu", nameEn: "Cloud of Ebony", nameAr: "سحابة الأبنوس", nameDe: "Wolke des Ebenholzes", nameFr: "Nuage de l'Ébène", theme: "abanoz", element: "Toprak", meaning: "Maddi konularda belirsizlik, sisli düşünceler." },
  { id: 55, name: "Abanozun Yatağanı", nameEn: "Scimitar of Ebony", nameAr: "سيف الأبنوس", nameDe: "Yatagan des Ebenholzes", nameFr: "Cimeterre de l'Ébène", theme: "abanoz", element: "Toprak", meaning: "Kesin ve acı verici bitiş, krizin zirvesi." },
  { id: 56, name: "Abanozun Çölü", nameEn: "Desert of Ebony", nameAr: "صحراء الأبنوس", nameDe: "Wüste des Ebenholzes", nameFr: "Désert de l'Ébène", theme: "abanoz", element: "Toprak", meaning: "Yalnızlık, bereketsizlik, ilişkide kuraklık dönemi." },
  { id: 57, name: "Abanozun Mezarı", nameEn: "Grave of Ebony", nameAr: "قبر الأبنوس", nameDe: "Grab des Ebenholzes", nameFr: "Tombe de l'Ébène", theme: "abanoz", element: "Toprak", meaning: "Tamamen biten ve geri dönüşü olmayan bir durum." },
  { id: 58, name: "Abanozun Faresi", nameEn: "Mouse of Ebony", nameAr: "فأر الأبنوس", nameDe: "Maus des Ebenholzes", nameFr: "Souris de l'Ébène", theme: "abanoz", element: "Toprak", meaning: "Maddi kayıplar, sinsi düşmanlar ve yıpranma." },
  { id: 59, name: "Abanozun Karı", nameEn: "Snow of Ebony", nameAr: "ثلج الأبنوس", nameDe: "Schnee des Ebenholzes", nameFr: "Neige de l'Ébène", theme: "abanoz", element: "Toprak", meaning: "Duyguların donması, soğukluk ve iletişim kopukluğu." },

  // 60-65: Temel Semboller
  { id: 60, name: "Afyon", nameEn: "Opium", nameAr: "أفيون", nameDe: "Opium", nameFr: "Opium", theme: "sembol", meaning: "Çekilen acıların geçici olarak dinmesi, bağımlılık, uyuşukluk." },
  { id: 61, name: "Zaman", nameEn: "Time", nameAr: "الوقت", nameDe: "Zeit", nameFr: "Temps", theme: "sembol", meaning: "Sabır göstermek gereken bir durum, zamanın iyileştirici gücü." },
  { id: 62, name: "Nil", nameEn: "Nile", nameAr: "النيل", nameDe: "Nil", nameFr: "Nil", theme: "sembol", meaning: "Hayatın akışı, verimlilik, büyük ve güçlü bir başlangıç." },
  { id: 63, name: "Samyeli", nameEn: "Samyeli", nameAr: "ساميلي", nameDe: "Samyeli", nameFr: "Samyeli", theme: "sembol", meaning: "Geçici fırtınalar, aniden esen sıcak rüzgar, heyecanlı bir haber." },
  { id: 64, name: "Deve", nameEn: "Camel", nameAr: "جمل", nameDe: "Kamel", nameFr: "Chameau", theme: "sembol", meaning: "Şiddetli arzu, uyum sağlama, sabrın sonunda ödüllendirilmesi." },
  { id: 65, name: "Ayna", nameEn: "Mirror", nameAr: "مرآة", nameDe: "Spiegel", nameFr: "Miroir", theme: "sembol", meaning: "Kendinle yüzleşme, gerçeği görme ve illüzyonların yıkılması." }
];

export const katinaSpreads = [
  {
    id: 'tek-kart',
    name: 'Günün Kartı',
    nameKey: 'fortune.katina.spread.single',
    description: 'Aşk hayatınızla ilgili günlük enerjiyi ve hızlı bir mesajı gösterir.',
    descKey: 'fortune.katina.spread.single.desc',
    cardCount: 1,
    positions: ['Günün Enerjisi']
  },
  {
    id: 'uc-kart',
    name: 'İlişki Serimi',
    nameKey: 'fortune.katina.spread.three',
    description: 'Siz, partneriniz ve ilişkinizin gidişatı hakkında net bilgiler sunar.',
    descKey: 'fortune.katina.spread.three.desc',
    cardCount: 3,
    positions: ['Sizin Duygularınız', 'Partnerin Karşılığı', 'İlişkinin Geleceği']
  },
  {
    id: 'imparator-haci',
    name: 'Katina Haçı',
    nameKey: 'fortune.katina.spread.celtic',
    description: 'Geçmiş, şu an, engeller ve nihai sonuca detaylı bir bakış atar.',
    descKey: 'fortune.katina.spread.celtic.desc',
    cardCount: 5,
    positions: ['Geçmişin Etkisi', 'Şu Anki Durum', 'Bilinçaltı', 'Karşılaşılan Engel', 'Muhtemel Sonuç']
  }
];
