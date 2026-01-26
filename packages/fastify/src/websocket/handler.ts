import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import type { WebSocket } from 'ws';
import type { WebSocketMessage, WebSocketResponse } from '../types.js';
import { generateId } from '../streaming/helpers.js';
import type { ToolCall } from '@cogitator-ai/types';

interface Subscription {
  channel: string;
  callback: (data: unknown) => void;
}

interface ClientState {
  id: string;
  subscriptions: Map<string, Subscription>;
  abortController?: AbortController;
}

interface WebSocketRoutesOptions {
  path?: string;
}

export const websocketRoutes: FastifyPluginAsync<WebSocketRoutesOptions> = async (
  fastify,
  opts
) => {
  const path = opts.path ?? '/ws';

  fastify.get(path, { websocket: true }, (socket: WebSocket, _request: FastifyRequest) => {
    const clientState: ClientState = {
      id: generateId('ws'),
      subscriptions: new Map(),
    };

    socket.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        await handleMessage(socket, message, fastify, clientState);
      } catch (error) {
        sendResponse(socket, {
          type: 'error',
          error: error instanceof Error ? error.message : 'Invalid message',
        });
      }
    });

    socket.on('close', () => {
      clientState.abortController?.abort();
    });

    socket.on('error', () => {
      clientState.abortController?.abort();
    });
  });
};

async function handleMessage(
  socket: WebSocket,
  message: WebSocketMessage,
  fastify: Parameters<FastifyPluginAsync>[0],
  state: ClientState
): Promise<void> {
  switch (message.type) {
    case 'ping':
      sendResponse(socket, { type: 'pong' });
      break;

    case 'subscribe':
      if (message.channel) {
        state.subscriptions.set(message.channel, {
          channel: message.channel,
          callback: (data) => {
            sendResponse(socket, { type: 'event', channel: message.channel, payload: data });
          },
        });
        sendResponse(socket, { type: 'subscribed', channel: message.channel });
      }
      break;

    case 'unsubscribe':
      if (message.channel) {
        state.subscriptions.delete(message.channel);
        sendResponse(socket, { type: 'unsubscribed', channel: message.channel });
      }
      break;

    case 'run':
      await handleRun(socket, message, fastify, state);
      break;

    case 'stop':
      state.abortController?.abort();
      state.abortController = undefined;
      break;
  }
}

async function handleRun(
  socket: WebSocket,
  message: WebSocketMessage,
  fastify: Parameters<FastifyPluginAsync>[0],
  state: ClientState
): Promise<void> {
  const payload = message.payload as {
    type: 'agent' | 'workflow' | 'swarm';
    name: string;
    input: string;
    context?: Record<string, unknown>;
  };

  if (!payload?.type || !payload?.name || !payload?.input) {
    sendResponse(socket, { type: 'error', id: message.id, error: 'Invalid run payload' });
    return;
  }

  state.abortController = new AbortController();

  try {
    if (payload.type === 'agent') {
      const agent = fastify.cogitator.agents[payload.name];
      if (!agent) {
        sendResponse(socket, {
          type: 'error',
          id: message.id,
          error: `Agent '${payload.name}' not found`,
        });
        return;
      }

      const result = await fastify.cogitator.runtime.run(agent, {
        input: payload.input,
        context: payload.context,
        stream: true,
        onToken: (token: string) => {
          sendResponse(socket, {
            type: 'event',
            id: message.id,
            payload: { type: 'token', delta: token },
          });
        },
        onToolCall: (toolCall: ToolCall) => {
          sendResponse(socket, {
            type: 'event',
            id: message.id,
            payload: { type: 'tool-call', ...toolCall },
          });
        },
        onToolResult: (toolResult: { callId: string; result: unknown }) => {
          sendResponse(socket, {
            type: 'event',
            id: message.id,
            payload: { type: 'tool-result', ...toolResult },
          });
        },
      });

      sendResponse(socket, {
        type: 'event',
        id: message.id,
        payload: { type: 'complete', result },
      });
    }
  } catch (error) {
    if (state.abortController?.signal.aborted) {
      sendResponse(socket, { type: 'event', id: message.id, payload: { type: 'cancelled' } });
    } else {
      sendResponse(socket, {
        type: 'error',
        id: message.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

function sendResponse(socket: WebSocket, response: WebSocketResponse): void {
  try {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify(response));
    }
  } catch {}
}
