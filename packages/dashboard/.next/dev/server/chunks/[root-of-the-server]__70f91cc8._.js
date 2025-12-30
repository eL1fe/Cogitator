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
"[project]/packages/dashboard/src/lib/db/analytics.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getDashboardStats",
    ()=>getDashboardStats,
    "getHourlyStats",
    ()=>getHourlyStats,
    "getModelStats",
    ()=>getModelStats,
    "getTopAgents",
    ()=>getTopAgents
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/db/index.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function getHourlyStats(hours = 24) {
    const rows = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    WITH hours AS (
      SELECT generate_series(
        date_trunc('hour', NOW() - INTERVAL '${hours} hours'),
        date_trunc('hour', NOW()),
        INTERVAL '1 hour'
      ) AS hour
    )
    SELECT 
      h.hour,
      COALESCE(COUNT(r.id), 0) as runs,
      COALESCE(SUM(r.total_tokens), 0) as tokens,
      COALESCE(SUM(r.cost), 0) as cost
    FROM hours h
    LEFT JOIN dashboard_runs r ON date_trunc('hour', r.started_at) = h.hour
    GROUP BY h.hour
    ORDER BY h.hour
  `);
    return rows.map((row)=>({
            hour: row.hour.toISOString(),
            runs: parseInt(row.runs),
            tokens: parseInt(row.tokens),
            cost: parseFloat(row.cost)
        }));
}
async function getModelStats(period = 'day') {
    const intervals = {
        day: "NOW() - INTERVAL '1 day'",
        week: "NOW() - INTERVAL '7 days'",
        month: "NOW() - INTERVAL '30 days'"
    };
    const rows = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    SELECT 
      a.model,
      COUNT(r.id) as runs,
      COALESCE(SUM(r.total_tokens), 0) as tokens,
      COALESCE(SUM(r.cost), 0) as cost
    FROM dashboard_runs r
    JOIN dashboard_agents a ON r.agent_id = a.id
    WHERE r.started_at >= ${intervals[period]}
    GROUP BY a.model
    ORDER BY cost DESC
  `);
    return rows.map((row)=>({
            model: row.model,
            runs: parseInt(row.runs),
            tokens: parseInt(row.tokens),
            cost: parseFloat(row.cost)
        }));
}
async function getTopAgents(limit = 10, period = 'week') {
    const intervals = {
        day: "NOW() - INTERVAL '1 day'",
        week: "NOW() - INTERVAL '7 days'",
        month: "NOW() - INTERVAL '30 days'"
    };
    const rows = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    SELECT 
      a.id,
      a.name,
      a.model,
      COUNT(r.id) as runs,
      COALESCE(SUM(r.total_tokens), 0) as tokens,
      COALESCE(SUM(r.cost), 0) as cost,
      COALESCE(AVG(r.duration), 0) as avg_duration,
      COALESCE(
        SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END)::float / NULLIF(COUNT(r.id), 0) * 100,
        0
      ) as success_rate
    FROM dashboard_agents a
    LEFT JOIN dashboard_runs r ON r.agent_id = a.id AND r.started_at >= ${intervals[period]}
    GROUP BY a.id, a.name, a.model
    ORDER BY runs DESC
    LIMIT $1
  `, [
        limit
    ]);
    return rows.map((row)=>({
            id: row.id,
            name: row.name,
            model: row.model,
            runs: parseInt(row.runs),
            tokens: parseInt(row.tokens),
            cost: parseFloat(row.cost),
            avgDuration: parseFloat(row.avg_duration),
            successRate: parseFloat(row.success_rate)
        }));
}
async function getDashboardStats() {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`
    SELECT
      (SELECT COUNT(*) FROM dashboard_runs WHERE started_at >= NOW() - INTERVAL '24 hours') as total_runs,
      (SELECT COUNT(*) FROM dashboard_agents WHERE status != 'offline') as active_agents,
      (SELECT COALESCE(SUM(total_tokens), 0) FROM dashboard_runs WHERE started_at >= NOW() - INTERVAL '24 hours') as total_tokens,
      (SELECT COALESCE(SUM(cost), 0) FROM dashboard_runs WHERE started_at >= NOW() - INTERVAL '24 hours') as total_cost,
      (SELECT COUNT(*) FROM dashboard_runs WHERE status = 'running') as running_runs,
      (SELECT COALESCE(AVG(duration), 0) FROM dashboard_runs WHERE started_at >= NOW() - INTERVAL '24 hours' AND duration IS NOT NULL) as avg_duration
  `);
    return {
        totalRuns: parseInt(result?.total_runs || '0'),
        activeAgents: parseInt(result?.active_agents || '0'),
        totalTokens: parseInt(result?.total_tokens || '0'),
        totalCost: parseFloat(result?.total_cost || '0'),
        runningRuns: parseInt(result?.running_runs || '0'),
        avgDuration: parseFloat(result?.avg_duration || '0')
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/packages/dashboard/src/app/api/analytics/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_react-dom@19.2.3_react@19.2.3/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/db/analytics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/db/index.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
let initialized = false;
async function ensureInitialized() {
    if (!initialized) {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeSchema"])();
            initialized = true;
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    }
}
async function GET(request) {
    try {
        await ensureInitialized();
        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get('period') || 'day';
        const hours = parseInt(searchParams.get('hours') || '24');
        const [hourlyStats, modelStats, topAgents, dashboardStats] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHourlyStats"])(hours),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelStats"])(period),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTopAgents"])(10, period),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDashboardStats"])()
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            hourly: hourlyStats,
            models: modelStats,
            topAgents,
            dashboard: dashboardStats,
            period
        });
    } catch (error) {
        console.error('Failed to fetch analytics:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch analytics'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__70f91cc8._.js.map