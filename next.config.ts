const { withSentryConfig } = require('@sentry/nextjs');

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
  async redirects() {
    return [
      { source: '/fallar/iching', destination: '/iching', permanent: true },
      { source: '/fallar/runler', destination: '/runler', permanent: true },
      { source: '/fallar/kristal', destination: '/kristal', permanent: true },
      { source: '/fallar', destination: '/', permanent: true },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: "astralis-bd",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});
