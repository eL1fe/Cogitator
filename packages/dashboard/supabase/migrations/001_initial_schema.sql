-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table
CREATE TABLE IF NOT EXISTS cogitator_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'readonly')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cogitator_users_email ON cogitator_users(email);
CREATE INDEX IF NOT EXISTS idx_cogitator_users_role ON cogitator_users(role);

-- Agents table
CREATE TABLE IF NOT EXISTS dashboard_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  instructions TEXT,
  description TEXT,
  temperature REAL DEFAULT 0.7,
  top_p REAL,
  max_tokens INTEGER,
  tools TEXT[],
  memory_enabled BOOLEAN DEFAULT false,
  max_iterations INTEGER DEFAULT 10,
  timeout INTEGER,
  response_format TEXT,
  total_runs INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_agents_name ON dashboard_agents(name);

-- Threads table
CREATE TABLE IF NOT EXISTS dashboard_threads (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES dashboard_agents(id) ON DELETE SET NULL,
  title TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_threads_agent_id ON dashboard_threads(agent_id);

-- Messages table with vector embeddings
CREATE TABLE IF NOT EXISTS dashboard_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES dashboard_threads(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES dashboard_agents(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  title TEXT,
  tokens INTEGER,
  metadata JSONB,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_messages_thread_id ON dashboard_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_messages_created_at ON dashboard_messages(created_at);

-- Runs table
CREATE TABLE IF NOT EXISTS dashboard_runs (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES dashboard_agents(id) ON DELETE SET NULL,
  thread_id TEXT REFERENCES dashboard_threads(id) ON DELETE SET NULL,
  input TEXT,
  output TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  duration INTEGER,
  iterations INTEGER DEFAULT 0,
  error TEXT,
  trace JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dashboard_runs_agent_id ON dashboard_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_runs_status ON dashboard_runs(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_runs_created_at ON dashboard_runs(created_at);

-- Workflows table
CREATE TABLE IF NOT EXISTS dashboard_workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  definition JSONB,
  initial_state JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_workflows_name ON dashboard_workflows(name);

-- Workflow runs table
CREATE TABLE IF NOT EXISTS dashboard_workflow_runs (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES dashboard_workflows(id) ON DELETE CASCADE,
  input TEXT,
  output TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  error TEXT,
  duration INTEGER,
  checkpoint_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dashboard_workflow_runs_workflow_id ON dashboard_workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_workflow_runs_status ON dashboard_workflow_runs(status);

-- Swarms table
CREATE TABLE IF NOT EXISTS dashboard_swarms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  strategy TEXT NOT NULL CHECK (strategy IN ('debate', 'consensus', 'hierarchical', 'round-robin', 'pipeline', 'auction', 'broadcast')),
  agent_ids TEXT[],
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_swarms_name ON dashboard_swarms(name);
CREATE INDEX IF NOT EXISTS idx_dashboard_swarms_strategy ON dashboard_swarms(strategy);

-- Swarm runs table
CREATE TABLE IF NOT EXISTS dashboard_swarm_runs (
  id TEXT PRIMARY KEY,
  swarm_id TEXT NOT NULL REFERENCES dashboard_swarms(id) ON DELETE CASCADE,
  input TEXT,
  output TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  error TEXT,
  duration INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dashboard_swarm_runs_swarm_id ON dashboard_swarm_runs(swarm_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_swarm_runs_status ON dashboard_swarm_runs(status);

-- Jobs table for background tasks
CREATE TABLE IF NOT EXISTS cogitator_jobs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('agent', 'workflow', 'swarm')),
  target_id TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  error TEXT,
  progress INTEGER,
  user_id TEXT NOT NULL REFERENCES cogitator_users(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cogitator_jobs_user_id ON cogitator_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_cogitator_jobs_status ON cogitator_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cogitator_jobs_type ON cogitator_jobs(type);
CREATE INDEX IF NOT EXISTS idx_cogitator_jobs_created_at ON cogitator_jobs(created_at);

-- Logs table
CREATE TABLE IF NOT EXISTS dashboard_logs (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  context JSONB,
  source TEXT,
  run_id TEXT REFERENCES dashboard_runs(id) ON DELETE SET NULL,
  agent_id TEXT REFERENCES dashboard_agents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_logs_level ON dashboard_logs(level);
CREATE INDEX IF NOT EXISTS idx_dashboard_logs_run_id ON dashboard_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_logs_created_at ON dashboard_logs(created_at);

-- Schema migrations tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial migration record
INSERT INTO schema_migrations (version) VALUES ('001_initial_schema') ON CONFLICT DO NOTHING;
