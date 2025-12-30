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
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/packages/dashboard/src/lib/db/runs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "addMessage",
    ()=>addMessage,
    "addToolCall",
    ()=>addToolCall,
    "createRun",
    ()=>createRun,
    "getAllRuns",
    ()=>getAllRuns,
    "getRecentRuns",
    ()=>getRecentRuns,
    "getRunById",
    ()=>getRunById,
    "getRunCount",
    ()=>getRunCount,
    "getRunMessages",
    ()=>getRunMessages,
    "getRunStats",
    ()=>getRunStats,
    "getRunToolCalls",
    ()=>getRunToolCalls,
    "getRunningRuns",
    ()=>getRunningRuns,
    "updateRun",
    ()=>updateRun,
    "updateToolCall",
    ()=>updateToolCall
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nanoid$40$5$2e$1$2e$6$2f$node_modules$2f$nanoid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/nanoid@5.1.6/node_modules/nanoid/index.js [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function rowToRun(row) {
    return {
        id: row.id,
        agentId: row.agent_id,
        agentName: row.agent_name,
        model: row.agent_model,
        status: row.status,
        input: row.input,
        output: row.output || undefined,
        startedAt: row.started_at.toISOString(),
        completedAt: row.completed_at?.toISOString(),
        duration: row.duration || undefined,
        inputTokens: row.input_tokens,
        outputTokens: row.output_tokens,
        totalTokens: row.total_tokens,
        cost: parseFloat(row.cost) || 0,
        error: row.error || undefined
    };
}
function rowToToolCall(row) {
    return {
        id: row.id,
        name: row.name,
        arguments: row.arguments || {},
        result: row.result,
        status: row.status,
        duration: row.duration || undefined,
        error: row.error || undefined
    };
}
function rowToMessage(row) {
    return {
        id: row.id,
        role: row.role,
        content: row.content,
        toolCallId: row.tool_call_id || undefined,
        createdAt: row.created_at.toISOString()
    };
}
async function getAllRuns(options) {
    let sql = `
    SELECT r.*, a.name as agent_name, a.model as agent_model
    FROM dashboard_runs r
    LEFT JOIN dashboard_agents a ON r.agent_id = a.id
    WHERE 1=1
  `;
    const params = [];
    let paramIndex = 1;
    if (options?.status) {
        sql += ` AND r.status = $${paramIndex++}`;
        params.push(options.status);
    }
    if (options?.agentId) {
        sql += ` AND r.agent_id = $${paramIndex++}`;
        params.push(options.agentId);
    }
    sql += ' ORDER BY r.started_at DESC';
    if (options?.limit) {
        sql += ` LIMIT $${paramIndex++}`;
        params.push(options.limit);
    }
    if (options?.offset) {
        sql += ` OFFSET $${paramIndex++}`;
        params.push(options.offset);
    }
    const rows = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(sql, params);
    return rows.map(rowToRun);
}
async function getRunById(id) {
    const row = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`SELECT r.*, a.name as agent_name, a.model as agent_model
     FROM dashboard_runs r
     LEFT JOIN dashboard_agents a ON r.agent_id = a.id
     WHERE r.id = $1`, [
        id
    ]);
    return row ? rowToRun(row) : null;
}
async function getRunToolCalls(runId) {
    const rows = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM dashboard_tool_calls WHERE run_id = $1 ORDER BY started_at', [
        runId
    ]);
    return rows.map(rowToToolCall);
}
async function getRunMessages(runId) {
    const rows = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM dashboard_messages WHERE run_id = $1 ORDER BY created_at', [
        runId
    ]);
    return rows.map(rowToMessage);
}
async function createRun(data) {
    const id = `run_${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nanoid$40$5$2e$1$2e$6$2f$node_modules$2f$nanoid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])(12)}`;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO dashboard_runs (id, agent_id, thread_id, input, status)
     VALUES ($1, $2, $3, $4, 'running')`, [
        id,
        data.agentId,
        data.threadId || null,
        data.input
    ]);
    const run = await getRunById(id);
    return run;
}
async function updateRun(id, data) {
    const updates = [];
    const values = [];
    let paramIndex = 1;
    if (data.status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        values.push(data.status);
        if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
            updates.push(`completed_at = NOW()`);
        }
    }
    if (data.output !== undefined) {
        updates.push(`output = $${paramIndex++}`);
        values.push(data.output);
    }
    if (data.duration !== undefined) {
        updates.push(`duration = $${paramIndex++}`);
        values.push(data.duration);
    }
    if (data.inputTokens !== undefined) {
        updates.push(`input_tokens = $${paramIndex++}`);
        values.push(data.inputTokens);
    }
    if (data.outputTokens !== undefined) {
        updates.push(`output_tokens = $${paramIndex++}`);
        values.push(data.outputTokens);
    }
    if (data.totalTokens !== undefined) {
        updates.push(`total_tokens = $${paramIndex++}`);
        values.push(data.totalTokens);
    }
    if (data.cost !== undefined) {
        updates.push(`cost = $${paramIndex++}`);
        values.push(data.cost);
    }
    if (data.error !== undefined) {
        updates.push(`error = $${paramIndex++}`);
        values.push(data.error);
    }
    if (updates.length === 0) return getRunById(id);
    values.push(id);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execute"])(`UPDATE dashboard_runs SET ${updates.join(', ')} WHERE id = $${paramIndex}`, values);
    return getRunById(id);
}
async function addToolCall(data) {
    const id = `tc_${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nanoid$40$5$2e$1$2e$6$2f$node_modules$2f$nanoid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])(12)}`;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO dashboard_tool_calls (id, run_id, name, arguments)
     VALUES ($1, $2, $3, $4)`, [
        id,
        data.runId,
        data.name,
        JSON.stringify(data.arguments || {})
    ]);
    return id;
}
async function updateToolCall(id, data) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execute"])(`UPDATE dashboard_tool_calls 
     SET status = $1, result = $2, duration = $3, error = $4, completed_at = NOW()
     WHERE id = $5`, [
        data.status,
        JSON.stringify(data.result),
        data.duration || null,
        data.error || null,
        id
    ]);
}
async function addMessage(data) {
    const id = `msg_${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nanoid$40$5$2e$1$2e$6$2f$node_modules$2f$nanoid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])(12)}`;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO dashboard_messages (id, run_id, role, content, tool_call_id)
     VALUES ($1, $2, $3, $4, $5)`, [
        id,
        data.runId,
        data.role,
        data.content,
        data.toolCallId || null
    ]);
    return id;
}
async function getRunCount(status) {
    let sql = 'SELECT COUNT(*) as count FROM dashboard_runs';
    const params = [];
    if (status) {
        sql += ' WHERE status = $1';
        params.push(status);
    }
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(sql, params);
    return parseInt(result?.count || '0');
}
async function getRecentRuns(limit = 10) {
    return getAllRuns({
        limit
    });
}
async function getRunningRuns() {
    return getAllRuns({
        status: 'running'
    });
}
async function getRunStats(period = 'day') {
    const intervals = {
        day: "NOW() - INTERVAL '1 day'",
        week: "NOW() - INTERVAL '7 days'",
        month: "NOW() - INTERVAL '30 days'"
    };
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`
    SELECT 
      COUNT(*) as total_runs,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_runs,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_runs,
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(cost), 0) as total_cost
    FROM dashboard_runs
    WHERE started_at >= ${intervals[period]}
  `);
    return {
        totalRuns: parseInt(result?.total_runs || '0'),
        completedRuns: parseInt(result?.completed_runs || '0'),
        failedRuns: parseInt(result?.failed_runs || '0'),
        totalTokens: parseInt(result?.total_tokens || '0'),
        totalCost: parseFloat(result?.total_cost || '0')
    };
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
"[project]/packages/dashboard/src/app/api/runs/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_react-dom@19.2.3_react@19.2.3/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$runs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/db/runs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/dashboard/src/lib/redis.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$runs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$runs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
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
        const status = searchParams.get('status') || undefined;
        const agentId = searchParams.get('agentId') || undefined;
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const runs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$runs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllRuns"])({
            status,
            agentId,
            limit,
            offset
        });
        const stats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$runs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRunStats"])('day');
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            runs,
            stats,
            pagination: {
                limit,
                offset
            }
        });
    } catch (error) {
        console.error('Failed to fetch runs:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch runs'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        await ensureInitialized();
        const body = await request.json();
        if (!body.agentId || !body.input) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'agentId and input are required'
            }, {
                status: 400
            });
        }
        const run = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$db$2f$runs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRun"])({
            agentId: body.agentId,
            threadId: body.threadId,
            input: body.input
        });
        // Publish real-time event
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["publish"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$dashboard$2f$src$2f$lib$2f$redis$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CHANNELS"].RUN_STARTED, run);
        } catch  {
        // Redis might not be available
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(run, {
            status: 201
        });
    } catch (error) {
        console.error('Failed to create run:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create run'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0c418dec._.js.map