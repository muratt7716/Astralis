export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  emoji: string;
  arcana: "major" | "minor";
  suit?: string;
  upright: string;
  reversed: string;
  element?: string;
}

export const tarotCards: TarotCard[] = [
  // ===== MAJOR ARCANA (0-21) =====
  { id: 0, name: "Deli (The Fool)", nameEn: "The Fool", emoji: "🃏", arcana: "major", upright: "Yeni başlangıçlar, masumiyet, spontanlık", reversed: "Dikkatsizlik, risk alma, deneyimsizlik", element: "Hava" },
  { id: 1, name: "Büyücü (The Magician)", nameEn: "The Magician", emoji: "🎩", arcana: "major", upright: "İrade gücü, yaratıcılık, ustalık", reversed: "Manipülasyon, yeteneklerin kötüye kullanımı", element: "Hava" },
  { id: 2, name: "Başrahibe (High Priestess)", nameEn: "The High Priestess", emoji: "🌙", arcana: "major", upright: "Sezgi, bilinçaltı, gizem", reversed: "Bastırılmış duygular, gizli gündemler", element: "Su" },
  { id: 3, name: "İmparatoriçe (The Empress)", nameEn: "The Empress", emoji: "👑", arcana: "major", upright: "Bereket, annelik, doğa", reversed: "Bağımlılık, boşluk, yaratıcı tıkanıklık", element: "Toprak" },
  { id: 4, name: "İmparator (The Emperor)", nameEn: "The Emperor", emoji: "🏛️", arcana: "major", upright: "Otorite, yapı, liderlik", reversed: "Tiranlık, katılık, kontrol", element: "Ateş" },
  { id: 5, name: "Başrahip (Hierophant)", nameEn: "The Hierophant", emoji: "⛪", arcana: "major", upright: "Gelenek, maneviyat, rehberlik", reversed: "Dogma, uyumsuzluk, isyan", element: "Toprak" },
  { id: 6, name: "Aşıklar (The Lovers)", nameEn: "The Lovers", emoji: "💕", arcana: "major", upright: "Aşk, uyum, seçimler", reversed: "Dengesizlik, uyumsuzluk, yanlış seçim", element: "Hava" },
  { id: 7, name: "Savaş Arabası (The Chariot)", nameEn: "The Chariot", emoji: "🏇", arcana: "major", upright: "Zafer, irade, kararlılık", reversed: "Saldırganlık, yön kaybı", element: "Su" },
  { id: 8, name: "Güç (Strength)", nameEn: "Strength", emoji: "🦁", arcana: "major", upright: "Cesaret, sabır, iç güç", reversed: "Güvensizlik, zayıflık, şüphe", element: "Ateş" },
  { id: 9, name: "Ermiş (The Hermit)", nameEn: "The Hermit", emoji: "🏔️", arcana: "major", upright: "İç arayış, yalnızlık, bilgelik", reversed: "Yalıtılmışlık, paranoya", element: "Toprak" },
  { id: 10, name: "Kader Çarkı (Wheel of Fortune)", nameEn: "Wheel of Fortune", emoji: "🎡", arcana: "major", upright: "Şans, döngüler, kader", reversed: "Kötü şans, direnç, kontrol kaybı", element: "Ateş" },
  { id: 11, name: "Adalet (Justice)", nameEn: "Justice", emoji: "⚖️", arcana: "major", upright: "Adalet, dürüstlük, hukuk", reversed: "Adaletsizlik, sahtekarlık", element: "Hava" },
  { id: 12, name: "Asılan Adam (The Hanged Man)", nameEn: "The Hanged Man", emoji: "🙃", arcana: "major", upright: "Teslimiyet, farklı bakış açısı, bekleme", reversed: "Gecikme, direnç, feda", element: "Su" },
  { id: 13, name: "Ölüm (Death)", nameEn: "Death", emoji: "💀", arcana: "major", upright: "Dönüşüm, son, yeni başlangıç", reversed: "Değişime direnç, durgunluk", element: "Su" },
  { id: 14, name: "Denge (Temperance)", nameEn: "Temperance", emoji: "⚗️", arcana: "major", upright: "Denge, sabır, ılımlılık", reversed: "Dengesizlik, aşırılık", element: "Ateş" },
  { id: 15, name: "Şeytan (The Devil)", nameEn: "The Devil", emoji: "😈", arcana: "major", upright: "Bağımlılık, tutku, gölge ben", reversed: "Özgürleşme, bağlardan kurtulma", element: "Toprak" },
  { id: 16, name: "Kule (The Tower)", nameEn: "The Tower", emoji: "🗼", arcana: "major", upright: "Ani değişim, yıkım, uyanış", reversed: "Felaketten kaçınma, korku", element: "Ateş" },
  { id: 17, name: "Yıldız (The Star)", nameEn: "The Star", emoji: "⭐", arcana: "major", upright: "Umut, ilham, huzur", reversed: "Umutsuzluk, hayal kırıklığı", element: "Hava" },
  { id: 18, name: "Ay (The Moon)", nameEn: "The Moon", emoji: "🌕", arcana: "major", upright: "Yanılsama, korku, bilinçaltı", reversed: "Korkunun üstesinden gelme, netlik", element: "Su" },
  { id: 19, name: "Güneş (The Sun)", nameEn: "The Sun", emoji: "☀️", arcana: "major", upright: "Mutluluk, başarı, canlılık", reversed: "Geçici mutluluk, aşırı iyimserlik", element: "Ateş" },
  { id: 20, name: "Mahkeme (Judgement)", nameEn: "Judgement", emoji: "📯", arcana: "major", upright: "Yargılama, yeniden doğuş, çağrı", reversed: "Özeleştiri, pişmanlık", element: "Ateş" },
  { id: 21, name: "Dünya (The World)", nameEn: "The World", emoji: "🌍", arcana: "major", upright: "Tamamlanma, başarı, bütünlük", reversed: "Eksiklik, gecikme, tamamlanamamış işler", element: "Toprak" },

  // ===== MINOR ARCANA — CUPS (Su) =====
  { id: 22, name: "Kupaların Ası", nameEn: "Ace of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Yeni aşk, duygusal başlangıç", reversed: "Duygusal boşluk, bastırılmış hisler" },
  { id: 23, name: "Kupaların İkisi", nameEn: "Two of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Ortaklık, karşılıklı çekim", reversed: "Dengesiz ilişki, ayrılık" },
  { id: 24, name: "Kupaların Üçü", nameEn: "Three of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Kutlama, dostluk, topluluk", reversed: "Aşırılık, dedikodu" },
  { id: 25, name: "Kupaların Dördü", nameEn: "Four of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Meditasyon, değerlendirme, ilgisizlik", reversed: "Fırsatı kaçırma, bezginlik" },
  { id: 26, name: "Kupaların Beşi", nameEn: "Five of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Kayıp, pişmanlık, yas", reversed: "Kabul, iyileşme, ilerleme" },
  { id: 27, name: "Kupaların Altısı", nameEn: "Six of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Nostalji, çocukluk anıları, masumiyet", reversed: "Geçmişe takılma, gerçekçi olmama" },
  { id: 28, name: "Kupaların Yedisi", nameEn: "Seven of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Hayaller, seçenekler, fantezi", reversed: "Yanılsama, kararsızlık" },
  { id: 29, name: "Kupaların Sekizi", nameEn: "Eight of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Bırakıp gitme, arayış, hayal kırıklığı", reversed: "Kaçış korkusu, sıkışmışlık" },
  { id: 30, name: "Kupaların Dokuzu", nameEn: "Nine of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Dilek kartı, tatmin, bolluk", reversed: "Açgözlülük, tatminsizlik" },
  { id: 31, name: "Kupaların Onu", nameEn: "Ten of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Aile mutluluğu, uyum, huzur", reversed: "Aile içi sorunlar, yıkık hayaller" },
  { id: 32, name: "Kupaların Prensi", nameEn: "Page of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Yaratıcı mesajlar, sezgisel genç", reversed: "Duygusal olgunlaşma ihtiyacı" },
  { id: 33, name: "Kupaların Şövalyesi", nameEn: "Knight of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Romantizm, cazibe, teklif", reversed: "Hayal kırıklığı, gerçekçi olmayan beklentiler" },
  { id: 34, name: "Kupaların Kraliçesi", nameEn: "Queen of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Şefkat, sezgi, duygusal güvenlik", reversed: "Duygusal manipülasyon, güvensizlik" },
  { id: 35, name: "Kupaların Kralı", nameEn: "King of Cups", emoji: "🏆", arcana: "minor", suit: "cups", upright: "Duygusal olgunluk, diplomasi, bilgelik", reversed: "Duygusal soğukluk, manipülasyon" },

  // ===== MINOR ARCANA — WANDS (Ateş) =====
  { id: 36, name: "Asaların Ası", nameEn: "Ace of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "İlham, yeni proje, yaratıcı enerji", reversed: "Gecikme, motivasyon kaybı" },
  { id: 37, name: "Asaların İkisi", nameEn: "Two of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Planlama, gelecek vizyonu, keşif", reversed: "Korku, plansızlık" },
  { id: 38, name: "Asaların Üçü", nameEn: "Three of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Genişleme, ilerleme, öngörü", reversed: "Hayal kırıklığı, gecikme" },
  { id: 39, name: "Asaların Dördü", nameEn: "Four of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Kutlama, istikrar, ev", reversed: "Geçiş dönemi, huzursuzluk" },
  { id: 40, name: "Asaların Beşi", nameEn: "Five of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Rekabet, çatışma, mücadele", reversed: "Çatışmadan kaçınma, iç çatışma" },
  { id: 41, name: "Asaların Altısı", nameEn: "Six of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Zafer, tanınma, başarı", reversed: "Ego, kibirlilik, düşüş" },
  { id: 42, name: "Asaların Yedisi", nameEn: "Seven of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Savunma, azim, meydan okuma", reversed: "Teslim olma, bunalmışlık" },
  { id: 43, name: "Asaların Sekizi", nameEn: "Eight of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Hız, hareket, ani gelişmeler", reversed: "Gecikme, sabırsızlık" },
  { id: 44, name: "Asaların Dokuzu", nameEn: "Nine of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Dayanıklılık, cesaret, son sınav", reversed: "Yorgunluk, paranoya" },
  { id: 45, name: "Asaların Onu", nameEn: "Ten of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Yük, sorumluluk, tükenmişlik", reversed: "Yükü bırakma, delegasyon" },
  { id: 46, name: "Asaların Prensi", nameEn: "Page of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Macera, keşif, coşku", reversed: "Yüzeysellik, yönsüzlük" },
  { id: 47, name: "Asaların Şövalyesi", nameEn: "Knight of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Enerji, tutku, macera", reversed: "Düşüncesizlik, sabırsızlık" },
  { id: 48, name: "Asaların Kraliçesi", nameEn: "Queen of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Özgüven, bağımsızlık, karizma", reversed: "Bencillik, kıskançlık" },
  { id: 49, name: "Asaların Kralı", nameEn: "King of Wands", emoji: "🪄", arcana: "minor", suit: "wands", upright: "Liderlik, vizyon, girişimcilik", reversed: "Despotluk, acelecilik" },

  // ===== MINOR ARCANA — SWORDS (Hava) =====
  { id: 50, name: "Kılıçların Ası", nameEn: "Ace of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Netlik, gerçek, zihinsel güç", reversed: "Karmaşa, yanlış anlaşılma" },
  { id: 51, name: "Kılıçların İkisi", nameEn: "Two of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Karar verememe, çıkmaz, denge", reversed: "Bilgi aşırılığı, duygusal karar" },
  { id: 52, name: "Kılıçların Üçü", nameEn: "Three of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Kalp kırıklığı, acı, ayrılık", reversed: "İyileşme, affetme" },
  { id: 53, name: "Kılıçların Dördü", nameEn: "Four of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Dinlenme, meditasyon, iyileşme", reversed: "Huzursuzluk, tükenmişlik" },
  { id: 54, name: "Kılıçların Beşi", nameEn: "Five of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Çatışma, yenilgi, kayıp", reversed: "Uzlaşma, af" },
  { id: 55, name: "Kılıçların Altısı", nameEn: "Six of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Geçiş, yolculuk, iyileşme", reversed: "Sıkışmışlık, çözümsüzlük" },
  { id: 56, name: "Kılıçların Yedisi", nameEn: "Seven of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Hile, strateji, kaçış", reversed: "İtiraf, vicdan azabı" },
  { id: 57, name: "Kılıçların Sekizi", nameEn: "Eight of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Hapsolmuşluk, kısıtlama, endişe", reversed: "Özgürleşme, yeni bakış açısı" },
  { id: 58, name: "Kılıçların Dokuzu", nameEn: "Nine of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Kaygı, kabus, suçluluk", reversed: "İyileşme, umut, yardım alma" },
  { id: 59, name: "Kılıçların Onu", nameEn: "Ten of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Son, yıkım, kaçınılmaz değişim", reversed: "Yeniden doğuş, en kötü geride kaldı" },
  { id: 60, name: "Kılıçların Prensi", nameEn: "Page of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Merak, zeka, yeni fikirler", reversed: "Dedikodu, acelecilik" },
  { id: 61, name: "Kılıçların Şövalyesi", nameEn: "Knight of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Hız, hırs, mantık", reversed: "Düşüncesizlik, saldırganlık" },
  { id: 62, name: "Kılıçların Kraliçesi", nameEn: "Queen of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Bağımsızlık, keskin zeka, dürüstlük", reversed: "Soğukluk, acımasızlık" },
  { id: 63, name: "Kılıçların Kralı", nameEn: "King of Swords", emoji: "⚔️", arcana: "minor", suit: "swords", upright: "Zihinsel otorite, etik, adalet", reversed: "Diktatörlük, duygusuzluk" },

  // ===== MINOR ARCANA — PENTACLES (Toprak) =====
  { id: 64, name: "Tılsımların Ası", nameEn: "Ace of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Yeni finansal fırsat, bolluk, sağlık", reversed: "Kaçırılan fırsat, maddi kayıp" },
  { id: 65, name: "Tılsımların İkisi", nameEn: "Two of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Denge, uyum, esneklik", reversed: "Dengesizlik, aşırı yüklenme" },
  { id: 66, name: "Tılsımların Üçü", nameEn: "Three of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Takım çalışması, ustalık, planlama", reversed: "Uyumsuzluk, kalite eksikliği" },
  { id: 67, name: "Tılsımların Dördü", nameEn: "Four of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Güvenlik, tasarruf, kontrol", reversed: "Cimrilik, maddi bağımlılık" },
  { id: 68, name: "Tılsımların Beşi", nameEn: "Five of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Zorluk, yoksulluk, hastalık", reversed: "İyileşme, ruhani zenginlik" },
  { id: 69, name: "Tılsımların Altısı", nameEn: "Six of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Cömertlik, hayırseverlik, paylaşım", reversed: "Borç, eşitsizlik" },
  { id: 70, name: "Tılsımların Yedisi", nameEn: "Seven of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Sabır, yatırım, uzun vadeli vizyon", reversed: "Sabırsızlık, kötü yatırım" },
  { id: 71, name: "Tılsımların Sekizi", nameEn: "Eight of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Çalışkanlık, ustalık, özveri", reversed: "Mükemmeliyetçilik, monotonluk" },
  { id: 72, name: "Tılsımların Dokuzu", nameEn: "Nine of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Lüks, özgüven, bağımsızlık", reversed: "Maddi bağımlılık, gösterişçilik" },
  { id: 73, name: "Tılsımların Onu", nameEn: "Ten of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Miras, aile serveti, sürdürülebilirlik", reversed: "Finansal kayıp, aile anlaşmazlıkları" },
  { id: 74, name: "Tılsımların Prensi", nameEn: "Page of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Öğrenme, yeni beceri, fırsat", reversed: "Odak kaybı, tembellik" },
  { id: 75, name: "Tılsımların Şövalyesi", nameEn: "Knight of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Güvenilirlik, sabır, çalışkanlık", reversed: "Durgunluk, aşırı tutuculuk" },
  { id: 76, name: "Tılsımların Kraliçesi", nameEn: "Queen of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Pratiklik, konfor, güvenlik", reversed: "Maddecilik, iş-yaşam dengesizliği" },
  { id: 77, name: "Tılsımların Kralı", nameEn: "King of Pentacles", emoji: "🪙", arcana: "minor", suit: "pentacles", upright: "Zenginlik, iş başarısı, güvenlik", reversed: "Açgözlülük, materyalizm" },
];

export const tarotSpreads = [
  { id: "single", name: "Tek Kart", nameEn: "Single Card", count: 1, description: "Hızlı bir cevap ve günlük rehberlik." },
  { id: "three", name: "3'lü Serim", nameEn: "Three Card Spread", count: 3, description: "Geçmiş — Şimdi — Gelecek." },
  { id: "celtic", name: "Celtic Cross", nameEn: "Celtic Cross", count: 10, description: "En kapsamlı ve detaylı serim." },
];
