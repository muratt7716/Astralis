"use client";

import { useEffect } from "react";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/providers/AuthProvider";
import { GoogleOAuthProvider } from '@react-oauth/google';

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
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <AuthProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
