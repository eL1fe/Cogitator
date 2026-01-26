export { cogitatorPlugin } from './plugin.js';

export type {
  CogitatorPluginOptions,
  CogitatorContext,
  AuthContext,
  AuthFunction,
  RateLimitConfig,
  SwaggerConfig,
  WebSocketConfig,
  AgentListResponse,
  AgentRunRequest,
  AgentRunResponse,
  ThreadResponse,
  AddMessageRequest,
  ToolListResponse,
  WorkflowListResponse,
  WorkflowRunRequest,
  WorkflowRunResponse,
  WorkflowStatusResponse,
  SwarmListResponse,
  SwarmRunRequest,
  SwarmRunResponse,
  BlackboardResponse,
  HealthResponse,
  ErrorResponse,
  WebSocketMessage,
  WebSocketResponse,
  OpenAPISpec,
} from './types.js';

export {
  AgentRunRequestSchema,
  AgentRunResponseSchema,
  AddMessageRequestSchema,
  WorkflowRunRequestSchema,
  SwarmRunRequestSchema,
} from './types.js';

export { FastifyStreamWriter } from './streaming/index.js';

export type { StreamEvent, Usage } from './streaming/protocol.js';

export {
  createStartEvent,
  createTextStartEvent,
  createTextDeltaEvent,
  createTextEndEvent,
  createToolCallStartEvent,
  createToolCallDeltaEvent,
  createToolCallEndEvent,
  createToolResultEvent,
  createErrorEvent,
  createFinishEvent,
  createWorkflowEvent,
  createSwarmEvent,
} from './streaming/protocol.js';

export { generateId, encodeSSE, encodeDone } from './streaming/helpers.js';
