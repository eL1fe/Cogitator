'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import {
  ArrowLeft,
  Clock,
  Zap,
  DollarSign,
  Bot,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { TraceWaterfall } from '@/components/traces/TraceWaterfall';
import type { Run, ToolCall, Message, TraceSpan } from '@/types';

interface RunDetailProps {
  runId: string;
}

interface RunWithRelations extends Run {
  toolCalls?: ToolCall[];
  messages?: Message[];
  spans?: TraceSpan[];
}

export function RunDetail({ runId }: RunDetailProps) {
  const [run, setRun] = useState<RunWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'trace' | 'json'>('messages');
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchRun() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/runs/${runId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Run not found');
          } else {
            setError('Failed to load run details');
          }
          return;
        }
        
        const data = await response.json();
        setRun(data);
      } catch (err) {
        console.error('Failed to fetch run:', err);
        setError('Failed to load run details');
      } finally {
        setLoading(false);
      }
    }

    fetchRun();
  }, [runId]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTool = (toolId: string) => {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="text-center">
              <Skeleton className="h-5 w-5 mx-auto mb-2" />
              <Skeleton className="h-7 w-16 mx-auto mb-1" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="space-y-6">
        <Link href="/runs">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Runs
          </Button>
        </Link>
        <Card className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-error" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {error || 'Run not found'}
          </h3>
          <p className="text-text-secondary">
            The run you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.
          </p>
        </Card>
      </div>
    );
  }

  const statusConfig = {
    running: { variant: 'info' as const, label: 'Running' },
    completed: { variant: 'success' as const, label: 'Completed' },
    failed: { variant: 'error' as const, label: 'Failed' },
    cancelled: { variant: 'warning' as const, label: 'Cancelled' },
  };

  const config = statusConfig[run.status];
  const toolCalls = run.toolCalls || [];
  const spans = run.spans || [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/runs">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Runs
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">{run.id}</h1>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
            <div className="flex items-center gap-1.5">
              <Bot className="w-4 h-4" />
              <span>{run.agentName || run.agentId}</span>
            </div>
            {run.model && (
              <>
                <span className="text-text-muted">•</span>
                <span>{run.model}</span>
              </>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => copyToClipboard(run.id)}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy ID'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <Clock className="w-5 h-5 text-accent mx-auto mb-2" />
          <p className="text-xl font-semibold text-text-primary">
            {run.duration ? `${(run.duration / 1000).toFixed(1)}s` : '-'}
          </p>
          <p className="text-xs text-text-secondary">Duration</p>
        </Card>
        <Card className="text-center">
          <Zap className="w-5 h-5 text-chart-2 mx-auto mb-2" />
          <p className="text-xl font-semibold text-text-primary">
            {run.totalTokens.toLocaleString()}
          </p>
          <p className="text-xs text-text-secondary">Tokens</p>
        </Card>
        <Card className="text-center">
          <DollarSign className="w-5 h-5 text-chart-4 mx-auto mb-2" />
          <p className="text-xl font-semibold text-text-primary">
            ${run.cost.toFixed(4)}
          </p>
          <p className="text-xs text-text-secondary">Cost</p>
        </Card>
        <Card className="text-center">
          <div className="w-5 h-5 mx-auto mb-2 text-chart-3 font-mono text-sm font-bold">
            #
          </div>
          <p className="text-xl font-semibold text-text-primary">
            {toolCalls.length}
          </p>
          <p className="text-xs text-text-secondary">Tool Calls</p>
        </Card>
      </div>

      {/* Error display */}
      {run.error && (
        <Card variant="outline" className="border-error/50 bg-error/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-error">Error</p>
              <p className="text-sm text-text-secondary mt-1">{run.error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-subtle">
        {(['messages', 'trace', 'json'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab
                ? 'text-accent border-accent'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            )}
          >
            {tab === 'messages' && 'Messages'}
            {tab === 'trace' && `Trace${spans.length > 0 ? ` (${spans.length})` : ''}`}
            {tab === 'json' && 'JSON'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-chart-2" />
                User Input
              </CardTitle>
            </CardHeader>
            <p className="text-sm text-text-primary whitespace-pre-wrap">{run.input}</p>
          </Card>

          {/* Tool Calls */}
          {toolCalls.map((tool) => (
            <Card key={tool.id} padding="none">
              <button
                onClick={() => toggleTool(tool.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedTools.has(tool.id) ? (
                    <ChevronDown className="w-4 h-4 text-text-tertiary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-tertiary" />
                  )}
                  <Badge variant="outline">{tool.name}</Badge>
                  {tool.duration && (
                    <span className="text-xs text-text-tertiary">
                      {tool.duration}ms
                    </span>
                  )}
                </div>
                <Badge 
                  variant={tool.status === 'success' ? 'success' : tool.status === 'error' ? 'error' : 'warning'} 
                  size="sm"
                >
                  {tool.status}
                </Badge>
              </button>
              {expandedTools.has(tool.id) && (
                <div className="px-4 pb-4 space-y-3 border-t border-border-subtle">
                  <div className="pt-3">
                    <p className="text-xs text-text-tertiary mb-1">Arguments</p>
                    <pre className="bg-bg-elevated rounded-lg p-3 text-xs font-mono text-text-secondary overflow-x-auto">
                      {JSON.stringify(tool.arguments, null, 2)}
                    </pre>
                  </div>
                  {tool.result !== undefined && (
                    <div>
                      <p className="text-xs text-text-tertiary mb-1">Result</p>
                      <pre className="bg-bg-elevated rounded-lg p-3 text-xs font-mono text-text-secondary overflow-x-auto max-h-64">
                        {typeof tool.result === 'string' 
                          ? tool.result 
                          : JSON.stringify(tool.result, null, 2)}
                      </pre>
                    </div>
                  )}
                  {tool.error && (
                    <div>
                      <p className="text-xs text-error mb-1">Error</p>
                      <pre className="bg-error/10 rounded-lg p-3 text-xs font-mono text-error overflow-x-auto">
                        {tool.error}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}

          {/* Output */}
          {run.output && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Assistant Output
                </CardTitle>
              </CardHeader>
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-text-primary">
                  {run.output}
                </pre>
              </div>
            </Card>
          )}

          {/* Empty state */}
          {toolCalls.length === 0 && !run.output && (
            <Card className="text-center py-8">
              <p className="text-text-muted">No messages or tool calls recorded</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'trace' && <TraceWaterfall spans={spans} />}

      {activeTab === 'json' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Raw JSON</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(JSON.stringify(run, null, 2))}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          <pre className="bg-bg-elevated rounded-lg p-4 text-xs font-mono text-text-secondary overflow-x-auto max-h-[600px]">
            {JSON.stringify(run, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
