import type { NextConfig } from 'next';

const apiProxyUrl = process.env.API_PROXY_URL?.replace(/\/$/, '');

const nextConfig: NextConfig = {
  // Fixed dev port (3000); allow LAN access without Next.js cross-origin warnings.
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.0.15'],
  // Production: proxy /api/* to Railway so the browser stays same-origin (no CORS).
  async rewrites() {
    if (!apiProxyUrl) return [];
    return [{ source: '/api/:path*', destination: `${apiProxyUrl}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.shipmater.com' },
    ],
  },
};

export default nextConfig;
