/**
 * @cogitator/config
 *
 * Configuration loading for Cogitator (YAML, env)
 */

export { loadConfig, defineConfig, type LoadConfigOptions } from './config.js';
export {
  CogitatorConfigSchema,
  LLMConfigSchema,
  LimitsConfigSchema,
  ProvidersConfigSchema,
  LLMProviderSchema,
  type CogitatorConfigInput,
  type CogitatorConfigOutput,
} from './schema.js';
export { loadYamlConfig } from './loaders/yaml.js';
export { loadEnvConfig } from './loaders/env.js';
