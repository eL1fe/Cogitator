# @cogitator-ai/dashboard

Web dashboard for monitoring and managing Cogitator agents, runs, and workflows.

> **Preview Release**: This dashboard is in active development. APIs may change.

## Features

- 📊 Real-time agent execution monitoring
- 🔄 Workflow visualization and management
- 🎮 Interactive playground for testing agents
- 📈 Analytics and performance metrics
- 🔐 Role-based access control
- 🔑 API key authentication for programmatic access

## Quick Start

### Development

```bash
cd packages/dashboard
cp .env.production.example .env.local
# Edit .env.local with your values
pnpm dev
```

### Production

```bash
pnpm build
pnpm start
```

## Authentication

### Session-based (Supabase)

For web UI access, authentication uses Supabase Auth:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### API Key Authentication

For programmatic access (scripts, CI/CD, integrations):

```bash
# Simple single-key setup
COGITATOR_API_KEY=cog_your_secret_key

# Or multiple keys with roles
COGITATOR_API_KEYS='[{"id":"prod","hash":"sha256hash","name":"Production","role":"admin","createdAt":1234}]'
```

#### Usage

```bash
# Via Authorization header
curl -H "Authorization: Bearer cog_xxx" https://dashboard.example.com/api/agents

# Via X-API-Key header
curl -H "X-API-Key: cog_xxx" https://dashboard.example.com/api/agents
```

#### Generating API Keys

```bash
# Via API (admin only)
curl -X POST https://dashboard.example.com/api/auth/keys \
  -H "Authorization: Bearer cog_admin_key" \
  -H "Content-Type: application/json" \
  -d '{"name": "CI Pipeline", "role": "user"}'
```

### Roles

| Role       | Permissions                        |
| ---------- | ---------------------------------- |
| `admin`    | Full access, config changes        |
| `user`     | Read/write agents, runs, workflows |
| `readonly` | View-only access                   |

## API Endpoints

### Agents

```
GET    /api/agents          List all agents
POST   /api/agents          Create agent
GET    /api/agents/:id      Get agent details
PATCH  /api/agents/:id      Update agent
DELETE /api/agents/:id      Delete agent
```

### Runs

```
GET    /api/runs            List runs (filterable)
GET    /api/runs/:id        Get run details
```

### Workflows

```
GET    /api/workflows       List workflows
POST   /api/workflows       Create workflow
GET    /api/workflows/:id   Get workflow
PATCH  /api/workflows/:id   Update workflow
DELETE /api/workflows/:id   Delete workflow
POST   /api/workflows/:id/run  Execute workflow
```

### Playground

```
POST   /api/playground      Execute agent with input
```

### MCP Integration

```
GET    /api/mcp?action=clients     List connected MCP clients
POST   /api/mcp action=connect     Connect to MCP server
POST   /api/mcp action=call-tool   Call MCP tool
DELETE /api/mcp                    Disconnect all
```

### Health

```
GET    /api/health          Overall health status
GET    /api/health/live     Liveness probe
GET    /api/health/ready    Readiness probe
```

## Environment Variables

See [.env.production.example](.env.production.example) for all available options.

### Required

| Variable                        | Description           |
| ------------------------------- | --------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key     |
| `DATABASE_URL`                  | PostgreSQL connection |

### Optional

| Variable                   | Description                | Default                  |
| -------------------------- | -------------------------- | ------------------------ |
| `COGITATOR_AUTH_ENABLED`   | Enable authentication      | `true`                   |
| `COGITATOR_API_KEY`        | Single API key for access  | -                        |
| `COGITATOR_ENCRYPTION_KEY` | Key for encrypting secrets | -                        |
| `OLLAMA_URL`               | Ollama server URL          | `http://localhost:11434` |
| `OPENAI_API_KEY`           | OpenAI API key             | -                        |
| `ANTHROPIC_API_KEY`        | Anthropic API key          | -                        |

## Deployment

### Vercel

```bash
vercel
```

The dashboard is optimized for Vercel deployment. Set environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Self-hosted

For full functionality including sandbox execution:

```bash
docker compose up -d
```

## License

MIT
