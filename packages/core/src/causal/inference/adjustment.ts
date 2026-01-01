import type { CausalGraph, AdjustmentSet } from '@cogitator-ai/types';
import { dSeparation } from './d-separation';

export function findBackdoorAdjustment(
  graph: CausalGraph,
  treatment: string,
  outcome: string
): AdjustmentSet | null {
  if (!graph.hasNode(treatment) || !graph.hasNode(outcome)) {
    return null;
  }

  const treatmentDescendants = new Set(graph.getDescendants(treatment).map((n) => n.id));
  treatmentDescendants.add(treatment);

  const allNodes = graph.getNodes().map((n) => n.id);
  const candidates = allNodes.filter(
    (n) => n !== treatment && n !== outcome && !treatmentDescendants.has(n)
  );

  const minimalSets: string[][] = [];

  for (let size = 0; size <= candidates.length; size++) {
    for (const subset of combinations(candidates, size)) {
      if (isValidBackdoorSet(graph, treatment, outcome, subset)) {
        minimalSets.push(subset);
        if (size === 0 || minimalSets.length > 0) {
          const minSize = minimalSets[0].length;
          if (subset.length > minSize) break;
        }
      }
    }
    if (minimalSets.length > 0) break;
  }

  if (minimalSets.length === 0) {
    return null;
  }

  const bestSet = minimalSets[0];

  return {
    variables: bestSet,
    type: 'backdoor',
    formula: generateBackdoorFormula(treatment, outcome, bestSet),
    isMinimal: true,
    isValid: true,
  };
}

function isValidBackdoorSet(
  graph: CausalGraph,
  treatment: string,
  outcome: string,
  adjustmentSet: string[]
): boolean {
  const treatmentDescendants = new Set(graph.getDescendants(treatment).map((n) => n.id));
  for (const node of adjustmentSet) {
    if (treatmentDescendants.has(node)) {
      return false;
    }
  }

  const modifiedGraph = createGraphWithoutOutgoingEdges(graph, treatment);
  const result = dSeparation(modifiedGraph, treatment, outcome, adjustmentSet);

  return result.separated;
}

function createGraphWithoutOutgoingEdges(graph: CausalGraph, nodeId: string): CausalGraph {
  const cloned = graph.clone();
  const children = graph.getChildren(nodeId);

  for (const child of children) {
    const edge = cloned.getEdgeBetween(nodeId, child.id);
    if (edge) {
      cloned.removeEdge(edge.id);
    }
  }

  return cloned;
}

export function findFrontdoorAdjustment(
  graph: CausalGraph,
  treatment: string,
  outcome: string
): AdjustmentSet | null {
  if (!graph.hasNode(treatment) || !graph.hasNode(outcome)) {
    return null;
  }

  const paths = graph.findPaths(treatment, outcome);
  if (paths.length === 0) {
    return null;
  }

  const allNodes = graph.getNodes().map((n) => n.id);
  const candidates = allNodes.filter((n) => n !== treatment && n !== outcome);

  for (let size = 1; size <= candidates.length; size++) {
    for (const subset of combinations(candidates, size)) {
      if (isValidFrontdoorSet(graph, treatment, outcome, subset)) {
        return {
          variables: subset,
          type: 'frontdoor',
          formula: generateFrontdoorFormula(treatment, outcome, subset),
          isMinimal: true,
          isValid: true,
        };
      }
    }
  }

  return null;
}

