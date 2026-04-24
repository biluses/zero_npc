import nextPwa from 'next-pwa';

const withPWA = nextPwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // standalone output: copia solo lo necesario en .next/standalone, ideal para Docker
  output: 'standalone',
  // El monorepo está en /repo/apps/web; standalone necesita conocer la raíz para resolver pnpm symlinks
  outputFileTracingRoot: process.env.NEXT_OUTPUT_TRACING_ROOT || undefined,
  images: {
    remotePatterns: [
      // Allowed sources: our own API uploads and Stripe product images
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'files.stripe.com' },
      { protocol: 'https', hostname: '*.zero-npc.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), nfc=(self), geolocation=()' },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
