import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dev/',
          '/monitoring/',
          '/onboarding/',
          '/profil/',
          '/premium/',
          '/actions/',
          '/sentry-example-page',
        ],
      },
    ],
    sitemap: 'https://www.astralislab.com/sitemap.xml',
    host: 'https://www.astralislab.com',
  }
}
