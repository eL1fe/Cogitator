import { query, queryOne, execute } from './index';
import { nanoid } from 'nanoid';
import type { Agent } from '@/types';

interface AgentRow {
  id: string;
  name: string;
  model: string;
  description: string | null;
  instructions: string | null;
  status: 'online' | 'offline' | 'busy';
  total_runs: number;
  total_tokens: string;
  total_cost: string;
  last_run_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function rowToAgent(row: AgentRow): Agent {
  return {
    id: row.id,
    name: row.name,
    model: row.model,
    status: row.status,
    totalRuns: row.total_runs,
    totalTokens: parseInt(row.total_tokens) || 0,
    totalCost: parseFloat(row.total_cost) || 0,
    lastRunAt: row.last_run_at?.toISOString() || null,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getAllAgents(): Promise<Agent[]> {
  const rows = await query<AgentRow>(
    'SELECT * FROM dashboard_agents ORDER BY created_at DESC'
  );
  return rows.map(rowToAgent);
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const row = await queryOne<AgentRow>(
    'SELECT * FROM dashboard_agents WHERE id = $1',
    [id]
  );
  return row ? rowToAgent(row) : null;
}

export async function createAgent(data: {
  name: string;
  model: string;
  description?: string;
  instructions?: string;
}): Promise<Agent> {
  const id = `agent_${nanoid(12)}`;
  
  await execute(
    `INSERT INTO dashboard_agents (id, name, model, description, instructions)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, data.name, data.model, data.description || null, data.instructions || null]
  );

  const agent = await getAgentById(id);
  return agent!;
}

export async function updateAgent(id: string, data: Partial<{
  name: string;
  model: string;
  description: string;
  instructions: string;
  status: 'online' | 'offline' | 'busy';
}>): Promise<Agent | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.model !== undefined) {
    updates.push(`model = $${paramIndex++}`);
    values.push(data.model);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.instructions !== undefined) {
    updates.push(`instructions = $${paramIndex++}`);
    values.push(data.instructions);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }

  if (updates.length === 0) return getAgentById(id);

  updates.push(`updated_at = NOW()`);
  values.push(id);

  await execute(
    `UPDATE dashboard_agents SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
    values
  );

  return getAgentById(id);
}

export async function deleteAgent(id: string): Promise<boolean> {
  const count = await execute('DELETE FROM dashboard_agents WHERE id = $1', [id]);
  return count > 0;
}

export async function incrementAgentStats(id: string, tokens: number, cost: number): Promise<void> {
  await execute(
    `UPDATE dashboard_agents 
     SET total_runs = total_runs + 1, 
         total_tokens = total_tokens + $1,
         total_cost = total_cost + $2,
         last_run_at = NOW(),
         updated_at = NOW()
     WHERE id = $3`,
    [tokens, cost, id]
  );
}

export async function setAgentStatus(id: string, status: 'online' | 'offline' | 'busy'): Promise<void> {
  await execute(
    'UPDATE dashboard_agents SET status = $1, updated_at = NOW() WHERE id = $2',
    [status, id]
  );
}

export async function getAgentCount(): Promise<number> {
  const result = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM dashboard_agents');
  return parseInt(result?.count || '0');
}

export async function seedDefaultAgents(): Promise<void> {
  const count = await getAgentCount();
  
  if (count === 0) {
    const defaultAgents = [
      { name: 'Research Agent', model: 'gpt-4o', description: 'Analyzes data and provides comprehensive research reports' },
      { name: 'Code Assistant', model: 'claude-3-5-sonnet', description: 'Helps with code reviews, refactoring, and documentation' },
      { name: 'Data Analyst', model: 'gpt-4o-mini', description: 'Processes data and generates analytical insights' },
    ];

    for (const agent of defaultAgents) {
      await createAgent(agent);
    }
  }
}
