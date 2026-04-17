"use client";

import { useEffect } from "react";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/providers/AuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Permanent Service Worker Fixing Logic
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log('Successfully unregistered stale service worker');
            }
          });
        }
      });
    }
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  );
}
