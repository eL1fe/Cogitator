import { nanoid } from 'nanoid';
import type { LLMBackend, Message, ToolCall } from '@cogitator-ai/types';
import { countMessagesTokens } from '@cogitator-ai/memory';
import { ToolRegistry } from '../registry';
import type { Agent } from '../agent';

export interface StreamChatResult {
  id: string;
  content: string;
  toolCalls?: ToolCall[];
  finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export async function streamChat(
  backend: LLMBackend,
  model: string,
  messages: Message[],
  registry: ToolRegistry,
  agent: Agent,
  onToken: (token: string) => void
): Promise<StreamChatResult> {
  let content = '';
  let toolCalls: ToolCall[] | undefined;
  let finishReason: 'stop' | 'tool_calls' | 'length' | 'error' = 'stop';
  let inputTokens = 0;
  let outputTokens = 0;
  let hasUsageFromStream = false;

  const stream = backend.chatStream({
    model,
    messages,
    tools: registry.getSchemas(),
    temperature: agent.config.temperature,
    topP: agent.config.topP,
    maxTokens: agent.config.maxTokens,
    stop: agent.config.stopSequences,
  });

  for await (const chunk of stream) {
    if (chunk.delta.content) {
      content += chunk.delta.content;
      onToken(chunk.delta.content);
    }
    if (chunk.delta.toolCalls) {
      toolCalls = chunk.delta.toolCalls as ToolCall[];
    }
    if (chunk.finishReason) {
      finishReason = chunk.finishReason;
    }
    if (chunk.usage) {
      inputTokens = chunk.usage.inputTokens;
      outputTokens = chunk.usage.outputTokens;
      hasUsageFromStream = true;
    }
  }

  if (!hasUsageFromStream) {
    inputTokens = countMessagesTokens(messages);
    outputTokens = Math.ceil(content.length / 4);
  }

  return {
    id: `stream_${nanoid(8)}`,
    content,
    toolCalls,
    finishReason,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    },
  };
}
