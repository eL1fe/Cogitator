import { type NextRequest, NextResponse } from 'next/server';
import { createUser, initializeUsersSchema } from '@/lib/auth/users';
import { registerSchema } from '@/lib/validation';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { queryOne } from '@/lib/db';

let schemaInitialized = false;

async function ensureSchema() {
  if (!schemaInitialized) {
    await initializeUsersSchema();
    schemaInitialized = true;
  }
}

export async function POST(request: NextRequest) {
  try {

    if (process.env.COGITATOR_REGISTRATION_ENABLED === 'false') {
      return NextResponse.json(
        { error: 'Registration is disabled' },
        { status: 403 }
      );
    }

    const rateLimitResult = await rateLimit(request, RATE_LIMITS.auth);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    await ensureSchema();

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
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

    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM cogitator_users WHERE email = $1',
      [email]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const user = await createUser({
      email,
      password,
      role: 'user',
    });

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[auth/register] Error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
