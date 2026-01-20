import { describe, it, expect } from 'vitest';
import { Agent } from '../src/agent';
import { tool } from '../src/tool';
import { z } from 'zod';

describe('Agent', () => {
  it('creates agent with required properties', () => {
    const agent = new Agent({
      name: 'test-agent',
      model: 'gpt-4o',
      instructions: 'You are a helpful assistant.',
    });

    expect(agent.name).toBe('test-agent');
    expect(agent.model).toBe('gpt-4o');
    expect(agent.instructions).toBe('You are a helpful assistant.');
  });

  it('generates unique id', () => {
    const agent1 = new Agent({ name: 'a', model: 'm', instructions: 'i' });
    const agent2 = new Agent({ name: 'a', model: 'm', instructions: 'i' });

    expect(agent1.id).not.toBe(agent2.id);
    expect(agent1.id).toMatch(/^agent_/);
  });

  it('accepts tools array', () => {
    const myTool = tool({
      name: 'calculator',
      description: 'Calculate',
      parameters: z.object({ expr: z.string() }),
      execute: async () => 42,
    });

    const agent = new Agent({
      name: 'math-agent',
      model: 'gpt-4o',
      instructions: 'Help with math',
      tools: [myTool],
    });

    expect(agent.tools).toHaveLength(1);
    expect(agent.tools[0].name).toBe('calculator');
  });

  it('accepts optional parameters', () => {
    const agent = new Agent({
      name: 'configured-agent',
      model: 'gpt-4o',
      instructions: 'Be helpful',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
    });

    expect(agent.config.temperature).toBe(0.7);
    expect(agent.config.maxTokens).toBe(2000);
    expect(agent.config.topP).toBe(0.9);
  });

  it('defaults to empty tools array', () => {
    const agent = new Agent({
      name: 'no-tools',
      model: 'gpt-4o',
      instructions: 'Simple agent',
    });

    expect(agent.tools).toEqual([]);
  });

  it('preserves tool order', () => {
    const tool1 = tool({
      name: 'first',
      description: '1st',
      parameters: z.object({}),
      execute: async () => null,
    });

    const tool2 = tool({
      name: 'second',
      description: '2nd',
      parameters: z.object({}),
      execute: async () => null,
    });

    const tool3 = tool({
      name: 'third',
      description: '3rd',
      parameters: z.object({}),
      execute: async () => null,
    });

    const agent = new Agent({
      name: 'multi-tool',
      model: 'gpt-4o',
      instructions: 'Multiple tools',
      tools: [tool1, tool2, tool3],
    });

    expect(agent.tools.map((t) => t.name)).toEqual(['first', 'second', 'third']);
  });

  it('supports maxIterations config', () => {
    const agent = new Agent({
      name: 'limited-agent',
      model: 'gpt-4o',
      instructions: 'Limited iterations',
      maxIterations: 5,
    });

    expect(agent.config.maxIterations).toBe(5);
  });

  it('supports responseFormat', () => {
    const agent = new Agent({
      name: 'json-agent',
      model: 'gpt-4o',
      instructions: 'Return JSON',
      responseFormat: { type: 'json_object' },
    });

    expect(agent.config.responseFormat).toEqual({ type: 'json_object' });
  });
});
