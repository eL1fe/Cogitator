import { NextRequest, NextResponse } from 'next/server';
import { getAgentById, updateAgent, deleteAgent } from '@/lib/db/agents';
import { getAllRuns } from '@/lib/db/runs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const agent = await getAgentById(id);
    
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Get recent runs for this agent
    const runs = await getAllRuns({ agentId: id, limit: 20 });

    return NextResponse.json({ ...agent, recentRuns: runs });
  } catch (error) {
    console.error('Failed to fetch agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const agent = await updateAgent(id, {
      name: body.name,
      model: body.model,
      description: body.description,
      instructions: body.instructions,
      status: body.status,
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Failed to update agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteAgent(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}

