export interface LenormandCard {
  id: number;
  name: string;
  nameEn: string;
  emoji: string;
  meaning: string;
  combinationHint: string;
}

export const lenormandCards: LenormandCard[] = [
  { id: 1, name: "Binici", nameEn: "Rider", emoji: "🏇", meaning: "Haber, mesaj, hızlı gelişme", combinationHint: "Yanındaki kart haberin konusunu belirler" },
  { id: 2, name: "Yonca", nameEn: "Clover", emoji: "🍀", meaning: "Küçük şans, kısa süreli fırsat", combinationHint: "Komşu kartlara hafif şans ekler" },
  { id: 3, name: "Gemi", nameEn: "Ship", emoji: "🚢", meaning: "Yolculuk, ticaret, uzak mesafe", combinationHint: "Yanındaki kartın konusu uzaklardan gelir" },
  { id: 4, name: "Ev", nameEn: "House", emoji: "🏠", meaning: "Aile, güvenlik, gayrimenkul", combinationHint: "Yanındaki kartı ev/aile bağlamına taşır" },
  { id: 5, name: "Ağaç", nameEn: "Tree", emoji: "🌳", meaning: "Sağlık, kökenler, uzun vadeli büyüme", combinationHint: "Yanındaki kartın sağlık boyutunu gösterir" },
  { id: 6, name: "Bulutlar", nameEn: "Clouds", emoji: "☁️", meaning: "Kafa karışıklığı, belirsizlik, endişe", combinationHint: "Yanındaki kartı belirsizleştirir" },
  { id: 7, name: "Yılan", nameEn: "Snake", emoji: "🐍", meaning: "Komplikasyon, hile, karmaşık yol", combinationHint: "Yanındaki kartı karmaşıklaştırır" },
  { id: 8, name: "Tabut", nameEn: "Coffin", emoji: "⚰️", meaning: "Son, dönüşüm, kapanış", combinationHint: "Yanındaki kartı sonlandırır veya dönüştürür" },
  { id: 9, name: "Buket", nameEn: "Bouquet", emoji: "💐", meaning: "Hediye, güzellik, iltifat, sürpriz", combinationHint: "Yanındaki kartı güzelleştirir" },
  { id: 10, name: "Tırpan", nameEn: "Scythe", emoji: "🗡️", meaning: "Ani kesinti, karar, ameliyat", combinationHint: "Yanındaki kartı aniden keser" },
  { id: 11, name: "Kamçı", nameEn: "Whip", emoji: "🏏", meaning: "Tartışma, tekrar, fiziksel aktivite", combinationHint: "Yanındaki kartın tekrarını gösterir" },
  { id: 12, name: "Kuşlar", nameEn: "Birds", emoji: "🐦", meaning: "İletişim, dedikodu, çift, endişe", combinationHint: "Yanındaki kartla ilgili konuşmalar" },
  { id: 13, name: "Çocuk", nameEn: "Child", emoji: "👶", meaning: "Yeni başlangıç, masumiyet, küçük", combinationHint: "Yanındaki kartı küçültür/yeniler" },
  { id: 14, name: "Tilki", nameEn: "Fox", emoji: "🦊", meaning: "Kurnazlık, iş, dikkat gerektiren durum", combinationHint: "Yanındaki kartta dikkatli olun uyarısı" },
  { id: 15, name: "Ayı", nameEn: "Bear", emoji: "🐻", meaning: "Güç, otorite, patron, finans", combinationHint: "Yanındaki karta güç ve otorite ekler" },
  { id: 16, name: "Yıldızlar", nameEn: "Stars", emoji: "✨", meaning: "Umut, ilham, maneviyat, rehberlik", combinationHint: "Yanındaki kartı aydınlatır" },
  { id: 17, name: "Leylek", nameEn: "Stork", emoji: "🪽", meaning: "Değişim, taşınma, hamilelik, geliş", combinationHint: "Yanındaki kartın değişimini gösterir" },
  { id: 18, name: "Köpek", nameEn: "Dog", emoji: "🐕", meaning: "Sadakat, dostluk, güven", combinationHint: "Yanındaki kartın güvenilir yönünü vurgular" },
  { id: 19, name: "Kule", nameEn: "Tower", emoji: "🏰", meaning: "Resmi kurum, yalnızlık, yetki", combinationHint: "Yanındaki kartı resmileştirir" },
  { id: 20, name: "Bahçe", nameEn: "Garden", emoji: "🌺", meaning: "Sosyal ortam, toplantı, halk", combinationHint: "Yanındaki kartın sosyal boyutunu gösterir" },
  { id: 21, name: "Dağ", nameEn: "Mountain", emoji: "⛰️", meaning: "Engel, gecikme, blokaj", combinationHint: "Yanındaki kartı bloke eder" },
  { id: 22, name: "Yollar", nameEn: "Crossroad", emoji: "🔀", meaning: "Seçim, karar noktası, alternatifler", combinationHint: "Yanındaki kartla ilgili bir seçim var" },
  { id: 23, name: "Fare", nameEn: "Mice", emoji: "🐀", meaning: "Stres, kayıp, yavaş erozyon", combinationHint: "Yanındaki kartı yavaşça aşındırır" },
  { id: 24, name: "Kalp", nameEn: "Heart", emoji: "❤️", meaning: "Aşk, romantizm, tutku", combinationHint: "Yanındaki kartı romantik bağlama taşır" },
  { id: 25, name: "Yüzük", nameEn: "Ring", emoji: "💍", meaning: "Sözleşme, bağlılık, evlilik, döngü", combinationHint: "Yanındaki kartı bağlayıcı hale getirir" },
  { id: 26, name: "Kitap", nameEn: "Book", emoji: "📖", meaning: "Gizem, eğitim, bilgi, sır", combinationHint: "Yanındaki kartın gizli yönünü açar" },
  { id: 27, name: "Mektup", nameEn: "Letter", emoji: "✉️", meaning: "Belge, mesaj, yazışma", combinationHint: "Yanındaki kartla ilgili yazılı haber" },
  { id: 28, name: "Erkek", nameEn: "Man", emoji: "👨", meaning: "Erkek figürü, eş, partner", combinationHint: "Yanındaki kartlar erkeğin durumunu gösterir" },
  { id: 29, name: "Kadın", nameEn: "Woman", emoji: "👩", meaning: "Kadın figürü, eş, partner", combinationHint: "Yanındaki kartlar kadının durumunu gösterir" },
  { id: 30, name: "Zambak", nameEn: "Lily", emoji: "🌷", meaning: "Olgunluk, huzur, cinsellik, deneyim", combinationHint: "Yanındaki kartı olgunlaştırır" },
  { id: 31, name: "Güneş", nameEn: "Sun", emoji: "☀️", meaning: "Başarı, enerji, mutluluk, berraklık", combinationHint: "Yanındaki kartı son derece olumlu yapar" },
  { id: 32, name: "Ay", nameEn: "Moon", emoji: "🌙", meaning: "Duygular, şöhret, sezgi, tanınma", combinationHint: "Yanındaki kartın duygusal boyutunu gösterir" },
  { id: 33, name: "Anahtar", nameEn: "Key", emoji: "🔑", meaning: "Çözüm, kesinlik, önemli gelişme", combinationHint: "Yanındaki kartın gerçekleşeceğini onaylar" },
  { id: 34, name: "Balık", nameEn: "Fish", emoji: "🐟", meaning: "Para, iş, zenginlik, bolluk", combinationHint: "Yanındaki kartın finansal boyutunu gösterir" },
  { id: 35, name: "Çapa", nameEn: "Anchor", emoji: "⚓", meaning: "İstikrar, odak, iş", combinationHint: "Yanındaki kartı sabitler ve kalıcılaştırır" },
  { id: 36, name: "Haç", nameEn: "Cross", emoji: "✝️", meaning: "Kader, yük, sınav, manevi ders", combinationHint: "Yanındaki kartı ağırlaştırır, kadersel yapar" },
];

export const lenormandSpreads = [
  { id: "three", name: "3'lü Serim", count: 3, description: "Geçmiş — Şimdi — Gelecek. Hızlı ve net." },
  { id: "five", name: "5'li Serim", count: 5, description: "Detaylı analiz, konu etrafında geniş perspektif." },
  { id: "grand", name: "Grand Tableau (9 Kart)", count: 9, description: "En kapsamlı Lenormand okuması." },
];
