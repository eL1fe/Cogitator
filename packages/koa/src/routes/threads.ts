import Router from '@koa/router';
import type { CogitatorState, ThreadResponse, AddMessageRequest, Message } from '../types.js';

export function createThreadRoutes(): Router<CogitatorState> {
  const router = new Router<CogitatorState>();

  router.get('/threads/:id', async (ctx) => {
    const memory = ctx.state.cogitator.cogitator.memory;
    if (!memory) {
      ctx.status = 503;
      ctx.body = { error: { message: 'Memory not configured', code: 'UNAVAILABLE' } };
      return;
    }

    const { id } = ctx.params;

    try {
      const result = await memory.getEntries({ threadId: id });
      if (!result.success) {
        ctx.status = 500;
        ctx.body = { error: { message: result.error, code: 'INTERNAL' } };
        return;
      }

      const messages = result.data.map((entry: { message: Message }) => entry.message);
      const response: ThreadResponse = {
        id,
        messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      ctx.body = response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      ctx.status = 500;
      ctx.body = { error: { message, code: 'INTERNAL' } };
    }
  });

  router.post('/threads/:id/messages', async (ctx) => {
    const memory = ctx.state.cogitator.cogitator.memory;
    if (!memory) {
      ctx.status = 503;
      ctx.body = { error: { message: 'Memory not configured', code: 'UNAVAILABLE' } };
      return;
    }

    const { id } = ctx.params;
    const body = (ctx.request as unknown as { body: AddMessageRequest }).body;

    if (!body?.role || !body?.content) {
      ctx.status = 400;
      ctx.body = {
        error: { message: 'Missing required fields: role, content', code: 'INVALID_INPUT' },
      };
      return;
    }

    try {
      const result = await memory.addEntry({
        threadId: id,
        message: {
          role: body.role,
          content: body.content,
        },
        tokenCount: 0,
      });

      if (!result.success) {
        ctx.status = 500;
        ctx.body = { error: { message: result.error, code: 'INTERNAL' } };
        return;
      }

      ctx.status = 201;
      ctx.body = { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      ctx.status = 500;
      ctx.body = { error: { message, code: 'INTERNAL' } };
    }
  });

  router.delete('/threads/:id', async (ctx) => {
    const memory = ctx.state.cogitator.cogitator.memory;
    if (!memory) {
      ctx.status = 503;
      ctx.body = { error: { message: 'Memory not configured', code: 'UNAVAILABLE' } };
      return;
    }

    const { id } = ctx.params;

    try {
      const result = await memory.clearThread(id);
      if (!result.success) {
        ctx.status = 500;
        ctx.body = { error: { message: result.error, code: 'INTERNAL' } };
        return;
      }
      ctx.status = 204;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      ctx.status = 500;
      ctx.body = { error: { message, code: 'INTERNAL' } };
    }
  });

  return router;
}
