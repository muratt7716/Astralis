import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mistik Rehber — Kozmik Danışmanınla Tanış | Astralis',
  description: 'Melisa, Aras, Umut, Hekate veya Selin ile kişisel astroloji ve koçluk seansı başlat. Her rehberin kendine özgü bilgeliği ve yaklaşımıyla hayatınıza ışık tutun.',
  alternates: {
    canonical: 'https://www.astralislab.com/mistik-rehber',
  },
  openGraph: {
    title: 'Mistik Rehberler | Astralis',
    description: 'Yapay zeka destekli kozmik danışmanlarınla tanış. Empati, analiz, bilgelik ve dürüstlük — her rehber sana özel.',
    url: 'https://www.astralislab.com/mistik-rehber',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
