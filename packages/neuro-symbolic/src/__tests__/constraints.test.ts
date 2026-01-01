import { describe, it, expect } from 'vitest';
import {
  Expr,
  ConstraintBuilder,
  variable,
  constant,
  and,
  or,
  not,
  implies,
  iff,
  ite,
  sum,
  product,
  allDifferent,
  atMost,
  atLeast,
  exactly,
  expressionToString,
  constraintToString,
  problemToString,
} from '../constraints/dsl';
import { SimpleSATSolver, createSimpleSATSolver, solveSAT } from '../constraints/simple-sat-solver';

describe('Constraint DSL', () => {
  describe('Expr class', () => {
    it('creates variable via static method', () => {
      const x = Expr.variable('x');
      expect(x).toBeInstanceOf(Expr);
      expect(x.expression.type).toBe('variable');
      expect((x.expression as { name: string }).name).toBe('x');
    });

    it('creates constant via static method', () => {
      const c = Expr.constant(42);
      expect(c).toBeInstanceOf(Expr);
      expect(c.expression.type).toBe('constant');
      expect((c.expression as { value: number }).value).toBe(42);
    });
  });

  describe('variable and constant functions', () => {
    it('creates variable expression', () => {
      const x = variable('x');
      expect(x).toBeInstanceOf(Expr);
      expect(x.expression.type).toBe('variable');
    });

    it('creates numeric constant', () => {
      const c = constant(42);
      expect(c.expression.type).toBe('constant');
      expect((c.expression as { value: number }).value).toBe(42);
    });

    it('creates boolean constant', () => {
      const c = constant(true);
      expect(c.expression.type).toBe('constant');
      expect((c.expression as { value: boolean }).value).toBe(true);
    });
  });

  describe('arithmetic operations', () => {
    const x = variable('x');
    const y = variable('y');

    it('creates addition expression', () => {
      const expr = x.add(y);
      expect(expr.expression.type).toBe('operation');
      expect((expr.expression as { operator: string }).operator).toBe('add');
    });

    it('creates subtraction expression', () => {
      const expr = x.sub(y);
      expect((expr.expression as { operator: string }).operator).toBe('sub');
    });

    it('creates multiplication expression', () => {
      const expr = x.mul(y);
      expect((expr.expression as { operator: string }).operator).toBe('mul');
    });

    it('creates division expression', () => {
      const expr = x.div(y);
      expect((expr.expression as { operator: string }).operator).toBe('div');
    });

    it('creates modulo expression', () => {
      const expr = x.mod(y);
      expect((expr.expression as { operator: string }).operator).toBe('mod');
    });

    it('creates power expression', () => {
      const expr = x.pow(constant(2));
      expect((expr.expression as { operator: string }).operator).toBe('pow');
    });

    it('supports number arguments', () => {
      const expr = x.add(5);
      expect(expr.expression.type).toBe('operation');
    });
  });

  describe('comparison operations', () => {
    const x = variable('x');
    const y = variable('y');

    it('creates equality constraint', () => {
      const expr = x.eq(y);
      expect((expr.expression as { operator: string }).operator).toBe('eq');
    });

    it('creates not-equal constraint', () => {
      const expr = x.neq(y);
      expect((expr.expression as { operator: string }).operator).toBe('neq');
    });

    it('creates less-than constraint', () => {
      const expr = x.lt(y);
      expect((expr.expression as { operator: string }).operator).toBe('lt');
    });

    it('creates less-than-or-equal constraint', () => {
      const expr = x.lte(y);
      expect((expr.expression as { operator: string }).operator).toBe('lte');
    });

    it('creates greater-than constraint', () => {
      const expr = x.gt(y);
      expect((expr.expression as { operator: string }).operator).toBe('gt');
    });

    it('creates greater-than-or-equal constraint', () => {
      const expr = x.gte(y);
      expect((expr.expression as { operator: string }).operator).toBe('gte');
    });
  });

  describe('logical operations', () => {
    const a = variable('a');
    const b = variable('b');

    it('creates AND expression', () => {
      const expr = and(a, b);
      expect(expr.expression.type).toBe('operation');
      expect((expr.expression as { operator: string }).operator).toBe('and');
    });

    it('creates OR expression', () => {
      const expr = or(a, b);
      expect((expr.expression as { operator: string }).operator).toBe('or');
    });

    it('creates NOT expression', () => {
      const expr = not(a);
      expect((expr.expression as { operator: string }).operator).toBe('not');
    });

    it('creates implication expression', () => {
      const expr = implies(a, b);
      expect((expr.expression as { operator: string }).operator).toBe('implies');
    });

    it('creates bi-implication expression', () => {
      const expr = iff(a, b);
      expect((expr.expression as { operator: string }).operator).toBe('iff');
    });

    it('and with single element returns that element', () => {
      const expr = and(a);
      expect(expr).toBe(a);
    });

    it('and with empty returns true constant', () => {
      const expr = and();
      expect(expr.expression.type).toBe('constant');
      expect((expr.expression as { value: boolean }).value).toBe(true);
    });

    it('or with empty returns false constant', () => {
      const expr = or();
      expect((expr.expression as { value: boolean }).value).toBe(false);
    });

    it('not with boolean constant', () => {
      const expr = not(true);
      expect((expr.expression as { value: boolean }).value).toBe(false);
    });
  });

  describe('conditional expression', () => {
    it('creates if-then-else expression', () => {
      const cond = variable('c');
      const t = constant(1);
      const f = constant(0);
      const expr = ite(cond, t, f);

      expect((expr.expression as { operator: string }).operator).toBe('ite');
    });

    it('accepts numbers as then/else', () => {
      const cond = variable('c');
      const expr = ite(cond, 1, 0);
      expect(expr.expression.type).toBe('operation');
    });
  });

  describe('aggregate functions', () => {
    const x = variable('x');
    const y = variable('y');
    const z = variable('z');

    it('creates sum expression using add chain', () => {
      const expr = sum(x, y, z);
      expect(expr.expression.type).toBe('operation');
      expect((expr.expression as { operator: string }).operator).toBe('add');
    });

    it('creates product expression using mul chain', () => {
      const expr = product(x, y, z);
      expect(expr.expression.type).toBe('operation');
      expect((expr.expression as { operator: string }).operator).toBe('mul');
    });
  });

  describe('global constraints', () => {
    const x = variable('x');
    const y = variable('y');
    const z = variable('z');

    it('creates allDifferent constraint', () => {
      const expr = allDifferent(x, y, z);
      expect((expr.expression as { operator: string }).operator).toBe('allDifferent');
    });

    it('creates atMost constraint', () => {
      const a = variable('a');
      const b = variable('b');
      const c = variable('c');
      const expr = atMost(2, a, b, c);
      expect((expr.expression as { operator: string }).operator).toBe('atMost');
    });

    it('creates atLeast constraint', () => {
      const a = variable('a');
      const b = variable('b');
      const expr = atLeast(1, a, b);
      expect((expr.expression as { operator: string }).operator).toBe('atLeast');
    });

    it('creates exactly constraint', () => {
      const a = variable('a');
      const b = variable('b');
      const expr = exactly(1, a, b);
      expect((expr.expression as { operator: string }).operator).toBe('exactly');
    });
  });
});

