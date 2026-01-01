export {
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
} from './dsl';

export {
  SimpleSATSolver,
  createSimpleSATSolver,
  solveSAT,
  type SimpleSATConfig,
} from './simple-sat-solver';

export {
  Z3WASMSolver,
  createZ3Solver,
  solveWithZ3,
  isZ3Available,
  type Z3SolverConfig,
} from './z3-wasm-solver';

export {
  createNLToConstraintsPrompt,
  createConstraintExplanationPrompt,
  createUnsatAnalysisPrompt,
  createConstraintSuggestionPrompt,
  parseNLConstraintsResponse,
  formatSolverResultForLLM,
  formatProblemSummary,
  type NLToConstraintsContext,
  type ConstraintExplanationContext,
  type UnsatAnalysisContext,
  type ConstraintSuggestionContext,
  type ParseNLConstraintsResult,
} from './prompts';

import type { ConstraintProblem, SolverResult, ConstraintSolverConfig } from '@cogitator-ai/types';
import { solveSAT, type SimpleSATConfig } from './simple-sat-solver';
import { solveWithZ3, isZ3Available } from './z3-wasm-solver';

export async function solve(
  problem: ConstraintProblem,
  config?: Partial<ConstraintSolverConfig>
): Promise<SolverResult> {
  const solverType = config?.solver ?? 'z3';

  if (solverType === 'z3') {
    const z3Available = await isZ3Available();

    if (z3Available) {
      return solveWithZ3(problem, config);
    }

    console.warn('Z3 not available, falling back to simple-sat solver');
  }

  return solveSAT(problem, config as Partial<SimpleSATConfig>);
}
