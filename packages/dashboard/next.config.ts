import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  transpilePackages: [
    '@cogitator/config',
    '@cogitator/core',
    '@cogitator/mcp',
    '@cogitator/memory',
    '@cogitator/models',
    '@cogitator/openai-compat',
    '@cogitator/redis',
    '@cogitator/sandbox',
    '@cogitator/swarms',
    '@cogitator/types',
    '@cogitator/workflows',
  ],
};

export default nextConfig;

