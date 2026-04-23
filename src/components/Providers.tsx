"use client";

import { useEffect, useState } from "react";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/providers/AuthProvider";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // PWA standalone modunu tespit et
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      !!(window.navigator as any).standalone;
    setIsStandalone(standalone);
  }, []);

  // Standalone modda GoogleOAuthProvider render etme —
  // accounts.google.com/gsi/client WebView'da crash yapıyor,
  // zaten OAuth popup'ları standalone modda çalışmaz.
  const content = (
    <AuthProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </AuthProvider>
  );

  if (isStandalone) {
    return content;
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      {content}
    </GoogleOAuthProvider>
  );
}
