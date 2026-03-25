"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { 
  type SupportedLanguage, 
  type LanguageInfo, 
  type TranslationDict,
  languages, 
  translations 
} from "./i18n-shared";

export { type SupportedLanguage, type LanguageInfo, languages, translations };

// --------------- Context ---------------

type LanguageContextType = {
  language: SupportedLanguage;
  languageInfo: LanguageInfo;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string>) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("tr");

  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("falci-lang="))
      ?.split("=")[1];
    if (saved && languages.some((l) => l.code === saved)) {
      setLanguageState(saved as SupportedLanguage);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    document.cookie = `falci-lang=${lang}; path=/; max-age=31536000`;
    // Force reload to update server-side components and cookie-based lang detection
    window.location.reload();
  };

  const t = (key: string, params?: Record<string, string>): string => {
    let value = translations[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replaceAll(`{${k}}`, v);
      });
    }
    return value;
  };

  const langInfo = languages.find((l) => l.code === language) || languages[0];

  return (
    <LanguageContext.Provider value={{ language, languageInfo: langInfo, setLanguage, t, dir: langInfo.dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
