import * as tr from './locales/tr';
import * as en from './locales/en';
import * as ar from './locales/ar';
import * as de from './locales/de';
import * as fr from './locales/fr';

export type DeepMeaningProps = tr.DeepMeaningProps;

const locales: Record<string, typeof tr> = { tr, en, ar, de, fr };

function getLocale(lang: string): typeof tr {
  return locales[lang] || locales['tr'];
}

export function getPythagoreanMeaning(compound: number, lang: string = 'tr'): DeepMeaningProps {
  const locale = getLocale(lang);
  return locale.pythagoreanMeanings[compound] || locale.pythagoreanMeanings[0];
}

export function getChaldeanMeaning(compound: number, lang: string = 'tr') {
  const locale = getLocale(lang);
  return locale.chaldeanMeanings[compound] || locale.chaldeanMeanings[0];
}

export function getPersonalYearMeaning(year: number, lang: string = 'tr') {
  const locale = getLocale(lang);
  return locale.personalYearMeanings[year] || locale.personalYearMeanings[1];
}

export function getPersonalMonthMeaning(month: number, lang: string = 'tr') {
  const locale = getLocale(lang);
  return locale.personalMonthMeanings[month] || locale.personalMonthMeanings[1];
}

export function getPersonalDayMeaning(day: number, lang: string = 'tr') {
  const locale = getLocale(lang);
  return locale.personalDayMeanings[day] || locale.personalDayMeanings[1];
}

export function getFrequencyExplanations(lang: string = 'tr') {
  const locale = getLocale(lang);
  return locale.frequencyExplanations;
}

// Fallbacks for backward compatibility (defaults to Turkish)
export const pythagoreanMeanings = tr.pythagoreanMeanings;
export const chaldeanMeanings = tr.chaldeanMeanings;
export const personalYearMeanings = tr.personalYearMeanings;
export const personalMonthMeanings = tr.personalMonthMeanings;
export const personalDayMeanings = tr.personalDayMeanings;
export const frequencyExplanations = tr.frequencyExplanations;
