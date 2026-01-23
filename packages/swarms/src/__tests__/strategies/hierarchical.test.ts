import { describe, it, expect, beforeEach } from 'vitest';
import { HierarchicalStrategy } from '../../strategies/hierarchical';
import { MockCoordinator } from './__mocks__/mock-coordinator';
import { createMockSwarmAgent } from './__mocks__/mock-helpers';

describe('HierarchicalStrategy', () => {
  let coordinator: MockCoordinator;

  beforeEach(() => {
    coordinator = new MockCoordinator();
  });

  describe('initialization', () => {
    it('should throw when no supervisor exists', async () => {
      coordinator.addAgent(createMockSwarmAgent('worker-1', { role: 'worker' }));
      const strategy = new HierarchicalStrategy(coordinator as any);

      await expect(strategy.execute({ input: 'test' })).rejects.toThrow(
        'Hierarchical strategy requires a supervisor agent'
      );
    });

    it('should apply default config values', () => {
      coordinator.addAgent(createMockSwarmAgent('supervisor', { role: 'supervisor' }));
      coordinator.setAgentResponse('supervisor', 'Done');

      const strategy = new HierarchicalStrategy(coordinator as any);
      expect(strategy).toBeDefined();
    });

    it('should use provided config overrides', () => {
      coordinator.addAgent(createMockSwarmAgent('supervisor', { role: 'supervisor' }));
      coordinator.setAgentResponse('supervisor', 'Done');

      const strategy = new HierarchicalStrategy(coordinator as any, {
        maxDelegationDepth: 5,
        workerCommunication: true,
      });
      expect(strategy).toBeDefined();
    });
  });

  describe('execution', () => {
    beforeEach(() => {
      const supervisor = createMockSwarmAgent('supervisor', { role: 'supervisor' });
      const worker1 = createMockSwarmAgent('worker-1', {
        role: 'worker',
        expertise: ['coding', 'review'],
        instructions: 'I am a coding expert',
      });
      const worker2 = createMockSwarmAgent('worker-2', {
        role: 'worker',
        expertise: ['testing'],
        instructions: 'I am a testing expert',
      });

      coordinator.addAgent(supervisor);
      coordinator.addAgent(worker1);
      coordinator.addAgent(worker2);

      coordinator.setAgentResponse('supervisor', 'Supervisor completed the task');
      coordinator.setAgentResponse('worker-1', 'Worker 1 output');
      coordinator.setAgentResponse('worker-2', 'Worker 2 output');
    });

    it('should run supervisor with available workers list', async () => {
      const strategy = new HierarchicalStrategy(coordinator as any);

      await strategy.execute({ input: 'Do something' });

      const call = coordinator.getLastCallFor('supervisor');
      expect(call).toBeDefined();
      expect(call?.context?.availableWorkers).toBeDefined();
      expect(call?.context?.availableWorkers).toHaveLength(2);
    });

    it('should pass workerInfo with name, description, expertise', async () => {
      const strategy = new HierarchicalStrategy(coordinator as any);

      await strategy.execute({ input: 'Do something' });

      const call = coordinator.getLastCallFor('supervisor');
      const workers = call?.context?.availableWorkers as any[];

      expect(workers[0]).toMatchObject({
        name: 'worker-1',
        expertise: ['coding', 'review'],
      });
      expect(workers[1]).toMatchObject({
        name: 'worker-2',
        expertise: ['testing'],
      });
    });

    it('should include delegationInstructions in supervisor context', async () => {
      const strategy = new HierarchicalStrategy(coordinator as any);

      await strategy.execute({ input: 'Do something' });

      const call = coordinator.getLastCallFor('supervisor');
      expect(call?.context?.delegationInstructions).toBeDefined();
      expect(call?.context?.delegationInstructions).toContain('Available workers:');
      expect(call?.context?.delegationInstructions).toContain('worker-1');
      expect(call?.context?.delegationInstructions).toContain('worker-2');
    });

    it('should include hierarchyConfig with maxDelegationDepth', async () => {
      const strategy = new HierarchicalStrategy(coordinator as any, {
        maxDelegationDepth: 5,
      });

      await strategy.execute({ input: 'Do something' });

      const call = coordinator.getLastCallFor('supervisor');
      expect(call?.context?.hierarchyConfig).toMatchObject({
        maxDelegationDepth: 5,
      });
    });

    it('should return supervisor output as final result', async () => {
      const strategy = new HierarchicalStrategy(coordinator as any);

      const result = await strategy.execute({ input: 'Do something' });

      expect(result.output).toBe('Supervisor completed the task');
    });
  });

  describe('worker info building', () => {
    it('should extract worker descriptions from instructions', async () => {
      const supervisor = createMockSwarmAgent('supervisor', { role: 'supervisor' });
      const worker = createMockSwarmAgent('worker', {
        role: 'worker',
        instructions: 'I specialize in data analysis and visualization',
      });

      coordinator.addAgent(supervisor);
      coordinator.addAgent(worker);
      coordinator.setAgentResponse('supervisor', 'Done');

      const strategy = new HierarchicalStrategy(coordinator as any);
      await strategy.execute({ input: 'test' });

      const call = coordinator.getLastCallFor('supervisor');
      const workers = call?.context?.availableWorkers as any[];
      expect(workers[0].description).toContain('I specialize in data analysis');
    });

    it('should include expertise from metadata', async () => {
      const supervisor = createMockSwarmAgent('supervisor', { role: 'supervisor' });
      const worker = createMockSwarmAgent('worker', {
        role: 'worker',
        expertise: ['python', 'machine-learning'],
      });

      coordinator.addAgent(supervisor);
      coordinator.addAgent(worker);
      coordinator.setAgentResponse('supervisor', 'Done');

      const strategy = new HierarchicalStrategy(coordinator as any);
      await strategy.execute({ input: 'test' });

      const call = coordinator.getLastCallFor('supervisor');
      const workers = call?.context?.availableWorkers as any[];
      expect(workers[0].expertise).toEqual(['python', 'machine-learning']);
    });

    it('should handle workers without expertise', async () => {
      const supervisor = createMockSwarmAgent('supervisor', { role: 'supervisor' });
      const worker = createMockSwarmAgent('worker', { role: 'worker' });

      coordinator.addAgent(supervisor);
      coordinator.addAgent(worker);
      coordinator.setAgentResponse('supervisor', 'Done');

      const strategy = new HierarchicalStrategy(coordinator as any);
      await strategy.execute({ input: 'test' });

      const call = coordinator.getLastCallFor('supervisor');
      const workers = call?.context?.availableWorkers as any[];
      expect(workers[0].expertise).toEqual([]);
    });
  });

  describe('blackboard initialization', () => {
    beforeEach(() => {
      coordinator.addAgent(createMockSwarmAgent('supervisor', { role: 'supervisor' }));
      coordinator.setAgentResponse('supervisor', 'Done');
    });

    it('should write empty tasks array', async () => {
      const strategy = new HierarchicalStrategy(coordinator as any);
      await strategy.execute({ input: 'test' });

      const tasks = coordinator.blackboard.read('tasks');
      expect(tasks).toEqual([]);
    });

    it('should write empty workerResults object', async () => {
      const strategy = new HierarchicalStrategy(coordinator as any);
      await strategy.execute({ input: 'test' });

      const workerResults = coordinator.blackboard.read('workerResults');
      expect(workerResults).toEqual({});
    });
  });

  describe('result structure', () => {
    beforeEach(() => {
      coordinator.addAgent(createMockSwarmAgent('supervisor', { role: 'supervisor' }));
      coordinator.setAgentResponse('supervisor', 'Final output');
    });

    it('should include supervisor result in agentResults', async () => {
      const strategy = new HierarchicalStrategy(coordinator as any);
      const result = await strategy.execute({ input: 'test' });

      expect(result.agentResults.has('supervisor')).toBe(true);
      expect(result.agentResults.get('supervisor')?.output).toBe('Final output');
    });

    it('should return structured output if present', async () => {
      coordinator.setAgentResponse('supervisor', {
        output: 'Output',
        structured: { key: 'value' },
        runId: 'run1',
        agentId: 'agent1',
        threadId: 'thread1',
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0, duration: 0 },
        toolCalls: [],
        messages: [],
        trace: { traceId: 'trace1', spans: [] },
      });

      const strategy = new HierarchicalStrategy(coordinator as any);
      const result = await strategy.execute({ input: 'test' });

      expect(result.structured).toEqual({ key: 'value' });
    });
  });
});
