'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import {
  ArrowLeft,
  Bot,
  Play,
  Settings,
  Zap,
  DollarSign,
  Activity,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AgentDetailProps {
  agentId: string;
}

const usageData = [
  { date: 'Mon', runs: 45, tokens: 89000 },
  { date: 'Tue', runs: 52, tokens: 104000 },
  { date: 'Wed', runs: 38, tokens: 76000 },
  { date: 'Thu', runs: 65, tokens: 130000 },
  { date: 'Fri', runs: 71, tokens: 142000 },
  { date: 'Sat', runs: 28, tokens: 56000 },
  { date: 'Sun', runs: 43, tokens: 86000 },
];

const recentRuns = [
  { id: 'run_1', status: 'completed', input: 'Analyze market trends...', duration: 4.2, tokens: 3421 },
  { id: 'run_2', status: 'completed', input: 'Research competitor analysis...', duration: 6.8, tokens: 5234 },
  { id: 'run_3', status: 'failed', input: 'Generate quarterly report...', duration: 2.1, tokens: 1890 },
  { id: 'run_4', status: 'completed', input: 'Summarize feedback data...', duration: 3.5, tokens: 2678 },
];

export function AgentDetail({ agentId }: AgentDetailProps) {
  const agent = {
    id: agentId,
    name: 'Research Agent',
    model: 'gpt-4o',
    status: 'online' as const,
    description: 'Analyzes data and provides comprehensive research reports. Specializes in market research, competitive analysis, and trend forecasting.',
    instructions: 'You are a research agent specializing in data analysis and report generation...',
    totalRuns: 342,
    totalTokens: 1250000,
    totalCost: 24.5,
    avgDuration: 4.2,
    successRate: 94.5,
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/agents">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-success/10 flex items-center justify-center">
            <Bot className="w-8 h-8 text-success" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-text-primary">
                {agent.name}
              </h1>
              <Badge variant="success" pulse>
                {agent.status}
              </Badge>
            </div>
            <p className="text-text-secondary mt-1">{agent.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Configure
          </Button>
          <Button variant="primary" className="gap-2">
            <Play className="w-4 h-4" />
            Run Agent
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <Activity className="w-5 h-5 text-accent mx-auto mb-2" />
          <p className="text-2xl font-semibold text-text-primary">{agent.totalRuns}</p>
          <p className="text-xs text-text-secondary">Total Runs</p>
        </Card>
        <Card className="text-center">
          <Zap className="w-5 h-5 text-chart-2 mx-auto mb-2" />
          <p className="text-2xl font-semibold text-text-primary">
            {(agent.totalTokens / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-text-secondary">Tokens</p>
        </Card>
        <Card className="text-center">
          <DollarSign className="w-5 h-5 text-chart-4 mx-auto mb-2" />
          <p className="text-2xl font-semibold text-text-primary">
            ${agent.totalCost.toFixed(2)}
          </p>
          <p className="text-xs text-text-secondary">Total Cost</p>
        </Card>
        <Card className="text-center">
          <Clock className="w-5 h-5 text-chart-3 mx-auto mb-2" />
          <p className="text-2xl font-semibold text-text-primary">
            {agent.avgDuration}s
          </p>
          <p className="text-xs text-text-secondary">Avg Duration</p>
        </Card>
        <Card className="text-center">
          <TrendingUp className="w-5 h-5 text-success mx-auto mb-2" />
          <p className="text-2xl font-semibold text-text-primary">
            {agent.successRate}%
          </p>
          <p className="text-xs text-text-secondary">Success Rate</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Usage (Last 7 days)</CardTitle>
          </CardHeader>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorRuns2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#666666', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666666', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333333',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="runs" stroke="#00ff88" strokeWidth={2} fill="url(#colorRuns2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Description & Config */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <p className="text-sm text-text-secondary mb-4">{agent.description}</p>

          <CardTitle className="mb-2">System Instructions</CardTitle>
          <div className="bg-bg-elevated rounded-lg p-3 font-mono text-xs text-text-secondary">
            {agent.instructions}
          </div>
        </Card>
      </div>

      {/* Recent Runs */}
      <Card padding="none">
        <CardHeader className="px-4 pt-4">
          <CardTitle>Recent Runs</CardTitle>
          <Link href={`/runs?agent=${agentId}`}>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <div className="divide-y divide-border-subtle">
          {recentRuns.map((run) => (
            <Link
              key={run.id}
              href={`/runs/${run.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-bg-hover transition-colors"
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  run.status === 'completed' && 'bg-success',
                  run.status === 'failed' && 'bg-error'
                )}
              />
              <p className="flex-1 text-sm text-text-primary truncate">{run.input}</p>
              <div className="flex items-center gap-4 text-xs text-text-tertiary">
                <span>{run.duration}s</span>
                <span>{run.tokens.toLocaleString()} tokens</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
