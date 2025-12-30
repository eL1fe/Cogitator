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
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[project]/packages/dashboard/src/lib/redis.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CHANNELS",
    ()=>CHANNELS,
    "cache",
    ()=>cache,
    "closeRedis",
    ()=>closeRedis,
    "getRedis",
    ()=>getRedis,
    "getSubscriber",
    ()=>getSubscriber,
    "invalidateCache",
    ()=>invalidateCache,
    "publish",
    ()=>publish,
    "subscribe",
    ()=>subscribe
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$ioredis$40$5$2e$8$2e$2$2f$node_modules$2f$ioredis$2f$built$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/ioredis@5.8.2/node_modules/ioredis/built/index.js [app-route] (ecmascript)");
;
let redis = null;
let subscriber = null;
function getRedis() {
    if (!redis) {
        redis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$ioredis$40$5$2e$8$2e$2$2f$node_modules$2f$ioredis$2f$built$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            maxRetriesPerRequest: 3,
            lazyConnect: true
        });
    }
    return redis;
}
function getSubscriber() {
    if (!subscriber) {
        subscriber = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$ioredis$40$5$2e$8$2e$2$2f$node_modules$2f$ioredis$2f$built$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            maxRetriesPerRequest: 3,
            lazyConnect: true
        });
    }
    return subscriber;
}
async function publish(channel, message) {
    const client = getRedis();
    await client.publish(channel, JSON.stringify(message));
}
async function subscribe(channel, callback) {
    const sub = getSubscriber();
    await sub.subscribe(channel);
    const handler = (ch, msg)=>{
        if (ch === channel) {
            try {
                callback(JSON.parse(msg));
            } catch  {
                callback(msg);
            }
        }
    };
    sub.on('message', handler);
    return ()=>{
        sub.off('message', handler);
        sub.unsubscribe(channel);
    };
}
async function cache(key, fn, ttlSeconds = 60) {
    const client = getRedis();
    const cached = await client.get(key);
    if (cached) {
        return JSON.parse(cached);
    }
    const result = await fn();
    await client.setex(key, ttlSeconds, JSON.stringify(result));
    return result;
}
async function invalidateCache(pattern) {
    const client = getRedis();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
        await client.del(...keys);
    }
}
async function closeRedis() {
    if (redis) {
        await redis.quit();
        redis = null;
    }
    if (subscriber) {
        await subscriber.quit();
        subscriber = null;
    }
}
const CHANNELS = {
    RUN_STARTED: 'cogitator:run:started',
    RUN_COMPLETED: 'cogitator:run:completed',
    RUN_FAILED: 'cogitator:run:failed',
    LOG_ENTRY: 'cogitator:log:entry',
    AGENT_STATUS: 'cogitator:agent:status',
    TOOL_CALL: 'cogitator:tool:call'
};
}),
"[project]/packages/dashboard/src/app/api/health/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_react-dom@19.2.3_react@19.2.3/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/redis.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function GET() {
    const health = {
        status: 'healthy',
        services: {
            database: {
                status: 'down'
            },
            redis: {
                status: 'down'
            },
            ollama: {
                status: 'down'
            }
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    };
    // Check PostgreSQL
    try {
        const pool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPool"])();
        const start = Date.now();
        await pool.query('SELECT 1');
        health.services.database = {
            status: 'up',
            latency: Date.now() - start
        };
    } catch  {
        health.services.database = {
            status: 'down'
        };
        health.status = 'degraded';
    }
    // Check Redis
    try {
        const redis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRedis"])();
        const start = Date.now();
        await redis.ping();
        health.services.redis = {
            status: 'up',
            latency: Date.now() - start
        };
    } catch  {
        health.services.redis = {
            status: 'down'
        };
        health.status = 'degraded';
    }
    // Check Ollama
    try {
        const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        const response = await fetch(`${ollamaUrl}/api/tags`, {
            signal: AbortSignal.timeout(5000)
        });
        if (response.ok) {
            const data = await response.json();
            health.services.ollama = {
                status: 'up',
                models: data.models?.map((m)=>m.name) || []
            };
        }
    } catch  {
        health.services.ollama = {
            status: 'down'
        };
    // Ollama is optional, don't mark as degraded
    }
    // If database is down, system is unhealthy
    if (health.services.database.status === 'down') {
        health.status = 'unhealthy';
    }
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(health, {
        status: statusCode
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f9d17d36._.js.map