import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Horary Astroloji — Soruya Özel Anlık Harita | Astralis',
  description: 'Horary astroloji ile sorunuza özel anlık bir harita oluşturun. Soruyu sorduğunuz anın kozmik enerjisi, cevabı içinde barındırır. Türkçe\'nin en kapsamlı horary aracı.',
  alternates: {
    canonical: 'https://www.astralislab.com/horary',
  },
  openGraph: {
    title: 'Horary Astroloji | Astralis',
    description: 'Sorunuzu sorun, yıldızlar cevaplasın. Anlık kozmik harita ile horary astroloji analizi.',
    url: 'https://www.astralislab.com/horary',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
