module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/packages/dashboard/src/lib/ollama.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POPULAR_MODELS",
    ()=>POPULAR_MODELS,
    "checkOllamaHealth",
    ()=>checkOllamaHealth,
    "deleteModel",
    ()=>deleteModel,
    "getModelInfo",
    ()=>getModelInfo,
    "getOllamaModels",
    ()=>getOllamaModels,
    "pullModel",
    ()=>pullModel
]);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
async function getOllamaModels() {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`);
        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status}`);
        }
        const data = await response.json();
        const models = data.models || [];
        return models.map((m)=>({
                name: m.name,
                displayName: formatModelName(m.name),
                size: m.size,
                sizeFormatted: formatSize(m.size),
                parameterSize: m.details?.parameter_size || 'Unknown',
                family: m.details?.family || 'Unknown',
                quantization: m.details?.quantization_level || 'Unknown',
                modifiedAt: m.modified_at,
                isDownloaded: true
            }));
    } catch (error) {
        console.error('Failed to fetch Ollama models:', error);
        return [];
    }
}
async function getModelInfo(name) {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/show`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name
            })
        });
        if (!response.ok) return null;
        const data = await response.json();
        return {
            name,
            displayName: formatModelName(name),
            size: 0,
            sizeFormatted: 'Unknown',
            parameterSize: data.details?.parameter_size || 'Unknown',
            family: data.details?.family || 'Unknown',
            quantization: data.details?.quantization_level || 'Unknown',
            modifiedAt: data.modified_at || '',
            isDownloaded: true
        };
    } catch  {
        return null;
    }
}
async function pullModel(name, onProgress) {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/pull`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                stream: true
            })
        });
        if (!response.ok || !response.body) {
            throw new Error(`Failed to pull model: ${response.status}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while(true){
            const { done, value } = await reader.read();
            if (done) break;
            const lines = decoder.decode(value).split('\n').filter(Boolean);
            for (const line of lines){
                try {
                    const progress = JSON.parse(line);
                    if (progress.total && progress.completed) {
                        progress.percent = Math.round(progress.completed / progress.total * 100);
                    }
                    onProgress(progress);
                } catch  {
                // Ignore parse errors
                }
            }
        }
        return true;
    } catch (error) {
        console.error('Failed to pull model:', error);
        return false;
    }
}
async function deleteModel(name) {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name
            })
        });
        return response.ok;
    } catch  {
        return false;
    }
}
async function checkOllamaHealth() {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/version`);
        if (response.ok) {
            const data = await response.json();
            return {
                available: true,
                version: data.version
            };
        }
        return {
            available: false
        };
    } catch  {
        return {
            available: false
        };
    }
}
const POPULAR_MODELS = [
    {
        name: 'llama3.2:3b',
        description: 'Llama 3.2 3B - Fast and efficient',
        size: '2.0 GB'
    },
    {
        name: 'llama3.2:1b',
        description: 'Llama 3.2 1B - Ultra-lightweight',
        size: '1.3 GB'
    },
    {
        name: 'llama3.1:8b',
        description: 'Llama 3.1 8B - Balanced performance',
        size: '4.7 GB'
    },
    {
        name: 'llama3.1:70b',
        description: 'Llama 3.1 70B - High capability',
        size: '40 GB'
    },
    {
        name: 'mistral:7b',
        description: 'Mistral 7B - Strong reasoning',
        size: '4.1 GB'
    },
    {
        name: 'mixtral:8x7b',
        description: 'Mixtral 8x7B MoE - Expert mixture',
        size: '26 GB'
    },
    {
        name: 'codellama:7b',
        description: 'Code Llama 7B - Code generation',
        size: '3.8 GB'
    },
    {
        name: 'codellama:13b',
        description: 'Code Llama 13B - Better code',
        size: '7.4 GB'
    },
    {
        name: 'gemma2:9b',
        description: 'Gemma 2 9B - Google model',
        size: '5.4 GB'
    },
    {
        name: 'gemma2:2b',
        description: 'Gemma 2 2B - Compact Google',
        size: '1.6 GB'
    },
    {
        name: 'qwen2.5:7b',
        description: 'Qwen 2.5 7B - Multilingual',
        size: '4.4 GB'
    },
    {
        name: 'qwen2.5:14b',
        description: 'Qwen 2.5 14B - Larger Qwen',
        size: '8.9 GB'
    },
    {
        name: 'phi3:mini',
        description: 'Phi-3 Mini - Microsoft compact',
        size: '2.2 GB'
    },
    {
        name: 'deepseek-coder:6.7b',
        description: 'DeepSeek Coder - Code specialist',
        size: '3.8 GB'
    },
    {
        name: 'nomic-embed-text',
        description: 'Nomic Embed - Text embeddings',
        size: '274 MB'
    }
];
function formatModelName(name) {
    const parts = name.split(':');
    const base = parts[0].replace(/-/g, ' ').replace(/\b\w/g, (c)=>c.toUpperCase());
    const tag = parts[1] || 'latest';
    return `${base} (${tag})`;
}
function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
}),
"[project]/packages/dashboard/src/lib/db/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "closePool",
    ()=>closePool,
    "execute",
    ()=>execute,
    "getPool",
    ()=>getPool,
    "initializeSchema",
    ()=>initializeSchema,
    "query",
    ()=>query,
    "queryOne",
    ()=>queryOne,
    "withTransaction",
    ()=>withTransaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$16$2e$3$2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/.pnpm/pg@8.16.3/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$16$2e$3$2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$16$2e$3$2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
