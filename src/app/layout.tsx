import type { Metadata, Viewport } from "next";
import "./globals.css";
import GlobalBackground from "@/components/Cosmic/GlobalBackgroundClient";
import Providers from "@/components/Providers";
import ConditionalShell from "@/components/ConditionalShell";
import PWAInstaller from "@/components/PWAInstaller";
import PWAProvider from "@/components/PWAProvider";

import { cookies } from "next/headers";
import { translations, SupportedLanguage, languages } from "@/lib/i18n-shared";

export const viewport: Viewport = {
  themeColor: '#0d0415',
};

const BASE_URL = 'https://www.astralislab.com';

const LOCALE_MAP: Record<string, string> = {
  tr: 'tr_TR', en: 'en_US', ar: 'ar_SA', de: 'de_DE', fr: 'fr_FR',
};

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("astralis-lang")?.value as SupportedLanguage) || "tr";
  const t = (key: string) => translations[lang]?.[key] || translations.tr[key] || key;

  const title = `Astralis | ${t("hero.title.1")} ${t("hero.title.2")}`;
  const description = t("hero.subtitle");

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    verification: {
      google: 'Ed0gLXyqHORDm0DIOePPiPA_PuthjJzQzJXoR70qI1c',
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Astralis',
    },
    icons: {
      icon: '/favicon.png',
      apple: '/favicon.png',
    },
    alternates: {
      canonical: BASE_URL,
      languages: {
        'tr': BASE_URL,
        'en': BASE_URL,
        'ar': BASE_URL,
        'de': BASE_URL,
        'fr': BASE_URL,
        'x-default': BASE_URL,
      },
    },
    openGraph: {
      type: 'website',
      locale: LOCALE_MAP[lang] || 'tr_TR',
      url: BASE_URL,
      siteName: 'Astralis',
      title,
      description,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Astralis — Yıldızların Rehberliği' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("astralis-lang")?.value as SupportedLanguage) || "tr";
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${BASE_URL}/#organization`,
                  "name": "Astralis",
                  "url": BASE_URL,
                  "logo": `${BASE_URL}/favicon.png`,
                  "description": "Profesyonel astroloji, kişisel gelişim ve yaşam koçluğu platformu.",
                  "knowsAbout": ["Astroloji", "Numeroloji", "Doğum Haritası", "Horary Astroloji", "Biyoritim", "Kişisel Gelişim"]
                },
                {
                  "@type": "WebSite",
                  "@id": `${BASE_URL}/#website`,
                  "url": BASE_URL,
                  "name": "Astralis",
                  "description": "Yıldızların rehberliğiyle kişisel gelişim, astroloji ve yaşam koçluğu",
                  "publisher": { "@id": `${BASE_URL}/#organization` },
                  "inLanguage": ["tr", "en", "ar", "de", "fr"]
                },
                {
                  "@type": "WebApplication",
                  "name": "Astralis",
                  "url": BASE_URL,
                  "applicationCategory": "LifestyleApplication",
                  "operatingSystem": "Web, iOS PWA, Android PWA",
                  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "TRY" },
                  "featureList": [
                    "Kişisel Doğum Haritası Analizi",
                    "Burç Uyumluluk Analizi",
                    "Numeroloji Hesaplama",
                    "Biyoritim Takibi",
                    "Horary Astroloji",
                    "Rüya Analizi",
                    "I Ching",
                    "Rün Okuma",
                    "Mistik Rehberler"
                  ]
                }
              ]
            })
          }}
        />
      </head>
      <body className="bg-[#070714] text-white font-sans min-h-screen antialiased overflow-x-hidden">
        <Providers>
          <GlobalBackground />
          <PWAProvider>
            <ConditionalShell>
              {children}
            </ConditionalShell>
          </PWAProvider>
          <PWAInstaller />
        </Providers>
      </body>
    </html>
  );
}
