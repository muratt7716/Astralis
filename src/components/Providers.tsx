"use client";

import { useEffect } from "react";
import { LanguageProvider } from "@/lib/i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => console.error("Service Worker registration failed:", error));
    }
  }, []);

  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