let pool = null;
function getPool() {
    if (!pool) {
        pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$40$8$2e$16$2e$3$2f$node_modules$2f$pg$29$__["Pool"]({
            host: process.env.POSTGRES_HOST || 'localhost',
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
            user: process.env.POSTGRES_USER || 'cogitator',
            password: process.env.POSTGRES_PASSWORD || 'cogitator',
            database: process.env.POSTGRES_DB || 'cogitator',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        });
    }
    return pool;
}
async function query(sql, params) {
    const pool = getPool();
    const result = await pool.query(sql, params);
    return result.rows;
}
async function queryOne(sql, params) {
    const rows = await query(sql, params);
    return rows[0] || null;
}
async function execute(sql, params) {
    const pool = getPool();
    const result = await pool.query(sql, params);
    return result.rowCount || 0;
}
async function withTransaction(fn) {
    const pool = getPool();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally{
        client.release();
    }
}
async function initializeSchema() {
    const pool = getPool();
    await pool.query(`
    -- Agents table
    CREATE TABLE IF NOT EXISTS dashboard_agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      description TEXT,
      instructions TEXT,
      status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
      total_runs INTEGER DEFAULT 0,
      total_tokens BIGINT DEFAULT 0,
      total_cost DECIMAL(12, 6) DEFAULT 0,
      last_run_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Runs table
    CREATE TABLE IF NOT EXISTS dashboard_runs (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL REFERENCES dashboard_agents(id) ON DELETE CASCADE,
      thread_id TEXT,
      status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
      input TEXT NOT NULL,
      output TEXT,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      duration INTEGER,
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      cost DECIMAL(12, 6) DEFAULT 0,
      error TEXT
    );

    -- Tool calls table
    CREATE TABLE IF NOT EXISTS dashboard_tool_calls (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES dashboard_runs(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      arguments JSONB,
      result JSONB,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error')),
      duration INTEGER,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      error TEXT
    );

    -- Spans table (for tracing)
    CREATE TABLE IF NOT EXISTS dashboard_spans (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES dashboard_runs(id) ON DELETE CASCADE,
      trace_id TEXT NOT NULL,
      parent_id TEXT,
      name TEXT NOT NULL,
      kind TEXT DEFAULT 'internal',
      status TEXT DEFAULT 'unset' CHECK (status IN ('ok', 'error', 'unset')),
      start_time BIGINT NOT NULL,
      end_time BIGINT,
      duration INTEGER,
      attributes JSONB,
      events JSONB
    );

    -- Logs table
    CREATE TABLE IF NOT EXISTS dashboard_logs (
      id TEXT PRIMARY KEY,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
      message TEXT NOT NULL,
      source TEXT,
      agent_id TEXT,
      run_id TEXT,
      metadata JSONB
    );

    -- Messages table (conversation history)
    CREATE TABLE IF NOT EXISTS dashboard_messages (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES dashboard_runs(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
      content TEXT NOT NULL,
      tool_call_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Config table (key-value store)
    CREATE TABLE IF NOT EXISTS dashboard_config (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_dashboard_runs_agent_id ON dashboard_runs(agent_id);
    CREATE INDEX IF NOT EXISTS idx_dashboard_runs_status ON dashboard_runs(status);
    CREATE INDEX IF NOT EXISTS idx_dashboard_runs_started_at ON dashboard_runs(started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_dashboard_tool_calls_run_id ON dashboard_tool_calls(run_id);
    CREATE INDEX IF NOT EXISTS idx_dashboard_spans_run_id ON dashboard_spans(run_id);
    CREATE INDEX IF NOT EXISTS idx_dashboard_spans_trace_id ON dashboard_spans(trace_id);
    CREATE INDEX IF NOT EXISTS idx_dashboard_logs_timestamp ON dashboard_logs(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_dashboard_logs_level ON dashboard_logs(level);
    CREATE INDEX IF NOT EXISTS idx_dashboard_logs_run_id ON dashboard_logs(run_id);
    CREATE INDEX IF NOT EXISTS idx_dashboard_messages_run_id ON dashboard_messages(run_id);
  `);
}
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/packages/dashboard/src/lib/db/config.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "deleteConfig",
    ()=>deleteConfig,
    "getAllConfig",
    ()=>getAllConfig,
    "getCogitatorConfig",
    ()=>getCogitatorConfig,
    "getConfig",
    ()=>getConfig,
    "setCogitatorConfig",
    ()=>setCogitatorConfig,
    "setConfig",
    ()=>setConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/db/index.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function getConfig(key) {
    const row = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])('SELECT value FROM dashboard_config WHERE key = $1', [
        key
    ]);
    return row?.value || null;
}
async function setConfig(key, value) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO dashboard_config (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`, [
        key,
        JSON.stringify(value)
    ]);
}
async function deleteConfig(key) {
    const count = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM dashboard_config WHERE key = $1', [
        key
    ]);
    return count > 0;
}
async function getAllConfig() {
    const rows = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT key, value FROM dashboard_config');
    const config = {};
    for (const row of rows){
        config[row.key] = row.value;
    }
    return config;
}
async function getCogitatorConfig() {
    return getConfig('cogitator');
}
async function setCogitatorConfig(config) {
    await setConfig('cogitator', config);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/packages/dashboard/src/app/api/models/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_react-dom@19.2.3_react@19.2.3/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$ollama$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/ollama.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/db/config.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function GET() {
    try {
        // Get Ollama models
        const ollamaHealth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$ollama$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkOllamaHealth"])();
        const ollamaModels = ollamaHealth.available ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$ollama$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOllamaModels"])() : [];
        // Get API keys status (not the actual keys)
        const apiKeys = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConfig"])('api_keys');
        // Mark which popular models are downloaded
        const downloadedNames = new Set(ollamaModels.map((m)=>m.name));
        const availableModels = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$ollama$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["POPULAR_MODELS"].map((m)=>({
                ...m,
                isDownloaded: downloadedNames.has(m.name)
            }));
        // Cloud providers
        const cloudProviders = [
            {
                id: 'openai',
                name: 'OpenAI',
                models: [
                    'gpt-4o',
                    'gpt-4o-mini',
                    'gpt-4-turbo',
                    'gpt-3.5-turbo',
                    'o1-preview',
                    'o1-mini'
                ],
                configured: !!apiKeys?.openai || !!process.env.OPENAI_API_KEY
            },
            {
                id: 'anthropic',
                name: 'Anthropic',
                models: [
                    'claude-3-5-sonnet-20241022',
                    'claude-3-5-haiku-20241022',
                    'claude-3-opus-20240229'
                ],
                configured: !!apiKeys?.anthropic || !!process.env.ANTHROPIC_API_KEY
            },
            {
                id: 'google',
                name: 'Google',
                models: [
                    'gemini-1.5-pro',
                    'gemini-1.5-flash',
                    'gemini-2.0-flash-exp'
                ],
                configured: !!apiKeys?.google || !!process.env.GOOGLE_API_KEY
            }
        ];
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ollama: {
                available: ollamaHealth.available,
                version: ollamaHealth.version,
                models: ollamaModels
            },
            available: availableModels,
            cloud: cloudProviders
        });
    } catch (error) {
        console.error('Failed to fetch models:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch models'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { action } = body;
        if (action === 'save_api_keys') {
            const { openai, anthropic, google } = body;
            // Only save non-empty keys
            const keys = {};
            if (openai) keys.openai = openai;
            if (anthropic) keys.anthropic = anthropic;
            if (google) keys.google = google;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setConfig"])('api_keys', keys);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Unknown action'
        }, {
            status: 400
        });
    } catch (error) {
        console.error('Failed to process request:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to process request'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8c999929._.js.map