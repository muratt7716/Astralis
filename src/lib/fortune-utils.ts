/**
 * Gets the localized name for a card based on the current language.
 * @param card The card object (must have name and optional nameEn, nameAr, nameDe, nameFr)
 * @param language Current language code ('tr', 'en', 'ar', 'de', 'fr')
 * @returns Localized name string
 */
export function getLocalizedName(card: any, language: string): string {
  if (!card) return "";
  
  switch (language) {
    case "en":
      return card.nameEn || card.name;
    case "ar":
      return card.nameAr || card.nameEn || card.name;
    case "de":
      return card.nameDe || card.nameEn || card.name;
    case "fr":
      return card.nameFr || card.nameEn || card.name;
    case "tr":
    default:
      return card.name;
  }
}

/**
 * Gets the localized description/meaning for a card based on the current language and orientation.
 * (Future expansion: add localized meanings to data files)
 */
export function getLocalizedMeaning(card: any, language: string, isReversed: boolean = false): string {
  if (!card) return "";
  
  // For now, meanings are primarily in Turkish/English in the data files.
  // This helper can be expanded as more translations are added.
  if (isReversed) {
    return card.reversedMeaning || card.reversed || card.upright;
  }
  return card.upright;
}
