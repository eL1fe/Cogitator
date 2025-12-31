'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import {
  Bot,
  Plus,
  Search,
  Zap,
  DollarSign,
  Activity,
  MoreVertical,
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'busy' | 'offline';
  description: string;
  totalRuns: number;
  totalTokens: number;
  totalCost: number;
  lastRunAt: string | null;
}

const agents: Agent[] = [
  {
    id: 'agent_1',
    name: 'Research Agent',
    model: 'gpt-4o',
    status: 'busy',
    description: 'Analyzes data and provides comprehensive research reports',
    totalRuns: 342,
    totalTokens: 1250000,
    totalCost: 24.5,
    lastRunAt: '2 mins ago',
  },
  {
    id: 'agent_2',
    name: 'Code Assistant',
    model: 'claude-3-5-sonnet',
    status: 'online',
    description: 'Helps with code reviews, refactoring, and documentation',
    totalRuns: 589,
    totalTokens: 2340000,
    totalCost: 35.2,
    lastRunAt: '5 mins ago',
  },
  {
    id: 'agent_3',
    name: 'Data Analyst',
    model: 'gpt-4o-mini',
    status: 'online',
    description: 'Processes data and generates analytical insights',
    totalRuns: 156,
    totalTokens: 890000,
    totalCost: 8.9,
    lastRunAt: '15 mins ago',
  },
  {
    id: 'agent_4',
    name: 'Content Writer',
    model: 'claude-3-5-sonnet',
    status: 'offline',
    description: 'Creates blog posts, documentation, and marketing copy',
    totalRuns: 78,
    totalTokens: 456000,
    totalCost: 6.8,
    lastRunAt: '2 hours ago',
  },
  {
    id: 'agent_5',
    name: 'Customer Support',
    model: 'gpt-4o-mini',
    status: 'online',
    description: 'Handles customer inquiries and provides support',
    totalRuns: 1024,
    totalTokens: 3210000,
    totalCost: 12.4,
    lastRunAt: '30 secs ago',
  },
];

const statusConfig = {
  online: { color: 'bg-success', label: 'Online' },
  busy: { color: 'bg-warning', label: 'Busy' },
  offline: { color: 'bg-text-tertiary', label: 'Offline' },
};

export function AgentsList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Agents</h1>
          <p className="text-text-secondary mt-1">
            Manage and monitor your AI agents
          </p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Agent
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search agents..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            All
          </Button>
          <Button variant="ghost" size="sm">
            Online
          </Button>
          <Button variant="ghost" size="sm">
            Offline
          </Button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, index) => {
          const config = statusConfig[agent.status];
          return (
            <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}>
              <Card
                hover
                className="h-full animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        agent.status === 'online' && 'bg-success/10',
                        agent.status === 'busy' && 'bg-warning/10',
                        agent.status === 'offline' && 'bg-bg-elevated'
                      )}
                    >
                      <Bot
                        className={cn(
                          'w-5 h-5',
                          agent.status === 'online' && 'text-success',
                          agent.status === 'busy' && 'text-warning',
                          agent.status === 'offline' && 'text-text-tertiary'
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-text-primary">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-text-tertiary">{agent.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        config.color,
                        agent.status === 'busy' && 'animate-pulse'
                      )}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                  {agent.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border-subtle">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-text-tertiary mb-1">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      {agent.totalRuns}
                    </p>
                    <p className="text-xs text-text-muted">runs</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-text-tertiary mb-1">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      {(agent.totalTokens / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-text-muted">tokens</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-text-tertiary mb-1">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      ${agent.totalCost.toFixed(0)}
                    </p>
                    <p className="text-xs text-text-muted">cost</p>
                  </div>
                </div>

                {/* Last run */}
                {agent.lastRunAt && (
                  <p className="text-xs text-text-muted mt-3 text-center">
                    Last run {agent.lastRunAt}
                  </p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
