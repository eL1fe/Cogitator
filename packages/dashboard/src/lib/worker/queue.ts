import { nanoid } from 'nanoid';
import { query, queryOne } from '@/lib/db';
import type { Job, CreateJobInput, JobUpdate, JobStatus } from './types';

export async function createJob(input: CreateJobInput): Promise<Job> {
  const id = `job_${nanoid(12)}`;
  const now = new Date();

  await query(
    `INSERT INTO cogitator_jobs (id, type, target_id, input, status, user_id, metadata, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      input.type,
      input.targetId,
      input.input,
      'pending',
      input.userId,
      JSON.stringify(input.metadata || {}),
      now,
    ]
  );

  return {
    id,
    type: input.type,
    targetId: input.targetId,
    input: input.input,
    status: 'pending',
    createdAt: now,
    userId: input.userId,
    metadata: input.metadata,
  };
}

export async function getJob(id: string): Promise<Job | null> {
  const row = await queryOne<{
    id: string;
    type: string;
    target_id: string;
    input: string;
    status: string;
    output: string | null;
    error: string | null;
    progress: number | null;
    created_at: Date;
    started_at: Date | null;
    completed_at: Date | null;
    user_id: string;
    metadata: string | null;
  }>('SELECT * FROM cogitator_jobs WHERE id = $1', [id]);

  if (!row) return null;

  return {
    id: row.id,
    type: row.type as Job['type'],
    targetId: row.target_id,
    input: row.input,
    status: row.status as JobStatus,
    output: row.output || undefined,
    error: row.error || undefined,
    progress: row.progress || undefined,
    createdAt: row.created_at,
    startedAt: row.started_at || undefined,
    completedAt: row.completed_at || undefined,
    userId: row.user_id,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  };
}

export async function getJobs(options?: {
  userId?: string;
  status?: JobStatus;
  type?: Job['type'];
  limit?: number;
  offset?: number;
}): Promise<Job[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (options?.userId) {
    conditions.push(`user_id = $${paramIndex++}`);
    params.push(options.userId);
  }
  if (options?.status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(options.status);
  }
  if (options?.type) {
    conditions.push(`type = $${paramIndex++}`);
    params.push(options.type);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const rows = await query<{
    id: string;
    type: string;
    target_id: string;
    input: string;
    status: string;
    output: string | null;
    error: string | null;
    progress: number | null;
    created_at: Date;
    started_at: Date | null;
    completed_at: Date | null;
    user_id: string;
    metadata: string | null;
  }>(
    `SELECT * FROM cogitator_jobs ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    [...params, limit, offset]
  );

  return rows.map((row) => ({
    id: row.id,
    type: row.type as Job['type'],
    targetId: row.target_id,
    input: row.input,
    status: row.status as JobStatus,
    output: row.output || undefined,
    error: row.error || undefined,
    progress: row.progress || undefined,
    createdAt: row.created_at,
    startedAt: row.started_at || undefined,
    completedAt: row.completed_at || undefined,
    userId: row.user_id,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  }));
}

export async function updateJob(id: string, update: JobUpdate): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (update.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    params.push(update.status);
  }
  if (update.output !== undefined) {
    fields.push(`output = $${paramIndex++}`);
    params.push(update.output);
  }
  if (update.error !== undefined) {
    fields.push(`error = $${paramIndex++}`);
    params.push(update.error);
  }
  if (update.progress !== undefined) {
    fields.push(`progress = $${paramIndex++}`);
    params.push(update.progress);
  }
  if (update.startedAt !== undefined) {
    fields.push(`started_at = $${paramIndex++}`);
    params.push(update.startedAt);
  }
  if (update.completedAt !== undefined) {
    fields.push(`completed_at = $${paramIndex++}`);
    params.push(update.completedAt);
  }

  if (fields.length === 0) return;

  params.push(id);
  await query(`UPDATE cogitator_jobs SET ${fields.join(', ')} WHERE id = $${paramIndex}`, params);
}

export async function cancelJob(id: string): Promise<boolean> {
  const job = await getJob(id);
  if (!job) return false;

  if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
    return false;
  }

  await updateJob(id, {
    status: 'cancelled',
    completedAt: new Date(),
  });

  return true;
}

export async function getQueueStats(): Promise<{
  pending: number;
  running: number;
  completed: number;
  failed: number;
}> {
  const result = await queryOne<{
    pending: string;
    running: string;
    completed: string;
    failed: string;
  }>(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'running') as running,
      COUNT(*) FILTER (WHERE status = 'completed') as completed,
      COUNT(*) FILTER (WHERE status = 'failed') as failed
    FROM cogitator_jobs
  `);

  return {
    pending: parseInt(result?.pending || '0'),
    running: parseInt(result?.running || '0'),
    completed: parseInt(result?.completed || '0'),
    failed: parseInt(result?.failed || '0'),
  };
}