describe('ConstraintBuilder', () => {
  it('creates a new problem', () => {
    const builder = ConstraintBuilder.create('test-problem');
    const problem = builder.build();

    expect(problem.name).toBe('test-problem');
    expect(problem.variables).toHaveLength(0);
    expect(problem.constraints).toHaveLength(0);
  });

  it('adds integer variables', () => {
    const builder = ConstraintBuilder.create();
    builder.int('x', 0, 10);
    builder.int('y', -5, 5);
    const problem = builder.build();

    expect(problem.variables).toHaveLength(2);
    expect(problem.variables[0].name).toBe('x');
    expect(problem.variables[0].type).toBe('int');
    expect(problem.variables[0].domain).toEqual({ min: 0, max: 10 });
  });

  it('adds real variables', () => {
    const builder = ConstraintBuilder.create();
    builder.real('x', 0.0, 1.0);
    const problem = builder.build();

    expect(problem.variables[0].type).toBe('real');
  });

  it('adds boolean variables', () => {
    const builder = ConstraintBuilder.create();
    builder.bool('flag');
    const problem = builder.build();

    expect(problem.variables[0].type).toBe('bool');
  });

  it('adds constraints with assert', () => {
    const builder = ConstraintBuilder.create();
    const x = builder.int('x', 0, 10);
    const y = builder.int('y', 0, 10);
    builder.assert(x.add(y).eq(constant(10)));
    const problem = builder.build();

    expect(problem.constraints).toHaveLength(1);
  });

  it('supports named constraints', () => {
    const builder = ConstraintBuilder.create();
    const x = builder.int('x', 0, 10);
    builder.assert(x.gte(constant(5)), 'minimum_constraint');
    const problem = builder.build();

    expect(problem.constraints[0].name).toBe('minimum_constraint');
  });

  it('adds soft constraints with weight', () => {
    const builder = ConstraintBuilder.create();
    const x = builder.int('x', 0, 10);
    builder.soft(x.eq(constant(5)), 10);
    const problem = builder.build();

    const softConstraints = problem.constraints.filter((c) => !c.isHard);
    expect(softConstraints).toHaveLength(1);
    expect(softConstraints[0].weight).toBe(10);
  });

  it('sets optimization objective', () => {
    const builder = ConstraintBuilder.create();
    const x = builder.int('x', 0, 100);
    builder.maximize(x);
    const problem = builder.build();

    expect(problem.objective).toBeDefined();
    expect(problem.objective!.type).toBe('maximize');
  });

  it('supports minimize objective', () => {
    const builder = ConstraintBuilder.create();
    const x = builder.int('x', 0, 100);
    builder.minimize(x);
    const problem = builder.build();

    expect(problem.objective!.type).toBe('minimize');
  });

  it('chains multiple operations', () => {
    const builder = ConstraintBuilder.create('chained');
    const x = builder.int('x', 1, 10);
    const y = builder.int('y', 1, 10);
    builder.assert(x.add(y).eq(constant(10)));
    builder.assert(x.lt(y));
    builder.maximize(x);
    const problem = builder.build();

    expect(problem.name).toBe('chained');
    expect(problem.variables).toHaveLength(2);
    expect(problem.constraints).toHaveLength(2);
    expect(problem.objective).toBeDefined();
  });
});

