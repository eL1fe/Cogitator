/**
 * @cogitator/sandbox
 *
 * Docker-based sandbox execution for Cogitator agents
 */

export { SandboxManager } from './sandbox-manager.js';
export {
  BaseSandboxExecutor,
  NativeSandboxExecutor,
  DockerSandboxExecutor,
  type DockerExecutorOptions,
} from './executors/index.js';
export { ContainerPool, type ContainerPoolOptions, type ContainerCreateOptions } from './pool/index.js';
export { parseMemory, cpusToNanoCpus } from './utils/index.js';

// Re-export types from @cogitator/types for convenience
export type {
  SandboxType,
  SandboxConfig,
  SandboxResourceLimits,
  SandboxNetworkConfig,
  SandboxMount,
  SandboxExecutionRequest,
  SandboxExecutionResult,
  SandboxManagerConfig,
  SandboxPoolConfig,
  SandboxDockerConfig,
  SandboxResult,
} from '@cogitator/types';
