import type { FastifyPluginAsync } from 'fastify';
import type { ThreadResponse, AddMessageRequest } from '../types.js';
import { AddMessageRequestSchema } from '../types.js';

interface ThreadParams {
  id: string;
}

export const threadRoutes: FastifyPluginAsync = async (fastify) => {
  const getMemory = () => fastify.cogitator.runtime.memory;

  fastify.get<{ Params: ThreadParams }>(
    '/threads/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      const memory = getMemory();
      if (!memory) {
        return reply.status(503).send({
          error: { message: 'Memory not configured', code: 'UNAVAILABLE' },
        });
      }

      const { id } = request.params;

      try {
        const result = await memory.getEntries({ threadId: id });
        if (!result.success) {
          return reply.status(500).send({
            error: { message: result.error, code: 'INTERNAL' },
          });
        }

        const messages = result.data.map((entry) => entry.message);
        const response: ThreadResponse = {
          id,
          messages,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return reply.status(500).send({
          error: { message, code: 'INTERNAL' },
        });
      }
    }
  );

  fastify.post<{ Params: ThreadParams; Body: AddMessageRequest }>(
    '/threads/:id/messages',
    {
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        body: AddMessageRequestSchema,
      },
    },
    async (request, reply) => {
      const memory = getMemory();
      if (!memory) {
        return reply.status(503).send({
          error: { message: 'Memory not configured', code: 'UNAVAILABLE' },
        });
      }

      const { id } = request.params;
      const body = request.body;

      if (!body?.role || !body?.content) {
        return reply.status(400).send({
          error: { message: 'Missing required fields: role, content', code: 'INVALID_INPUT' },
        });
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
          return reply.status(500).send({
            error: { message: result.error, code: 'INTERNAL' },
          });
        }

        return reply.status(201).send({ success: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return reply.status(500).send({
          error: { message, code: 'INTERNAL' },
        });
      }
    }
  );

  fastify.delete<{ Params: ThreadParams }>(
    '/threads/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      const memory = getMemory();
      if (!memory) {
        return reply.status(503).send({
          error: { message: 'Memory not configured', code: 'UNAVAILABLE' },
        });
      }

      const { id } = request.params;

      try {
        const result = await memory.clearThread(id);
        if (!result.success) {
          return reply.status(500).send({
            error: { message: result.error, code: 'INTERNAL' },
          });
        }
        return reply.status(204).send();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return reply.status(500).send({
          error: { message, code: 'INTERNAL' },
        });
      }
    }
  );
};
