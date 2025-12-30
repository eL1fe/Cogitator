'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
} from 'lucide-react';
import { TraceWaterfall } from '@/components/traces/TraceWaterfall';

interface RunDetailProps {
  runId: string;
}

export function RunDetail({ runId }: RunDetailProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'trace' | 'json'>('messages');
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const run = {
    id: runId,
    agentId: 'agent_1',
    agentName: 'Research Agent',
    model: 'gpt-4o',
    status: 'completed' as const,
    input: 'Analyze the latest trends in WebGPU technology and its impact on web development. Focus on performance benchmarks and adoption rates.',
    output: `# WebGPU Technology Analysis

## Overview
WebGPU is a modern graphics API that provides high-performance 3D graphics and data-parallel computation on the web. It represents a significant advancement over WebGL.

## Key Findings

### Performance
- Up to 3x faster rendering compared to WebGL 2.0
- Better CPU utilization through reduced driver overhead
- Native compute shader support

### Adoption
- Chrome 113+ ships with WebGPU enabled by default
- Firefox and Safari are in active development
- Major frameworks like Three.js adding support

## Conclusion
WebGPU is positioned to become the standard for high-performance web graphics, particularly for applications requiring intensive GPU computations.`,
    startedAt: new Date(Date.now() - 2 * 60 * 1000),
    completedAt: new Date(Date.now() - 1.5 * 60 * 1000),
    duration: 4200,
    inputTokens: 1234,
    outputTokens: 2187,
    totalTokens: 3421,
    cost: 0.034,
    toolCalls: [
      {
        id: 'tool_1',
        name: 'web_search',
        arguments: { query: 'WebGPU performance benchmarks 2024' },
        result: { results: ['benchmark1.com', 'benchmark2.com'] },
        duration: 1200,
        status: 'success' as const,
      },
      {
        id: 'tool_2',
        name: 'read_url',
        arguments: { url: 'https://gpuweb.github.io/gpuweb/' },
        result: { content: 'WebGPU specification...' },
        duration: 800,
        status: 'success' as const,
      },
    ],
  };

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
            <Badge variant="success">Completed</Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
            <div className="flex items-center gap-1.5">
              <Bot className="w-4 h-4" />
              <span>{run.agentName}</span>
            </div>
            <span className="text-text-muted">•</span>
            <span>{run.model}</span>
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
            {(run.duration / 1000).toFixed(1)}s
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
            ${run.cost.toFixed(3)}
          </p>
          <p className="text-xs text-text-secondary">Cost</p>
        </Card>
        <Card className="text-center">
          <div className="w-5 h-5 mx-auto mb-2 text-chart-3 font-mono text-sm">
            {run.toolCalls.length}
          </div>
          <p className="text-xl font-semibold text-text-primary">
            {run.toolCalls.length}
          </p>
          <p className="text-xs text-text-secondary">Tool Calls</p>
        </Card>
      </div>

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
            {tab === 'trace' && 'Trace'}
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
            <p className="text-sm text-text-primary">{run.input}</p>
          </Card>

          {/* Tool Calls */}
          {run.toolCalls.map((tool) => (
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
                  <span className="text-xs text-text-tertiary">
                    {tool.duration}ms
                  </span>
                </div>
                <Badge variant="success" size="sm">
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
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Result</p>
                    <pre className="bg-bg-elevated rounded-lg p-3 text-xs font-mono text-text-secondary overflow-x-auto">
                      {JSON.stringify(tool.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {/* Output */}
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
        </div>
      )}

      {activeTab === 'trace' && <TraceWaterfall runId={runId} />}

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

