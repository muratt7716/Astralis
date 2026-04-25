import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rüya Analizi — Bilinçaltı Mesajlarını Keşfet | Astralis',
  description: 'Rüyalarınızı yapay zeka ile analiz edin. Jungian psikoloji ve arketip sembolizmi kullanarak bilinçaltınızın mesajlarını çözün. Rüya tabiri değil, bilinç analizi.',
  alternates: {
    canonical: 'https://www.astralislab.com/ruya-analizi',
  },
  openGraph: {
    title: 'Rüya Analizi | Astralis',
    description: 'Bilinçaltınızın kapısını aralayın. Yapay zeka destekli rüya sembolizmi ve Jungian arketip analizi.',
    url: 'https://www.astralislab.com/ruya-analizi',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
