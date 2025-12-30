'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import { Search, Filter, Clock, Zap, Bot, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Run {
  id: string;
  agentId: string;
  agentName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  input: string;
  output: string | null;
  startedAt: Date;
  duration: number | null;
  tokens: number;
  cost: number;
}

const runs: Run[] = [
  {
    id: 'run_1',
    agentId: 'agent_1',
    agentName: 'Research Agent',
    status: 'completed',
    input: 'Analyze the latest trends in WebGPU technology and its impact on web development',
    output: 'WebGPU is emerging as a powerful graphics API...',
    startedAt: new Date(Date.now() - 2 * 60 * 1000),
    duration: 4200,
    tokens: 3421,
    cost: 0.034,
  },
  {
    id: 'run_2',
    agentId: 'agent_2',
    agentName: 'Code Assistant',
    status: 'running',
    input: 'Refactor the authentication module to use JWT tokens',
    output: null,
    startedAt: new Date(Date.now() - 30 * 1000),
    duration: null,
    tokens: 1250,
    cost: 0.019,
  },
  {
    id: 'run_3',
    agentId: 'agent_3',
    agentName: 'Data Analyst',
    status: 'completed',
    input: 'Generate a comprehensive report on Q4 sales performance',
    output: 'Q4 Sales Report Summary...',
    startedAt: new Date(Date.now() - 5 * 60 * 1000),
    duration: 8500,
    tokens: 5680,
    cost: 0.057,
  },
  {
    id: 'run_4',
    agentId: 'agent_4',
    agentName: 'Content Writer',
    status: 'failed',
    input: 'Write a blog post about the benefits of AI agents in business',
    output: null,
    startedAt: new Date(Date.now() - 10 * 60 * 1000),
    duration: 2100,
    tokens: 890,
    cost: 0.013,
  },
  {
    id: 'run_5',
    agentId: 'agent_1',
    agentName: 'Research Agent',
    status: 'completed',
    input: 'Compare React 19 and Vue 3 frameworks for enterprise applications',
    output: 'Comprehensive framework comparison...',
    startedAt: new Date(Date.now() - 15 * 60 * 1000),
    duration: 3800,
    tokens: 2340,
    cost: 0.023,
  },
  {
    id: 'run_6',
    agentId: 'agent_5',
    agentName: 'Customer Support',
    status: 'completed',
    input: 'Help customer with subscription upgrade process',
    output: 'I have processed your upgrade request...',
    startedAt: new Date(Date.now() - 20 * 60 * 1000),
    duration: 1200,
    tokens: 780,
    cost: 0.003,
  },
];

const statusConfig = {
  running: { variant: 'info' as const, label: 'Running', pulse: true },
  completed: { variant: 'success' as const, label: 'Completed', pulse: false },
  failed: { variant: 'error' as const, label: 'Failed', pulse: false },
  cancelled: { variant: 'warning' as const, label: 'Cancelled', pulse: false },
};

export function RunsList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Runs</h1>
          <p className="text-text-secondary mt-1">
            View and analyze agent execution history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" pulse>
            3 Running
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search runs..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
        <div className="flex items-center gap-2">
          {Object.entries(statusConfig).map(([status, config]) => (
            <Button key={status} variant="ghost" size="sm">
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Runs List */}
      <Card padding="none">
        <div className="divide-y divide-border-subtle">
          {runs.map((run, index) => {
            const config = statusConfig[run.status];
            return (
              <Link
                key={run.id}
                href={`/runs/${run.id}`}
                className="flex items-center gap-4 px-4 py-4 hover:bg-bg-hover transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Status */}
                <div
                  className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    run.status === 'running' && 'bg-info pulse-live',
                    run.status === 'completed' && 'bg-success',
                    run.status === 'failed' && 'bg-error',
                    run.status === 'cancelled' && 'bg-warning'
                  )}
                />

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-text-primary">
                      {run.id}
                    </span>
                    <Badge variant={config.variant} size="sm" pulse={config.pulse}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary truncate">
                    {run.input}
                  </p>
                </div>

                {/* Agent */}
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                  <Bot className="w-4 h-4" />
                  <span>{run.agentName}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-xs text-text-tertiary">
                  {run.duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{(run.duration / 1000).toFixed(1)}s</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{run.tokens.toLocaleString()}</span>
                  </div>
                  <span className="text-text-muted w-24 text-right">
                    {formatDistanceToNow(run.startedAt, { addSuffix: true })}
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-text-muted" />
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

