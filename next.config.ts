/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Service Worker'ın doğru scope ile yüklenmesi için kritik başlıklar
        source: '/sw.js',
        headers: [
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
      {
        // Manifest'in her zaman taze alınması
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/fallar/iching', destination: '/iching', permanent: true },
      { source: '/fallar/runler', destination: '/runler', permanent: true },
      { source: '/fallar/kristal', destination: '/kristal', permanent: true },
      { source: '/fallar', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;