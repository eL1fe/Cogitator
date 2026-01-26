import type { Tool } from '@cogitator-ai/core';
import type { LanguageModelV1 } from '@ai-sdk/provider';

export interface CogitatorProviderOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface CogitatorProvider {
  (agentName: string, options?: CogitatorProviderOptions): LanguageModelV1;
  languageModel(agentName: string, options?: CogitatorProviderOptions): LanguageModelV1;
}

export interface AISDKModelWrapperOptions {
  defaultModel?: string;
}

export type CogitatorTool<TParams = unknown, TResult = unknown> = Tool<TParams, TResult>;
