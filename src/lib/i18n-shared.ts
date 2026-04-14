import { tr } from "@/locales/tr";
import { en } from "@/locales/en";
import { ar } from "@/locales/ar";
import { de } from "@/locales/de";
import { fr } from "@/locales/fr";

export type SupportedLanguage = "tr" | "en" | "ar" | "de" | "fr";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

export const languages: LanguageInfo[] = [
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "ltr" },
];

export type TranslationDict = Record<string, string>;

export const translations: Record<SupportedLanguage, TranslationDict> = {
  tr,
  en,
  ar,
  de,
  fr
};