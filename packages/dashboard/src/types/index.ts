export interface Agent {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'busy';
  totalRuns: number;
  totalTokens: number;
  totalCost: number;
  lastRunAt: string | null;
  createdAt: string;
}

export interface Run {
  id: string;
  agentId: string;
  agentName?: string;
  model?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  input: string;
  output?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  error?: string;
  toolCalls?: ToolCall[];
  messages?: Message[];
  spans?: TraceSpan[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  duration?: number;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCallId?: string;
  createdAt: string;
}

export interface TraceSpan {
  id: string;
  traceId: string;
  parentId?: string;
  name: string;
  kind: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'ok' | 'error' | 'unset';
  attributes: Record<string, unknown>;
  events: SpanEvent[];
  children?: TraceSpan[];
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, unknown>;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source?: string;
  agentId?: string;
  runId?: string;
  metadata?: Record<string, unknown>;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  inputPrice: number;
  outputPrice: number;
  capabilities?: string[];
}

export interface AnalyticsData {
  period: 'hour' | 'day' | 'week' | 'month';
  totalRuns: number;
  totalTokens: number;
  totalCost: number;
  avgDuration: number;
  successRate: number;
  tokensByModel: Record<string, number>;
  costByModel: Record<string, number>;
  runsByHour: { hour: string; runs: number; tokens: number }[];
  topAgents: { agentId: string; name: string; runs: number; cost: number }[];
}

export interface DashboardStats {
  totalRuns: number;
  runsDelta: number;
  totalTokens: number;
  tokensDelta: number;
  totalCost: number;
  costDelta: number;
  activeAgents: number;
  agentsDelta: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    name: string;
    status: 'up' | 'down' | 'degraded';
    latency?: number;
  }[];
  lastCheck: string;
}
