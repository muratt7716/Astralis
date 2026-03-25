export interface Rune {
  id: number;
  name: string;
  symbol: string;
  meaning: string;
  reversed: string;
  element: string;
  keywords: string;
}

export const elderFutharkRunes: Rune[] = [
  { id: 1, name: "Fehu", symbol: "ᚠ", meaning: "Zenginlik, bolluk, maddi kazanç", reversed: "Kayıp, hayal kırıklığı, açgözlülük", element: "Ateş", keywords: "para, mülk, başarı" },
  { id: 2, name: "Uruz", symbol: "ᚢ", meaning: "Güç, sağlık, fiziksel enerji", reversed: "Zayıflık, hastalık, fırsatı kaçırma", element: "Toprak", keywords: "dayanıklılık, cesaret" },
  { id: 3, name: "Thurisaz", symbol: "ᚦ", meaning: "Savunma, koruma, engellerle yüzleşme", reversed: "Tehlike, savunmasızlık, düşmanlık", element: "Ateş", keywords: "sınır, güç, mücadele" },
  { id: 4, name: "Ansuz", symbol: "ᚨ", meaning: "İlham, bilgelik, iletişim", reversed: "Yanlış anlaşılma, bilgi kirliliği", element: "Hava", keywords: "söz, mesaj, öğretmen" },
  { id: 5, name: "Raidho", symbol: "ᚱ", meaning: "Yolculuk, hareket, ilerleme", reversed: "Gecikme, beklenmedik engel", element: "Hava", keywords: "seyahat, rota, ritim" },
  { id: 6, name: "Kenaz", symbol: "ᚲ", meaning: "Bilgi, aydınlanma, yaratıcılık", reversed: "Karanlık, cehalet, tıkanıklık", element: "Ateş", keywords: "ışık, sanat, tutku" },
  { id: 7, name: "Gebo", symbol: "ᚷ", meaning: "Hediye, ortaklık, cömertlik", reversed: "(Ters anlamı yoktur)", element: "Hava", keywords: "paylaşım, denge, bağ" },
  { id: 8, name: "Wunjo", symbol: "ᚹ", meaning: "Neşe, mutluluk, uyum", reversed: "Hüzün, yabancılaşma, kriz", element: "Toprak", keywords: "sevinç, başarı, refah" },
  { id: 9, name: "Hagalaz", symbol: "ᚺ", meaning: "Yıkım, kaçınılmaz değişim, doğa gücü", reversed: "(Ters anlamı yoktur)", element: "Su", keywords: "fırtına, arınma, kader" },
  { id: 10, name: "Nauthiz", symbol: "ᚾ", meaning: "İhtiyaç, kısıtlama, direniş", reversed: "(Ters anlamı yoktur)", element: "Ateş", keywords: "sabır, disiplin, gereklilik" },
  { id: 11, name: "Isa", symbol: "ᛁ", meaning: "Durağanlık, buz, bekleyiş", reversed: "(Ters anlamı yoktur)", element: "Su", keywords: "dondurma, durma, içsel süreç" },
  { id: 12, name: "Jera", symbol: "ᛃ", meaning: "Hasat, döngü, ödüllendirme", reversed: "(Ters anlamı yoktur)", element: "Toprak", keywords: "mevsim, sabır, emek" },
  { id: 13, name: "Eihwaz", symbol: "ᛇ", meaning: "Dayanıklılık, dönüşüm, güvenilirlik", reversed: "(Ters anlamı yoktur)", element: "Hava", keywords: "kök, omurga, direnç" },
  { id: 14, name: "Perthro", symbol: "ᛈ", meaning: "Gizem, şans, kader", reversed: "Sır, beklenmedik sonuç", element: "Su", keywords: "kader çarkı, sürpriz" },
  { id: 15, name: "Algiz", symbol: "ᛉ", meaning: "Koruma, savunma, uyanıklık", reversed: "Gizli tehlike, savunma düşüklüğü", element: "Hava", keywords: "kalkan, sezgi, güvenlik" },
  { id: 16, name: "Sowilo", symbol: "ᛊ", meaning: "Güneş, zafer, pozitif enerji", reversed: "(Ters anlamı yoktur)", element: "Ateş", keywords: "başarı, aydınlık, güç" },
  { id: 17, name: "Tiwaz", symbol: "ᛏ", meaning: "Onur, adalet, liderlik", reversed: "Adaletsizlik, enerji kaybı", element: "Hava", keywords: "savaşçı, cesaret, fedakarlık" },
  { id: 18, name: "Berkano", symbol: "ᛒ", meaning: "Doğum, yenilenme, büyüme", reversed: "Durgunluk, aile sorunları", element: "Toprak", keywords: "anne, bereket, başlangıç" },
  { id: 19, name: "Ehwaz", symbol: "ᛖ", meaning: "Ortaklık, hareket, güven", reversed: "Güvensizlik, huzursuzluk", element: "Toprak", keywords: "at, yolculuk, seyahat" },
  { id: 20, name: "Mannaz", symbol: "ᛗ", meaning: "İnsanlık, benlik, topluluk", reversed: "Yalnızlık, iç çatışma", element: "Hava", keywords: "birey, kimlik, akıl" },
  { id: 21, name: "Laguz", symbol: "ᛚ", meaning: "Su, sezgi, bilinçaltı, akış", reversed: "Duygusal kaos, korku", element: "Su", keywords: "rüya, his, derinlik" },
  { id: 22, name: "Ingwaz", symbol: "ᛜ", meaning: "Tohum, potansiyel, iç huzur", reversed: "(Ters anlamı yoktur)", element: "Toprak", keywords: "üretkenlik, tamamlanma" },
  { id: 23, name: "Dagaz", symbol: "ᛞ", meaning: "Şafak, uyanış, dönüm noktası", reversed: "(Ters anlamı yoktur)", element: "Ateş", keywords: "aydınlanma, dönüşüm" },
  { id: 24, name: "Othala", symbol: "ᛟ", meaning: "Miras, kökenler, aile, mülk", reversed: "Köklerden kopma, aile sorunları", element: "Toprak", keywords: "ev, gelenek, aidiyet" },
];

export const runeSpreads = [
  { id: "odin", name: "Odin'in Çekilişi", count: 1, description: "Tek rün. Günlük rehberlik ve hızlı cevap." },
  { id: "norns", name: "Nornlar (3'lü)", count: 3, description: "Geçmiş (Urd) — Şimdi (Verdandi) — Gelecek (Skuld)." },
];
