import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'dockerode',
    'ssh2',
    '@extism/extism',
    'langfuse',
    'mongodb',
    'nodemailer',
    'isolated-vm',
    '@aws-sdk/client-bedrock-runtime',
    '@qdrant/js-client-rest',
    'better-sqlite3',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  transpilePackages: [
    '@cogitator-ai/config',
    '@cogitator-ai/core',
    '@cogitator-ai/mcp',
    '@cogitator-ai/memory',
    '@cogitator-ai/models',
    '@cogitator-ai/openai-compat',
    '@cogitator-ai/redis',
    '@cogitator-ai/sandbox',
    '@cogitator-ai/swarms',
    '@cogitator-ai/types',
    '@cogitator-ai/workflows',
  ],
};

export default nextConfig;
