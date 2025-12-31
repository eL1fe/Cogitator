# @cogitator-ai/worker

Distributed job queue for Cogitator agent execution. Built on BullMQ for reliable, scalable background processing.

## Installation

```bash
pnpm add @cogitator-ai/worker ioredis
```

## Usage

### Job Queue

Add jobs for background execution:

```typescript
import { JobQueue } from '@cogitator-ai/worker';

const queue = new JobQueue({
  redis: { host: 'localhost', port: 6379 },
});

// Agent config (serialized form)
const agentConfig = {
  id: 'my-agent',
  name: 'My Agent',
  model: 'openai/gpt-4',
  instructions: 'You are a helpful assistant',
  tools: [],
};

// Add agent job
await queue.addAgentJob(agentConfig, 'Process this task', {
  threadId: 'thread-123',
  priority: 1,
});

// Add workflow job
const workflowConfig = { name: 'data-pipeline', nodes: [] };
await queue.addWorkflowJob(workflowConfig, { data: [] }, {
  runId: 'run-456',
});

// Add swarm job
const swarmConfig = { name: 'research-team', strategy: 'hierarchical', agents: [] };
await queue.addSwarmJob(swarmConfig, 'Research AI trends');
```

### Worker Pool

Process jobs with configurable concurrency:

```typescript
import { WorkerPool } from '@cogitator-ai/worker';
import { Cogitator } from '@cogitator-ai/core';

const cogitator = new Cogitator();
const pool = new WorkerPool(cogitator, {
  redis: { host: 'localhost', port: 6379 },
  concurrency: 5,
});

await pool.start();
```

### Metrics

Prometheus-compatible metrics for HPA:

```typescript
import { JobQueue, MetricsCollector, formatPrometheusMetrics } from '@cogitator-ai/worker';

const queue = new JobQueue({
  redis: { host: 'localhost', port: 6379 },
});
const metrics = new MetricsCollector();

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  const queueMetrics = await queue.getMetrics();
  res.send(metrics.format(queueMetrics));
});
```

### Available Metrics

- `cogitator_queue_depth` - Total waiting + delayed jobs
- `cogitator_queue_waiting` - Jobs waiting
- `cogitator_queue_active` - Jobs processing
- `cogitator_queue_completed_total` - Completed jobs
- `cogitator_queue_failed_total` - Failed jobs
- `cogitator_workers_total` - Active workers
- `cogitator_job_duration_seconds` - Job processing time histogram

## Redis Configuration

```typescript
// Single node
const queue = new JobQueue({
  redis: { host: 'localhost', port: 6379, password: 'secret' },
});

// Cluster mode
const queue = new JobQueue({
  redis: {
    cluster: {
      nodes: [
        { host: 'redis-1', port: 6379 },
        { host: 'redis-2', port: 6379 },
      ],
    },
    password: 'secret',
  },
});
```

## Documentation

See the [Cogitator documentation](https://github.com/eL1fe/cogitator) for full API reference.

## License

MIT
