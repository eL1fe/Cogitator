import { NextRequest, NextResponse } from 'next/server';
import { getOllamaModels, checkOllamaHealth, POPULAR_MODELS } from '@/lib/ollama';
import { getConfig, setConfig } from '@/lib/db/config';
import {
  getModelRegistry,
  initializeModels,
  getModel,
  getPrice,
  listModels,
  BUILTIN_MODELS,
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
  GOOGLE_MODELS,
} from '@cogitator/models';

interface ApiKeysConfig {
  openai?: string;
  anthropic?: string;
  google?: string;
}

let modelsInitialized = false;

async function ensureModelsInitialized() {
  if (!modelsInitialized) {
    try {
      await initializeModels();
      modelsInitialized = true;
    } catch (error) {
      console.warn('[models] Failed to initialize models registry:', error);
      modelsInitialized = true;
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // Handle specific actions
    if (action === 'pricing') {
      await ensureModelsInitialized();
      const modelName = searchParams.get('model');
      
      if (modelName) {
        const price = getPrice(modelName);
        const model = getModel(modelName);
        return NextResponse.json({
          model: modelName,
          pricing: price,
          info: model,
        });
      }

      // Return all models with pricing
      const allModels = listModels();
      return NextResponse.json({
        models: allModels.map(m => ({
          ...m,
          pricing: getPrice(m.id),
        })),
      });
    }

    if (action === 'registry') {
      await ensureModelsInitialized();
      const provider = searchParams.get('provider');
      const models = listModels(provider ? { provider } : undefined);
      return NextResponse.json({ models });
    }

    // Default: return all available models
    // Get Ollama models
    const ollamaHealth = await checkOllamaHealth();
    const ollamaModels = ollamaHealth.available ? await getOllamaModels() : [];
    
    // Get API keys status (not the actual keys)
    const apiKeys = await getConfig<ApiKeysConfig>('api_keys');
    
    // Mark which popular models are downloaded
    // Build sets for efficient lookup
    const downloadedFullNames = new Set(ollamaModels.map((m) => m.name));
    
    const availableModels = POPULAR_MODELS.map((m) => {
      const [baseName, tag] = m.name.split(':');
      
      // Check for exact match first
      if (downloadedFullNames.has(m.name)) {
        return { ...m, isDownloaded: true };
      }
      
      // For models without explicit tag (e.g., "nomic-embed-text"), check if :latest exists
      if (!tag) {
        if (downloadedFullNames.has(`${baseName}:latest`)) {
          return { ...m, isDownloaded: true };
        }
      }
      
      // For models with a tag, also check if base:latest exists (some models use :latest as alias)
      // But only if the requested tag is a common variant like numbers (3b, 7b, etc.)
      // Don't match different size variants
      
      return { ...m, isDownloaded: false };
    });

    // Get model info from registry
    await ensureModelsInitialized();

    // Cloud providers with pricing from @cogitator/models
    const cloudProviders = [
      {
        id: 'openai',
        name: 'OpenAI',
        models: OPENAI_MODELS.map(m => ({
          id: m.id,
          name: m.displayName,
          contextLength: m.contextWindow,
          pricing: m.pricing,
          capabilities: m.capabilities,
        })),
        configured: !!apiKeys?.openai || !!process.env.OPENAI_API_KEY,
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        models: ANTHROPIC_MODELS.map(m => ({
          id: m.id,
          name: m.displayName,
          contextLength: m.contextWindow,
          pricing: m.pricing,
          capabilities: m.capabilities,
        })),
        configured: !!apiKeys?.anthropic || !!process.env.ANTHROPIC_API_KEY,
      },
      {
        id: 'google',
        name: 'Google',
        models: GOOGLE_MODELS.map(m => ({
          id: m.id,
          name: m.displayName,
          contextLength: m.contextWindow,
          pricing: m.pricing,
          capabilities: m.capabilities,
        })),
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
      registry: {
        totalModels: BUILTIN_MODELS.length,
        providers: ['openai', 'anthropic', 'google', 'ollama'],
      },
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
