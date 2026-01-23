import type { TaskComplexity, TokenEstimate, ToolSchema } from '@cogitator-ai/types';

const CHARS_PER_TOKEN = 4;

const OUTPUT_ESTIMATES: Record<TaskComplexity, { min: number; max: number; expected: number }> = {
  simple: { min: 50, max: 300, expected: 150 },
  moderate: { min: 300, max: 1500, expected: 800 },
  complex: { min: 1500, max: 6000, expected: 3000 },
};

const TOOL_CALL_TOKENS = { min: 50, max: 200, expected: 100 };

const DEFAULT_MEMORY_TOKENS = { min: 200, max: 1500, expected: 800 };

export class TokenEstimator {
  estimateFromText(text: string): number {
    return Math.ceil(text.length / CHARS_PER_TOKEN);
  }

  estimateInputTokens(params: {
    systemPrompt: string;
    userInput: string;
    memoryContext?: string;
    toolSchemas?: ToolSchema[];
    iterations: number;
    includeMemory?: boolean;
    memoryTokenEstimate?: number;
  }): TokenEstimate {
    const {
      systemPrompt,
      userInput,
      memoryContext,
      toolSchemas,
      iterations,
      includeMemory = true,
      memoryTokenEstimate,
    } = params;

    const systemTokens = this.estimateFromText(systemPrompt);
    const inputTokens = this.estimateFromText(userInput);

    let memoryTokens = { min: 0, max: 0, expected: 0 };
    if (includeMemory) {
      if (memoryContext) {
        const contextTokens = this.estimateFromText(memoryContext);
        memoryTokens = { min: contextTokens, max: contextTokens, expected: contextTokens };
      } else if (memoryTokenEstimate) {
        memoryTokens = {
          min: memoryTokenEstimate,
          max: memoryTokenEstimate,
          expected: memoryTokenEstimate,
        };
      } else {
        memoryTokens = DEFAULT_MEMORY_TOKENS;
      }
    }

    let toolSchemaTokens = 0;
    if (toolSchemas && toolSchemas.length > 0) {
      const schemasJson = JSON.stringify(toolSchemas);
      toolSchemaTokens = this.estimateFromText(schemasJson);
    }

    const baseMin = systemTokens + inputTokens + memoryTokens.min + toolSchemaTokens;
    const baseMax = systemTokens + inputTokens + memoryTokens.max + toolSchemaTokens;
    const baseExpected = systemTokens + inputTokens + memoryTokens.expected + toolSchemaTokens;

    return {
      min: baseMin * iterations,
      max: baseMax * iterations,
      expected: baseExpected * iterations,
    };
  }

  estimateOutputTokens(params: {
    complexity: TaskComplexity;
    hasTools: boolean;
    toolCallCount: number;
    iterations: number;
  }): TokenEstimate {
    const { complexity, hasTools, toolCallCount, iterations } = params;

    const base = OUTPUT_ESTIMATES[complexity];

    let toolTokens = { min: 0, max: 0, expected: 0 };
    if (hasTools && toolCallCount > 0) {
      toolTokens = {
        min: TOOL_CALL_TOKENS.min * toolCallCount,
        max: TOOL_CALL_TOKENS.max * toolCallCount,
        expected: TOOL_CALL_TOKENS.expected * toolCallCount,
      };
    }

    return {
      min: (base.min + toolTokens.min) * iterations,
      max: (base.max + toolTokens.max) * iterations,
      expected: (base.expected + toolTokens.expected) * iterations,
    };
  }

  estimateIterations(complexity: TaskComplexity, hasTools: boolean): number {
    const baseIterations: Record<TaskComplexity, number> = {
      simple: 1,
      moderate: 1,
      complex: 2,
    };

    let iterations = baseIterations[complexity];
    if (hasTools) {
      iterations += complexity === 'simple' ? 1 : complexity === 'moderate' ? 2 : 3;
    }

    return iterations;
  }

  estimateToolCalls(complexity: TaskComplexity, toolCount: number): number {
    if (toolCount === 0) return 0;

    const callsPerComplexity: Record<TaskComplexity, number> = {
      simple: 1,
      moderate: 2,
      complex: 4,
    };

    return Math.min(callsPerComplexity[complexity], toolCount * 2);
  }
}
