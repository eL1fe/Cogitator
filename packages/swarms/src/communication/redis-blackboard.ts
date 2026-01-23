import type {
  Blackboard,
  BlackboardConfig,
  BlackboardSection,
  BlackboardHistoryEntry,
} from '@cogitator-ai/types';
import type { Redis } from 'ioredis';

export interface RedisBlackboardOptions {
  redis: Redis;
  swarmId: string;
  keyPrefix?: string;
}

interface StoredSection<T = unknown> {
  name: string;
  data: T;
  lastModified: number;
  modifiedBy: string;
  version: number;
}

export class RedisBlackboard implements Blackboard {
  private redis: Redis;
  private subscriber: Redis;
  private swarmId: string;
  private keyPrefix: string;
  private config: BlackboardConfig;
  private subscriptions = new Map<string, Set<(data: unknown, agentName: string) => void>>();
  private localCache = new Map<string, StoredSection>();
  private historyCache = new Map<string, BlackboardHistoryEntry[]>();

  constructor(config: BlackboardConfig, options: RedisBlackboardOptions) {
    this.config = config;
    this.redis = options.redis;
    this.subscriber = options.redis.duplicate();
    this.swarmId = options.swarmId;
    this.keyPrefix = options.keyPrefix ?? 'swarm';
  }

  private sectionKey(section: string): string {
    return `${this.keyPrefix}:${this.swarmId}:blackboard:${section}`;
  }

  private historyKey(section: string): string {
    return `${this.keyPrefix}:${this.swarmId}:blackboard:${section}:history`;
  }

  private channelKey(): string {
    return `${this.keyPrefix}:${this.swarmId}:blackboard:changes`;
  }

  async initialize(): Promise<void> {
    for (const [name, initialData] of Object.entries(this.config.sections)) {
      const section: StoredSection = {
        name,
        data: initialData,
        lastModified: Date.now(),
        modifiedBy: 'system',
        version: 1,
      };
      this.localCache.set(name, section);

      const existing = await this.redis.get(this.sectionKey(name));
      if (!existing) {
        await this.redis.set(this.sectionKey(name), JSON.stringify(section));

        if (this.config.trackHistory) {
          const entry: BlackboardHistoryEntry = {
            value: initialData,
            writtenBy: 'system',
            timestamp: Date.now(),
            version: 1,
          };
          await this.redis.rpush(this.historyKey(name), JSON.stringify(entry));
          this.historyCache.set(name, [entry]);
        }
      } else {
        const stored = JSON.parse(existing) as StoredSection;
        this.localCache.set(name, stored);
      }
    }

    await this.subscriber.subscribe(this.channelKey());

    this.subscriber.on('message', (_channel: string, messageJson: string) => {
      try {
        const { section, data, agentName, version, timestamp } = JSON.parse(messageJson) as {
          section: string;
          data: unknown;
          agentName: string;
          version: number;
          timestamp: number;
        };

        const stored: StoredSection = {
          name: section,
          data,
          lastModified: timestamp,
          modifiedBy: agentName,
          version,
        };
        this.localCache.set(section, stored);

        this.notifySubscribers(section, data, agentName);
      } catch {}
    });
  }

  read<T = unknown>(section: string): T {
    const cached = this.localCache.get(section);
    if (!cached) {
      throw new Error(`Blackboard section '${section}' not found`);
    }
    return cached.data as T;
  }

  write<T>(section: string, data: T, agentName: string): void {
    if (!this.config.enabled) {
      throw new Error('Blackboard is not enabled');
    }

    const existing = this.localCache.get(section);
    const version = existing ? existing.version + 1 : 1;
    const timestamp = Date.now();

    const newSection: StoredSection<T> = {
      name: section,
      data,
      lastModified: timestamp,
      modifiedBy: agentName,
      version,
    };

    this.localCache.set(section, newSection);

    void this.redis.set(this.sectionKey(section), JSON.stringify(newSection));

    if (this.config.trackHistory) {
      const entry: BlackboardHistoryEntry = {
        value: data,
        writtenBy: agentName,
        timestamp,
        version,
      };
      if (!this.historyCache.has(section)) {
        this.historyCache.set(section, []);
      }
      this.historyCache.get(section)!.push(entry);
      void this.redis.rpush(this.historyKey(section), JSON.stringify(entry));
    }

    void this.redis.publish(
      this.channelKey(),
      JSON.stringify({ section, data, agentName, version, timestamp })
    );

    this.notifySubscribers(section, data, agentName);
  }

  append<T>(section: string, item: T, agentName: string): void {
    const current = this.localCache.get(section);

    if (!current) {
      this.write(section, [item], agentName);
      return;
    }

    if (!Array.isArray(current.data)) {
      throw new Error(`Section '${section}' is not an array, cannot append`);
    }

    const newData = [...current.data, item];
    this.write(section, newData, agentName);
  }

  has(section: string): boolean {
    return this.localCache.has(section);
  }

  delete(section: string): void {
    this.localCache.delete(section);
    this.historyCache.delete(section);
    this.subscriptions.delete(section);
    void this.redis.del(this.sectionKey(section));
    void this.redis.del(this.historyKey(section));
  }

  subscribe(section: string, handler: (data: unknown, agentName: string) => void): () => void {
    if (!this.subscriptions.has(section)) {
      this.subscriptions.set(section, new Set());
    }
    this.subscriptions.get(section)!.add(handler);

    return () => {
      const handlers = this.subscriptions.get(section);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscriptions.delete(section);
        }
      }
    };
  }

  getSections(): string[] {
    return Array.from(this.localCache.keys());
  }

  getSection<T = unknown>(section: string): BlackboardSection<T> | undefined {
    const cached = this.localCache.get(section);
    if (!cached) return undefined;
    return {
      name: cached.name,
      data: cached.data as T,
      lastModified: cached.lastModified,
      modifiedBy: cached.modifiedBy,
      version: cached.version,
    };
  }

  getHistory(section: string): BlackboardHistoryEntry[] {
    return this.historyCache.get(section) ?? [];
  }

  clear(): void {
    const sections = Array.from(this.localCache.keys());
    this.localCache.clear();
    this.historyCache.clear();

    for (const section of sections) {
      void this.redis.del(this.sectionKey(section));
      void this.redis.del(this.historyKey(section));
    }
  }

  async close(): Promise<void> {
    await this.subscriber.unsubscribe();
    await this.subscriber.quit();
  }

  async syncFromRedis(): Promise<void> {
    const pattern = `${this.keyPrefix}:${this.swarmId}:blackboard:*`;
    const keys = await this.redis.keys(pattern);

    for (const key of keys) {
      if (key.endsWith(':history')) continue;

      const raw = await this.redis.get(key);
      if (raw) {
        const stored = JSON.parse(raw) as StoredSection;
        this.localCache.set(stored.name, stored);
      }
    }
  }

  private notifySubscribers(section: string, data: unknown, agentName: string): void {
    const handlers = this.subscriptions.get(section);
    if (handlers) {
      for (const handler of handlers) {
        void Promise.resolve(handler(data, agentName)).catch((error) => {
          console.warn('[RedisBlackboard] Handler error:', error);
        });
      }
    }
  }
}
