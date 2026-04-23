// public/sw.js
const CACHE_NAME = 'astralis-v3';

// Key assets to pre-cache
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Not: cache.addAll çok katıdır. Biri bile 404 verirse SW kurulmaz.
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.error('[SW] Pre-cache failed:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
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

// Robust Fetch Handler
self.addEventListener('fetch', (event) => {
  // 1. Navigation requests (Sayfa geçişleri ve ilk açılış)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // ÇÖZÜM: Promise'i doğru şekilde çözüyoruz
          return caches.match('/').then((cachedResponse) => {
            return cachedResponse || caches.match(event.request);
          });
        })
    );
    return;
  }

  // 2. Static Assets (Icons, Images, Scripts, Styles)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // Sadece başarılı ve GET olan istekleri cache'e al
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          // Chrome eklentilerinden gelen istekleri (chrome-extension://) cache'lemeyi engelle (Hata sebebidir)
          if (!event.request.url.startsWith('http')) return networkResponse;

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Çevrimdışı durumunda aset bulunamazsa sessizce geç
        return null;
      });
    })
  );
});