import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doğum Haritası Hesaplama — Güneş, Ay ve Yükselen Burç | Astralis',
  description: 'Doğum tarihiniz, saatiniz ve doğum yerinizle kişisel astroloji haritanızı oluşturun. Gezegen konumları, astrolojik evler ve transit analizleriyle kozmik kimliğinizi keşfedin.',
  alternates: {
    canonical: 'https://www.astralislab.com/dogum-haritasi',
  },
  openGraph: {
    title: 'Doğum Haritası Hesaplama | Astralis',
    description: 'Kozmik kimliğinizi keşfedin. Güneş, Ay ve Yükselen burçlarınızı, gezegen konumlarınızı ve kişisel astroloji analizinizi görün.',
    url: 'https://www.astralislab.com/dogum-haritasi',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
