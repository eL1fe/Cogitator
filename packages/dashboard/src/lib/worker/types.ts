export type JobType = 'agent' | 'workflow' | 'swarm';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Job {
  id: string;
  type: JobType;
  targetId: string;
  input: string;
  status: JobStatus;
  output?: string;
  error?: string;
  progress?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface CreateJobInput {
  type: JobType;
  targetId: string;
  input: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface JobUpdate {
  status?: JobStatus;
  output?: string;
  error?: string;
  progress?: number;
  startedAt?: Date;
  completedAt?: Date;
}
