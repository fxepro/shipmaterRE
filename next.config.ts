import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Fixed dev port (3000); allow LAN access without Next.js cross-origin warnings.
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.0.15'],
  // NOTE: /api/* proxying is handled by app/api/[...path]/route.ts at request-time.
  // Do NOT add a rewrites() block here — it would be baked at build time and
  // break whenever API_PROXY_URL changes between deploys.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.shipmater.com' },
    ],
  },
};

export default nextConfig;
