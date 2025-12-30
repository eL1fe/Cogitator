import { create } from 'zustand';
import type { Run } from '@/types';

interface RunsState {
  runs: Run[];
  loading: boolean;
  error: string | null;
  selectedRunId: string | null;
  liveRuns: Run[];
  setRuns: (runs: Run[]) => void;
  addRun: (run: Run) => void;
  updateRun: (id: string, updates: Partial<Run>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectRun: (id: string | null) => void;
  addLiveRun: (run: Run) => void;
  removeLiveRun: (id: string) => void;
  updateLiveRun: (id: string, updates: Partial<Run>) => void;
}

export const useRunsStore = create<RunsState>((set) => ({
  runs: [],
  loading: false,
  error: null,
  selectedRunId: null,
  liveRuns: [],
  setRuns: (runs) => set({ runs }),
  addRun: (run) =>
    set((state) => ({ runs: [run, ...state.runs] })),
  updateRun: (id, updates) =>
    set((state) => ({
      runs: state.runs.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  selectRun: (id) => set({ selectedRunId: id }),
  addLiveRun: (run) =>
    set((state) => ({ liveRuns: [...state.liveRuns, run] })),
  removeLiveRun: (id) =>
    set((state) => ({
      liveRuns: state.liveRuns.filter((r) => r.id !== id),
    })),
  updateLiveRun: (id, updates) =>
    set((state) => ({
      liveRuns: state.liveRuns.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
}));

