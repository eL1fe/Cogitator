import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export const POST = withAuth(async (request) => {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Model name required' }, { status: 400 });
    }

    const response = await fetch(`${OLLAMA_URL}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete model:', error);
    return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 });
  }
});
