export interface KatinaCard {
  id: number;
  name: string;
  theme: 'yakut' | 'zumrut' | 'elmas' | 'abanoz' | 'sembol' | 'ruh';
  meaning: string;
  reversedMeaning?: string;
  element?: string;
}

export const katinaCards: KatinaCard[] = [
  // 1-4: Ruhlar (Ana Karakterler)
  { id: 1, name: "Attart", theme: "ruh", meaning: "İyi şans, mutluluk, doğurganlık, bilgelik ve güzellik. Saf ve temiz duygular." },
  { id: 2, name: "Valide", theme: "ruh", meaning: "Güçlü ve otoriter bir kadın. Çıkar ilişkileri kuran ve kendi bildiğini okuyan yapı." },
  { id: 3, name: "Derviş", theme: "ruh", meaning: "Manevi rehberlik, bilgelik, sabır ve kendini bulma. Bekleyişin sonu." },
  { id: 4, name: "Büyücü", theme: "ruh", meaning: "Kaderi değiştirme gücü, illüzyon, manipülasyon ve etkileme." },

  // 5-18: Yakut Serisi (Ateş Elementi / Tutku ve Aşk)
  { id: 5, name: "Yakut", theme: "yakut", element: "Ateş", meaning: "Büyük, tutkulu ve karşılıklı aşk. Ruh eşiyle birleşme, duygusal zirve." },
  { id: 6, name: "Selçuksassa", theme: "yakut", element: "Ateş", meaning: "Arzu edilen hedefe ulaşma, cinsel çekim ve tutku." },
  { id: 7, name: "Kalif", theme: "yakut", element: "Ateş", meaning: "Yakutun Atı. Maddi zevklere düşkünlük, geçici ve tutkulu ilişkiler." },
  { id: 8, name: "Suna", theme: "yakut", element: "Ateş", meaning: "Baştan çıkarıcı, çekici ve kendine güvenen dişil enerji." },
  { id: 9, name: "Yakutun Tılsımı", theme: "yakut", element: "Ateş", meaning: "Aşkta koruma, ilişkinin güçlenmesi ve sıcaklık." },
  { id: 10, name: "Yakutun Anahtarı", theme: "yakut", element: "Ateş", meaning: "Kalbin kapılarının açılması, yeni bir aşkın başlangıcı." },
  { id: 11, name: "Yakutun Yolu", theme: "yakut", element: "Ateş", meaning: "Aşkta ilerleme, doğru kişiye doğru atılan adım." },
  { id: 12, name: "Yakutun Ağacı", theme: "yakut", element: "Ateş", meaning: "Köklü ve güçlü aşk, tutkunun meyve vermesi." },
  { id: 13, name: "Yakutun Dağı", theme: "yakut", element: "Ateş", meaning: "Aşkta aşılan büyük engeller, zorluklara rağmen süren sevgi." },
  { id: 14, name: "Yakutun Çiçeği", theme: "yakut", element: "Ateş", meaning: "Aşkın filizlenmesi, heyecan ve romantizm." },
  { id: 15, name: "Yakutun Yıldızı", theme: "yakut", element: "Ateş", meaning: "Aşkta şans, umut ve parlayan bir gelecek." },
  { id: 16, name: "Yakutun Ayı", theme: "yakut", element: "Ateş", meaning: "Aşkta sezgiler, gizli duyguların ortaya çıkması." },
  { id: 17, name: "Yakutun Güneşi", theme: "yakut", element: "Ateş", meaning: "Aşkta netlik, sevinç, aydınlık ve sıcaklık." },
  { id: 18, name: "Yakutun Evi", theme: "yakut", element: "Ateş", meaning: "Aşkta huzur, evlilik veya aynı evi paylaşmak." },

  // 19-32: Zümrüt Serisi (Su Elementi / Duygu ve Şifa)
  { id: 19, name: "Zümrüt", theme: "zumrut", element: "Su", meaning: "Şifa, aşkta başarı ve sağlıkta iyileşme. Kötü durumdan toparlanma." },
  { id: 20, name: "Mida", theme: "zumrut", element: "Su", meaning: "Zümrüdün Hanımı. Kıskanç, güvenilmez ve mutsuz bir kadın." },
  { id: 21, name: "Hesse", theme: "zumrut", element: "Su", meaning: "Kendi içine dönük, durgun ve melankolik su enerjisi." },
  { id: 22, name: "İshafan", theme: "zumrut", element: "Su", meaning: "Geçmişin yüklerinden kurtulma, arınma ve temizlenme." },
  { id: 23, name: "Zümrüdün Tılsımı", theme: "zumrut", element: "Su", meaning: "Duygusal koruma, yaraların sarılması." },
  { id: 24, name: "Zümrüdün Balığı", theme: "zumrut", element: "Su", meaning: "Duygusal bereket, akışta kalma ve kısmet." },
  { id: 25, name: "Zümrüdün Yelkenlisi", theme: "zumrut", element: "Su", meaning: "Duygusal yolculuk, yeni sulara yelken açma." },
  { id: 26, name: "Zümrüdün Gülü", theme: "zumrut", element: "Su", meaning: "Derin sevgi, estetik ve duygusal tatmin." },
  { id: 27, name: "Zümrüdün Çapası", theme: "zumrut", element: "Su", meaning: "Duygusal bağlılık, güven ve sadakat." },
  { id: 28, name: "Zümrüdün Kulesi", theme: "zumrut", element: "Su", meaning: "Duygusal izolasyon, yalnızlık ve korunma ihtiyacı." },
  { id: 29, name: "Zümrüdün Kuşu", theme: "zumrut", element: "Su", meaning: "Duygusal haberler, sevgi dolu mesajlar." },
  { id: 30, name: "Zümrüdün Yılanı", theme: "zumrut", element: "Su", meaning: "Duygusal ihanet, sinsi kurnazlıklar." },
  { id: 31, name: "Zümrüdün Çocuğu", theme: "zumrut", element: "Su", meaning: "Duygusal masumiyet, yeni ve saf bir başlangıç." },
  { id: 32, name: "Zümrüdün Leyleği", theme: "zumrut", element: "Su", meaning: "Duygusal değişim, hamilelik veya taşınma." },

  // 33-46: Elmas Serisi (Hava Elementi / Zihin ve İletişim)
  { id: 33, name: "Elmas", theme: "elmas", element: "Hava", meaning: "Maddi zenginlik, başarı, zeka, para ve mal sahibi olmak." },
  { id: 34, name: "Dastar", theme: "elmas", element: "Hava", meaning: "Elmasın Hanımı. Güçlü, hareketli, çalışkan ve çıkar ilişkisi kuran yapı." },
  { id: 35, name: "Munzur", theme: "elmas", element: "Hava", meaning: "Ani haberler, beklenmedik iletişim veya tartışmalar." },
  { id: 36, name: "Turhan", theme: "elmas", element: "Hava", meaning: "Zihinsel netlik, hedefe odaklanma ve stratejik düşünme." },
  { id: 37, name: "Elmasın Tılsımı", theme: "elmas", element: "Hava", meaning: "Zihinsel koruma, kurnazca yapılan planlardan sakınma." },
  { id: 38, name: "Elmasın Kitabı", theme: "elmas", element: "Hava", meaning: "Sırların açığa çıkması, gizli belgeler veya resmi işler." },
  { id: 39, name: "Elmasın Mektubu", theme: "elmas", element: "Hava", meaning: "Önemli yazılı sözleşmeler, mesajlar veya belgeler." },
  { id: 40, name: "Elmasın Yüzüğü", theme: "elmas", element: "Hava", meaning: "Resmiyet kazanan ilişkiler, nişan veya imzalı anlaşma." },
  { id: 41, name: "Elmasın Köpeği", theme: "elmas", element: "Hava", meaning: "Düşünsel sadakat, güvenilir bir dost tavsiyesi." },
  { id: 42, name: "Elmasın Kaması", theme: "elmas", element: "Hava", meaning: "Zihinsel saldırı, keskin sözler ve ani bitişler." },
  { id: 43, name: "Elmasın Süpürgesi", theme: "elmas", element: "Hava", meaning: "Zihinsel dağınıklığı temizleme, sorunları çözme." },
  { id: 44, name: "Elmasın Haçı", theme: "elmas", element: "Hava", meaning: "Ağır zihinsel yük, vicdan azabı veya zihinsel kriz." },
  { id: 45, name: "Elmasın Baykuşu", theme: "elmas", element: "Hava", meaning: "Derin sezgilerle gelen zihinsel aydınlanma ve bilgelik." },
  { id: 46, name: "Elmasın Tilkisi", theme: "elmas", element: "Hava", meaning: "Kurnazlık, dikkat gerektiren zekice oyunlar." },

  // 47-59: Abanoz Serisi (Toprak Elementi / Maddiyat ve Zorluklar)
  { id: 47, name: "Abanoz", theme: "abanoz", element: "Toprak", meaning: "Büyük sıkıntılar, üzüntü, öfke, bitişler ve yapısal krizler." },
  { id: 48, name: "Tattaret", theme: "abanoz", element: "Toprak", meaning: "Abanozun Hanımı. Kötücül enerji, engeller ve inatçı kadın figürü." },
  { id: 49, name: "Selana", theme: "abanoz", element: "Toprak", meaning: "Çift karakterlilik, güvenilmez toprak enerjisi, gizli niyetler." },
  { id: 50, name: "Bedes", theme: "abanoz", element: "Toprak", meaning: "Fiziksel zorluklar, yorgunluk ve engellerle mücadele." },
  { id: 51, name: "Abanozun Çarkı", theme: "abanoz", element: "Toprak", meaning: "Zorlu bir dönemin başlangıcı, karmik sınavlar." },
  { id: 52, name: "Abanozun Leyleği", theme: "abanoz", element: "Toprak", meaning: "Kaçınılmaz ve zorlu değişim, geciken taşınma." },
  { id: 53, name: "Abanozun İp", theme: "abanoz", element: "Toprak", meaning: "Bağımlılıklar, takıntılar ve çözülmesi gereken bağlar." },
  { id: 54, name: "Abanozun Bulutu", theme: "abanoz", element: "Toprak", meaning: "Maddi konularda belirsizlik, sisli düşünceler." },
  { id: 55, name: "Abanozun Yatağanı", theme: "abanoz", element: "Toprak", meaning: "Kesin ve acı verici bitiş, krizin zirvesi." },
  { id: 56, name: "Abanozun Çölü", theme: "abanoz", element: "Toprak", meaning: "Yalnızlık, bereketsizlik, ilişkide kuraklık dönemi." },
  { id: 57, name: "Abanozun Mezarı", theme: "abanoz", element: "Toprak", meaning: "Tamamen biten ve geri dönüşü olmayan bir durum." },
  { id: 58, name: "Abanozun Faresi", theme: "abanoz", element: "Toprak", meaning: "Maddi kayıplar, sinsi düşmanlar ve yıpranma." },
  { id: 59, name: "Abanozun Karı", theme: "abanoz", element: "Toprak", meaning: "Duyguların donması, soğukluk ve iletişim kopukluğu." },

  // 60-65: Temel Semboller
  { id: 60, name: "Afyon", theme: "sembol", meaning: "Çekilen acıların geçici olarak dinmesi, bağımlılık, uyuşukluk." },
  { id: 61, name: "Zaman", theme: "sembol", meaning: "Sabır göstermek gereken bir durum, zamanın iyileştirici gücü." },
  { id: 62, name: "Nil", theme: "sembol", meaning: "Hayatın akışı, verimlilik, büyük ve güçlü bir başlangıç." },
  { id: 63, name: "Samyeli", theme: "sembol", meaning: "Geçici fırtınalar, aniden esen sıcak rüzgar, heyecanlı bir haber." },
  { id: 64, name: "Deve", theme: "sembol", meaning: "Şiddetli arzu, uyum sağlama, sabrın sonunda ödüllendirilmesi." },
  { id: 65, name: "Ayna", theme: "sembol", meaning: "Kendinle yüzleşme, gerçeği görme ve illüzyonların yıkılması." }
];

export const katinaSpreads = [
  {
    id: 'tek-kart',
    name: 'Günün Kartı (1 Kart)',
    description: 'Aşk hayatınızla ilgili günlük enerjiyi ve hızlı bir mesajı gösterir.',
    cardCount: 1,
    positions: ['Günün Enerjisi']
  },
  {
    id: 'uc-kart',
    name: 'İlişki Serimi (3 Kart)',
    description: 'Siz, partneriniz ve ilişkinizin gidişatı hakkında net bilgiler sunar.',
    cardCount: 3,
    positions: ['Sizin Duygularınız', 'Partnerin Karşılığı', 'İlişkinin Geleceği']
  },
  {
    id: 'imparator-haci',
    name: 'Katina Haçı (5 Kart)',
    description: 'Geçmiş, şu an, engeller ve nihai sonuca detaylı bir bakış atar.',
    cardCount: 5,
    positions: ['Geçmişin Etkisi', 'Şu Anki Durum', 'Bilinçaltı', 'Karşılaşılan Engel', 'Muhtemel Sonuç']
  }
];
