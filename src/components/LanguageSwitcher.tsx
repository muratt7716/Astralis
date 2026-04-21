"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation, languages } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { language, setLanguage, languageInfo } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick as any);
    document.addEventListener("touchstart", handleClick as any, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClick as any);
      document.removeEventListener("touchstart", handleClick as any);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors text-sm"
        style={{ touchAction: "manipulation" }}
      >
        <span className="text-base">{languageInfo.flag}</span>
        <span className="text-gray-300 hidden xl:inline">{languageInfo.nativeName}</span>
        <svg className={`w-3 h-3 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-[#0a0a1a] border border-white/10 shadow-2xl overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5
                ${language === lang.code ? "text-purple-400 bg-purple-500/5" : "text-gray-400"}`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.nativeName}</span>
              {language === lang.code && <span className="ml-auto text-purple-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