describe('Expression formatting', () => {
  it('formats variable', () => {
    const x = variable('x');
    expect(expressionToString(x.expression)).toContain('x');
  });

  it('formats constant', () => {
    const result1 = expressionToString(constant(42).expression);
    const result2 = expressionToString(constant(true).expression);
    expect(result1).toContain('42');
    expect(result2).toContain('true');
  });

  it('formats operation', () => {
    const x = variable('x');
    const y = variable('y');
    const result = expressionToString(x.add(y).expression);
    expect(result).toContain('x');
    expect(result).toContain('y');
  });
});

describe('Constraint formatting', () => {
  it('formats constraint', () => {
    const x = variable('x');
    const constraint = {
      id: 'test',
      expression: x.lt(constant(10)).expression,
      name: 'upper_bound',
      isHard: true,
    };

    const str = constraintToString(constraint);
    expect(str).toContain('upper_bound');
  });
});

describe('Problem formatting', () => {
  it('formats complete problem', () => {
    const builder = ConstraintBuilder.create('scheduling');
    const x = builder.int('x', 1, 10);
    const y = builder.int('y', 1, 10);
    builder.assert(x.add(y).eq(constant(15)), 'sum_constraint');
    builder.assert(x.lt(y), 'ordering');
    const problem = builder.build();

    const str = problemToString(problem);
    expect(str).toContain('scheduling');
    expect(str).toContain('Variables');
    expect(str).toContain('Constraints');
  });
});

describe('SimpleSATSolver', () => {
  it('solves satisfiable problem', () => {
    const builder = ConstraintBuilder.create();
    const a = builder.bool('a');
    const b = builder.bool('b');
    builder.assert(or(a, b));
    const problem = builder.build();

    const result = solveSAT(problem);
    expect(result.status).toBe('sat');
    if (result.status === 'sat') {
      expect(result.model).toBeDefined();
    }
  });

  it('detects unsatisfiable problem', () => {
    const builder = ConstraintBuilder.create();
    const a = builder.bool('a');
    builder.assert(a);
    builder.assert(not(a));
    const problem = builder.build();

    const result = solveSAT(problem);
    expect(result.status).toBe('unsat');
  });

  it('handles conjunction', () => {
    const builder = ConstraintBuilder.create();
    const a = builder.bool('a');
    const b = builder.bool('b');
    builder.assert(and(a, b));
    const problem = builder.build();

    const result = solveSAT(problem);
    expect(result.status).toBe('sat');
    if (result.status === 'sat') {
      expect(result.model.assignments.a).toBe(true);
      expect(result.model.assignments.b).toBe(true);
    }
  });

  it('handles disjunction', () => {
    const builder = ConstraintBuilder.create();
    const a = builder.bool('a');
    const b = builder.bool('b');
    builder.assert(or(a, b));
    builder.assert(not(a));
    const problem = builder.build();

    const result = solveSAT(problem);
    expect(result.status).toBe('sat');
    if (result.status === 'sat') {
      expect(result.model.assignments.b).toBe(true);
    }
  });

  it('handles implication', () => {
    const builder = ConstraintBuilder.create();
    const a = builder.bool('a');
    const b = builder.bool('b');
    builder.assert(implies(a, b));
    builder.assert(a);
    const problem = builder.build();

    const result = solveSAT(problem);
    expect(result.status).toBe('sat');
    if (result.status === 'sat') {
      expect(result.model.assignments.b).toBe(true);
    }
  });

  it('handles negation', () => {
    const builder = ConstraintBuilder.create();
    const a = builder.bool('a');
    builder.assert(not(a));
    const problem = builder.build();

    const result = solveSAT(problem);
    expect(result.status).toBe('sat');
    if (result.status === 'sat') {
      expect(result.model.assignments.a).toBe(false);
    }
  });

  it('creates solver with config', () => {
    const solver = createSimpleSATSolver({ timeout: 100 });
    expect(solver).toBeInstanceOf(SimpleSATSolver);
  });

  it('handles multiple variables', () => {
    const builder = ConstraintBuilder.create();
    const a = builder.bool('a');
    const b = builder.bool('b');
    const c = builder.bool('c');
    builder.assert(or(a, b));
    builder.assert(or(b, c));
    builder.assert(or(not(a), not(c)));
    const problem = builder.build();

    const result = solveSAT(problem);
    expect(result.status).toBe('sat');
  });
});
