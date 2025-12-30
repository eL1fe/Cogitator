import { query, queryOne, execute } from './index';

export async function getConfig<T>(key: string): Promise<T | null> {
  const row = await queryOne<{ value: T }>(
    'SELECT value FROM dashboard_config WHERE key = $1',
    [key]
  );
  return row?.value || null;
}

export async function setConfig<T>(key: string, value: T): Promise<void> {
  await execute(
    `INSERT INTO dashboard_config (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, JSON.stringify(value)]
  );
}

export async function deleteConfig(key: string): Promise<boolean> {
  const count = await execute('DELETE FROM dashboard_config WHERE key = $1', [key]);
  return count > 0;
}

export async function getAllConfig(): Promise<Record<string, unknown>> {
  const rows = await query<{ key: string; value: unknown }>(
    'SELECT key, value FROM dashboard_config'
  );
  
  const config: Record<string, unknown> = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  return config;
}

export interface CogitatorConfig {
  llm: {
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  };
  memory?: {
    adapter: string;
    redis?: { url: string };
    postgres?: { url: string };
  };
  sandbox?: {
    enabled: boolean;
    type: string;
    timeout?: number;
  };
  limits?: {
    maxTurns?: number;
    maxTokens?: number;
    maxCost?: number;
  };
}

export async function getCogitatorConfig(): Promise<CogitatorConfig | null> {
  return getConfig<CogitatorConfig>('cogitator');
}

export async function setCogitatorConfig(config: CogitatorConfig): Promise<void> {
  await setConfig('cogitator', config);
}

