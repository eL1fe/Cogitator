import { nanoid } from 'nanoid';
import type { Agent, AgentConfig, Tool } from '@cogitator-ai/types';

export interface TestAgentConfig extends Partial<AgentConfig> {
  name?: string;
  model?: string;
  instructions?: string;
}

export function createTestAgentConfig(overrides?: TestAgentConfig): AgentConfig {
  return {
    id: `agent_${nanoid(8)}`,
    name: 'test-agent',
    model: 'mock/test-model',
    instructions: 'You are a helpful test assistant.',
    temperature: 0.7,
    maxIterations: 10,
    timeout: 30000,
    tools: [],
    ...overrides,
  };
}

export function createTestAgent(overrides?: TestAgentConfig): Agent {
  const config = createTestAgentConfig(overrides);

  return {
    id: config.id!,
    name: config.name,
    model: config.model,
    instructions: config.instructions,
    tools: config.tools ?? [],
    config,
    clone(cloneOverrides: Partial<AgentConfig>) {
      return createTestAgent({ ...config, ...cloneOverrides, id: undefined });
    },
    serialize() {
      return {
        version: '1.0',
        id: config.id!,
        name: config.name,
        config: {
          model: config.model,
          instructions: config.instructions,
          tools: (config.tools ?? []).map((t: Tool) => t.name),
          temperature: config.temperature,
          maxIterations: config.maxIterations,
          timeout: config.timeout,
        },
        metadata: {
          serializedAt: new Date().toISOString(),
        },
      };
    },
  };
}
