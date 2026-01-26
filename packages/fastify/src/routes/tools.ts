import type { FastifyPluginAsync } from 'fastify';
import type { ToolListResponse } from '../types.js';

export const toolRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/tools', async () => {
    const toolsSet = new Map<string, { name: string; description?: string; parameters: unknown }>();

    for (const agent of Object.values(fastify.cogitator.agents)) {
      const tools = agent.config.tools || [];
      for (const tool of tools) {
        if (!toolsSet.has(tool.name)) {
          toolsSet.set(tool.name, {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          });
        }
      }
    }

    const response: ToolListResponse = {
      tools: Array.from(toolsSet.values()).map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters as Record<string, unknown>,
      })),
    };

    return response;
  });
};
