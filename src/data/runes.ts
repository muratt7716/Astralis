export interface Rune {
  id: number;
  nameKey: string;
  name: string;
  symbol: string;
  meaningKey: string;
  reversedKey: string;
  elementKey: string;
  keywordsKey: string;
  // Fallbacks for direct access if needed
  meaning: string;
  reversed: string;
  element: string;
  keywords: string;
}

export const elderFutharkRunes: Rune[] = [
  { id: 1, name: "Fehu", symbol: "ᚠ", nameKey: "rune.1.name", meaningKey: "rune.1.meaning", reversedKey: "rune.1.reversed", elementKey: "element.fire", keywordsKey: "rune.1.keywords", meaning: "Zenginlik", reversed: "Kayıp", element: "Ateş", keywords: "para" },
  { id: 2, name: "Uruz", symbol: "ᚢ", nameKey: "rune.2.name", meaningKey: "rune.2.meaning", reversedKey: "rune.2.reversed", elementKey: "element.earth", keywordsKey: "rune.2.keywords", meaning: "Güç", reversed: "Zayıflık", element: "Toprak", keywords: "dayanıklılık" },
  { id: 3, name: "Thurisaz", symbol: "ᚦ", nameKey: "rune.3.name", meaningKey: "rune.3.meaning", reversedKey: "rune.3.reversed", elementKey: "element.fire", keywordsKey: "rune.3.keywords", meaning: "Savunma", reversed: "Tehlike", element: "Ateş", keywords: "sınır" },
  { id: 4, name: "Ansuz", symbol: "ᚨ", nameKey: "rune.4.name", meaningKey: "rune.4.meaning", reversedKey: "rune.4.reversed", elementKey: "element.air", keywordsKey: "rune.4.keywords", meaning: "İlham", reversed: "Yanlış anlaşılma", element: "Hava", keywords: "söz" },
  { id: 5, name: "Raidho", symbol: "ᚱ", nameKey: "rune.5.name", meaningKey: "rune.5.meaning", reversedKey: "rune.5.reversed", elementKey: "element.air", keywordsKey: "rune.5.keywords", meaning: "Yolculuk", reversed: "Gecikme", element: "Hava", keywords: "seyahat" },
  { id: 6, name: "Kenaz", symbol: "ᚲ", nameKey: "rune.6.name", meaningKey: "rune.6.meaning", reversedKey: "rune.6.reversed", elementKey: "element.fire", keywordsKey: "rune.6.keywords", meaning: "Bilgi", reversed: "Karanlık", element: "Ateş", keywords: "ışık" },
  { id: 7, name: "Gebo", symbol: "ᚷ", nameKey: "rune.7.name", meaningKey: "rune.7.meaning", reversedKey: "rune.7.reversed", elementKey: "element.air", keywordsKey: "rune.7.keywords", meaning: "Hediye", reversed: "(Ters anlamı yoktur)", element: "Hava", keywords: "paylaşım" },
  { id: 8, name: "Wunjo", symbol: "ᚹ", nameKey: "rune.8.name", meaningKey: "rune.8.meaning", reversedKey: "rune.8.reversed", elementKey: "element.earth", keywordsKey: "rune.8.keywords", meaning: "Neşe", reversed: "Hüzün", element: "Toprak", keywords: "sevinç" },
  { id: 10, name: "Nauthiz", symbol: "ᚾ", nameKey: "rune.10.name", meaningKey: "rune.10.meaning", reversedKey: "rune.10.reversed", elementKey: "element.fire", keywordsKey: "rune.10.keywords", meaning: "İhtiyaç", reversed: "(Ters anlamı yoktur)", element: "Ateş", keywords: "sabır" },
  { id: 11, name: "Isa", symbol: "ᛁ", nameKey: "rune.11.name", meaningKey: "rune.11.meaning", reversedKey: "rune.11.reversed", elementKey: "element.water", keywordsKey: "rune.11.keywords", meaning: "Durağanlık", reversed: "(Ters anlamı yoktur)", element: "Su", keywords: "dondurma" },
  { id: 12, name: "Jera", symbol: "ᛃ", nameKey: "rune.12.name", meaningKey: "rune.12.meaning", reversedKey: "rune.12.reversed", elementKey: "element.earth", keywordsKey: "rune.12.keywords", meaning: "Hasat", reversed: "(Ters anlamı yoktur)", element: "Toprak", keywords: "mevsim" },
  { id: 13, name: "Eihwaz", symbol: "ᛇ", nameKey: "rune.13.name", meaningKey: "rune.13.meaning", reversedKey: "rune.13.reversed", elementKey: "element.air", keywordsKey: "rune.13.keywords", meaning: "Dayanıklılık", reversed: "(Ters anlamı yoktur)", element: "Hava", keywords: "kök" },
  { id: 14, name: "Perthro", symbol: "ᛈ", nameKey: "rune.14.name", meaningKey: "rune.14.meaning", reversedKey: "rune.14.reversed", elementKey: "element.water", keywordsKey: "rune.14.keywords", meaning: "Gizem", reversed: "Sır", element: "Su", keywords: "kader çarkı" },
  { id: 15, name: "Algiz", symbol: "ᛉ", nameKey: "rune.15.name", meaningKey: "rune.15.meaning", reversedKey: "rune.15.reversed", elementKey: "element.air", keywordsKey: "rune.15.keywords", meaning: "Koruma", reversed: "Gizli tehlike", element: "Hava", keywords: "kalkan" },
  { id: 16, name: "Sowilo", symbol: "ᛊ", nameKey: "rune.16.name", meaningKey: "rune.16.meaning", reversedKey: "rune.16.reversed", elementKey: "element.fire", keywordsKey: "rune.16.keywords", meaning: "Güneş", reversed: "(Ters anlamı yoktur)", element: "Ateş", keywords: "başarı" },
  { id: 17, name: "Tiwaz", symbol: "ᛏ", nameKey: "rune.17.name", meaningKey: "rune.17.meaning", reversedKey: "rune.17.reversed", elementKey: "element.air", keywordsKey: "rune.17.keywords", meaning: "Onur", reversed: "Adaletsizlik", element: "Hava", keywords: "savaşçı" },
  { id: 18, name: "Berkano", symbol: "ᛒ", nameKey: "rune.18.name", meaningKey: "rune.18.meaning", reversedKey: "rune.18.reversed", elementKey: "element.earth", keywordsKey: "rune.18.keywords", meaning: "Doğum", reversed: "Durgunluk", element: "Toprak", keywords: "anne" },
  { id: 19, name: "Ehwaz", symbol: "ᛖ", nameKey: "rune.19.name", meaningKey: "rune.19.meaning", reversedKey: "rune.19.reversed", elementKey: "element.earth", keywordsKey: "rune.19.keywords", meaning: "Ortaklık", reversed: "Güvensizlik", element: "Toprak", keywords: "at" },
  { id: 20, name: "Mannaz", symbol: "ᛗ", nameKey: "rune.20.name", meaningKey: "rune.20.meaning", reversedKey: "rune.20.reversed", elementKey: "element.air", keywordsKey: "rune.20.keywords", meaning: "İnsanlık", reversed: "Yalnızlık", element: "Hava", keywords: "birey" },
  { id: 21, name: "Laguz", symbol: "ᛚ", nameKey: "rune.21.name", meaningKey: "rune.21.meaning", reversedKey: "rune.21.reversed", elementKey: "element.water", keywordsKey: "rune.21.keywords", meaning: "Su", reversed: "Duygusal kaos", element: "Su", keywords: "rüya" },
  { id: 22, name: "Ingwaz", symbol: "ᛜ", nameKey: "rune.22.name", meaningKey: "rune.22.meaning", reversedKey: "rune.22.reversed", elementKey: "element.earth", keywordsKey: "rune.22.keywords", meaning: "Tohum", reversed: "(Ters anlamı yoktur)", element: "Toprak", keywords: "üretkenlik" },
  { id: 23, name: "Dagaz", symbol: "ᛞ", nameKey: "rune.23.name", meaningKey: "rune.23.meaning", reversedKey: "rune.23.reversed", elementKey: "element.fire", keywordsKey: "rune.23.keywords", meaning: "Şafak", reversed: "(Ters anlamı yoktur)", element: "Ateş", keywords: "aydınlanma" },
  { id: 24, name: "Othala", symbol: "ᛟ", nameKey: "rune.24.name", meaningKey: "rune.24.meaning", reversedKey: "rune.24.reversed", elementKey: "element.earth", keywordsKey: "rune.24.keywords", meaning: "Miras", reversed: "Köklerden kopma", element: "Toprak", keywords: "ev" },
];

export const runeSpreads = [
  { id: "odin", nameKey: "rune.spread.odin.name", count: 1, descriptionKey: "rune.spread.odin.desc" },
  { id: "norns", nameKey: "rune.spread.norns.name", count: 3, descriptionKey: "rune.spread.norns.desc" },
];

