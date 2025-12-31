import { query, queryOne } from './index';

export interface HourlyStats {
  hour: string;
  runs: number;
  tokens: number;
  cost: number;
}

export interface ModelStats {
  model: string;
  runs: number;
  tokens: number;
  cost: number;
}

export interface AgentStats {
  id: string;
  name: string;
  model: string;
  runs: number;
  tokens: number;
  cost: number;
  avgDuration: number;
  successRate: number;
}

export async function getHourlyStats(hours = 24): Promise<HourlyStats[]> {
  const rows = await query<{
    hour: Date;
    runs: string;
    tokens: string;
    cost: string;
  }>(`
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

  return rows.map((row) => ({
    hour: row.hour.toISOString(),
    runs: parseInt(row.runs),
    tokens: parseInt(row.tokens),
    cost: parseFloat(row.cost),
  }));
}

export async function getModelStats(
  period: 'day' | 'week' | 'month' = 'day'
): Promise<ModelStats[]> {
  const intervals = {
    day: "NOW() - INTERVAL '1 day'",
    week: "NOW() - INTERVAL '7 days'",
    month: "NOW() - INTERVAL '30 days'",
  };

  const rows = await query<{
    model: string;
    runs: string;
    tokens: string;
    cost: string;
  }>(`
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

  return rows.map((row) => ({
    model: row.model,
    runs: parseInt(row.runs),
    tokens: parseInt(row.tokens),
    cost: parseFloat(row.cost),
  }));
}

export async function getTopAgents(
  limit = 10,
  period: 'day' | 'week' | 'month' = 'week'
): Promise<AgentStats[]> {
  const intervals = {
    day: "NOW() - INTERVAL '1 day'",
    week: "NOW() - INTERVAL '7 days'",
    month: "NOW() - INTERVAL '30 days'",
  };

  const rows = await query<{
    id: string;
    name: string;
    model: string;
    runs: string;
    tokens: string;
    cost: string;
    avg_duration: string;
    success_rate: string;
  }>(
    `
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
  `,
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    model: row.model,
    runs: parseInt(row.runs),
    tokens: parseInt(row.tokens),
    cost: parseFloat(row.cost),
    avgDuration: parseFloat(row.avg_duration),
    successRate: parseFloat(row.success_rate),
  }));
}

export async function getDashboardStats(): Promise<{
  totalRuns: number;
  activeAgents: number;
  totalTokens: number;
  totalCost: number;
  runningRuns: number;
  avgDuration: number;
}> {
  const result = await queryOne<{
    total_runs: string;
    active_agents: string;
    total_tokens: string;
    total_cost: string;
    running_runs: string;
    avg_duration: string;
  }>(`
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
    avgDuration: parseFloat(result?.avg_duration || '0'),
  };
}
