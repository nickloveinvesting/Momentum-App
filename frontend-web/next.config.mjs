/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,

  // SWC minification (faster than Terser)
  swcMinify: true,

  // Production source maps (for Sentry error tracking)
  productionBrowserSourceMaps: true,

  // Performance optimizations
  poweredByHeader: false,
  generateEtags: true,

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Environment configuration
  env: {
    BUILD_TIME: new Date().toISOString(),
  },

  // Experimental features
  experimental: {
    optimizePackageImports: [
      '@momentum/shared',
      'react-hook-form',
      'zustand',
    ],
  },
};

export default nextConfig;
