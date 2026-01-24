# SOC2 Compliance Documentation

This document provides comprehensive SOC2 Type II compliance documentation for Cogitator, covering the five Trust Service Criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy.

> **Note**: This documentation describes controls implemented in the Cogitator framework. Organizations deploying Cogitator are responsible for implementing operational controls appropriate to their environment.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Security Controls](#security-controls)
3. [Availability Controls](#availability-controls)
4. [Processing Integrity Controls](#processing-integrity-controls)
5. [Confidentiality Controls](#confidentiality-controls)
6. [Privacy Controls](#privacy-controls)
7. [Audit & Logging](#audit--logging)
8. [Incident Response](#incident-response)
9. [Vendor Management](#vendor-management)
10. [Control Matrix](#control-matrix)

---

## Executive Summary

Cogitator is an open-source AI agent runtime that processes potentially sensitive data through LLM interactions. This document outlines the security controls, data handling practices, and compliance measures implemented to meet SOC2 requirements.

### Scope

- **In Scope**: Cogitator core runtime, tool execution sandboxes, memory adapters, observability integrations
- **Out of Scope**: Third-party LLM providers (OpenAI, Anthropic, etc.), user-deployed infrastructure, custom tools developed by users

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Cogitator Runtime                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Agent     │  │   Tools     │  │   Memory Adapters       │  │
│  │  Execution  │  │  Registry   │  │  (Postgres/Redis/etc)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Sandbox    │  │Constitutional│ │   Observability         │  │
│  │(WASM/Docker)│  │     AI      │  │  (Langfuse/OTEL)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LLM Providers (External)                      │
│         OpenAI  │  Anthropic  │  Google  │  Ollama (local)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Controls

### CC6.1 - Logical Access Controls

#### Authentication

| Control                | Implementation                                    | Evidence                                        |
| ---------------------- | ------------------------------------------------- | ----------------------------------------------- |
| API Key Authentication | Required `X-API-Key` header for all API endpoints | `packages/dashboard/src/lib/auth/middleware.ts` |
| JWT Token Validation   | Supabase Auth integration with token verification | `packages/dashboard/src/lib/supabase/`          |
| Session Management     | Secure session handling with configurable TTL     | Dashboard auth flow                             |

#### Authorization

| Control            | Implementation                           | Evidence                           |
| ------------------ | ---------------------------------------- | ---------------------------------- |
| Role-Based Access  | Agent-level permissions for tool access  | `Agent.allowedTools` configuration |
| Tool Allowlists    | Explicit tool whitelisting per agent     | Agent configuration                |
| Resource Isolation | Thread-based isolation for conversations | ThreadID-based memory partitioning |

#### Code Example - API Authentication

```typescript
// Authentication middleware
export async function authenticateRequest(request: Request): Promise<AuthResult> {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return { authenticated: false, error: 'API key required' };
  }

  const hashedKey = await hashApiKey(apiKey);
  const validKey = await validateApiKey(hashedKey);

  if (!validKey) {
    await logFailedAuthentication(request);
    return { authenticated: false, error: 'Invalid API key' };
  }

  return { authenticated: true, user: validKey.userId };
}
```

### CC6.2 - System Access Restrictions

#### Sandbox Isolation

Cogitator provides three levels of code execution isolation:

| Sandbox Type | Isolation Level     | Use Case                       |
| ------------ | ------------------- | ------------------------------ |
| **WASM**     | Memory-safe, no I/O | Production, untrusted code     |
| **Docker**   | Container isolation | Complex tools, resource limits |
| **Native**   | None                | Development only               |

#### WASM Sandbox Security Properties

- Memory isolation via WebAssembly linear memory bounds checking
- No filesystem access (unless explicitly granted via WASI)
- No network access
- Execution timeout enforcement
- Output size limits (50KB default)

#### Docker Sandbox Security Properties

```yaml
Security Controls:
  NetworkMode: 'none' # No network access
  CapDrop: ['ALL'] # Drop all capabilities
  SecurityOpt: 'no-new-privileges'
  ReadonlyRootfs: true # Read-only filesystem
  User: '1000:1000' # Non-root user
  Resources:
    Memory: '512m'
    CPUs: '1'
    PidsLimit: 100
```

### CC6.3 - Security Event Monitoring

See [Audit & Logging](#audit--logging) section for comprehensive monitoring controls.

### CC6.6 - Encryption

#### Data in Transit

| Component            | Encryption | Configuration                          |
| -------------------- | ---------- | -------------------------------------- |
| API Endpoints        | TLS 1.3    | Enforced via reverse proxy             |
| Database Connections | TLS        | `sslmode=require` in connection string |
| Redis Connections    | TLS        | `rediss://` protocol                   |
| LLM API Calls        | TLS 1.2+   | Provider-enforced                      |

#### Data at Rest

| Component      | Encryption | Implementation                  |
| -------------- | ---------- | ------------------------------- |
| Postgres       | TDE        | Database-level encryption       |
| Redis          | Encrypted  | Redis Enterprise encryption     |
| Memory Adapter | AES-256    | Optional field-level encryption |
| Audit Logs     | Encrypted  | Storage-level encryption        |

#### Secret Management

```typescript
// Recommended secret management pattern
const config = {
  llm: {
    openaiApiKey: process.env.OPENAI_API_KEY, // From secret manager
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  },
  database: {
    url: process.env.DATABASE_URL, // Includes credentials
  },
};

// Secrets are NEVER logged
logger.info('Configuration loaded', {
  hasOpenAI: !!config.llm.openaiApiKey, // Boolean only
  hasAnthropic: !!config.llm.anthropicApiKey,
});
```

### CC6.7 - Vulnerability Management

#### Dependency Security

| Control             | Implementation              |
| ------------------- | --------------------------- |
| Dependency Scanning | `pnpm audit` in CI pipeline |
| Version Pinning     | Lockfile enforcement        |
| Security Updates    | Automated Dependabot PRs    |
| CVE Monitoring      | GitHub Security Advisories  |

#### Secure Development Practices

- TypeScript strict mode enforced
- Zod schema validation for all inputs
- No `any` types (enforced via linting)
- Code review required for all changes
- Automated testing (334+ tests)

---

## Availability Controls

### A1.1 - System Availability Commitments

#### High Availability Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Load Balancer (L7)                          │
│                    Health checks: /health                        │
└─────────────────────────────────────────────────────────────────┘
                    │                    │
        ┌───────────┴───────────┐        │
        ▼                       ▼        ▼
┌──────────────┐      ┌──────────────┐  ┌──────────────┐
│  Cogitator   │      │  Cogitator   │  │  Cogitator   │
│  Instance 1  │      │  Instance 2  │  │  Instance N  │
└──────────────┘      └──────────────┘  └──────────────┘
        │                    │                │
        └────────────────────┼────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Shared State Layer                            │
│  ┌─────────────────┐              ┌─────────────────────────┐   │
│  │  PostgreSQL     │              │  Redis Cluster          │   │
│  │  (Primary +     │              │  (Sentinel/Cluster)     │   │
│  │   Replicas)     │              │                         │   │
│  └─────────────────┘              └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### Health Check Endpoints

| Endpoint        | Purpose         | Response                           |
| --------------- | --------------- | ---------------------------------- |
| `/health`       | Basic health    | `200 OK`                           |
| `/health/live`  | Liveness probe  | `200 OK` if process running        |
| `/health/ready` | Readiness probe | `200 OK` if dependencies connected |

### A1.2 - Capacity Planning

#### Resource Limits Configuration

```typescript
const resourceConfig = {
  agent: {
    maxIterations: 10, // Prevent infinite loops
    maxTokens: 4096, // Output token limit
    timeout: 120000, // 2 minute timeout
  },
  sandbox: {
    memoryLimit: '512m',
    cpuLimit: 1,
    timeout: 30000,
  },
  context: {
    compressionThreshold: 0.8, // Compress at 80% capacity
    outputReserve: 0.15, // Reserve 15% for output
  },
};
```

#### Auto-Scaling Metrics

| Metric              | Threshold | Action   |
| ------------------- | --------- | -------- |
| CPU Usage           | > 70%     | Scale up |
| Memory Usage        | > 80%     | Scale up |
| Request Latency P95 | > 5s      | Scale up |
| Queue Depth         | > 100     | Scale up |

### A1.3 - Backup and Recovery

See [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md) for comprehensive backup and recovery procedures.

#### Recovery Point Objective (RPO)

| Data Type           | RPO        | Backup Method          |
| ------------------- | ---------- | ---------------------- |
| Agent Configuration | 0          | Version controlled     |
| Conversation Memory | 1 hour     | Database replication   |
| Audit Logs          | 15 minutes | Stream to cold storage |
| Traces              | 24 hours   | Observability platform |

#### Recovery Time Objective (RTO)

| Scenario                | RTO         | Recovery Method                      |
| ----------------------- | ----------- | ------------------------------------ |
| Single instance failure | < 1 minute  | Auto-restart, load balancer failover |
| Database failover       | < 5 minutes | Automated replica promotion          |
| Full region failure     | < 1 hour    | Cross-region deployment              |

---

## Processing Integrity Controls

### PI1.1 - Processing Accuracy

#### Input Validation

All inputs are validated using Zod schemas:

```typescript
import { z } from 'zod';

const AgentInputSchema = z.object({
  input: z.string().min(1).max(100000),
  threadId: z.string().uuid().optional(),
  context: z.record(z.unknown()).optional(),
});

// Validation happens before processing
const validated = AgentInputSchema.parse(userInput);
```

#### Tool Argument Validation

```typescript
const tool = tool({
  name: 'search',
  description: 'Search the web',
  parameters: z.object({
    query: z.string().min(1).max(500),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  execute: async ({ query, limit }) => {
    // Arguments are guaranteed to match schema
  },
});
```

### PI1.2 - Processing Completeness

#### Transaction Handling

```typescript
// Agent execution is atomic per iteration
const result = await cogitator.run(agent, {
  input: userMessage,
  threadId: threadId,
  onStep: (step) => {
    // Each step is logged for auditability
    logger.info('Agent step', {
      iteration: step.iteration,
      toolCalls: step.toolCalls?.length || 0,
    });
  },
});
```

#### Retry Logic

```typescript
// Built-in retry with exponential backoff
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  retryOn: [429, 500, 502, 503, 504],
};
```

### PI1.3 - Processing Timeliness

#### Timeout Configuration

| Operation         | Default Timeout | Configurable |
| ----------------- | --------------- | ------------ |
| LLM Request       | 60s             | Yes          |
| Tool Execution    | 30s             | Yes          |
| Agent Run         | 120s            | Yes          |
| Sandbox Execution | 10s             | Yes          |

#### Streaming Support

```typescript
// Stream responses for real-time feedback
const stream = await cogitator.run(agent, {
  input: message,
  stream: true,
});

for await (const chunk of stream) {
  // Process chunks in real-time
  process.stdout.write(chunk.content);
}
```

---

## Confidentiality Controls

### C1.1 - Confidential Information Identification

#### Data Classification

| Classification   | Examples                | Handling                     |
| ---------------- | ----------------------- | ---------------------------- |
| **Public**       | Documentation, examples | No restrictions              |
| **Internal**     | Agent configurations    | Access controlled            |
| **Confidential** | API keys, user data     | Encrypted, logged access     |
| **Restricted**   | PII, credentials        | Encrypted, minimal retention |

### C1.2 - Confidential Information Protection

#### Data Minimization

```typescript
// Only store necessary conversation data
const memoryConfig = {
  ttl: 86400, // 24 hour retention
  maxMessages: 100, // Limit stored messages
  excludeFields: ['apiKey'], // Never store secrets
};
```

#### Log Redaction

```typescript
// Automatic PII redaction in logs
const redactPatterns = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
  /\bsk-[a-zA-Z0-9]{48}\b/g, // OpenAI key
  /\bsk-ant-[a-zA-Z0-9-]{95}\b/g, // Anthropic key
];
```

### C1.3 - Confidential Information Disposal

#### Data Retention Policies

| Data Type           | Retention                   | Disposal Method          |
| ------------------- | --------------------------- | ------------------------ |
| Conversation Memory | Configurable (default: 24h) | Automatic TTL expiration |
| Audit Logs          | 90 days                     | Secure deletion          |
| Traces              | 30 days                     | Automatic archival       |
| API Keys            | Until revoked               | Cryptographic erasure    |

---

## Privacy Controls

### P1.1 - Privacy Notice

Cogitator processes data as directed by the deploying organization. Privacy notices should be provided by the organization to their end users.

#### Data Flow Transparency

```
User Input → Cogitator → LLM Provider → Response
     │                        │
     ▼                        ▼
 Memory Store         Provider Logs
 (Configurable)       (Provider Policy)
```

### P2.1 - Data Collection Consent

Data collection is controlled by the deploying organization through configuration:

```typescript
const config = {
  memory: {
    enabled: true, // Organization controls persistence
    adapter: 'postgres',
    retention: 86400, // Organization sets retention
  },
  observability: {
    enabled: true, // Organization controls tracing
    provider: 'langfuse',
  },
};
```

### P3.1 - Personal Information Collection

#### Configurable Data Collection

```typescript
// Organizations can disable memory storage entirely
const cogitator = new Cogitator({
  memory: {
    enabled: false, // No conversation storage
  },
});

// Or use ephemeral memory
const cogitator = new Cogitator({
  memory: {
    adapter: 'memory', // In-memory only, cleared on restart
  },
});
```

### P4.1 - Use of Personal Information

Personal information is only used for:

1. Providing the requested AI agent functionality
2. Maintaining conversation context (if enabled)
3. Debugging and troubleshooting (with consent)

### P6.1 - Data Subject Rights

Organizations using Cogitator can implement data subject rights through:

```typescript
// Delete user data
await memoryAdapter.deleteThread(userId, threadId);

// Export user data
const userData = await memoryAdapter.getMessages(userId, threadId);

// Access logs
const auditLogs = await getAuditLogs({ userId, dateRange });
```

---

## Audit & Logging

### Observability Stack

Cogitator integrates with industry-standard observability platforms:

| Platform           | Purpose              | Integration        |
| ------------------ | -------------------- | ------------------ |
| **Langfuse**       | LLM-specific tracing | Native integration |
| **OpenTelemetry**  | Distributed tracing  | OTEL SDK           |
| **Custom Logging** | Application logs     | Structured JSON    |

### Audit Log Schema

```typescript
interface AuditLogEntry {
  timestamp: string; // ISO 8601
  eventType: string; // e.g., 'agent.run', 'tool.execute'
  userId?: string; // Authenticated user
  agentId: string; // Agent identifier
  threadId?: string; // Conversation thread
  action: string; // Specific action
  outcome: 'success' | 'failure';
  metadata: {
    duration?: number;
    tokenUsage?: {
      prompt: number;
      completion: number;
    };
    error?: string;
  };
  sourceIp?: string; // Request origin
  userAgent?: string; // Client identifier
}
```

### Log Categories

| Category        | Retention | Purpose                                |
| --------------- | --------- | -------------------------------------- |
| Security Events | 1 year    | Authentication, authorization failures |
| API Access      | 90 days   | All API requests                       |
| Agent Execution | 30 days   | Tool calls, LLM interactions           |
| System Events   | 30 days   | Startup, shutdown, errors              |

### Example Audit Trail

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "eventType": "agent.run",
  "userId": "user_abc123",
  "agentId": "research-agent",
  "threadId": "thread_xyz789",
  "action": "execute",
  "outcome": "success",
  "metadata": {
    "duration": 5420,
    "tokenUsage": {
      "prompt": 1500,
      "completion": 800
    },
    "toolsUsed": ["web_search", "calculator"],
    "iterations": 3
  },
  "sourceIp": "192.168.1.100",
  "userAgent": "cogitator-client/1.0"
}
```

### Langfuse Integration

```typescript
const cogitator = new Cogitator({
  observability: {
    provider: 'langfuse',
    langfuse: {
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: 'https://cloud.langfuse.com',
    },
  },
});
```

Langfuse provides:

- Full trace visualization
- Token usage analytics
- Cost tracking
- Prompt versioning
- User feedback collection

---

## Incident Response

### Incident Classification

| Severity          | Description               | Response Time | Examples                         |
| ----------------- | ------------------------- | ------------- | -------------------------------- |
| **P1 - Critical** | Service down, data breach | < 15 minutes  | Security breach, complete outage |
| **P2 - High**     | Major feature broken      | < 1 hour      | Agent execution failures         |
| **P3 - Medium**   | Degraded performance      | < 4 hours     | Slow response times              |
| **P4 - Low**      | Minor issues              | < 24 hours    | UI bugs, documentation errors    |

### Incident Response Procedure

#### 1. Detection

- Automated monitoring alerts
- User reports
- Security scanning

#### 2. Triage

- Assess severity and impact
- Identify affected systems
- Notify stakeholders

#### 3. Containment

- Isolate affected systems
- Block malicious actors
- Preserve evidence

#### 4. Eradication

- Remove threat
- Patch vulnerabilities
- Update configurations

#### 5. Recovery

- Restore services
- Verify functionality
- Monitor for recurrence

#### 6. Post-Incident

- Root cause analysis
- Documentation
- Process improvements

### Security Incident Contacts

For security vulnerabilities:

1. **Do NOT** open a public issue
2. Email: security@cogitator.dev
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
4. Response within 24 hours
5. 90-day disclosure timeline

---

## Vendor Management

### Third-Party Dependencies

#### LLM Providers

| Provider  | Data Handling                   | Compliance        |
| --------- | ------------------------------- | ----------------- |
| OpenAI    | API data retention policies     | SOC2 Type II      |
| Anthropic | No training on API data         | SOC2 Type II      |
| Google AI | Enterprise data agreements      | ISO 27001, SOC2   |
| Ollama    | Local execution, no data leaves | N/A (self-hosted) |

#### Infrastructure Dependencies

| Dependency  | Purpose           | Security Posture                        |
| ----------- | ----------------- | --------------------------------------- |
| PostgreSQL  | Data persistence  | Self-managed or managed (RDS, Supabase) |
| Redis       | Caching, queues   | Self-managed or managed (ElastiCache)   |
| Docker      | Sandbox execution | Container security best practices       |
| Extism/WASM | Sandbox execution | Memory-safe execution                   |

### Dependency Security

```bash
# Regular security audits
pnpm audit

# Update dependencies
pnpm update

# Check for known vulnerabilities
npx snyk test
```

---

## Control Matrix

### SOC2 Trust Service Criteria Mapping

| TSC                      | Control                    | Implementation                 | Status |
| ------------------------ | -------------------------- | ------------------------------ | ------ |
| **Security**             |                            |                                |        |
| CC6.1                    | Logical access controls    | API authentication, RBAC       | ✅     |
| CC6.2                    | System access restrictions | Sandbox isolation              | ✅     |
| CC6.3                    | Security event monitoring  | Audit logging, Langfuse        | ✅     |
| CC6.6                    | Encryption                 | TLS, encryption at rest        | ✅     |
| CC6.7                    | Vulnerability management   | Dependency scanning, updates   | ✅     |
| **Availability**         |                            |                                |        |
| A1.1                     | System availability        | Health checks, HA architecture | ✅     |
| A1.2                     | Capacity planning          | Resource limits, auto-scaling  | ✅     |
| A1.3                     | Backup and recovery        | Database backups, DR plan      | ✅     |
| **Processing Integrity** |                            |                                |        |
| PI1.1                    | Processing accuracy        | Input validation (Zod)         | ✅     |
| PI1.2                    | Processing completeness    | Transaction handling           | ✅     |
| PI1.3                    | Processing timeliness      | Timeouts, streaming            | ✅     |
| **Confidentiality**      |                            |                                |        |
| C1.1                     | Information classification | Data classification policy     | ✅     |
| C1.2                     | Information protection     | Encryption, access controls    | ✅     |
| C1.3                     | Information disposal       | TTL, secure deletion           | ✅     |
| **Privacy**              |                            |                                |        |
| P1.1                     | Privacy notice             | Configurable by deployer       | ✅     |
| P2.1                     | Consent                    | Deployer responsibility        | ✅     |
| P3.1                     | Collection                 | Configurable data collection   | ✅     |
| P4.1                     | Use                        | Limited to service provision   | ✅     |
| P6.1                     | Data subject rights        | Export/delete APIs             | ✅     |

---

## Document Control

| Version | Date         | Author         | Changes         |
| ------- | ------------ | -------------- | --------------- |
| 1.0     | January 2025 | Cogitator Team | Initial release |

---

## References

- [Security Model](./SECURITY.md) - Detailed security architecture
- [Disaster Recovery](./DISASTER_RECOVERY.md) - Backup and recovery procedures
- [Architecture](./ARCHITECTURE.md) - System architecture overview
- [API Documentation](./API.md) - API security details
