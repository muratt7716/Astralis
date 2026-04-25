import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'I Ching — Kadim Çin Kehanet Sistemi | Astralis',
  description: '3.000 yıllık I Ching bilgeliğiyle sorularınıza cevap bulun. 64 hexagram ve geleneksel Çin felsefesiyle bilinç çalışması yapın. Türkçe\'nin en kapsamlı I Ching uygulaması.',
  alternates: {
    canonical: 'https://www.astralislab.com/iching',
  },
  openGraph: {
    title: 'I Ching | Astralis',
    description: 'Kadim Çin bilgeliği. 64 hexagram ile değişimin ve dönüşümün rehberi.',
    url: 'https://www.astralislab.com/iching',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
