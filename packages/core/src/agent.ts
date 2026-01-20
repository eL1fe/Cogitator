import type { Agent as IAgent, AgentConfig, Tool } from '@cogitator-ai/types';
import { nanoid } from 'nanoid';

/**
 * AI agent that can execute tasks using LLM and tools.
 *
 * @example
 * ```ts
 * import { Agent, tool } from '@cogitator-ai/core';
 * import { z } from 'zod';
 *
 * const searchTool = tool({
 *   name: 'search',
 *   description: 'Search the web',
 *   parameters: z.object({ query: z.string() }),
 *   execute: async ({ query }) => ({ results: [] }),
 * });
 *
 * const agent = new Agent({
 *   name: 'researcher',
 *   model: 'anthropic/claude-sonnet-4-20250514',
 *   instructions: 'You are a research assistant.',
 *   tools: [searchTool],
 * });
 * ```
 */
export class Agent implements IAgent {
  /** Unique identifier for this agent instance */
  readonly id: string;
  /** Human-readable name of the agent */
  readonly name: string;
  /** Full configuration including model, instructions, tools, and parameters */
  readonly config: AgentConfig;

  /**
   * Create a new Agent instance.
   *
   * @param config - Agent configuration
   * @param config.name - Human-readable name for the agent
   * @param config.model - LLM model identifier (e.g., 'anthropic/claude-sonnet-4-20250514')
   * @param config.instructions - System prompt defining agent behavior
   * @param config.tools - Array of tools the agent can use
   * @param config.temperature - Sampling temperature (default: 0.7)
   * @param config.maxIterations - Maximum tool call iterations (default: 10)
   * @param config.timeout - Run timeout in milliseconds (default: 120000)
   */
  constructor(config: AgentConfig) {
    this.id = config.id ?? `agent_${nanoid(12)}`;
    this.name = config.name;
    this.config = {
      temperature: 0.7,
      maxIterations: 10,
      timeout: 120_000,
      ...config,
    };
  }

  /** LLM model identifier */
  get model(): string {
    return this.config.model;
  }

  /** System prompt defining agent behavior */
  get instructions(): string {
    return this.config.instructions;
  }

  /** Tools available to this agent */
  get tools(): Tool[] {
    return this.config.tools ?? [];
  }

  /**
   * Create a copy of this agent with configuration overrides.
   *
   * @param overrides - Configuration values to override
   * @returns New Agent instance with merged configuration
   *
   * @example
   * ```ts
   * const creativeAgent = agent.clone({ temperature: 0.9 });
   * const fastAgent = agent.clone({ model: 'anthropic/claude-haiku' });
   * ```
   */
  clone(overrides: Partial<AgentConfig>): Agent {
    return new Agent({
      ...this.config,
      ...overrides,
    });
  }
}
