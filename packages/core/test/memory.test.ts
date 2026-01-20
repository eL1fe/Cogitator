import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryAdapter } from '@cogitator-ai/memory';

describe('InMemoryAdapter', () => {
  let adapter: InMemoryAdapter;

  beforeEach(async () => {
    adapter = new InMemoryAdapter();
    await adapter.connect();
  });

  describe('thread management', () => {
    it('creates and retrieves a thread', async () => {
      const result = await adapter.createThread('agent-1', { key: 'value' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.agentId).toBe('agent-1');
        expect(result.data.metadata).toEqual({ key: 'value' });

        const getResult = await adapter.getThread(result.data.id);
        expect(getResult.success).toBe(true);
        if (getResult.success) {
          expect(getResult.data?.id).toBe(result.data.id);
        }
      }
    });

    it('returns null for non-existent thread', async () => {
      const result = await adapter.getThread('non-existent');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('updates thread metadata', async () => {
      const createResult = await adapter.createThread('agent-1', { original: true });
      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const updateResult = await adapter.updateThread(createResult.data.id, { updated: true });
      expect(updateResult.success).toBe(true);
      if (updateResult.success) {
        expect(updateResult.data.metadata).toEqual({ original: true, updated: true });
      }
    });

    it('deletes thread and its entries', async () => {
      const createResult = await adapter.createThread('agent-1');
      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const threadId = createResult.data.id;

      await adapter.addEntry({
        threadId,
        role: 'user',
        content: 'Test message',
      });

      const deleteResult = await adapter.deleteThread(threadId);
      expect(deleteResult.success).toBe(true);

      const getResult = await adapter.getThread(threadId);
      expect(getResult.success).toBe(true);
      if (getResult.success) {
        expect(getResult.data).toBeNull();
      }
    });
  });

  describe('entry management', () => {
    it('adds and retrieves entries', async () => {
      const threadResult = await adapter.createThread('agent-1');
      expect(threadResult.success).toBe(true);
      if (!threadResult.success) return;

      const threadId = threadResult.data.id;

      const entry1 = await adapter.addEntry({
        threadId,
        role: 'user',
        content: 'Hello',
      });
      expect(entry1.success).toBe(true);

      const entry2 = await adapter.addEntry({
        threadId,
        role: 'assistant',
        content: 'Hi there!',
      });
      expect(entry2.success).toBe(true);

      const entriesResult = await adapter.getEntries({ threadId });
      expect(entriesResult.success).toBe(true);
      if (entriesResult.success) {
        expect(entriesResult.data).toHaveLength(2);
        expect(entriesResult.data[0].content).toBe('Hello');
        expect(entriesResult.data[1].content).toBe('Hi there!');
      }
    });

    it('returns empty array for empty thread', async () => {
      const threadResult = await adapter.createThread('agent-1');
      expect(threadResult.success).toBe(true);
      if (!threadResult.success) return;

      const entriesResult = await adapter.getEntries({ threadId: threadResult.data.id });
      expect(entriesResult.success).toBe(true);
      if (entriesResult.success) {
        expect(entriesResult.data).toEqual([]);
      }
    });

    it('respects limit option', async () => {
      const threadResult = await adapter.createThread('agent-1');
      expect(threadResult.success).toBe(true);
      if (!threadResult.success) return;

      const threadId = threadResult.data.id;

      for (let i = 0; i < 10; i++) {
        await adapter.addEntry({
          threadId,
          role: 'user',
          content: `Message ${i}`,
        });
      }

      const entriesResult = await adapter.getEntries({ threadId, limit: 5 });
      expect(entriesResult.success).toBe(true);
      if (entriesResult.success) {
        expect(entriesResult.data).toHaveLength(5);
        expect(entriesResult.data[0].content).toBe('Message 5');
      }
    });

    it('deletes individual entry', async () => {
      const threadResult = await adapter.createThread('agent-1');
      expect(threadResult.success).toBe(true);
      if (!threadResult.success) return;

      const threadId = threadResult.data.id;

      const entryResult = await adapter.addEntry({
        threadId,
        role: 'user',
        content: 'Delete me',
      });
      expect(entryResult.success).toBe(true);
      if (!entryResult.success) return;

      const deleteResult = await adapter.deleteEntry(entryResult.data.id);
      expect(deleteResult.success).toBe(true);

      const entriesResult = await adapter.getEntries({ threadId });
      expect(entriesResult.success).toBe(true);
      if (entriesResult.success) {
        expect(entriesResult.data).toHaveLength(0);
      }
    });

    it('clears all entries in thread', async () => {
      const threadResult = await adapter.createThread('agent-1');
      expect(threadResult.success).toBe(true);
      if (!threadResult.success) return;

      const threadId = threadResult.data.id;

      await adapter.addEntry({ threadId, role: 'user', content: 'One' });
      await adapter.addEntry({ threadId, role: 'assistant', content: 'Two' });

      const clearResult = await adapter.clearThread(threadId);
      expect(clearResult.success).toBe(true);

      const entriesResult = await adapter.getEntries({ threadId });
      expect(entriesResult.success).toBe(true);
      if (entriesResult.success) {
        expect(entriesResult.data).toHaveLength(0);
      }
    });
  });

  describe('stats', () => {
    it('tracks threads and entries', async () => {
      expect(adapter.stats.threads).toBe(0);
      expect(adapter.stats.entries).toBe(0);

      const threadResult = await adapter.createThread('agent-1');
      expect(adapter.stats.threads).toBe(1);

      if (threadResult.success) {
        await adapter.addEntry({
          threadId: threadResult.data.id,
          role: 'user',
          content: 'Test',
        });
        expect(adapter.stats.entries).toBe(1);
      }
    });
  });

  describe('disconnect', () => {
    it('clears all data on disconnect', async () => {
      const threadResult = await adapter.createThread('agent-1');
      expect(threadResult.success).toBe(true);

      await adapter.disconnect();

      expect(adapter.stats.threads).toBe(0);
      expect(adapter.stats.entries).toBe(0);
    });
  });

  describe('max entries limit', () => {
    it('evicts oldest entry when limit reached', async () => {
      const smallAdapter = new InMemoryAdapter({ provider: 'memory', maxEntries: 3 });
      await smallAdapter.connect();

      const threadResult = await smallAdapter.createThread('agent-1');
      expect(threadResult.success).toBe(true);
      if (!threadResult.success) return;

      const threadId = threadResult.data.id;

      await smallAdapter.addEntry({ threadId, role: 'user', content: 'First' });
      await smallAdapter.addEntry({ threadId, role: 'user', content: 'Second' });
      await smallAdapter.addEntry({ threadId, role: 'user', content: 'Third' });
      await smallAdapter.addEntry({ threadId, role: 'user', content: 'Fourth' });

      expect(smallAdapter.stats.entries).toBe(3);

      const entriesResult = await smallAdapter.getEntries({ threadId });
      expect(entriesResult.success).toBe(true);
      if (entriesResult.success) {
        expect(entriesResult.data.map((e) => e.content)).not.toContain('First');
      }
    });
  });
});
