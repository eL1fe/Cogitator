/**
 * Constitutional AI types for Cogitator
 *
 * Enables:
 * - Defining principles (constitution) for AI behavior
 * - Input/output filtering with harm classification
 * - Critique-revision loops for self-correction
 * - Tool approval enforcement
 */

export type HarmCategory =
  | 'violence'
  | 'hate'
  | 'sexual'
  | 'self-harm'
  | 'illegal'
  | 'privacy'
  | 'misinformation'
  | 'manipulation';

export type Severity = 'low' | 'medium' | 'high';

export type PrincipleCategory = 'ethics' | 'safety' | 'privacy' | 'legal' | 'custom';

export type FilterLayer = 'input' | 'output' | 'tool';

export interface ConstitutionalPrinciple {
  id: string;
  name: string;
  description: string;
  category: PrincipleCategory;

  critiquePrompt: string;
  revisionPrompt: string;

  harmCategories?: HarmCategory[];
  severity: Severity;

  appliesTo?: FilterLayer[];
}

export interface Constitution {
  id: string;
  name: string;
  version: string;
  principles: ConstitutionalPrinciple[];

  customizable: boolean;
  strictMode: boolean;
}

export interface HarmScore {
  category: HarmCategory;
  severity: Severity;
  confidence: number;
  principleViolated?: string;
  reasoning?: string;
}

export interface FilterResult {
  allowed: boolean;
  harmScores: HarmScore[];
  blockedReason?: string;
  suggestedRevision?: string;
}

export interface CritiqueResult {
  isHarmful: boolean;
  harmScores: HarmScore[];
  critique: string;
  principlesViolated: string[];
}

export interface RevisionResult {
  original: string;
  revised: string;
  iterations: number;
  critiqueHistory: CritiqueResult[];
}

export interface ToolGuardResult {
  approved: boolean;
  requiresConfirmation: boolean;
  sideEffects: string[];
  riskLevel: Severity;
  reason?: string;
}

export interface GuardrailConfig {
  enabled: boolean;
  constitution?: Constitution;
  model?: string;

  filterInput: boolean;
  filterOutput: boolean;
  filterToolCalls: boolean;
  filterToolResults: boolean;

  enableCritiqueRevision: boolean;
  maxRevisionIterations: number;
  revisionConfidenceThreshold: number;

  thresholds: Partial<Record<HarmCategory, Severity>>;

  strictMode: boolean;
  logViolations: boolean;
  onViolation?: (result: FilterResult, layer: FilterLayer) => void;
  onToolApproval?: (
    toolName: string,
    args: Record<string, unknown>,
    sideEffects: string[]
  ) => Promise<boolean>;
}

export const DEFAULT_GUARDRAIL_CONFIG: GuardrailConfig = {
  enabled: true,
  filterInput: true,
  filterOutput: true,
  filterToolCalls: true,
  filterToolResults: false,
  enableCritiqueRevision: true,
  maxRevisionIterations: 3,
  revisionConfidenceThreshold: 0.85,
  thresholds: {
    violence: 'medium',
    hate: 'low',
    sexual: 'medium',
    'self-harm': 'low',
    illegal: 'low',
    privacy: 'medium',
    misinformation: 'high',
    manipulation: 'medium',
  },
  strictMode: false,
  logViolations: true,
};
