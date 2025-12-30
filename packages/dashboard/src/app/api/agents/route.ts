import { NextRequest, NextResponse } from 'next/server';
import { getAllAgents, createAgent, seedDefaultAgents } from '@/lib/db/agents';
import { initializeSchema } from '@/lib/db';

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    try {
      await initializeSchema();
      await seedDefaultAgents();
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

export async function GET() {
  try {
    await ensureInitialized();
    const agents = await getAllAgents();
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    const body = await request.json();
    
    if (!body.name || !body.model) {
      return NextResponse.json(
        { error: 'Name and model are required' },
        { status: 400 }
      );
    }

    const agent = await createAgent({
      name: body.name,
      model: body.model,
      description: body.description,
      instructions: body.instructions,
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('Failed to create agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
