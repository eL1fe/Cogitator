import { describe, it, expect } from 'vitest';
import { tool, toolToSchema } from '../src/tool';
import { z } from 'zod';

describe('tool()', () => {
  it('creates a tool with name and description', () => {
    const myTool = tool({
      name: 'test_tool',
      description: 'A test tool',
      parameters: z.object({}),
      execute: async () => 'result',
    });

    expect(myTool.name).toBe('test_tool');
    expect(myTool.description).toBe('A test tool');
  });

  it('creates a tool with typed parameters', () => {
    const myTool = tool({
      name: 'calculator',
      description: 'Calculate math',
      parameters: z.object({
        a: z.number(),
        b: z.number(),
      }),
      execute: async ({ a, b }) => a + b,
    });

    expect(myTool.name).toBe('calculator');
  });

  it('executes tool with parameters', async () => {
    const myTool = tool({
      name: 'adder',
      description: 'Add two numbers',
      parameters: z.object({
        a: z.number(),
        b: z.number(),
      }),
      execute: async ({ a, b }) => ({ sum: a + b }),
    });

    const context = { agentId: 'test', runId: 'run1', signal: new AbortController().signal };
    const result = await myTool.execute({ a: 2, b: 3 }, context);

    expect(result).toEqual({ sum: 5 });
  });

  it('preserves optional tool properties', () => {
    const myTool = tool({
      name: 'optional_props',
      description: 'Tool with optional properties',
      parameters: z.object({}),
      execute: async () => null,
      category: 'utility',
      tags: ['test', 'example'],
      timeout: 5000,
      requiresApproval: true,
    });

    expect(myTool.category).toBe('utility');
    expect(myTool.tags).toEqual(['test', 'example']);
    expect(myTool.timeout).toBe(5000);
    expect(myTool.requiresApproval).toBe(true);
  });

  it('supports sandbox configuration', () => {
    const myTool = tool({
      name: 'sandboxed',
      description: 'Sandboxed tool',
      parameters: z.object({ code: z.string() }),
      execute: async ({ code }) => code,
      sandbox: {
        type: 'wasm',
        wasmModule: '/path/to/module.wasm',
        timeout: 10000,
      },
    });

    expect(myTool.sandbox).toEqual({
      type: 'wasm',
      wasmModule: '/path/to/module.wasm',
      timeout: 10000,
    });
  });
});

describe('toolToSchema()', () => {
  it('converts simple tool to JSON schema', () => {
    const myTool = tool({
      name: 'simple',
      description: 'Simple tool',
      parameters: z.object({
        input: z.string(),
      }),
      execute: async () => null,
    });

    const schema = toolToSchema(myTool);

    expect(schema.name).toBe('simple');
    expect(schema.description).toBe('Simple tool');
    expect(schema.parameters.type).toBe('object');
    expect(schema.parameters.properties).toHaveProperty('input');
  });

  it('includes required fields in schema', () => {
    const myTool = tool({
      name: 'required_fields',
      description: 'Tool with required fields',
      parameters: z.object({
        required: z.string(),
        optional: z.string().optional(),
      }),
      execute: async () => null,
    });

    const schema = toolToSchema(myTool);

    expect(schema.parameters.required).toContain('required');
    expect(schema.parameters.required).not.toContain('optional');
  });

  it('handles complex parameter types', () => {
    const myTool = tool({
      name: 'complex',
      description: 'Complex parameters',
      parameters: z.object({
        count: z.number().int().min(1).max(100),
        mode: z.enum(['fast', 'slow', 'balanced']),
        tags: z.array(z.string()).optional(),
      }),
      execute: async () => null,
    });

    const schema = toolToSchema(myTool);
    const props = schema.parameters.properties as Record<
      string,
      { type?: string; enum?: string[] }
    >;

    expect(props.count).toBeDefined();
    expect(props.mode.enum).toEqual(['fast', 'slow', 'balanced']);
  });

  it('toJSON method returns same as toolToSchema', () => {
    const myTool = tool({
      name: 'json_test',
      description: 'Test toJSON',
      parameters: z.object({ x: z.number() }),
      execute: async () => null,
    });

    const fromToJSON = myTool.toJSON();
    const fromHelper = toolToSchema(myTool);

    expect(fromToJSON).toEqual(fromHelper);
  });
});
