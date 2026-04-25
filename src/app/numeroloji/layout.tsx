import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Numeroloji Hesaplama — Yaşam Yolu ve Kişilik Sayıları | Astralis',
  description: 'Doğum tarihinizle yaşam yolu sayınızı, ifade sayınızı ve ruh güdüsü sayınızı hesaplayın. Pisagor ve Keldani numeroloji yöntemleriyle sayıların sırrını keşfedin.',
  alternates: {
    canonical: 'https://www.astralislab.com/numeroloji',
  },
  openGraph: {
    title: 'Numeroloji Hesaplama | Astralis',
    description: 'Sayıların dilini çözün. Yaşam yolunuzu, kişilik sayınızı ve kaderinizi numeroloji ile analiz edin.',
    url: 'https://www.astralislab.com/numeroloji',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
