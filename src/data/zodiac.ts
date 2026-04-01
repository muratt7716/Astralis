export interface ZodiacSign {
  id: string;
  name: string;
  nameKey: string;
  symbol: string;
  emoji: string;
  dateRange: string;
  startDate: { month: number; day: number };
  endDate: { month: number; day: number };
  element: string;
  elementKey: string;
  elementEmoji: string;
  quality: string;
  qualityKey: string;
  rulingPlanet: string;
  rulingPlanetKey: string;
  rulingPlanetEmoji: string;
  luckyNumbers: number[];
  luckyDay: string;
  luckyDayKey: string;
  luckyColor: string;
  luckyColorKey: string;
  compatibility: string[];
}

export const zodiacSigns: ZodiacSign[] = [
  {
    id: "koc",
    name: "Koç",
    nameKey: "zodiac.koc",
    symbol: "♈",
    emoji: "🐏",
    dateRange: "21 Mart - 20 Nisan",
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 20 },
    element: "Ateş",
    elementKey: "astrology.element.fire",
    elementEmoji: "🔥",
    quality: "Öncü",
    qualityKey: "astrology.quality.cardinal",
    rulingPlanet: "Mars",
    rulingPlanetKey: "astrology.planet.mars",
    rulingPlanetEmoji: "♂️",
    luckyNumbers: [1, 8, 17],
    luckyDay: "Salı",
    luckyDayKey: "astrology.day.tuesday",
    luckyColor: "Kırmızı",
    luckyColorKey: "astrology.color.red",
    compatibility: ["aslan", "yay", "ikizler", "kova"]
  },
  {
    id: "boga",
    name: "Boğa",
    nameKey: "zodiac.boga",
    symbol: "♉",
    emoji: "🐂",
    dateRange: "21 Nisan - 20 Mayıs",
    startDate: { month: 4, day: 21 },
    endDate: { month: 5, day: 20 },
    element: "Toprak",
    elementKey: "astrology.element.earth",
    elementEmoji: "🌍",
    quality: "Sabit",
    qualityKey: "astrology.quality.fixed",
    rulingPlanet: "Venüs",
    rulingPlanetKey: "astrology.planet.venus",
    rulingPlanetEmoji: "♀️",
    luckyNumbers: [2, 6, 9, 12],
    luckyDay: "Cuma",
    luckyDayKey: "astrology.day.friday",
    luckyColor: "Yeşil",
    luckyColorKey: "astrology.color.green",
    compatibility: ["basak", "oglak", "yengec", "balik"]
  },
  {
    id: "ikizler",
    name: "İkizler",
    nameKey: "zodiac.ikizler",
    symbol: "♊",
    emoji: "👯",
    dateRange: "21 Mayıs - 21 Haziran",
    startDate: { month: 5, day: 21 },
    endDate: { month: 6, day: 21 },
    element: "Hava",
    elementKey: "astrology.element.air",
    elementEmoji: "💨",
    quality: "Değişken",
    qualityKey: "astrology.quality.mutable",
    rulingPlanet: "Merkür",
    rulingPlanetKey: "astrology.planet.mercury",
    rulingPlanetEmoji: "☿️",
    luckyNumbers: [5, 7, 14, 23],
    luckyDay: "Çarşamba",
    luckyDayKey: "astrology.day.wednesday",
    luckyColor: "Sarı",
    luckyColorKey: "astrology.color.yellow",
    compatibility: ["terazi", "kova", "koc", "aslan"]
  },
  {
    id: "yengec",
    name: "Yengeç",
    nameKey: "zodiac.yengec",
    symbol: "♋",
    emoji: "🦀",
    dateRange: "22 Haziran - 22 Temmuz",
    startDate: { month: 6, day: 22 },
    endDate: { month: 7, day: 22 },
    element: "Su",
    elementKey: "astrology.element.water",
    elementEmoji: "💧",
    quality: "Öncü",
    qualityKey: "astrology.quality.cardinal",
    rulingPlanet: "Ay",
    rulingPlanetKey: "astrology.planet.moon",
    rulingPlanetEmoji: "🌙",
    luckyNumbers: [2, 3, 15, 20],
    luckyDay: "Pazartesi",
    luckyDayKey: "astrology.day.monday",
    luckyColor: "Gümüş",
    luckyColorKey: "astrology.color.silver",
    compatibility: ["akrep", "balik", "boga", "basak"]
  },
  {
    id: "aslan",
    name: "Aslan",
    nameKey: "zodiac.aslan",
    symbol: "♌",
    emoji: "🦁",
    dateRange: "23 Temmuz - 22 Ağustos",
    startDate: { month: 7, day: 23 },
    endDate: { month: 8, day: 22 },
    element: "Ateş",
    elementKey: "astrology.element.fire",
    elementEmoji: "🔥",
    quality: "Sabit",
    qualityKey: "astrology.quality.fixed",
    rulingPlanet: "Güneş",
    rulingPlanetKey: "astrology.planet.sun",
    rulingPlanetEmoji: "☀️",
    luckyNumbers: [1, 3, 10, 19],
    luckyDay: "Pazar",
    luckyDayKey: "astrology.day.sunday",
    luckyColor: "Altın",
    luckyColorKey: "astrology.color.gold",
    compatibility: ["koc", "yay", "ikizler", "terazi"]
  },
  {
    id: "basak",
    name: "Başak",
    nameKey: "zodiac.basak",
    symbol: "♍",
    emoji: "👩‍🌾",
    dateRange: "23 Ağustos - 22 Eylül",
    startDate: { month: 8, day: 23 },
    endDate: { month: 9, day: 22 },
    element: "Toprak",
    elementKey: "astrology.element.earth",
    elementEmoji: "🌍",
    quality: "Değişken",
    qualityKey: "astrology.quality.mutable",
    rulingPlanet: "Merkür",
    rulingPlanetKey: "astrology.planet.mercury",
    rulingPlanetEmoji: "☿️",
    luckyNumbers: [5, 14, 15, 23],
    luckyDay: "Çarşamba",
    luckyDayKey: "astrology.day.wednesday",
    luckyColor: "Lacivert",
    luckyColorKey: "astrology.color.navy",
    compatibility: ["boga", "oglak", "yengec", "akrep"]
  },
  {
    id: "terazi",
    name: "Terazi",
    nameKey: "zodiac.terazi",
    symbol: "♎",
    emoji: "⚖️",
    dateRange: "23 Eylül - 22 Ekim",
    startDate: { month: 9, day: 23 },
    endDate: { month: 10, day: 22 },
    element: "Hava",
    elementKey: "astrology.element.air",
    elementEmoji: "💨",
    quality: "Öncü",
    qualityKey: "astrology.quality.cardinal",
    rulingPlanet: "Venüs",
    rulingPlanetKey: "astrology.planet.venus",
    rulingPlanetEmoji: "♀️",
    luckyNumbers: [4, 6, 13, 24],
    luckyDay: "Cuma",
    luckyDayKey: "astrology.day.friday",
    luckyColor: "Pembe",
    luckyColorKey: "astrology.color.pink",
    compatibility: ["ikizler", "kova", "aslan", "yay"]
  },
  {
    id: "akrep",
    name: "Akrep",
    nameKey: "zodiac.akrep",
    symbol: "♏",
    emoji: "🦂",
    dateRange: "23 Ekim - 21 Kasım",
    startDate: { month: 10, day: 23 },
    endDate: { month: 11, day: 21 },
    element: "Su",
    elementKey: "astrology.element.water",
    elementEmoji: "💧",
    quality: "Sabit",
    qualityKey: "astrology.quality.fixed",
    rulingPlanet: "Plüton",
    rulingPlanetKey: "astrology.planet.pluto",
    rulingPlanetEmoji: "🔮",
    luckyNumbers: [8, 11, 18, 22],
    luckyDay: "Salı",
    luckyDayKey: "astrology.day.tuesday",
    luckyColor: "Bordo",
    luckyColorKey: "astrology.color.maroon",
    compatibility: ["yengec", "balik", "basak", "oglak"]
  },
  {
    id: "yay",
    name: "Yay",
    nameKey: "zodiac.yay",
    symbol: "♐",
    emoji: "🏹",
    dateRange: "22 Kasım - 21 Aralık",
    startDate: { month: 11, day: 22 },
    endDate: { month: 12, day: 21 },
    element: "Ateş",
    elementKey: "astrology.element.fire",
    elementEmoji: "🔥",
    quality: "Değişken",
    qualityKey: "astrology.quality.mutable",
    rulingPlanet: "Jüpiter",
    rulingPlanetKey: "astrology.planet.jupiter",
    rulingPlanetEmoji: "♃",
    luckyNumbers: [3, 7, 9, 12],
    luckyDay: "Perşembe",
    luckyDayKey: "astrology.day.thursday",
    luckyColor: "Mor",
    luckyColorKey: "astrology.color.purple",
    compatibility: ["koc", "aslan", "terazi", "kova"]
  },
  {
    id: "oglak",
    name: "Oğlak",
    nameKey: "zodiac.oglak",
    symbol: "♑",
    emoji: "🐐",
    dateRange: "22 Aralık - 20 Ocak",
    startDate: { month: 12, day: 22 },
    endDate: { month: 1, day: 20 },
    element: "Toprak",
    elementKey: "astrology.element.earth",
    elementEmoji: "🌍",
    quality: "Öncü",
    qualityKey: "astrology.quality.cardinal",
    rulingPlanet: "Satürn",
    rulingPlanetKey: "astrology.planet.saturn",
    rulingPlanetEmoji: "🪐",
    luckyNumbers: [4, 8, 13, 22],
    luckyDay: "Cumartesi",
    luckyDayKey: "astrology.day.saturday",
    luckyColor: "Kahverengi",
    luckyColorKey: "astrology.color.brown",
    compatibility: ["boga", "basak", "akrep", "balik"]
  },
  {
    id: "kova",
    name: "Kova",
    nameKey: "zodiac.kova",
    symbol: "♒",
    emoji: "🏺",
    dateRange: "21 Ocak - 18 Şubat",
    startDate: { month: 1, day: 21 },
    endDate: { month: 2, day: 18 },
    element: "Hava",
    elementKey: "astrology.element.air",
    elementEmoji: "💨",
    quality: "Sabit",
    qualityKey: "astrology.quality.fixed",
    rulingPlanet: "Uranüs",
    rulingPlanetKey: "astrology.planet.uranus",
    rulingPlanetEmoji: "⚡",
    luckyNumbers: [4, 7, 11, 22],
    luckyDay: "Cumartesi",
    luckyDayKey: "astrology.day.saturday",
    luckyColor: "Turkuaz",
    luckyColorKey: "astrology.color.turquoise",
    compatibility: ["ikizler", "terazi", "koc", "yay"]
  },
  {
    id: "balik",
    name: "Balık",
    nameKey: "zodiac.balik",
    symbol: "♓",
    emoji: "🐟",
    dateRange: "19 Şubat - 20 Mart",
    startDate: { month: 2, day: 19 },
    endDate: { month: 3, day: 20 },
    element: "Su",
    elementKey: "astrology.element.water",
    elementEmoji: "💧",
    quality: "Değişken",
    qualityKey: "astrology.quality.mutable",
    rulingPlanet: "Neptün",
    rulingPlanetKey: "astrology.planet.neptune",
    rulingPlanetEmoji: "🔱",
    luckyNumbers: [3, 9, 12, 15],
    luckyDay: "Perşembe",
    luckyDayKey: "astrology.day.thursday",
    luckyColor: "Deniz Yeşili",
    luckyColorKey: "astrology.color.sea_green",
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
