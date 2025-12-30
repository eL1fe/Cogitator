import Redis from 'ioredis';

let redis: Redis | null = null;
let subscriber: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return redis;
}

export function getSubscriber(): Redis {
  if (!subscriber) {
    subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return subscriber;
}

export async function publish(channel: string, message: unknown): Promise<void> {
  const client = getRedis();
  await client.publish(channel, JSON.stringify(message));
}

export async function subscribe(
  channel: string,
  callback: (message: unknown) => void
): Promise<() => void> {
  const sub = getSubscriber();
  
  await sub.subscribe(channel);
  
  const handler = (ch: string, msg: string) => {
    if (ch === channel) {
      try {
        callback(JSON.parse(msg));
      } catch {
        callback(msg);
      }
    }
  };
  
  sub.on('message', handler);
  
  return () => {
    sub.off('message', handler);
    sub.unsubscribe(channel);
  };
}

export async function cache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  const client = getRedis();
  
  const cached = await client.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  
  const result = await fn();
  await client.setex(key, ttlSeconds, JSON.stringify(result));
  
  return result;
}

export async function invalidateCache(pattern: string): Promise<void> {
  const client = getRedis();
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(...keys);
  }
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
  if (subscriber) {
    await subscriber.quit();
    subscriber = null;
  }
}

// Real-time channels
export const CHANNELS = {
  RUN_STARTED: 'cogitator:run:started',
  RUN_COMPLETED: 'cogitator:run:completed',
  RUN_FAILED: 'cogitator:run:failed',
  LOG_ENTRY: 'cogitator:log:entry',
  AGENT_STATUS: 'cogitator:agent:status',
  TOOL_CALL: 'cogitator:tool:call',
} as const;

