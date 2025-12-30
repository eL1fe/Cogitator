import { NextRequest, NextResponse } from 'next/server';
import { getOllamaModels, checkOllamaHealth, POPULAR_MODELS } from '@/lib/ollama';
import { getConfig, setConfig } from '@/lib/db/config';

interface ApiKeysConfig {
  openai?: string;
  anthropic?: string;
  google?: string;
}

export async function GET() {
  try {
    // Get Ollama models
    const ollamaHealth = await checkOllamaHealth();
    const ollamaModels = ollamaHealth.available ? await getOllamaModels() : [];
    
    // Get API keys status (not the actual keys)
    const apiKeys = await getConfig<ApiKeysConfig>('api_keys');
    
    // Mark which popular models are downloaded
    const downloadedNames = new Set(ollamaModels.map((m) => m.name));
    const availableModels = POPULAR_MODELS.map((m) => ({
      ...m,
      isDownloaded: downloadedNames.has(m.name),
    }));

    // Cloud providers
    const cloudProviders = [
      {
        id: 'openai',
        name: 'OpenAI',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'],
        configured: !!apiKeys?.openai || !!process.env.OPENAI_API_KEY,
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
        configured: !!apiKeys?.anthropic || !!process.env.ANTHROPIC_API_KEY,
      },
      {
        id: 'google',
        name: 'Google',
        models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'],
        configured: !!apiKeys?.google || !!process.env.GOOGLE_API_KEY,
      },
    ];

    return NextResponse.json({
      ollama: {
        available: ollamaHealth.available,
        version: ollamaHealth.version,
        models: ollamaModels,
      },
      available: availableModels,
      cloud: cloudProviders,
    });
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'save_api_keys') {
      const { openai, anthropic, google } = body;
      
      // Only save non-empty keys
      const keys: ApiKeysConfig = {};
      if (openai) keys.openai = openai;
      if (anthropic) keys.anthropic = anthropic;
      if (google) keys.google = google;
      
      await setConfig('api_keys', keys);
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to process request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
