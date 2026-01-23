/**
 * Swarm Agent job processor
 *
 * Executes a single agent within a distributed swarm context.
 * Reads shared state from Redis and publishes results back.
 */

import { Cogitator, Agent, tool } from '@cogitator-ai/core';
import Redis from 'ioredis';
import { z } from 'zod';
import type { Tool, ToolSchema } from '@cogitator-ai/types';
import type { SwarmAgentJobPayload, SwarmAgentJobResult } from '../types.js';

function jsonSchemaToZod(params: ToolSchema['parameters']): z.ZodType {
  const properties = params.properties;
  const required = params.required ?? [];

  if (Object.keys(properties).length === 0) {
    return z.object({});
  }

  const shape: Record<string, z.ZodType> = {};
  for (const [key, _] of Object.entries(properties)) {
    shape[key] = required.includes(key) ? z.unknown() : z.unknown().optional();
  }

  return z.object(shape).passthrough();
}

function recreateTools(schemas: ToolSchema[]): Tool[] {
  return schemas.map((schema) =>
    tool({
      name: schema.name,
      description: schema.description,
      parameters: jsonSchemaToZod(schema.parameters),
      execute: async (input) => {
        console.warn(
          `[swarm-agent-worker] Tool "${schema.name}" called with input:`,
          JSON.stringify(input)
        );
        return {
          warning: 'Tool executed in worker with stub implementation',
          input,
        };
      },
    })
  );
}

export async function processSwarmAgentJob(
  payload: SwarmAgentJobPayload
): Promise<SwarmAgentJobResult> {
  const { swarmId, agentName, agentConfig, input, context, stateKeys } = payload;

  let redis: Redis | null = null;

  try {
    const cogitator = new Cogitator();
    const tools = recreateTools(agentConfig.tools as ToolSchema[]);

    const agent = new Agent({
      name: agentConfig.name,
      model: `${agentConfig.provider}/${agentConfig.model}`,
      instructions: agentConfig.instructions,
      temperature: agentConfig.temperature,
      maxTokens: agentConfig.maxTokens,
      tools,
    });

    const result = await cogitator.run(agent, {
      input,
      context: {
        ...context,
        _distributedSwarm: true,
      },
    });

    const jobResult: SwarmAgentJobResult = {
      type: 'swarm-agent',
      swarmId,
      agentName,
      output: result.output,
      structured: result.structured,
      toolCalls: result.toolCalls.map((tc) => ({
        name: tc.name,
        input: tc.arguments,
        output: undefined,
      })),
      tokenUsage: {
        prompt: result.usage.inputTokens,
        completion: result.usage.outputTokens,
        total: result.usage.totalTokens,
      },
    };

    redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      password: process.env.REDIS_PASSWORD,
    });

    await redis.publish(stateKeys.results, JSON.stringify(jobResult));

    return jobResult;
  } catch (error) {
    const errorResult: SwarmAgentJobResult = {
      type: 'swarm-agent',
      swarmId,
      agentName,
      output: '',
      toolCalls: [],
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    if (!redis) {
      redis = new Redis({
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
        password: process.env.REDIS_PASSWORD,
      });
    }

    await redis.publish(stateKeys.results, JSON.stringify(errorResult));

    throw error;
  } finally {
    if (redis) {
      await redis.quit();
    }
  }
}
