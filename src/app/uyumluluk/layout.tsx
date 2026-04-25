import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Burç Uyumluluk Analizi — Sinastri ve İlişki Haritası | Astralis',
  description: 'İki kişinin astrolojik uyumunu keşfedin. Güneş burcu, Ay burcu ve sinastri haritası analizi ile ilişkinizdeki güçlü yanları ve dinamikleri anlayın.',
  alternates: {
    canonical: 'https://www.astralislab.com/uyumluluk',
  },
  openGraph: {
    title: 'Burç Uyumluluk Analizi | Astralis',
    description: 'İki kişi arasındaki kozmik bağı keşfedin. Sinastri haritası ve çok katmanlı uyumluluk analizi.',
    url: 'https://www.astralislab.com/uyumluluk',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
