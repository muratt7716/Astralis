import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rünler — Elder Futhark 24 Rün Rehberi ve Okuma | Astralis',
  description: 'İskandinav rün alfabesiyle bilinçaltı mesajlarınızı keşfedin. Elder Futhark\'ın 24 rünü, anlamları ve yorumları. Türkçe\'nin en kapsamlı rün uygulaması.',
  alternates: {
    canonical: 'https://www.astralislab.com/runler',
  },
  openGraph: {
    title: 'Rünler | Astralis',
    description: 'İskandinav bilgeliği. Elder Futhark 24 rünüyle öz keşif ve bilinç çalışması.',
    url: 'https://www.astralislab.com/runler',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
