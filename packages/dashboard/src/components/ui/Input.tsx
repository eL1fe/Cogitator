'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, type = 'text', ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-bg-secondary px-3 py-2 text-sm',
            'text-text-primary placeholder:text-text-tertiary',
            'border-border-default focus:border-accent focus:ring-1 focus:ring-accent',
            'transition-colors duration-200',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-10',
            error && 'border-error focus:border-error focus:ring-error',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

