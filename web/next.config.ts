import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Browser calls stay on the web origin (`/api`) so the Google session cookie
// remains first-party. The rewrite target is server-only.
const apiUrl = (process.env.OURS_API_ORIGIN || process.env.NEXT_PUBLIC_API_URL || '')
  .trim()
  .replace(/\/$/, '')
  .replace(/\/api$/, '');

const nextConfig: NextConfig = {
  // Dev server binds 0.0.0.0. Browsers on 127.0.0.1 and on a Quick Tunnel
  // must still be allowed to load /_next, or the login page never hydrates.
  allowedDevOrigins: ['127.0.0.1', '*.trycloudflare.com'],
  async rewrites() {
    if (!apiUrl) return [];

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
