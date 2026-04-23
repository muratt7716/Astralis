const CACHE_NAME = 'astralis-v8'; // Versiyon artırıldı

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Önemli: Telefon kurulumunda hata almamak için assets'leri teker teker cache'le
      return Promise.allSettled(
        PRECACHE_ASSETS.map(asset => cache.add(asset))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigasyon (Sayfa geçişleri)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(async () => {
          // Çevrimdışı/Hata durumunda ana sayfayı döndür
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/', { ignoreSearch: true });
          return cachedResponse || Response.error();
        })
    );
    return;
  }

  // 2. Statik Dosyalar & API (Cache-First or Network-First based on type)
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      // Cache'de varsa hemen ver
      if (cachedResponse) return cachedResponse;

      // Yoksa ağa git
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;

        // Kendi origin'imizdeki dosyaları runtime'da sakla
        if (url.origin === self.location.origin) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        // Tamamen ulaşılamazsa (offline)
        return new Response('', { status: 408 });
      });
    })
  );
});