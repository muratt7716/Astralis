"use client";

import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/providers/AuthProvider";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }: { children: React.ReactNode }) {
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
