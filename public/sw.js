const CACHE_NAME = 'astralis-v11';

// Kurulum: eski cache'leri temizle, hemen devreye gir
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch handler YOK — browser tüm istekleri direkt Vercel'e iletir.
// SSR sayfaları dinamik olduğu için SW cache'i standalone modda bozuyordu.

// Push notification (ileride aktif edilecek)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Astralis', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      const existing = list.find(c => c.url === url && 'focus' in c);
      return existing ? existing.focus() : clients.openWindow(url);
    })
  );
});
