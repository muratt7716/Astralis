// Minimal SW - Chrome install prompt için gerekli, hiçbir şeye dokunmuyor
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // clients.claim() YOK - sayfaların yüklenmesine karışmıyoruz
});

// fetch handler YOK - hiçbir isteğe dokunmuyoruz
