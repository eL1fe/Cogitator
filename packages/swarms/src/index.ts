/**
 * @cogitator/swarms - Multi-agent swarm coordination
 */

// Main exports
export { Swarm, SwarmBuilder, swarm } from './swarm.js';
export { SwarmCoordinator } from './coordinator.js';

// Strategies
export {
  BaseStrategy,
  HierarchicalStrategy,
  RoundRobinStrategy,
  ConsensusStrategy,
  AuctionStrategy,
  PipelineStrategy,
  DebateStrategy,
  createStrategy,
  getDefaultStrategyConfig,
} from './strategies/index.js';

// Communication primitives
export {
  SwarmEventEmitterImpl,
  InMemoryMessageBus,
  InMemoryBlackboard,
} from './communication/index.js';

// Resources
export { ResourceTracker } from './resources/tracker.js';
export { CircuitBreaker, type CircuitState, type CircuitBreakerConfig } from './resources/circuit-breaker.js';

// Tools
export {
  createSwarmTools,
  createStrategyTools,
  createMessagingTools,
  createBlackboardTools,
  createDelegationTools,
  createVotingTools,
  type SwarmToolContext,
  type MessagingTools,
  type BlackboardTools,
  type DelegationTools,
  type VotingTools,
} from './tools/index.js';

// Workflow integration
export {
  swarmNode,
  conditionalSwarmNode,
  parallelSwarmsNode,
  type SwarmNodeOptions,
  type SwarmNodeContext,
} from './workflow/swarm-node.js';

// Re-export types for convenience
export type {
  SwarmStrategy,
  SwarmConfig,
  SwarmRunOptions,
  SwarmAgent,
  SwarmAgentMetadata,
  SwarmAgentState,
  SwarmMessage,
  SwarmMessageType,
  MessageBus,
  MessageBusConfig,
  Blackboard,
  BlackboardConfig,
  BlackboardEntry,
  SwarmEventEmitter,
  SwarmEventType,
  SwarmEvent,
  SwarmEventHandler,
  HierarchicalConfig,
  RoundRobinConfig,
  ConsensusConfig,
  AuctionConfig,
  PipelineConfig,
  PipelineStage,
  PipelineContext,
  PipelineGateConfig,
  DebateConfig,
  StrategyResult,
  IStrategy,
  SwarmCoordinatorInterface,
  SwarmResourceConfig,
  SwarmErrorConfig,
} from '@cogitator/types';
