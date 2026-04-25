import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Biyoritim Hesaplama — Fiziksel, Duygusal ve Zihinsel Döngüler | Astralis',
  description: 'Doğum tarihinizle biyoritim döngülerinizi hesaplayın. Fiziksel, duygusal, zihinsel ve spiritüel enerji dalgalanmalarınızı anlayın ve günlerinizi optimize edin.',
  alternates: {
    canonical: 'https://www.astralislab.com/biyoritim',
  },
  openGraph: {
    title: 'Biyoritim Analizi | Astralis',
    description: 'Enerji döngülerinizi keşfedin. Fiziksel, duygusal ve zihinsel biyoritimlerinizi görselleştirin.',
    url: 'https://www.astralislab.com/biyoritim',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
