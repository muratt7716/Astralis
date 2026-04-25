import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Astralis | Yıldızların Rehberliği',
    short_name: 'Astralis',
    description: 'Astroloji, kişisel gelişim ve yaşam koçluğu platformu.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0415',
    theme_color: '#0d0415',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
