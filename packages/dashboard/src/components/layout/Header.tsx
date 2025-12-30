'use client';

import { useState } from 'react';
import { Search, Bell, Command } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function Header() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 border-b border-border-subtle bg-bg-secondary/80 backdrop-blur-sm flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Input
            placeholder="Search agents, runs, logs..."
            icon={<Search className="w-4 h-4" />}
            className="pr-20"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {!searchFocused && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-text-muted">
              <kbd className="px-1.5 py-0.5 text-xs bg-bg-elevated rounded border border-border-default">
                <Command className="w-3 h-3 inline" />
              </kbd>
              <kbd className="px-1.5 py-0.5 text-xs bg-bg-elevated rounded border border-border-default">
                K
              </kbd>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <Badge variant="success" pulse>
          Live
        </Badge>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full" />
        </Button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-chart-2 flex items-center justify-center text-bg-primary font-semibold text-sm">
            C
          </div>
        </div>
      </div>
    </header>
  );
}
