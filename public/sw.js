// Astralis Service Worker
// Cache name is intentionally NOT versioned here —
// Next.js static asset URLs already contain content hashes.
// HTML pages (navigations) are always fetched from network so users
// get fresh content on every deploy without manual cache clearing.

const STATIC_CACHE = 'astralis-static-v2';

// Static asset extensions worth caching
const CACHEABLE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff', '.woff2'];

function isCacheableAsset(url) {
  return CACHEABLE_EXTENSIONS.some(ext => url.pathname.endsWith(ext)) ||
    url.pathname.startsWith('/_next/static/');
}

self.addEventListener('install', () => {
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // HTML navigation: always network-first so users get fresh pages
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets: cache-first (Next.js hashes guarantee freshness)
  if (isCacheableAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else: network only
  event.respondWith(fetch(event.request));
});
