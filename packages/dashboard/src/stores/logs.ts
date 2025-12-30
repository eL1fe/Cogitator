import { create } from 'zustand';
import type { LogEntry } from '@/types';

interface LogsState {
  logs: LogEntry[];
  loading: boolean;
  error: string | null;
  isLive: boolean;
  levelFilter: LogEntry['level'] | 'all';
  searchQuery: string;
  setLogs: (logs: LogEntry[]) => void;
  addLog: (log: LogEntry) => void;
  addLogs: (logs: LogEntry[]) => void;
  clearLogs: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsLive: (isLive: boolean) => void;
  setLevelFilter: (level: LogEntry['level'] | 'all') => void;
  setSearchQuery: (query: string) => void;
}

const MAX_LOGS = 1000;

export const useLogsStore = create<LogsState>((set) => ({
  logs: [],
  loading: false,
  error: null,
  isLive: true,
  levelFilter: 'all',
  searchQuery: '',
  setLogs: (logs) => set({ logs: logs.slice(0, MAX_LOGS) }),
  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs].slice(0, MAX_LOGS),
    })),
  addLogs: (logs) =>
    set((state) => ({
      logs: [...logs, ...state.logs].slice(0, MAX_LOGS),
    })),
  clearLogs: () => set({ logs: [] }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setIsLive: (isLive) => set({ isLive }),
  setLevelFilter: (levelFilter) => set({ levelFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
