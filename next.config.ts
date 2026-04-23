/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default;

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

module.exports = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
