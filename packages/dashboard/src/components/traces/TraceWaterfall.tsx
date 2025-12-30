'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

interface Span {
  id: string;
  parentId: string | null;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'ok' | 'error';
  attributes: Record<string, unknown>;
}

interface TraceWaterfallProps {
  runId: string;
}

const mockSpans: Span[] = [
  {
    id: 'span_1',
    parentId: null,
    name: 'agent.run',
    startTime: 0,
    endTime: 4200,
    duration: 4200,
    status: 'ok',
    attributes: { 'agent.name': 'Research Agent', 'agent.model': 'gpt-4o' },
  },
  {
    id: 'span_2',
    parentId: 'span_1',
    name: 'llm.chat',
    startTime: 50,
    endTime: 1200,
    duration: 1150,
    status: 'ok',
    attributes: { model: 'gpt-4o', tokens: 1234 },
  },
  {
    id: 'span_3',
    parentId: 'span_1',
    name: 'tool.web_search',
    startTime: 1250,
    endTime: 2450,
    duration: 1200,
    status: 'ok',
    attributes: { query: 'WebGPU performance benchmarks' },
  },
  {
    id: 'span_4',
    parentId: 'span_3',
    name: 'http.request',
    startTime: 1300,
    endTime: 2400,
    duration: 1100,
    status: 'ok',
    attributes: { url: 'https://api.search.com/query' },
  },
  {
    id: 'span_5',
    parentId: 'span_1',
    name: 'tool.read_url',
    startTime: 2500,
    endTime: 3300,
    duration: 800,
    status: 'ok',
    attributes: { url: 'https://gpuweb.github.io/gpuweb/' },
  },
  {
    id: 'span_6',
    parentId: 'span_1',
    name: 'llm.chat',
    startTime: 3350,
    endTime: 4150,
    duration: 800,
    status: 'ok',
    attributes: { model: 'gpt-4o', tokens: 2187 },
  },
];

const COLORS = [
  'bg-accent',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
];

export function TraceWaterfall({ runId }: TraceWaterfallProps) {
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);
  
  const spans = mockSpans;
  const totalDuration = Math.max(...spans.map((s) => s.endTime));
  const minTime = Math.min(...spans.map((s) => s.startTime));

  const getSpanDepth = (span: Span): number => {
    if (!span.parentId) return 0;
    const parent = spans.find((s) => s.id === span.parentId);
    return parent ? getSpanDepth(parent) + 1 : 0;
  };

  const getSpanColor = (depth: number) => COLORS[depth % COLORS.length];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Waterfall */}
      <Card padding="none" className="lg:col-span-2">
        <CardHeader className="px-4 pt-4">
          <CardTitle>Trace Timeline</CardTitle>
          <span className="text-xs text-text-tertiary">
            Total: {(totalDuration / 1000).toFixed(2)}s
          </span>
        </CardHeader>

        {/* Time ruler */}
        <div className="px-4 py-2 border-b border-border-subtle">
          <div className="flex justify-between text-xs text-text-muted ml-48">
            <span>0ms</span>
            <span>{(totalDuration / 4).toFixed(0)}ms</span>
            <span>{(totalDuration / 2).toFixed(0)}ms</span>
            <span>{((totalDuration * 3) / 4).toFixed(0)}ms</span>
            <span>{totalDuration.toFixed(0)}ms</span>
          </div>
        </div>

        {/* Spans */}
        <div className="divide-y divide-border-subtle">
          {spans.map((span) => {
            const depth = getSpanDepth(span);
            const left = ((span.startTime - minTime) / totalDuration) * 100;
            const width = (span.duration / totalDuration) * 100;
            const isSelected = selectedSpan?.id === span.id;

            return (
              <button
                key={span.id}
                onClick={() => setSelectedSpan(span)}
                className={cn(
                  'w-full px-4 py-3 flex items-center gap-4 hover:bg-bg-hover transition-colors text-left',
                  isSelected && 'bg-bg-hover'
                )}
              >
                {/* Name */}
                <div
                  className="w-44 flex-shrink-0 truncate text-sm"
                  style={{ paddingLeft: `${depth * 16}px` }}
                >
                  <span className="text-text-primary">{span.name}</span>
                </div>

                {/* Timeline bar */}
                <div className="flex-1 h-6 relative">
                  <div
                    className={cn(
                      'absolute h-full rounded-sm transition-all',
                      getSpanColor(depth),
                      isSelected && 'ring-2 ring-accent ring-offset-2 ring-offset-bg-secondary'
                    )}
                    style={{
                      left: `${left}%`,
                      width: `${Math.max(width, 0.5)}%`,
                    }}
                  />
                </div>

                {/* Duration */}
                <span className="w-16 text-xs text-text-tertiary text-right">
                  {span.duration}ms
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Span Details */}
      <Card>
        <CardHeader>
          <CardTitle>Span Details</CardTitle>
        </CardHeader>

        {selectedSpan ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-text-tertiary mb-1">Name</p>
              <p className="text-sm text-text-primary font-mono">
                {selectedSpan.name}
              </p>
            </div>

            <div className="flex gap-4">
              <div>
                <p className="text-xs text-text-tertiary mb-1">Duration</p>
                <p className="text-sm text-text-primary">
                  {selectedSpan.duration}ms
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary mb-1">Status</p>
                <Badge
                  variant={selectedSpan.status === 'ok' ? 'success' : 'error'}
                  size="sm"
                >
                  {selectedSpan.status}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-xs text-text-tertiary mb-1">Start Time</p>
              <p className="text-sm text-text-primary">
                {selectedSpan.startTime}ms
              </p>
            </div>

            <div>
              <p className="text-xs text-text-tertiary mb-2">Attributes</p>
              <div className="bg-bg-elevated rounded-lg p-3 space-y-2">
                {Object.entries(selectedSpan.attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-text-tertiary">{key}</span>
                    <span className="text-text-primary font-mono truncate ml-4">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-tertiary">
            Click on a span to view details
          </p>
        )}
      </Card>
    </div>
  );
}

