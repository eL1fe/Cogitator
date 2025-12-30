import { NextResponse } from 'next/server';
import { getRunById, getRunToolCalls, getRunMessages } from '@/lib/db/runs';
import { getSpansByRunId } from '@/lib/db/spans';
import { initializeSchema } from '@/lib/db';
import { initializeExtendedSchema } from '@/lib/cogitator/db';
import { withAuth } from '@/lib/auth/middleware';

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    try {
      await initializeSchema();
      await initializeExtendedSchema();
      initialized = true;
    } catch (error) {
      console.error('[api/runs/[id]] Failed to initialize database:', error);
    }
  }
}

export const GET = withAuth(async (_request, context) => {
  try {
    await ensureInitialized();

    const { id } = await context!.params!;
    const run = await getRunById(id);

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    const [toolCalls, messages, spans] = await Promise.all([
      getRunToolCalls(id),
      getRunMessages(id),
      getSpansByRunId(id),
    ]);

    return NextResponse.json({
      ...run,
      toolCalls,
      messages,
      spans,
    });
  } catch (error) {
    console.error('[api/runs/[id]] Failed to fetch run:', error);
    return NextResponse.json({ error: 'Failed to fetch run' }, { status: 500 });
  }
});
