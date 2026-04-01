import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarField from "@/components/StarField";
import Providers from "@/components/Providers";

import { cookies } from "next/headers";
import { translations, SupportedLanguage, languages } from "@/lib/i18n-shared";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("falci-lang")?.value as SupportedLanguage) || "tr";
  const t = (key: string) => translations[lang]?.[key] || translations.tr[key] || key;

  return {
    title: `Astralis | ${t("hero.title.1")} ${t("hero.title.2")}`,
    description: t("hero.subtitle"),
    keywords: "astrology, zodiac, horoscopes, tarot, birth chart, coffee fortune, astroloji, burçlar, günlük burç yorumu, doğum haritası, fal",
    manifest: '/manifest.json',
    themeColor: '#0d0415',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Astralis',
    },
    icons: {
      apple: '/icon-192.png',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("falci-lang")?.value as SupportedLanguage) || "tr";
  const langInfo = languages.find(l => l.code === lang) || languages[0];

  return (
    <html lang={lang} dir={langInfo.dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Aref+Ruqaa+Ink:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#070714] text-white font-sans min-h-screen antialiased">
        <Providers>
          <StarField />
          <Navbar />
          <main className="relative z-10 pt-16 min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
