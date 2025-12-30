import { NextRequest, NextResponse } from 'next/server';
import { getCogitatorConfig, setCogitatorConfig, getAllConfig } from '@/lib/db/config';
import { initializeSchema } from '@/lib/db';

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

export async function GET() {
  try {
    await ensureInitialized();
    
    const config = await getCogitatorConfig();
    const allConfig = await getAllConfig();
    
    // Check environment variables
    const envVars = {
      POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
      POSTGRES_PORT: process.env.POSTGRES_PORT || '5432',
      REDIS_HOST: process.env.REDIS_HOST || 'localhost',
      REDIS_PORT: process.env.REDIS_PORT || '6379',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '***' : undefined,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '***' : undefined,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? '***' : undefined,
    };

    return NextResponse.json({
      cogitator: config || getDefaultConfig(),
      all: allConfig,
      environment: envVars,
    });
  } catch (error) {
    console.error('Failed to fetch config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureInitialized();
    const body = await request.json();
    
    if (!body.llm?.provider || !body.llm?.model) {
      return NextResponse.json(
        { error: 'llm.provider and llm.model are required' },
        { status: 400 }
      );
    }

    await setCogitatorConfig(body);
    const config = await getCogitatorConfig();

    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to update config:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}

function getDefaultConfig() {
  return {
    llm: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 4096,
    },
    memory: {
      adapter: 'postgres',
      postgres: {
        url: `postgresql://${process.env.POSTGRES_USER || 'cogitator'}:${process.env.POSTGRES_PASSWORD || 'cogitator'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'cogitator'}`,
      },
    },
    sandbox: {
      enabled: false,
      type: 'docker',
      timeout: 30000,
    },
    limits: {
      maxTurns: 10,
      maxTokens: 100000,
      maxCost: 1.0,
    },
  };
}
