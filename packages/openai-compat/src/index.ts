/**
 * @cogitator/openai-compat - OpenAI Assistants API Compatibility
 *
 * This package provides:
 * - OpenAI SDK adapter: Use OpenAI SDK to interact with Cogitator
 * - REST API server: Expose Cogitator as OpenAI-compatible API
 */

// Server
export { OpenAIServer, createOpenAIServer } from './server/api-server.js';

// Client adapter
export { OpenAIAdapter, createOpenAIAdapter } from './client/openai-adapter.js';
export { ThreadManager } from './client/thread-manager.js';

// Types
export type {
  // Common
  OpenAIError,
  ListResponse,
  // Assistant
  Assistant,
  AssistantTool,
  FunctionDefinition,
  ResponseFormat,
  CreateAssistantRequest,
  UpdateAssistantRequest,
  // Thread
  Thread,
  ToolResources,
  CreateThreadRequest,
  // Message
  Message,
  MessageContent,
  TextContent,
  TextAnnotation,
  Attachment,
  CreateMessageRequest,
  MessageContentPart,
  // Run
  Run,
  RunStatus,
  RequiredAction,
  ToolCall,
  RunError,
  Usage,
  ToolChoice,
  CreateRunRequest,
  SubmitToolOutputsRequest,
  ToolOutput,
  // Run Step
  RunStep,
  StepDetails,
  StepToolCall,
  // File
  FileObject,
  FilePurpose,
  UploadFileRequest,
  // Streaming
  StreamEvent,
  MessageDelta,
  RunStepDelta,
} from './types/openai-types.js';

