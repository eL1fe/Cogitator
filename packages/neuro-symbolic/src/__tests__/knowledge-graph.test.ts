import { describe, it, expect, beforeEach } from 'vitest';
import type { GraphNode, GraphEdge, GraphAdapter } from '@cogitator-ai/types';
import {
  GraphQueryBuilder,
  parseQueryString,
  formatQueryResult,
  variable,
} from '../knowledge-graph/query-language';

const createMockAdapter = (): GraphAdapter => {
  const nodes: GraphNode[] = [
    {
      id: 'person1',
      type: 'Person',
      name: 'Alice',
      properties: { age: 30 },
      confidence: 1,
      source: 'test',
    },
    {
      id: 'person2',
      type: 'Person',
      name: 'Bob',
      properties: { age: 25 },
      confidence: 1,
      source: 'test',
    },
    {
      id: 'company1',
      type: 'Company',
      name: 'TechCorp',
      properties: { employees: 100 },
      confidence: 1,
      source: 'test',
    },
    {
      id: 'city1',
      type: 'City',
      name: 'New York',
      properties: { population: 8000000 },
      confidence: 1,
      source: 'test',
    },
  ];

  const edges: GraphEdge[] = [
    {
      id: 'e1',
      sourceNodeId: 'person1',
      targetNodeId: 'company1',
      type: 'WORKS_AT',
      properties: { since: 2020 },
      confidence: 1,
      source: 'test',
    },
    {
      id: 'e2',
      sourceNodeId: 'person2',
      targetNodeId: 'company1',
      type: 'WORKS_AT',
      properties: { since: 2021 },
      confidence: 1,
      source: 'test',
    },
    {
      id: 'e3',
      sourceNodeId: 'person1',
      targetNodeId: 'city1',
      type: 'LIVES_IN',
      properties: {},
      confidence: 1,
      source: 'test',
    },
    {
      id: 'e4',
      sourceNodeId: 'person1',
      targetNodeId: 'person2',
      type: 'KNOWS',
      properties: { years: 5 },
      confidence: 1,
      source: 'test',
    },
  ];

  return {
    addNode: async () => ({ success: true, data: nodes[0] }),
    addEdge: async () => ({ success: true, data: edges[0] }),
    getNode: async (query) => {
      const node = nodes.find((n) => n.id === query.nodeId);
      return { success: !!node, data: node };
    },
    getEdge: async (query) => {
      const edge = edges.find((e) => e.id === query.edgeId);
      return { success: !!edge, data: edge };
    },
    updateNode: async (query) => {
      const node = nodes.find((n) => n.id === query.nodeId);
      return { success: !!node, data: node };
    },
    updateEdge: async (query) => {
      const edge = edges.find((e) => e.id === query.edgeId);
      return { success: !!edge, data: edge };
    },
    deleteNode: async () => ({ success: true }),
    deleteEdge: async () => ({ success: true }),
    queryNodes: async (query) => {
      let result = nodes;
      if (query.type) {
        result = result.filter((n) => n.type === query.type);
      }
      return { success: true, data: result };
    },
    queryEdges: async (query) => {
      let result = edges;
      if (query.type) {
        result = result.filter((e) => e.type === query.type);
      }
      return { success: true, data: result };
    },
    getNeighbors: async (query) => {
      const neighborIds = new Set<string>();
      for (const edge of edges) {
        if (edge.sourceNodeId === query.nodeId) neighborIds.add(edge.targetNodeId);
        if (edge.targetNodeId === query.nodeId) neighborIds.add(edge.sourceNodeId);
      }
      return { success: true, data: nodes.filter((n) => neighborIds.has(n.id)) };
    },
    getConnections: async (query) => {
      const result = edges.filter(
        (e) => e.sourceNodeId === query.nodeId || e.targetNodeId === query.nodeId
      );
      return { success: true, data: result };
    },
    clear: async () => ({ success: true }),
    getStats: async () => ({
      success: true,
      data: { nodeCount: nodes.length, edgeCount: edges.length },
    }),
  };
};

