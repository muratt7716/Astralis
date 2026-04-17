"use client";

import { useEffect } from "react";
import { LanguageProvider } from "@/lib/i18n";
import HoroscopePreloader from "@/components/Cosmic/HoroscopePreloader";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Permanent Service Worker Fixing Logic
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log('Successfully unregistered stale service worker');
              // We don't reload here anymore to avoid loops, the app will
              // use fresh assets on next visit or via cache headers.
            }
          });
        }
      });
    }
  }, []);

  return (
    <LanguageProvider>
      <HoroscopePreloader />
      {children}
    </LanguageProvider>
  );
}
