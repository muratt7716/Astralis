const CACHE_NAME = 'astralis-v6'; // GÜNCELLENDİ: Mobil cihazın yeni güncellemeyi alması için sürümü artırdık

const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

// 1. Kurulum: Assetleri tek tek ekle ki biri fail ederse hepsi yanmasın
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[SW] ${asset} önbelleğe alınamadı:`, err);
        }
      }
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

// 2. Fetch Stratejisi
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Sayfa Navigasyonu (Network-First + Fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          // İnternet varsa sayfayı al ve cache'i güncelle (Background update)
          const clone = res.clone();
          // GÜNCELLENDİ: Sadece '/' değil, gelen tam isteği (örn: /?pwa=true) cache'le
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(async () => {
          // İnternet yoksa önce cache'deki '/' dizinine bak (ignoreSearch: true olduğu için ?pwa=true olsa da '/' bulunur)
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/', { ignoreSearch: true });
          if (cachedResponse) return cachedResponse;

          // Cache'de de yoksa asla null dönme, bir offline Response objesi fırlat
          return new Response(
            '<html><body style="background:#0d0415;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;text-align:center;">' +
            '<div><h2>Bağlantı Bekleniyor...</h2><p>Şu an internete bağlanılamıyor.</p><button onclick="window.location.reload()" style="padding:10px 20px;margin-top:20px;background:#fff;color:#000;border:none;border-radius:5px;cursor:pointer;">Tekrar Dene</button></div>' +
            '</body></html>',
            {
              status: 200,
              headers: { 'Content-Type': 'text/html' }
            }
          );
        })
    );
    return;
  }

  // Statik Dosyalar (Cache-First)
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;

        // Sadece kendi origin'imizdeki dosyaları ve http isteklerini cache'le
        if (event.request.url.startsWith('http')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        // Asset bulunamazsa tarayıcıyı çökertmemek için boş response dön
        return new Response('', { status: 408 });
      });
    })
  );
});