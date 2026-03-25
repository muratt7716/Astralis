export interface LenormandCard {
  id: number;
  name: string;
  nameEn: string;
  nameAr?: string;
  nameDe?: string;
  nameFr?: string;
  emoji: string;
  meaning: string;
  combinationHint: string;
}

export const lenormandCards: LenormandCard[] = [
  { id: 1, name: "Binici", nameEn: "Rider", nameAr: "الفارس", nameDe: "Reiter", nameFr: "Cavalier", emoji: "🏇", meaning: "Haber, mesaj, hızlı gelişme", combinationHint: "Yanındaki kart haberin konusunu belirler" },
  { id: 2, name: "Yonca", nameEn: "Clover", nameAr: "البرسيم", nameDe: "Klee", nameFr: "Trèfle", emoji: "🍀", meaning: "Küçük şans, kısa süreli fırsat", combinationHint: "Komşu kartlara hafif şans ekler" },
  { id: 3, name: "Gemi", nameEn: "Ship", nameAr: "السفينة", nameDe: "Schiff", nameFr: "Vaisseau", emoji: "🚢", meaning: "Yolculuk, ticaret, uzak mesafe", combinationHint: "Yanındaki kartın konusu uzaklardan gelir" },
  { id: 4, name: "Ev", nameEn: "House", nameAr: "المنزل", nameDe: "Haus", nameFr: "Maison", emoji: "🏠", meaning: "Aile, güvenlik, gayrimenkul", combinationHint: "Yanındaki kartı ev/aile bağlamına taşır" },
  { id: 5, name: "Ağaç", nameEn: "Tree", nameAr: "الشجرة", nameDe: "Baum", nameFr: "Arbre", emoji: "🌳", meaning: "Sağlık, kökenler, uzun vadeli büyüme", combinationHint: "Yanındaki kartın sağlık boyutunu gösterir" },
  { id: 6, name: "Bulutlar", nameEn: "Clouds", nameAr: "السحب", nameDe: "Wolken", nameFr: "Nuages", emoji: "☁️", meaning: "Kafa karışıklığı, belirsizlik, endişe", combinationHint: "Yanındaki kartı belirsizleştirir" },
  { id: 7, name: "Yılan", nameEn: "Snake", nameAr: "الثعبان", nameDe: "Schlange", nameFr: "Serpent", emoji: "🐍", meaning: "Komplikasyon, hile, karmaşık yol", combinationHint: "Yanındaki kartı karmaşıklaştırır" },
  { id: 8, name: "Tabut", nameEn: "Coffin", nameAr: "التابوت", nameDe: "Sarg", nameFr: "Cercueil", emoji: "⚰️", meaning: "Son, dönüşüm, kapanış", combinationHint: "Yanındaki kartı sonlandırır veya dönüştürür" },
  { id: 9, name: "Buket", nameEn: "Bouquet", nameAr: "الباقة", nameDe: "Blumenstrauß", nameFr: "Bouquet", emoji: "💐", meaning: "Hediye, güzellik, iltifat, sürpriz", combinationHint: "Yanındaki kartı güzelleştirir" },
  { id: 10, name: "Tırpan", nameEn: "Scythe", nameAr: "المنجل", nameDe: "Sense", nameFr: "Faux", emoji: "🗡️", meaning: "Ani kesinti, karar, ameliyat", combinationHint: "Yanındaki kartı aniden keser" },
  { id: 11, name: "Kamçı", nameEn: "Whip", nameAr: "السوط", nameDe: "Rute", nameFr: "Verge", emoji: "🏏", meaning: "Tartışma, tekrar, fiziksel aktivite", combinationHint: "Yanındaki kartın tekrarını gösterir" },
  { id: 12, name: "Kuşlar", nameEn: "Birds", nameAr: "الطيور", nameDe: "Eulen", nameFr: "Oiseaux", emoji: "🐦", meaning: "İletişim, dedikodu, çift, endişe", combinationHint: "Yanındaki kartla ilgili konuşmalar" },
  { id: 13, name: "Çocuk", nameEn: "Child", nameAr: "الطفل", nameDe: "Kind", nameFr: "Enfant", emoji: "👶", meaning: "Yeni başlangıç, masumiyet, küçük", combinationHint: "Yanındaki kartı küçültür/yeniler" },
  { id: 14, name: "Tilki", nameEn: "Fox", nameAr: "الثعلب", nameDe: "Fuchs", nameFr: "Renard", emoji: "🦊", meaning: "Kurnazlık, iş, dikkat gerektiren durum", combinationHint: "Yanındaki kartta dikkatli olun uyarısı" },
  { id: 15, name: "Ayı", nameEn: "Bear", nameAr: "الدب", nameDe: "Bär", nameFr: "Ours", emoji: "🐻", meaning: "Güç, otorite, patron, finans", combinationHint: "Yanındaki karta güç ve otorite ekler" },
  { id: 16, name: "Yıldızlar", nameEn: "Stars", nameAr: "النجوم", nameDe: "Sterne", nameFr: "Étoiles", emoji: "✨", meaning: "Umut, ilham, maneviyat, rehberlik", combinationHint: "Yanındaki kartı aydınlatır" },
  { id: 17, name: "Leylek", nameEn: "Stork", nameAr: "اللقلق", nameDe: "Störche", nameFr: "Cigogne", emoji: "🪽", meaning: "Değişim, taşınma, hamilelik, geliş", combinationHint: "Yanındaki kartın değişimini gösterir" },
  { id: 18, name: "Köpek", nameEn: "Dog", nameAr: "الكلب", nameDe: "Hund", nameFr: "Chien", emoji: "🐕", meaning: "Sadakat, dostluk, güven", combinationHint: "Yanındaki kartın güvenilir yönünü vurgular" },
  { id: 19, name: "Kule", nameEn: "Tower", nameAr: "البرج", nameDe: "Turm", nameFr: "Tour", emoji: "🏰", meaning: "Resmi kurum, yalnızlık, yetki", combinationHint: "Yanındaki kartı resmileştirir" },
  { id: 20, name: "Bahçe", nameEn: "Garden", nameAr: "الحديقة", nameDe: "Park", nameFr: "Jardin", emoji: "🌺", meaning: "Sosyal ortam, toplantı, halk", combinationHint: "Yanındaki kartın sosyal boyutunu gösterir" },
  { id: 21, name: "Dağ", nameEn: "Mountain", nameAr: "الجبل", nameDe: "Berg", nameFr: "Montagne", emoji: "⛰️", meaning: "Engel, gecikme, blokaj", combinationHint: "Yanındaki kartı bloke eder" },
  { id: 22, name: "Yollar", nameEn: "Crossroad", nameAr: "الطرق", nameDe: "Wege", nameFr: "Chemin", emoji: "🔀", meaning: "Seçim, karar noktası, alternatifler", combinationHint: "Yanındaki kartla ilgili bir seçim var" },
  { id: 23, name: "Fare", nameEn: "Mice", nameAr: "الفئران", nameDe: "Mäuse", nameFr: "Souris", emoji: "🐀", meaning: "Stres, kayıp, yavaş erozyon", combinationHint: "Yanındaki kartı yavaşça aşındırır" },
  { id: 24, name: "Kalp", nameEn: "Heart", nameAr: "القلب", nameDe: "Herz", nameFr: "Cœur", emoji: "❤️", meaning: "Aşk, romantizm, tutku", combinationHint: "Yanındaki kartı romantik bağlama taşır" },
  { id: 25, name: "Yüzük", nameEn: "Ring", nameAr: "الخاتم", nameDe: "Ring", nameFr: "Anneau", emoji: "💍", meaning: "Sözleşme, bağlılık, evlilik, döngü", combinationHint: "Yanındaki kartı bağlayıcı hale getirir" },
  { id: 26, name: "Kitap", nameEn: "Book", nameAr: "الكتاب", nameDe: "Buch", nameFr: "Livre", emoji: "📖", meaning: "Gizem, eğitim, bilgi, sır", combinationHint: "Yanındaki kartın gizli yönünü açar" },
  { id: 27, name: "Mektup", nameEn: "Letter", nameAr: "الرسالة", nameDe: "Brief", nameFr: "Lettre", emoji: "✉️", meaning: "Belge, mesaj, yazışma", combinationHint: "Yanındaki kartla ilgili yazılı haber" },
  { id: 28, name: "Erkek", nameEn: "Man", nameAr: "الرجل", nameDe: "Herr", nameFr: "Monsieur", emoji: "👨", meaning: "Erkek figürü, eş, partner", combinationHint: "Yanındaki kartlar erkeğin durumunu gösterir" },
  { id: 29, name: "Kadın", nameEn: "Woman", nameAr: "المرأة", nameDe: "Dame", nameFr: "Dame", emoji: "👩", meaning: "Kadın figürü, eş, partner", combinationHint: "Yanındaki kartlar kadının durumunu gösterir" },
  { id: 30, name: "Zambak", nameEn: "Lily", nameAr: "الزنبق", nameDe: "Lilien", nameFr: "Lys", emoji: "🌷", meaning: "Olgunluk, huzur, cinsellik, deneyim", combinationHint: "Yanındaki kartı olgunlaştırır" },
  { id: 31, name: "Güneş", nameEn: "Sun", nameAr: "الشمس", nameDe: "Sonne", nameFr: "Soleil", emoji: "☀️", meaning: "Başarı, enerji, mutluluk, berraklık", combinationHint: "Yanındaki kartı son derece olumlu yapar" },
  { id: 32, name: "Ay", nameEn: "Moon", nameAr: "القمر", nameDe: "Mond", nameFr: "Lune", emoji: "🌙", meaning: "Duygular, şöhret, sezgi, tanınma", combinationHint: "Yanındaki kartın duygusal boyutunu gösterir" },
  { id: 33, name: "Anahtar", nameEn: "Key", nameAr: "المفتاح", nameDe: "Schlüssel", nameFr: "Clé", emoji: "🔑", meaning: "Çözüm, kesinlik, önemli gelişme", combinationHint: "Yanındaki kartın gerçekleşeceğini onaylar" },
  { id: 34, name: "Balık", nameEn: "Fish", nameAr: "السمك", nameDe: "Fische", nameFr: "Poissons", emoji: "🐟", meaning: "Para, iş, zenginlik, bolluk", combinationHint: "Yanındaki kartın finansal boyutunu gösterir" },
  { id: 35, name: "Çapa", nameEn: "Anchor", nameAr: "المرساة", nameDe: "Anker", nameFr: "Ancre", emoji: "⚓", meaning: "İstikrar, odak, iş", combinationHint: "Yanındaki kartı sabitler ve kalıcılaştırır" },
  { id: 36, name: "Haç", nameEn: "Cross", nameAr: "الصليب", nameDe: "Kreuz", nameFr: "Croix", emoji: "✝️", meaning: "Kader, yük, sınav, manevi ders", combinationHint: "Yanındaki kartı ağırlaştırır, kadersel yapar" },
];

export const lenormandSpreads = [
  { id: "three", name: "3'lü Serim", count: 3, description: "Geçmiş — Şimdi — Gelecek. Hızlı ve net.", nameKey: "fortune.tarot.spread.three", descKey: "fortune.tarot.spread.three.desc" },
  { id: "five", name: "5'li Serim", count: 5, description: "Detaylı analiz, konu etrafında geniş perspektif.", nameKey: "fortune.katina.spread.celtic", descKey: "fortune.katina.spread.celtic.desc" },
  { id: "grand", name: "Grand Tableau (9 Kart)", count: 9, description: "En kapsamlı Lenormand okuması.", nameKey: "fortune.tarot.spread.celtic", descKey: "fortune.tarot.spread.celtic.desc" },
];
