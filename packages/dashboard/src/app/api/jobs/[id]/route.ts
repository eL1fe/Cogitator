import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { getJob, cancelJob } from '@/lib/worker';

export const GET = withAuth(async (_request: AuthenticatedRequest, context) => {
  try {
    const { id } = await context!.params!;

    const job = await getJob(id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('[api/jobs] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch job' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: AuthenticatedRequest, context) => {
  try {
    const { id } = await context!.params!;

    const job = await getJob(id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.userId !== request.user!.id && request.user!.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const cancelled = await cancelJob(id);
    if (!cancelled) {
      return NextResponse.json(
        { error: 'Job cannot be cancelled (already completed or failed)' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Job cancelled' });
  } catch (error) {
    console.error('[api/jobs] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel job' },
      { status: 500 }
    );
  }
});
