const CACHE_NAME = 'astralis-v9';

const PRECACHE_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map(asset => cache.add(asset))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Eski cache'leri temizle
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        )
      ),
      // Hemen kontrol al (race condition olmadan)
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Navigasyon istekleri: Network-first, offline'da cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Sadece başarılı response'ları cache'le
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Sadece gerçekten offline'dayken cache'e bak
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match('/', { ignoreSearch: true });
          // Cache yoksa browser'ın kendi hata sayfasını göster (Response.error yerine)
          if (cached) return cached;
          // Minimal offline fallback - "retry" döngüsüne girmeden
          return new Response(
            '<html><body style="background:#0d0415;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px"><h2>Bağlantı kesildi</h2><p>İnternet bağlantını kontrol edip <a href="/" style="color:#a78bfa">yenile</a>.</p></body></html>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Statik dosyalar: Cache-first
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && url.origin === self.location.origin) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});
