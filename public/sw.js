const CACHE_NAME = 'astralis-v12';

// Kurulum anında cache'lenecek kritik dosyalar
const PRECACHE = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(PRECACHE.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Eski cache'leri temizle
      caches.keys().then((keys) =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Navigasyon isteklerine (sayfa geçişleri) DOKUNMA
  // Browser direkt Vercel'den alsın — SW karışmaz
  if (event.request.mode === 'navigate') return;

  // Sadece aynı origin'deki statik dosyaları cache'le
  // Next.js JS/CSS bundle'ları: _next/static/
  // Görseller: /images/, /icons, /avatars vs.
  const isStaticAsset =
    url.origin === self.location.origin && (
      url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/images/') ||
      url.pathname.startsWith('/avatars/') ||
      url.pathname.startsWith('/cards/') ||
      url.pathname.startsWith('/zodiac/') ||
      url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff|woff2|webp)$/)
    );

  if (!isStaticAsset) return;

  // Cache-first: cache'de varsa oradan ver, yoksa network'ten al ve cache'le
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        }
        return response;
      });
    })
  );
});