function isValidFrontdoorSet(
  graph: CausalGraph,
  treatment: string,
  outcome: string,
  mediators: string[]
): boolean {
  const mediatorSet = new Set(mediators);

  const paths = graph.findPaths(treatment, outcome);
  for (const path of paths) {
    let intercepted = false;
    for (let i = 1; i < path.nodes.length - 1; i++) {
      if (mediatorSet.has(path.nodes[i])) {
        intercepted = true;
        break;
      }
    }
    if (!intercepted) return false;
  }

  for (const m of mediators) {
    const treatmentParents = graph.getParents(treatment);
    for (const parent of treatmentParents) {
      if (graph.getEdgeBetween(parent.id, m) || isAncestor(graph, parent.id, m)) {
        return false;
      }
    }
  }

  for (const m of mediators) {
    const confounders = findConfounders(graph, m, outcome);
    const backdoorSet = [treatment, ...confounders.filter((c) => c !== treatment)];

    const separated = dSeparation(
      createGraphWithoutOutgoingEdges(graph, m),
      m,
      outcome,
      backdoorSet
    );
    if (!separated.separated) {
      return false;
    }
  }

  return true;
}

function isAncestor(graph: CausalGraph, potential: string, of: string): boolean {
  const ancestors = graph.getAncestors(of);
  return ancestors.some((a) => a.id === potential);
}

function findConfounders(graph: CausalGraph, node1: string, node2: string): string[] {
  const ancestors1 = new Set(graph.getAncestors(node1).map((n) => n.id));
  const ancestors2 = new Set(graph.getAncestors(node2).map((n) => n.id));

  const confounders: string[] = [];
  for (const a of ancestors1) {
    if (ancestors2.has(a)) {
      confounders.push(a);
    }
  }

  return confounders;
}

function generateBackdoorFormula(
  treatment: string,
  outcome: string,
  adjustmentSet: string[]
): string {
  if (adjustmentSet.length === 0) {
    return `P(${outcome}|do(${treatment})) = Σ P(${outcome}|${treatment})`;
  }

  const adjustVars = adjustmentSet.join(', ');
  return `P(${outcome}|do(${treatment})) = Σ_{${adjustVars}} P(${outcome}|${treatment}, ${adjustVars}) P(${adjustVars})`;
}

function generateFrontdoorFormula(treatment: string, outcome: string, mediators: string[]): string {
  const m = mediators.join(', ');
  return `P(${outcome}|do(${treatment})) = Σ_{${m}} P(${m}|${treatment}) Σ_{${treatment}'} P(${outcome}|${m}, ${treatment}') P(${treatment}')`;
}

export function findAllAdjustmentSets(
  graph: CausalGraph,
  treatment: string,
  outcome: string,
  maxSize = 5
): AdjustmentSet[] {
  const results: AdjustmentSet[] = [];

  const backdoor = findBackdoorAdjustment(graph, treatment, outcome);
  if (backdoor) {
    results.push(backdoor);
  }

  const frontdoor = findFrontdoorAdjustment(graph, treatment, outcome);
  if (frontdoor) {
    results.push(frontdoor);
  }

  const treatmentDescendants = new Set(graph.getDescendants(treatment).map((n) => n.id));

  const allNodes = graph.getNodes().map((n) => n.id);
  const candidates = allNodes.filter(
    (n) => n !== treatment && n !== outcome && !treatmentDescendants.has(n)
  );

  for (let size = 0; size <= Math.min(maxSize, candidates.length); size++) {
    for (const subset of combinations(candidates, size)) {
      if (isValidBackdoorSet(graph, treatment, outcome, subset)) {
        const exists = results.some(
          (r) =>
            r.type === 'backdoor' &&
            r.variables.length === subset.length &&
            r.variables.every((v) => subset.includes(v))
        );
        if (!exists) {
          results.push({
            variables: subset,
            type: 'backdoor',
            formula: generateBackdoorFormula(treatment, outcome, subset),
            isMinimal: size === (backdoor?.variables.length ?? 0),
            isValid: true,
          });
        }
      }
    }
  }

  return results;
}

function* combinations<T>(arr: T[], size: number): Generator<T[]> {
  if (size === 0) {
    yield [];
    return;
  }
  if (arr.length < size) return;

  for (let i = 0; i <= arr.length - size; i++) {
    for (const rest of combinations(arr.slice(i + 1), size - 1)) {
      yield [arr[i], ...rest];
    }
  }
}
