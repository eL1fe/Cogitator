import { NextResponse } from 'next/server';
import { withRole } from '@/lib/auth/middleware';

/**
 * Sandbox API - Disabled in serverless environment
 *
 * The sandbox functionality requires Docker which is not available
 * in serverless deployments (Vercel, etc.). This endpoint returns
 * a stub response indicating the feature is unavailable.
 *
 * For self-hosted deployments with Docker, implement the sandbox
 * integration separately.
 */

const SERVERLESS_MESSAGE =
  'Sandbox execution is not available in serverless deployments. ' +
  'Use a self-hosted deployment with Docker for sandbox functionality.';

export const GET = withRole(['admin'], async () => {
  return NextResponse.json({
    status: 'unavailable',
    reason: 'serverless',
    message: SERVERLESS_MESSAGE,
    capabilities: {
      native: false,
      docker: false,
      wasm: false,
    },
  });
});

export const POST = withRole(['admin'], async () => {
  return NextResponse.json(
    {
      success: false,
      error: SERVERLESS_MESSAGE,
    },
    { status: 501 }
  );
});

export const DELETE = withRole(['admin'], async () => {
  return NextResponse.json({ success: true, message: 'No sandbox to shutdown' });
});