describe('GraphQueryBuilder', () => {
  describe('Basic query construction', () => {
    it('creates select query', () => {
      const query = GraphQueryBuilder.select().build();
      expect(query.type).toBe('select');
      expect(query.patterns).toEqual([]);
    });

    it('creates ask query', () => {
      const query = GraphQueryBuilder.ask().build();
      expect(query.type).toBe('ask');
    });

    it('creates construct query', () => {
      const query = GraphQueryBuilder.construct().build();
      expect(query.type).toBe('construct');
    });

    it('creates describe query', () => {
      const query = GraphQueryBuilder.describe().build();
      expect(query.type).toBe('describe');
    });
  });

  describe('Pattern matching with where', () => {
    it('adds pattern with where clause', () => {
      const p = variable('p');
      const query = GraphQueryBuilder.select().where(p, 'type', 'Person').build();

      expect(query.patterns).toHaveLength(1);
      expect(query.patterns[0].subject).toBe(p);
    });

    it('chains multiple patterns', () => {
      const p = variable('p');
      const c = variable('c');
      const query = GraphQueryBuilder.select()
        .where(p, 'type', 'Person')
        .where(p, 'WORKS_AT', c)
        .build();

      expect(query.patterns).toHaveLength(2);
    });
  });

  describe('Variables', () => {
    it('creates variable reference', () => {
      const v = variable('person');
      expect(v.name).toBe('person');
    });

    it('uses variables in patterns', () => {
      const p = variable('p');
      const c = variable('c');

      const query = GraphQueryBuilder.select().where(p, 'WORKS_AT', c).build();

      expect(query.patterns).toHaveLength(1);
    });
  });

  describe('Filters', () => {
    it('adds filter with equality', () => {
      const query = GraphQueryBuilder.select().filter('age', 'eq', 30).build();

      expect(query.filters).toHaveLength(1);
      expect(query.filters![0]).toEqual({ field: 'age', operator: 'eq', value: 30 });
    });

    it('adds filter with comparison', () => {
      const query = GraphQueryBuilder.select().filter('age', 'gt', 25).build();

      expect(query.filters![0].operator).toBe('gt');
    });

    it('chains multiple filters', () => {
      const query = GraphQueryBuilder.select()
        .filter('age', 'gt', 20)
        .filter('age', 'lt', 40)
        .build();

      expect(query.filters).toHaveLength(2);
    });
  });

  describe('Ordering and Limits', () => {
    it('adds orderBy clause', () => {
      const query = GraphQueryBuilder.select().orderBy('name', 'asc').build();

      expect(query.orderBy).toEqual([{ field: 'name', direction: 'asc' }]);
    });

    it('adds descending order', () => {
      const query = GraphQueryBuilder.select().orderBy('age', 'desc').build();

      expect(query.orderBy![0].direction).toBe('desc');
    });

    it('adds limit', () => {
      const query = GraphQueryBuilder.select().limit(10).build();

      expect(query.limit).toBe(10);
    });

    it('adds offset', () => {
      const query = GraphQueryBuilder.select().offset(5).build();

      expect(query.offset).toBe(5);
    });

    it('combines limit and offset', () => {
      const query = GraphQueryBuilder.select().limit(10).offset(20).build();

      expect(query.limit).toBe(10);
      expect(query.offset).toBe(20);
    });
  });

  describe('Aggregations', () => {
    it('adds count aggregation', () => {
      const query = GraphQueryBuilder.select().count('person', 'totalPeople').build();

      expect(query.aggregates).toHaveLength(1);
      expect(query.aggregates![0].function).toBe('count');
    });

    it('adds sum aggregation', () => {
      const query = GraphQueryBuilder.select().sum('age', 'totalAge').build();

      expect(query.aggregates![0].function).toBe('sum');
    });

    it('adds avg aggregation', () => {
      const query = GraphQueryBuilder.select().avg('age', 'avgAge').build();

      expect(query.aggregates![0].function).toBe('avg');
    });

    it('adds min/max aggregations', () => {
      const query = GraphQueryBuilder.select().min('age', 'minAge').max('age', 'maxAge').build();

      expect(query.aggregates).toHaveLength(2);
    });

    it('adds groupBy', () => {
      const query = GraphQueryBuilder.select().groupBy('type', 'status').build();

      expect(query.groupBy).toEqual(['type', 'status']);
    });
  });
});

