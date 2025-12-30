import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Model name required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${OLLAMA_URL}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete model' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete model:', error);
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    );
  }
}

