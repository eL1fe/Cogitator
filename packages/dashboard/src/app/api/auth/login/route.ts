import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticateUser, initializeUsersSchema, ensureDefaultAdmin } from '@/lib/auth/users';
import { createAccessToken, createRefreshToken } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/validation';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

let schemaInitialized = false;

async function ensureSchema() {
  if (!schemaInitialized) {
    await initializeUsersSchema();
    await ensureDefaultAdmin();
    schemaInitialized = true;
  }
}

export async function POST(request: NextRequest) {
  try {

    const rateLimitResult = await rateLimit(request, RATE_LIMITS.auth);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    await ensureSchema();

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const accessToken = await createAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await createRefreshToken({
      id: user.id,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('cogitator_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    cookieStore.set('cogitator_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('[auth/login] Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
