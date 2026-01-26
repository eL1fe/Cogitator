import type { FastifyRequest, FastifyReply, onRequestHookHandler } from 'fastify';
import type { AuthFunction } from '../types.js';
import { generateId } from '../streaming/helpers.js';

export function createAuthHook(authFn?: AuthFunction): onRequestHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    request.cogitatorRequestId = generateId('req');
    request.cogitatorStartTime = Date.now();

    if (!authFn) {
      return;
    }

    try {
      const auth = await authFn(request);
      request.cogitatorAuth = auth;
    } catch {
      return reply.status(401).send({
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
    }
  };
}
