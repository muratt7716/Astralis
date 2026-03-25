export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  dateRange: string;
  startDate: { month: number; day: number };
  endDate: { month: number; day: number };
  element: string;
  elementEmoji: string;
  quality: string;
  rulingPlanet: string;
  rulingPlanetEmoji: string;
  luckyNumbers: number[];
  luckyDay: string;
  luckyColor: string;
  compatibility: string[];
}

export const zodiacSigns: ZodiacSign[] = [
  {
    id: "koc",
    name: "Koç",
    symbol: "♈",
    emoji: "🐏",
    dateRange: "21 Mart - 19 Nisan",
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 19 },
    element: "Ateş",
    elementEmoji: "🔥",
    quality: "Öncü",
    rulingPlanet: "Mars",
    rulingPlanetEmoji: "♂️",
    luckyNumbers: [1, 8, 17],
    luckyDay: "Salı",
    luckyColor: "Kırmızı",
    compatibility: ["aslan", "yay", "ikizler", "kova"]
  },
  {
    id: "boga",
    name: "Boğa",
    symbol: "♉",
    emoji: "🐂",
    dateRange: "20 Nisan - 20 Mayıs",
    startDate: { month: 4, day: 20 },
    endDate: { month: 5, day: 20 },
    element: "Toprak",
    elementEmoji: "🌍",
    quality: "Sabit",
    rulingPlanet: "Venüs",
    rulingPlanetEmoji: "♀️",
    luckyNumbers: [2, 6, 9, 12],
    luckyDay: "Cuma",
    luckyColor: "Yeşil",
    compatibility: ["basak", "oglak", "yengec", "balik"]
  },
  {
    id: "ikizler",
    name: "İkizler",
    symbol: "♊",
    emoji: "👯",
    dateRange: "21 Mayıs - 20 Haziran",
    startDate: { month: 5, day: 21 },
    endDate: { month: 6, day: 20 },
    element: "Hava",
    elementEmoji: "💨",
    quality: "Değişken",
    rulingPlanet: "Merkür",
    rulingPlanetEmoji: "☿️",
    luckyNumbers: [5, 7, 14, 23],
    luckyDay: "Çarşamba",
    luckyColor: "Sarı",
    compatibility: ["terazi", "kova", "koc", "aslan"]
  },
  {
    id: "yengec",
    name: "Yengeç",
    symbol: "♋",
    emoji: "🦀",
    dateRange: "21 Haziran - 22 Temmuz",
    startDate: { month: 6, day: 21 },
    endDate: { month: 7, day: 22 },
    element: "Su",
    elementEmoji: "💧",
    quality: "Öncü",
    rulingPlanet: "Ay",
    rulingPlanetEmoji: "🌙",
    luckyNumbers: [2, 3, 15, 20],
    luckyDay: "Pazartesi",
    luckyColor: "Gümüş",
    compatibility: ["akrep", "balik", "boga", "basak"]
  },
  {
    id: "aslan",
    name: "Aslan",
    symbol: "♌",
    emoji: "🦁",
    dateRange: "23 Temmuz - 22 Ağustos",
    startDate: { month: 7, day: 23 },
    endDate: { month: 8, day: 22 },
    element: "Ateş",
    elementEmoji: "🔥",
    quality: "Sabit",
    rulingPlanet: "Güneş",
    rulingPlanetEmoji: "☀️",
    luckyNumbers: [1, 3, 10, 19],
    luckyDay: "Pazar",
    luckyColor: "Altın",
    compatibility: ["koc", "yay", "ikizler", "terazi"]
  },
  {
    id: "basak",
    name: "Başak",
    symbol: "♍",
    emoji: "👩‍🌾",
    dateRange: "23 Ağustos - 22 Eylül",
    startDate: { month: 8, day: 23 },
    endDate: { month: 9, day: 22 },
    element: "Toprak",
    elementEmoji: "🌍",
    quality: "Değişken",
    rulingPlanet: "Merkür",
    rulingPlanetEmoji: "☿️",
    luckyNumbers: [5, 14, 15, 23],
    luckyDay: "Çarşamba",
    luckyColor: "Lacivert",
    compatibility: ["boga", "oglak", "yengec", "akrep"]
  },
  {
    id: "terazi",
    name: "Terazi",
    symbol: "♎",
    emoji: "⚖️",
    dateRange: "23 Eylül - 22 Ekim",
    startDate: { month: 9, day: 23 },
    endDate: { month: 10, day: 22 },
    element: "Hava",
    elementEmoji: "💨",
    quality: "Öncü",
    rulingPlanet: "Venüs",
    rulingPlanetEmoji: "♀️",
    luckyNumbers: [4, 6, 13, 24],
    luckyDay: "Cuma",
    luckyColor: "Pembe",
    compatibility: ["ikizler", "kova", "aslan", "yay"]
  },
  {
    id: "akrep",
    name: "Akrep",
    symbol: "♏",
    emoji: "🦂",
    dateRange: "23 Ekim - 21 Kasım",
    startDate: { month: 10, day: 23 },
    endDate: { month: 11, day: 21 },
    element: "Su",
    elementEmoji: "💧",
    quality: "Sabit",
    rulingPlanet: "Plüton",
    rulingPlanetEmoji: "🔮",
    luckyNumbers: [8, 11, 18, 22],
    luckyDay: "Salı",
    luckyColor: "Bordo",
    compatibility: ["yengec", "balik", "basak", "oglak"]
  },
  {
    id: "yay",
    name: "Yay",
    symbol: "♐",
    emoji: "🏹",
    dateRange: "22 Kasım - 21 Aralık",
    startDate: { month: 11, day: 22 },
    endDate: { month: 12, day: 21 },
    element: "Ateş",
    elementEmoji: "🔥",
    quality: "Değişken",
    rulingPlanet: "Jüpiter",
    rulingPlanetEmoji: "♃",
    luckyNumbers: [3, 7, 9, 12],
    luckyDay: "Perşembe",
    luckyColor: "Mor",
    compatibility: ["koc", "aslan", "terazi", "kova"]
  },
  {
    id: "oglak",
    name: "Oğlak",
    symbol: "♑",
    emoji: "🐐",
    dateRange: "22 Aralık - 19 Ocak",
    startDate: { month: 12, day: 22 },
    endDate: { month: 1, day: 19 },
    element: "Toprak",
    elementEmoji: "🌍",
    quality: "Öncü",
    rulingPlanet: "Satürn",
    rulingPlanetEmoji: "🪐",
    luckyNumbers: [4, 8, 13, 22],
    luckyDay: "Cumartesi",
    luckyColor: "Kahverengi",
    compatibility: ["boga", "basak", "akrep", "balik"]
  },
  {
    id: "kova",
    name: "Kova",
    symbol: "♒",
    emoji: "🏺",
    dateRange: "20 Ocak - 18 Şubat",
    startDate: { month: 1, day: 20 },
    endDate: { month: 2, day: 18 },
    element: "Hava",
    elementEmoji: "💨",
    quality: "Sabit",
    rulingPlanet: "Uranüs",
    rulingPlanetEmoji: "⚡",
    luckyNumbers: [4, 7, 11, 22],
    luckyDay: "Cumartesi",
    luckyColor: "Turkuaz",
    compatibility: ["ikizler", "terazi", "koc", "yay"]
  },
  {
    id: "balik",
    name: "Balık",
    symbol: "♓",
    emoji: "🐟",
    dateRange: "19 Şubat - 20 Mart",
    startDate: { month: 2, day: 19 },
    endDate: { month: 3, day: 20 },
    element: "Su",
    elementEmoji: "💧",
    quality: "Değişken",
    rulingPlanet: "Neptün",
    rulingPlanetEmoji: "🔱",
    luckyNumbers: [3, 9, 12, 15],
    luckyDay: "Perşembe",
    luckyColor: "Deniz Yeşili",
    compatibility: ["yengec", "akrep", "boga", "oglak"]
  }
];

export const getZodiacByDate = (month: number, day: number): ZodiacSign | undefined => {
  return zodiacSigns.find(sign => {
    if (sign.startDate.month <= sign.endDate.month) {
      return (
        (month === sign.startDate.month && day >= sign.startDate.day) ||
        (month === sign.endDate.month && day <= sign.endDate.day) ||
        (month > sign.startDate.month && month < sign.endDate.month)
      );
    } else {
      // Handles Capricorn (Dec-Jan)
      return (
        (month === sign.startDate.month && day >= sign.startDate.day) ||
        (month === sign.endDate.month && day <= sign.endDate.day) ||
        month > sign.startDate.month ||
        month < sign.endDate.month
      );
    }
  });
};

export const getZodiacById = (id: string): ZodiacSign | undefined => {
  return zodiacSigns.find(sign => sign.id === id);
};
