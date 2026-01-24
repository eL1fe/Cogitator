import { nanoid } from 'nanoid';
import type { ToolSchema, ToolContext } from '@cogitator-ai/types';

export interface TestToolOptions {
  name?: string;
  description?: string;
  parameters?: ToolSchema['parameters'];
  execute?: (args: Record<string, unknown>, context: ToolContext) => Promise<unknown>;
}

export interface SimpleTool {
  name: string;
  description: string;
  parameters: ToolSchema['parameters'];
  execute: (args: Record<string, unknown>, context: ToolContext) => Promise<unknown>;
}

export function createTestTool(options?: TestToolOptions): SimpleTool {
  const name = options?.name ?? `test_tool_${nanoid(4)}`;

  return {
    name,
    description: options?.description ?? `A test tool called ${name}`,
    parameters: options?.parameters ?? {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Test input' },
      },
      required: ['input'],
    },
    execute:
      options?.execute ??
      (async (args) => ({ result: `Executed ${name} with ${JSON.stringify(args)}` })),
  };
}

export function createCalculatorTool(): SimpleTool {
  return createTestTool({
    name: 'calculator',
    description: 'Perform mathematical calculations',
    parameters: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: 'Mathematical expression to evaluate' },
      },
      required: ['expression'],
    },
    execute: async ({ expression }) => {
      try {
        const result = Function(`"use strict"; return (${expression})`)();
        return { result };
      } catch {
        return { error: 'Invalid expression' };
      }
    },
  });
}

export function createWeatherTool(): SimpleTool {
  return createTestTool({
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name' },
        units: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'Temperature units',
        },
      },
      required: ['city'],
    },
    execute: async ({ city, units = 'celsius' }) => ({
      city,
      temperature: units === 'celsius' ? 22 : 72,
      condition: 'sunny',
      units,
    }),
  });
}

export function createFailingTool(errorMessage = 'Tool execution failed'): SimpleTool {
  return createTestTool({
    name: 'failing_tool',
    description: 'A tool that always fails',
    execute: async () => {
      throw new Error(errorMessage);
    },
  });
}

export function createSlowTool(delayMs = 1000): SimpleTool {
  return createTestTool({
    name: 'slow_tool',
    description: 'A tool that takes time to execute',
    execute: async (args) => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return { result: 'completed', delay: delayMs, args };
    },
  });
}

export function createToolSchema(name: string, description?: string): ToolSchema {
  return {
    name,
    description: description ?? `Schema for ${name}`,
    parameters: {
      type: 'object',
      properties: {
        input: { type: 'string' },
      },
      required: ['input'],
    },
  };
}
