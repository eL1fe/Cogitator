import { NextRequest, NextResponse } from 'next/server';
import { getRunById, updateRun, getRunToolCalls, getRunMessages } from '@/lib/db/runs';
import { getSpansByRunId } from '@/lib/db/spans';
import { incrementAgentStats } from '@/lib/db/agents';
import { publish, CHANNELS } from '@/lib/redis';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const run = await getRunById(id);
    
    if (!run) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      );
    }

    // Get related data
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
    console.error('Failed to fetch run:', error);
    return NextResponse.json(
      { error: 'Failed to fetch run' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const existingRun = await getRunById(id);
    if (!existingRun) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      );
    }

    const run = await updateRun(id, {
      status: body.status,
      output: body.output,
      duration: body.duration,
      inputTokens: body.inputTokens,
      outputTokens: body.outputTokens,
      totalTokens: body.totalTokens,
      cost: body.cost,
      error: body.error,
    });

    // Update agent stats if run completed
    if (body.status === 'completed' || body.status === 'failed') {
      try {
        await incrementAgentStats(
          existingRun.agentId,
          body.totalTokens || 0,
          body.cost || 0
        );
      } catch {
        // Non-critical
      }

      // Publish real-time event
      try {
        const channel = body.status === 'completed' 
          ? CHANNELS.RUN_COMPLETED 
          : CHANNELS.RUN_FAILED;
        await publish(channel, run);
      } catch {
        // Redis might not be available
      }
    }

    return NextResponse.json(run);
  } catch (error) {
    console.error('Failed to update run:', error);
    return NextResponse.json(
      { error: 'Failed to update run' },
      { status: 500 }
    );
  }
}

