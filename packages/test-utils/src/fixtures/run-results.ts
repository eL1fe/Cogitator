import { nanoid } from 'nanoid';
import type { RunResult, ToolCall, Message } from '@cogitator-ai/types';

export interface TestRunResultOptions extends Partial<Omit<RunResult, 'output'>> {
  output?: string;
}

export function createMockRunResult(output: string, options?: TestRunResultOptions): RunResult {
  return {
    output,
    runId: options?.runId ?? `run_${nanoid(8)}`,
    agentId: options?.agentId ?? `agent_${nanoid(8)}`,
    threadId: options?.threadId ?? `thread_${nanoid(8)}`,
    usage: options?.usage ?? {
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      cost: 0.001,
      duration: 100,
    },
    toolCalls: options?.toolCalls ?? [],
    messages: options?.messages ?? [],
    trace: options?.trace ?? {
      traceId: `trace_${nanoid(12)}`,
      spans: [],
    },
    ...options,
  };
}

export function createRunResultWithToolCalls(
  output: string,
  toolCalls: readonly ToolCall[],
  options?: Partial<RunResult>
): RunResult {
  return createMockRunResult(output, {
    ...options,
    toolCalls,
  });
}

export function createRunResultWithMessages(
  output: string,
  messages: readonly Message[],
  options?: Partial<RunResult>
): RunResult {
  return createMockRunResult(output, {
    ...options,
    messages,
  });
}
