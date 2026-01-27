import Router from '@koa/router';
import type { CogitatorState, HealthResponse } from '../types.js';

const startTime = Date.now();

export function createHealthRoutes(): Router<CogitatorState> {
  const router = new Router<CogitatorState>();

  router.get('/health', (ctx) => {
    const response: HealthResponse = {
      status: 'ok',
      uptime: Date.now() - startTime,
      timestamp: Date.now(),
    };
    ctx.body = response;
  });

  router.get('/ready', (ctx) => {
    ctx.body = { status: 'ok' };
  });

  return router;
}
