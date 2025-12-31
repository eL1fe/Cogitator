'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  format?: 'number' | 'currency' | 'compact';
  icon?: React.ReactNode;
  delay?: number;
  loading?: boolean;
}

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    case 'compact':
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value);
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
}

export function StatCard({
  title,
  value,
  change,
  format = 'number',
  icon,
  delay = 0,
  loading = false,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === 0;
  const hasChange = change !== undefined;

  if (loading) {
    return (
      <Card className="animate-fade-in" style={{ animationDelay: `${delay * 50}ms` }}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <div className="mt-3">
          <Skeleton className="h-4 w-20" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in" style={{ animationDelay: `${delay * 50}ms` }}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-2xl font-semibold text-text-primary animate-count">
            {formatValue(value, format)}
          </p>
        </div>
        {icon && <div className="p-2 bg-accent/10 rounded-lg text-accent">{icon}</div>}
      </div>

      {/* Change indicator */}
      {hasChange && (
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive && (
            <>
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-success">+{change}%</span>
            </>
          )}
          {isNegative && (
            <>
              <TrendingDown className="w-4 h-4 text-error" />
              <span className="text-sm text-error">{change}%</span>
            </>
          )}
          {isNeutral && (
            <>
              <Minus className="w-4 h-4 text-text-tertiary" />
              <span className="text-sm text-text-tertiary">No change</span>
            </>
          )}
          <span className="text-xs text-text-muted ml-1">vs last week</span>
        </div>
      )}
    </Card>
  );
}
