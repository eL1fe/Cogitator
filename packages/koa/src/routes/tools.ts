import Router from '@koa/router';
import type { CogitatorState, ToolListResponse } from '../types.js';

export function createToolRoutes(): Router<CogitatorState> {
  const router = new Router<CogitatorState>();

  router.get('/tools', (ctx) => {
    const { agents } = ctx.state.cogitator;
    const toolsSet = new Map<string, { name: string; description?: string; parameters: unknown }>();

    for (const agent of Object.values(agents)) {
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

    ctx.body = response;
  });

  return router;
}
