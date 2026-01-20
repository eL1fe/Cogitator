import { NextResponse } from 'next/server';
import { withRole, generateApiKey, hashApiKey, type User } from '@/lib/auth/middleware';

export const GET = withRole(['admin'], async () => {
  return NextResponse.json({
    message: 'API keys are stored in environment variables',
    envVars: {
      single: 'COGITATOR_API_KEY - Single API key for simple setups',
      multiple: 'COGITATOR_API_KEYS - JSON array of ApiKey objects',
    },
    format: {
      prefix: 'cog_',
      example: 'cog_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    },
  });
});

export const POST = withRole(['admin'], async (request) => {
  try {
    const body = await request.json();
    const { name, role = 'user' } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!['admin', 'user', 'readonly'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, user, or readonly' },
        { status: 400 }
      );
    }

    const { key, hash } = generateApiKey();

    const apiKeyEntry = {
      id: `key_${Date.now().toString(36)}`,
      hash,
      name,
      role: role as User['role'],
      createdAt: Date.now(),
    };

    return NextResponse.json({
      message: 'API key generated successfully',
      key,
      entry: apiKeyEntry,
      instructions: [
        'Save the key securely - it cannot be recovered',
        'Add to COGITATOR_API_KEY env var for single key setup',
        'Or add entry object to COGITATOR_API_KEYS JSON array',
        'Use as: Authorization: Bearer cog_xxx or X-API-Key: cog_xxx',
      ],
    });
  } catch (error) {
    console.error('[api/auth/keys] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate key' },
      { status: 500 }
    );
  }
});

export const DELETE = withRole(['admin'], async (request) => {
  const searchParams = request.nextUrl.searchParams;
  const keyToRevoke = searchParams.get('key');

  if (!keyToRevoke) {
    return NextResponse.json({ error: 'Key parameter required' }, { status: 400 });
  }

  const hash = hashApiKey(keyToRevoke);

  return NextResponse.json({
    message: 'To revoke this key, remove the entry with this hash from COGITATOR_API_KEYS',
    hash,
    instructions: [
      'API keys are managed via environment variables',
      'Remove the entry with matching hash from COGITATOR_API_KEYS',
      'Or change COGITATOR_API_KEY if using single key mode',
      'Restart the server for changes to take effect',
    ],
  });
});
