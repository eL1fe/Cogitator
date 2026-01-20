import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'crypto';

export interface User {
  id: string;
  email?: string;
  role: 'admin' | 'user' | 'readonly';
  authMethod?: 'session' | 'api_key';
}

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

export type RouteHandler = (
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse> | NextResponse;

export type AuthenticatedRouteHandler = (
  request: AuthenticatedRequest,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse> | NextResponse;

export interface ApiKey {
  id: string;
  hash: string;
  name: string;
  role: User['role'];
  createdAt: number;
  lastUsed?: number;
}

function isAuthEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return process.env.COGITATOR_AUTH_ENABLED !== 'false';
  }
  return process.env.COGITATOR_AUTH_ENABLED === 'true';
}

function getDefaultUser(): User {
  return {
    id: 'dev-admin',
    email: 'dev@localhost',
    role: 'admin',
    authMethod: 'session',
  };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export function generateApiKey(): { key: string; hash: string } {
  const prefix = 'cog_';
  const randomPart = Array.from({ length: 32 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
      Math.floor(Math.random() * 62)
    )
  ).join('');
  const key = `${prefix}${randomPart}`;
  return { key, hash: hashApiKey(key) };
}

function getApiKeys(): ApiKey[] {
  const keysJson = process.env.COGITATOR_API_KEYS;
  if (!keysJson) return [];

  try {
    return JSON.parse(keysJson);
  } catch {
    const singleKey = process.env.COGITATOR_API_KEY;
    if (singleKey) {
      return [
        {
          id: 'env-key',
          hash: hashApiKey(singleKey),
          name: 'Environment Key',
          role: 'admin',
          createdAt: Date.now(),
        },
      ];
    }
    return [];
  }
}

function validateApiKey(providedKey: string): User | null {
  const apiKeys = getApiKeys();
  if (apiKeys.length === 0) return null;

  const providedHash = hashApiKey(providedKey);
  const providedBuffer = Buffer.from(providedHash, 'hex');

  for (const apiKey of apiKeys) {
    const storedBuffer = Buffer.from(apiKey.hash, 'hex');
    if (
      providedBuffer.length === storedBuffer.length &&
      timingSafeEqual(providedBuffer, storedBuffer)
    ) {
      return {
        id: `api_${apiKey.id}`,
        email: undefined,
        role: apiKey.role,
        authMethod: 'api_key',
      };
    }
  }

  return null;
}

function extractApiKeyFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token.startsWith('cog_')) {
      return token;
    }
  }

  const xApiKey = request.headers.get('x-api-key');
  if (xApiKey) {
    return xApiKey;
  }

  return null;
}

async function createSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {}
        },
      },
    }
  );
}

export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  if (!isAuthEnabled()) {
    return getDefaultUser();
  }

  const apiKey = extractApiKeyFromRequest(request);
  if (apiKey) {
    const user = validateApiKey(apiKey);
    if (user) return user;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('[Auth] Supabase not configured, using default user');
    return getDefaultUser();
  }

  try {
    const supabase = await createSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: (user.user_metadata?.role as User['role']) || 'user',
      authMethod: 'session',
    };
  } catch (error) {
    console.error('[Auth] Failed to get user:', error);
    return null;
  }
}

export function withAuth(handler: AuthenticatedRouteHandler): RouteHandler {
  return async (request: NextRequest, context) => {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    (request as AuthenticatedRequest).user = user;
    return handler(request as AuthenticatedRequest, context);
  };
}

export function withRole(
  roles: ('admin' | 'user' | 'readonly')[],
  handler: AuthenticatedRouteHandler
): RouteHandler {
  return async (request: NextRequest, context) => {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS' },
        { status: 403 }
      );
    }

    (request as AuthenticatedRequest).user = user;
    return handler(request as AuthenticatedRequest, context);
  };
}

export function canRead(user: User): boolean {
  return ['admin', 'user', 'readonly'].includes(user.role);
}

export function canWrite(user: User): boolean {
  return ['admin', 'user'].includes(user.role);
}

export function canAdmin(user: User): boolean {
  return user.role === 'admin';
}
