import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.astralislab.com'

const ZODIAC_SIGNS = [
  'koc', 'boga', 'ikizler', 'yengec', 'aslan', 'basak',
  'terazi', 'akrep', 'yay', 'oglak', 'kova', 'balik',
]

const PERIODS = ['daily', 'weekly', 'monthly', 'yearly']

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/burclar`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/dogum-haritasi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/uyumluluk`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/numeroloji`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/biyoritim`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE_URL}/ruya-analizi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE_URL}/horary`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/iching`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE_URL}/runler`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE_URL}/kristal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE_URL}/mistik-rehber`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/gizlilik`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/kullanim-kosullari`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/mesafeli-satis-sozlesmesi`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/iptal-ve-iade`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  const zodiacRoutes: MetadataRoute.Sitemap = ZODIAC_SIGNS.map(sign => ({
    url: `${BASE_URL}/burclar/${sign}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const yorumlarRoutes: MetadataRoute.Sitemap = PERIODS.map(period => ({
    url: `${BASE_URL}/yorumlar/${period}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  return [...staticRoutes, ...zodiacRoutes, ...yorumlarRoutes]
}
