import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tüm Burçlar — Kişilik Özellikleri ve Astroloji Rehberi | Astralis",
  description: "12 burcun detaylı kişilik özellikleri, elementleri, yönetici gezegenleri, uyumluluk analizleri ve 2026 yorumları. Koç'tan Balık'a tüm burçlar için kapsamlı astroloji rehberi.",
  alternates: {
    canonical: 'https://www.astralislab.com/burclar',
  },
  openGraph: {
    title: "Tüm Burçlar | Astralis",
    description: "12 burcun kişilik analizleri, uyumluluk tabloları ve astroloji rehberi.",
    url: 'https://www.astralislab.com/burclar',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function BurclarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
