import { z } from 'zod';
import type { ToolContext } from '@cogitator-ai/types';
import { tool } from '@cogitator-ai/core';
import type { NeuroSymbolic } from '../orchestrator';
import { ConstraintBuilder, Expr, isZ3Available, variable, constant } from '../constraints';

const variableSchema = z.object({
  name: z.string().describe('Variable name'),
  type: z.enum(['bool', 'int', 'real']).describe('Variable type'),
  min: z.number().optional().describe('Minimum value for int/real'),
  max: z.number().optional().describe('Maximum value for int/real'),
});

const constraintExprSchema = z.object({
  left: z.string().describe('Left operand (variable name or number)'),
  op: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'and', 'or', 'implies']).describe('Operator'),
  right: z.string().describe('Right operand (variable name or number)'),
});

export function createConstraintTools(ns: NeuroSymbolic) {
  const solveConstraints = tool({
    name: 'solve_constraints',
    description:
      'Solve a constraint satisfaction problem (CSP) using SAT/SMT solver. ' +
      'Define variables with domains and constraints between them. ' +
      'Returns satisfying assignments or indicates unsatisfiability.',
    category: 'development' as const,
    tags: ['constraints', 'sat', 'smt', 'z3', 'neuro-symbolic'],
    parameters: z.object({
      problemName: z.string().optional().describe('Optional name for the problem'),
      variables: z.array(variableSchema).describe('Variables to solve for'),
      constraints: z.array(constraintExprSchema).describe('Constraints between variables'),
      objective: z
        .object({
          type: z.enum(['minimize', 'maximize']),
          variable: z.string().describe('Variable to optimize'),
        })
        .optional()
        .describe('Optimization objective'),
    }),
    execute: async (
      { problemName, variables: varDefs, constraints: constraintDefs, objective },
      _context: ToolContext
    ) => {
      const builder = ConstraintBuilder.create(problemName);
      const varExprs = new Map<string, Expr>();

      for (const v of varDefs) {
        let expr: Expr;
        if (v.type === 'bool') {
          expr = builder.bool(v.name);
        } else if (v.type === 'int') {
          expr = builder.int(v.name, v.min ?? 0, v.max ?? 100);
        } else {
          expr = builder.real(v.name, v.min ?? 0, v.max ?? 100);
        }
        varExprs.set(v.name, expr);
      }

      for (const c of constraintDefs) {
        const leftExpr = parseOperand(c.left, varExprs);
        const rightExpr = parseOperand(c.right, varExprs);

        switch (c.op) {
          case 'eq':
            builder.assert(leftExpr.eq(rightExpr));
            break;
          case 'neq':
            builder.assert(leftExpr.neq(rightExpr));
            break;
          case 'gt':
            builder.assert(leftExpr.gt(rightExpr));
            break;
          case 'gte':
            builder.assert(leftExpr.gte(rightExpr));
            break;
          case 'lt':
            builder.assert(leftExpr.lt(rightExpr));
            break;
          case 'lte':
            builder.assert(leftExpr.lte(rightExpr));
            break;
          case 'and':
            builder.assert(leftExpr.and(rightExpr));
            break;
          case 'or':
            builder.assert(leftExpr.or(rightExpr));
            break;
          case 'implies':
            builder.assert(leftExpr.implies(rightExpr));
            break;
        }
      }

      if (objective) {
        const objExpr = varExprs.get(objective.variable);
        if (objExpr) {
          if (objective.type === 'minimize') {
            builder.minimize(objExpr);
          } else {
            builder.maximize(objExpr);
          }
        }
      }

      const problem = builder.build();
      const result = await ns.solve(problem);

      const z3Available = await isZ3Available();

      if (!result.success || !result.data) {
        return {
          status: 'error',
          error: result.error || 'Solver failed',
          z3Available,
        };
      }

      const solverResult = result.data;

      if (solverResult.status === 'sat') {
        return {
          status: 'sat',
          satisfiable: true,
          model: solverResult.model.assignments,
          objectiveValue: solverResult.model.objectiveValue,
          duration: result.duration,
          z3Available,
        };
      } else if (solverResult.status === 'unsat') {
        return {
          status: 'unsat',
          satisfiable: false,
          unsatCore: solverResult.unsatCore,
          duration: result.duration,
          z3Available,
        };
      } else if (solverResult.status === 'timeout') {
        return {
          status: 'timeout',
          satisfiable: null,
          duration: result.duration,
          z3Available,
        };
      } else if (solverResult.status === 'unknown') {
        return {
          status: 'unknown',
          satisfiable: null,
          reason: solverResult.reason,
          duration: result.duration,
          z3Available,
        };
      } else {
        return {
          status: 'error',
          error: solverResult.message,
          duration: result.duration,
          z3Available,
        };
      }
    },
  });

  return { solveConstraints };
}

function parseOperand(operand: string, varExprs: Map<string, Expr>): Expr {
  const num = parseFloat(operand);
  if (!isNaN(num)) {
    return constant(num);
  }

  if (operand === 'true') {
    return constant(true);
  }
  if (operand === 'false') {
    return constant(false);
  }

  const varExpr = varExprs.get(operand);
  if (!varExpr) {
    return variable(operand);
  }
  return varExpr;
}
