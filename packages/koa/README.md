# @cogitator-ai/koa

Koa server adapter for [Cogitator AI](https://github.com/cogitator-ai/Cogitator-AI) runtime. Exposes agents, workflows, swarms, and threads as a REST API with SSE streaming.

## Installation

```bash
npm install @cogitator-ai/koa koa @koa/router
```

## Quick Start

```typescript
import Koa from 'koa';
import { cogitatorApp } from '@cogitator-ai/koa';
import { Cogitator, Agent } from '@cogitator-ai/core';

const cogitator = new Cogitator({ backend: 'openai' });
const chatAgent = new Agent({ name: 'chat', instructions: 'You are helpful.' });

const app = new Koa();
const router = cogitatorApp({
  cogitator,
  agents: { chat: chatAgent },
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
```

## API Endpoints

| Method   | Path                       | Description                  |
| -------- | -------------------------- | ---------------------------- |
| `GET`    | `/health`                  | Health check                 |
| `GET`    | `/ready`                   | Readiness check              |
| `GET`    | `/agents`                  | List all agents              |
| `POST`   | `/agents/:name/run`        | Run an agent                 |
| `POST`   | `/agents/:name/stream`     | Stream agent response (SSE)  |
| `GET`    | `/threads/:id`             | Get thread messages          |
| `POST`   | `/threads/:id/messages`    | Add message to thread        |
| `DELETE` | `/threads/:id`             | Delete thread                |
| `GET`    | `/tools`                   | List all tools               |
| `GET`    | `/workflows`               | List workflows               |
| `POST`   | `/workflows/:name/run`     | Execute workflow             |
| `POST`   | `/workflows/:name/stream`  | Stream workflow events (SSE) |
| `GET`    | `/swarms`                  | List swarms                  |
| `POST`   | `/swarms/:name/run`        | Run swarm                    |
| `POST`   | `/swarms/:name/stream`     | Stream swarm events (SSE)    |
| `GET`    | `/swarms/:name/blackboard` | Get swarm blackboard         |

## Authentication

```typescript
const router = cogitatorApp({
  cogitator,
  agents: { chat: chatAgent },
  auth: async (ctx) => {
    const token = ctx.get('authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token');
    const user = await validateToken(token);
    return { userId: user.id, roles: user.roles };
  },
});
```

## With Prefix

```typescript
import Koa from 'koa';
import Router from '@koa/router';
import { cogitatorApp } from '@cogitator-ai/koa';

const app = new Koa();
const main = new Router();
const cogitator = cogitatorApp({ cogitator, agents });

main.use('/api/v1', cogitator.routes(), cogitator.allowedMethods());
app.use(main.routes());
```

## WebSocket

```typescript
import { createServer } from 'http';
import { cogitatorApp, setupWebSocket } from '@cogitator-ai/koa';

const app = new Koa();
const router = cogitatorApp({ cogitator, agents, enableWebSocket: true });
app.use(router.routes());

const server = createServer(app.callback());
await setupWebSocket(server, { cogitator, agents, workflows: {}, swarms: {} });

server.listen(3000);
```

## Features

- Full REST API for agents, workflows, swarms, and threads
- Server-Sent Events (SSE) streaming
- Authentication middleware
- Built-in JSON body parser
- Error handling with Cogitator error codes
- WebSocket support via `ws`
- TypeScript-first with full type safety

## License

MIT
