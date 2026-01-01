import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeBase, createKnowledgeBase } from '../logic/knowledge-base';

describe('KnowledgeBase', () => {
  let kb: KnowledgeBase;

  beforeEach(() => {
    kb = createKnowledgeBase();
  });

  describe('consult', () => {
    it('parses simple facts', () => {
      const result = kb.consult('parent(tom, mary).');
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('parses multiple facts', () => {
      const program = `
        parent(tom, mary).
        parent(tom, bob).
        parent(mary, ann).
      `;
      const result = kb.consult(program);
      expect(result.success).toBe(true);
    });

    it('parses rules', () => {
      const program = `
        grandparent(X, Z) :- parent(X, Y), parent(Y, Z).
      `;
      const result = kb.consult(program);
      expect(result.success).toBe(true);
    });

    it('returns errors for invalid syntax', () => {
      const result = kb.consult('invalid syntax here');
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('assertFact', () => {
    it('adds a fact to the knowledge base', () => {
      kb.assertFact('likes', [
        { type: 'atom', value: 'john' },
        { type: 'atom', value: 'pizza' },
      ]);

      const clauses = kb.getClauses('likes', 2);
      expect(clauses).toHaveLength(1);
    });

    it('supports multiple facts with same predicate', () => {
      kb.assertFact('color', [{ type: 'atom', value: 'red' }]);
      kb.assertFact('color', [{ type: 'atom', value: 'green' }]);
      kb.assertFact('color', [{ type: 'atom', value: 'blue' }]);

      const clauses = kb.getClauses('color', 1);
      expect(clauses).toHaveLength(3);
    });
  });

  describe('assertRule', () => {
    it('adds a rule to the knowledge base', () => {
      kb.assertRule(
        { type: 'compound', functor: 'mortal', args: [{ type: 'variable', name: 'X' }] },
        [{ type: 'compound', functor: 'human', args: [{ type: 'variable', name: 'X' }] }]
      );

      const clauses = kb.getClauses('mortal', 1);
      expect(clauses).toHaveLength(1);
      expect(clauses[0].body).toHaveLength(1);
    });
  });

  describe('assert (string)', () => {
    it('parses and adds a single clause', () => {
      const success = kb.assert('likes(john, pizza).');
      expect(success).toBe(true);
      expect(kb.getClauses('likes', 2)).toHaveLength(1);
    });

    it('returns false for invalid syntax', () => {
      const success = kb.assert('invalid syntax');
      expect(success).toBe(false);
    });
  });

  describe('retract', () => {
    it('removes a matching clause', () => {
      kb.consult(`
        animal(dog).
        animal(cat).
        animal(bird).
      `);

      expect(kb.getClauses('animal', 1)).toHaveLength(3);

      const clauseToRemove = kb
        .getClauses('animal', 1)
        .find((c) => c.head.args[0].type === 'atom' && c.head.args[0].value === 'cat');

      if (clauseToRemove) {
        const result = kb.retract(clauseToRemove);
        expect(result).toBe(true);
      }

      expect(kb.getClauses('animal', 1)).toHaveLength(2);
    });

    it('returns false when clause not found', () => {
      kb.assertFact('foo', [{ type: 'atom', value: 'bar' }]);

      const nonExistentClause = {
        head: {
          type: 'compound' as const,
          functor: 'foo',
          args: [{ type: 'atom' as const, value: 'baz' }],
        },
        body: [],
      };

      const result = kb.retract(nonExistentClause);
      expect(result).toBe(false);
    });
  });

  describe('retractAll', () => {
    it('removes all clauses matching predicate', () => {
      kb.consult(`
        fact(a).
        fact(b).
        fact(c).
      `);

      const count = kb.retractAll('fact', 1);
      expect(count).toBe(3);
      expect(kb.getClauses('fact', 1)).toHaveLength(0);
    });

    it('returns 0 when predicate not found', () => {
      const count = kb.retractAll('nonexistent', 1);
      expect(count).toBe(0);
    });
  });

  describe('getClauses', () => {
    it('returns clauses for given predicate and arity', () => {
      kb.consult(`
        test(a, b).
        test(c, d).
        other(x).
      `);

      const clauses = kb.getClauses('test', 2);
      expect(clauses).toHaveLength(2);
    });

    it('returns empty array for unknown predicate', () => {
      const clauses = kb.getClauses('nonexistent', 1);
      expect(clauses).toHaveLength(0);
    });
  });

  describe('getPredicates', () => {
    it('returns all defined predicates in functor/arity format', () => {
      kb.consult(`
        foo(a).
        bar(x, y).
        baz(1, 2, 3).
      `);

      const predicates = kb.getPredicates();
      expect(predicates).toContain('foo/1');
      expect(predicates).toContain('bar/2');
      expect(predicates).toContain('baz/3');
    });
  });

  describe('hasPredicate', () => {
    it('returns true if predicate exists', () => {
      kb.consult('foo(a).');
      expect(kb.hasPredicate('foo', 1)).toBe(true);
    });

    it('returns false if predicate does not exist', () => {
      expect(kb.hasPredicate('nonexistent', 1)).toBe(false);
    });
  });

  describe('clear', () => {
    it('removes all clauses', () => {
      kb.consult(`
        foo(a).
        bar(b).
      `);

      kb.clear();

      expect(kb.getPredicates()).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('returns knowledge base statistics', () => {
      kb.consult(`
        foo(a).
        foo(b).
        bar(X) :- foo(X).
      `);

      const stats = kb.getStats();
      expect(stats.factCount).toBe(2);
      expect(stats.ruleCount).toBe(1);
      expect(stats.predicates).toHaveLength(2);
    });
  });

  describe('clone', () => {
    it('creates independent copy', () => {
      kb.assertFact('original', [{ type: 'atom', value: 'fact' }]);

      const clone = kb.clone();
      clone.assertFact('clone', [{ type: 'atom', value: 'only' }]);

      expect(kb.getClauses('clone', 1)).toHaveLength(0);
      expect(clone.getClauses('original', 1)).toHaveLength(1);
    });
  });

  describe('merge', () => {
    it('combines clauses from another knowledge base', () => {
      kb.assertFact('kb1', [{ type: 'atom', value: 'fact' }]);

      const other = createKnowledgeBase();
      other.assertFact('kb2', [{ type: 'atom', value: 'fact' }]);

      kb.merge(other);

      expect(kb.getClauses('kb1', 1)).toHaveLength(1);
      expect(kb.getClauses('kb2', 1)).toHaveLength(1);
    });
  });

  describe('toString', () => {
    it('converts knowledge base to string format', () => {
      kb.consult(`
        foo(a).
        bar(X) :- foo(X).
      `);

      const str = kb.toString();
      expect(str).toContain('foo(a)');
      expect(str).toContain('bar');
    });
  });

  describe('export and import', () => {
    it('serializes and deserializes knowledge base', () => {
      kb.consult(`
        person(alice).
        person(bob).
        friends(X, Y) :- person(X), person(Y).
      `);

      const exported = kb.export();
      const imported = KnowledgeBase.import(exported);

      expect(imported.getClauses('person', 1)).toHaveLength(2);
      expect(imported.getClauses('friends', 2)).toHaveLength(1);
    });
  });
});
