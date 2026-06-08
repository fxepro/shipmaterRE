import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Fixed dev port (3000); allow LAN access without Next.js cross-origin warnings.
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.0.15'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.shipmater.com' },
    ],
  },
};

export default nextConfig;
