import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { getUserById } from '@/lib/auth/users';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const user = request.user!;
    const userData = await getUserById(user.id);

    return NextResponse.json({
      user: userData || user,
    });
  } catch (error) {
    console.error('[auth/me] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    );
  }
});
