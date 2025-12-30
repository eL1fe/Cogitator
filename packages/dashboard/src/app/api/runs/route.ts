import { NextRequest, NextResponse } from 'next/server';
import { getAllRuns, createRun, getRunStats } from '@/lib/db/runs';
import { initializeSchema } from '@/lib/db';
import { publish, CHANNELS } from '@/lib/redis';

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    try {
      await initializeSchema();
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const agentId = searchParams.get('agentId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const runs = await getAllRuns({ status, agentId, limit, offset });
    const stats = await getRunStats('day');

    return NextResponse.json({
      runs,
      stats,
      pagination: { limit, offset },
    });
  } catch (error) {
    console.error('Failed to fetch runs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch runs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    const body = await request.json();
    
    if (!body.agentId || !body.input) {
      return NextResponse.json(
        { error: 'agentId and input are required' },
        { status: 400 }
      );
    }

    const run = await createRun({
      agentId: body.agentId,
      threadId: body.threadId,
      input: body.input,
    });

    // Publish real-time event
    try {
      await publish(CHANNELS.RUN_STARTED, run);
    } catch {
      // Redis might not be available
    }

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error('Failed to create run:', error);
    return NextResponse.json(
      { error: 'Failed to create run' },
      { status: 500 }
    );
  }
}
