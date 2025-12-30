import { NextResponse } from 'next/server';
import { getThread, deleteThread } from '@/lib/cogitator/db';
import { withAuth } from '@/lib/auth/middleware';

export const GET = withAuth(async (_request, context) => {
  try {
    const { id } = await context!.params!;
    const thread = await getThread(id);

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json(thread);
  } catch (error) {
    console.error('[api/threads] Failed to fetch thread:', error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (_request, context) => {
  try {
    const { id } = await context!.params!;
    const deleted = await deleteThread(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/threads] Failed to delete thread:', error);
    return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
  }
});
