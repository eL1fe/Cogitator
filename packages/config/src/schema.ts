/**
 * Configuration schema using Zod
 */

import { z } from 'zod';

export const LLMProviderSchema = z.enum([
  'ollama',
  'openai',
  'anthropic',
  'google',
  'vllm',
]);

export const ProvidersConfigSchema = z.object({
  ollama: z.object({ baseUrl: z.string() }).optional(),
  openai: z.object({ apiKey: z.string(), baseUrl: z.string().optional() }).optional(),
  anthropic: z.object({ apiKey: z.string() }).optional(),
  google: z.object({ apiKey: z.string() }).optional(),
  vllm: z.object({ baseUrl: z.string() }).optional(),
});

export const LLMConfigSchema = z.object({
  defaultProvider: LLMProviderSchema.optional(),
  defaultModel: z.string().optional(),
  providers: ProvidersConfigSchema.optional(),
});

export const LimitsConfigSchema = z.object({
  maxConcurrentRuns: z.number().positive().optional(),
  defaultTimeout: z.number().positive().optional(),
  maxTokensPerRun: z.number().positive().optional(),
});

export const CogitatorConfigSchema = z.object({
  llm: LLMConfigSchema.optional(),
  limits: LimitsConfigSchema.optional(),
});

export type CogitatorConfigInput = z.input<typeof CogitatorConfigSchema>;
export type CogitatorConfigOutput = z.output<typeof CogitatorConfigSchema>;
