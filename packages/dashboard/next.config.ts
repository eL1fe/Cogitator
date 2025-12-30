import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  transpilePackages: [
    '@cogitator/core',
    '@cogitator/types',
    '@cogitator/models',
  ],
};

export default nextConfig;

