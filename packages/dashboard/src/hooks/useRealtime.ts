'use client';

import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useRunsStore } from '@/stores/runs';
import { useLogsStore } from '@/stores/logs';
import type { Run, LogEntry } from '@/types';

export function useRealtime() {
  const { isConnected, subscribe } = useWebSocket();
  const { addLiveRun, updateLiveRun, removeLiveRun } = useRunsStore();
  const { addLog } = useLogsStore();

  useEffect(() => {
    if (!isConnected) return;

    const unsubRunStart = subscribe('run:start', (data) => {
      addLiveRun(data as Run);
    });

    const unsubRunUpdate = subscribe('run:update', (data) => {
      const run = data as Run;
      updateLiveRun(run.id, run);
    });

    const unsubRunComplete = subscribe('run:complete', (data) => {
      const run = data as Run;
      removeLiveRun(run.id);
    });

    const unsubLog = subscribe('log', (data) => {
      addLog(data as LogEntry);
    });

    return () => {
      unsubRunStart();
      unsubRunUpdate();
      unsubRunComplete();
      unsubLog();
    };
  }, [isConnected, subscribe, addLiveRun, updateLiveRun, removeLiveRun, addLog]);

  return { isConnected };
}

