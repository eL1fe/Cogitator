/**
 * Runs API Routes
 *
 * Implements OpenAI Runs API endpoints.
 */

import type { FastifyInstance } from 'fastify';
import type { OpenAIAdapter } from '../../client/openai-adapter';
import type { CreateRunRequest, SubmitToolOutputsRequest } from '../../types/openai-types';

export function registerRunRoutes(fastify: FastifyInstance, adapter: OpenAIAdapter) {
  fastify.post<{ Params: { thread_id: string }; Body: CreateRunRequest }>(
    '/v1/threads/:thread_id/runs',
    async (request, reply) => {
      const thread = await adapter.getThread(request.params.thread_id);

      if (!thread) {
        return reply.status(404).send({
          error: {
            message: `No thread found with id '${request.params.thread_id}'`,
            type: 'invalid_request_error',
            code: 'not_found',
          },
        });
      }

      try {
        const run = await adapter.createRun(request.params.thread_id, request.body);

        if (request.body.stream) {
          return handleStreamingRun(reply, adapter, request.params.thread_id, run.id);
        }

        return reply.status(201).send(run);
      } catch (error) {
        return reply.status(400).send({
          error: {
            message: error instanceof Error ? error.message : 'Failed to create run',
            type: 'invalid_request_error',
            code: 'invalid_request',
          },
        });
      }
    }
  );

  fastify.post<{
    Body: CreateRunRequest & {
      thread?: { messages?: { role: 'user' | 'assistant'; content: string }[] };
    };
  }>('/v1/threads/runs', async (request, reply) => {
    const thread = await adapter.createThread();

    if (request.body.thread?.messages) {
      for (const msg of request.body.thread.messages) {
        await adapter.addMessage(thread.id, msg);
      }
    }

    try {
      const run = await adapter.createRun(thread.id, request.body);

      if (request.body.stream) {
        return handleStreamingRun(reply, adapter, thread.id, run.id);
      }

      return reply.status(201).send(run);
    } catch (error) {
      return reply.status(400).send({
        error: {
          message: error instanceof Error ? error.message : 'Failed to create run',
          type: 'invalid_request_error',
          code: 'invalid_request',
        },
      });
    }
  });

  fastify.get<{ Params: { thread_id: string; run_id: string } }>(
    '/v1/threads/:thread_id/runs/:run_id',
    async (request, reply) => {
      const run = adapter.getRun(request.params.thread_id, request.params.run_id);

      if (!run) {
        return reply.status(404).send({
          error: {
            message: `No run found with id '${request.params.run_id}'`,
            type: 'invalid_request_error',
            code: 'not_found',
          },
        });
      }

      return reply.send(run);
    }
  );

  fastify.post<{ Params: { thread_id: string; run_id: string } }>(
    '/v1/threads/:thread_id/runs/:run_id/cancel',
    async (request, reply) => {
      const run = adapter.cancelRun(request.params.thread_id, request.params.run_id);

      if (!run) {
        return reply.status(404).send({
          error: {
            message: `No run found with id '${request.params.run_id}'`,
            type: 'invalid_request_error',
            code: 'not_found',
          },
        });
      }

      return reply.send(run);
    }
  );

  fastify.post<{
    Params: { thread_id: string; run_id: string };
    Body: SubmitToolOutputsRequest;
  }>('/v1/threads/:thread_id/runs/:run_id/submit_tool_outputs', async (request, reply) => {
    try {
      const run = await adapter.submitToolOutputs(
        request.params.thread_id,
        request.params.run_id,
        request.body
      );

      if (!run) {
        return reply.status(404).send({
          error: {
            message: `No run found with id '${request.params.run_id}'`,
            type: 'invalid_request_error',
            code: 'not_found',
          },
        });
      }

      if (request.body.stream) {
        return handleStreamingRun(reply, adapter, request.params.thread_id, run.id);
      }

      return reply.send(run);
    } catch (error) {
      return reply.status(400).send({
        error: {
          message: error instanceof Error ? error.message : 'Failed to submit tool outputs',
          type: 'invalid_request_error',
          code: 'invalid_request',
        },
      });
    }
  });
}

/**
 * Handle streaming run response using EventEmitter for real-time token delivery
 */
function handleStreamingRun(
  reply: {
    raw: {
      write: (data: string) => void;
      end: () => void;
      on: (event: string, handler: () => void) => void;
    };
    header: (key: string, value: string) => void;
  },
  adapter: OpenAIAdapter,
  _threadId: string,
  runId: string
) {
  reply.header('Content-Type', 'text/event-stream');
  reply.header('Cache-Control', 'no-cache');
  reply.header('Connection', 'keep-alive');
  reply.header('X-Accel-Buffering', 'no');

  const sendEvent = (event: string, data: unknown) => {
    const dataStr = event === 'done' ? data : JSON.stringify(data);
    reply.raw.write(`event: ${event}\n`);
    reply.raw.write(`data: ${dataStr}\n\n`);
  };

  const emitter = adapter.getStreamEmitter(runId);
  if (!emitter) {
    sendEvent('error', {
      error: { message: 'No stream available for this run', type: 'server_error' },
    });
    sendEvent('done', '[DONE]');
    reply.raw.end();
    return;
  }

  const eventHandler = (type: string, data: unknown) => {
    sendEvent(type, data);
  };

  const endHandler = () => {
    emitter.off('event', eventHandler);
    emitter.off('end', endHandler);
    reply.raw.end();
  };

  emitter.on('event', eventHandler);
  emitter.on('end', endHandler);

  reply.raw.on('close', () => {
    emitter.off('event', eventHandler);
    emitter.off('end', endHandler);
  });
}