describe('parseQueryString', () => {
  it('returns parsed result structure', () => {
    const result = parseQueryString('SELECT ?p WHERE ?p type Person');
    expect(result.type).toBe('select');
    expect(result.patterns).toBeDefined();
  });

  it('parses select query type', () => {
    const result = parseQueryString('SELECT ?x WHERE ?x type Person');
    expect(result.type).toBe('select');
  });

  it('parses ask query type', () => {
    const result = parseQueryString('ASK WHERE ?x type Person');
    expect(result.type).toBe('ask');
  });

  it('parses construct query type', () => {
    const result = parseQueryString('CONSTRUCT WHERE ?x type Person');
    expect(result.type).toBe('construct');
  });

  it('parses describe query type', () => {
    const result = parseQueryString('DESCRIBE ?x');
    expect(result.type).toBe('describe');
  });

  it('parses limit clause', () => {
    const result = parseQueryString(`
      SELECT ?x
      LIMIT 10
    `);
    expect(result.limit).toBe(10);
  });

  it('parses offset clause', () => {
    const result = parseQueryString(`
      SELECT ?x
      OFFSET 20
    `);
    expect(result.offset).toBe(20);
  });
});

describe('formatQueryResult', () => {
  it('formats empty result', () => {
    const result = {
      bindings: [],
      count: 0,
      executionTime: 50,
    };

    const formatted = formatQueryResult(result);
    expect(formatted).toContain('No results');
  });

  it('formats result with bindings', () => {
    const result = {
      bindings: [
        { person: { id: '1', type: 'person', name: 'Alice', confidence: 1, source: 'test' } },
        { person: { id: '2', type: 'person', name: 'Bob', confidence: 1, source: 'test' } },
      ],
      count: 2,
      executionTime: 100,
    };

    const formatted = formatQueryResult(result);
    expect(formatted).toContain('2 result(s)');
    expect(formatted).toContain('Alice');
    expect(formatted).toContain('Bob');
  });

  it('includes timing info', () => {
    const result = {
      bindings: [{ x: 'value' }],
      count: 1,
      executionTime: 100,
    };

    const formatted = formatQueryResult(result);
    expect(formatted).toContain('100ms');
  });
});

describe('Query Execution Context', () => {
  let adapter: GraphAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();
  });

  it('mock adapter returns nodes by type', async () => {
    const result = await adapter.queryNodes({ agentId: 'test', type: 'Person' });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('mock adapter returns edges by type', async () => {
    const result = await adapter.queryEdges({ agentId: 'test', type: 'WORKS_AT' });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('mock adapter returns neighbors', async () => {
    const result = await adapter.getNeighbors({ agentId: 'test', nodeId: 'person1' });
    expect(result.success).toBe(true);
    expect(result.data!.length).toBeGreaterThan(0);
  });

  it('mock adapter returns connections', async () => {
    const result = await adapter.getConnections({ agentId: 'test', nodeId: 'person1' });
    expect(result.success).toBe(true);
    expect(result.data!.length).toBeGreaterThan(0);
  });

  it('mock adapter gets node by id', async () => {
    const result = await adapter.getNode({ agentId: 'test', nodeId: 'person1' });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Alice');
  });

  it('mock adapter gets edge by id', async () => {
    const result = await adapter.getEdge({ agentId: 'test', edgeId: 'e1' });
    expect(result.success).toBe(true);
    expect(result.data?.type).toBe('WORKS_AT');
  });

  it('mock adapter returns stats', async () => {
    const result = await adapter.getStats({ agentId: 'test' });
    expect(result.success).toBe(true);
    expect(result.data?.nodeCount).toBe(4);
    expect(result.data?.edgeCount).toBe(4);
  });
});

describe('Query Builder Chaining', () => {
  it('supports full method chaining', () => {
    const p = variable('p');

    const query = GraphQueryBuilder.select()
      .where(p, 'type', 'Person')
      .filter('age', 'gt', 18)
      .filter('age', 'lt', 65)
      .orderBy('name', 'asc')
      .limit(100)
      .build();

    expect(query.patterns).toHaveLength(1);
    expect(query.filters).toHaveLength(2);
    expect(query.orderBy).toHaveLength(1);
    expect(query.limit).toBe(100);
  });

  it('builds query with multiple variables', () => {
    const p = variable('p');
    const c = variable('c');
    const city = variable('city');

    const query = GraphQueryBuilder.select()
      .where(p, 'type', 'Person')
      .where(p, 'WORKS_AT', c)
      .where(c, 'LOCATED_IN', city)
      .filter('p.age', 'gt', 25)
      .build();

    expect(query.patterns).toHaveLength(3);
    expect(query.filters).toHaveLength(1);
  });
});
