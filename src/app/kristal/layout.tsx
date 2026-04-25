import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kristal Rehberi — Burca Göre Taş ve Enerji | Astralis',
  description: 'Burç ve doğum haritanıza göre size özel kristal önerileri alın. Her taşın enerjetik özellikleri ve meditasyon kullanımı hakkında kapsamlı rehber.',
  alternates: {
    canonical: 'https://www.astralislab.com/kristal',
  },
  openGraph: {
    title: 'Kristal Rehberi | Astralis',
    description: 'Burçlara göre kristal önerileri. Enerjetik taşlarla farkındalık ve meditasyon pratiği.',
    url: 'https://www.astralislab.com/kristal',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
