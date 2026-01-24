import type { Message, ToolCall, ToolResult, ContentPart } from '@cogitator-ai/types';
import { nanoid } from 'nanoid';

export function createUserMessage(content: string): Message {
  return { role: 'user', content };
}

export function createAssistantMessage(content: string): Message {
  return { role: 'assistant', content };
}

export function createSystemMessage(content: string): Message {
  return { role: 'system', content };
}

export function createToolMessage(toolCallId: string, content: string, name?: string): Message {
  return {
    role: 'tool',
    content,
    toolCallId,
    name,
  };
}

export function createMultimodalMessage(parts: ContentPart[]): Message {
  return { role: 'user', content: parts };
}

export function createImageUrlMessage(text: string, imageUrl: string): Message {
  return createMultimodalMessage([
    { type: 'text', text },
    { type: 'image_url', image_url: { url: imageUrl } },
  ]);
}

export function createToolCall(name: string, args: Record<string, unknown> = {}): ToolCall {
  return {
    id: `call_${nanoid(8)}`,
    name,
    arguments: args,
  };
}

export function createToolResult(toolCall: ToolCall, result: unknown, error?: string): ToolResult {
  return {
    callId: toolCall.id,
    name: toolCall.name,
    result,
    error,
  };
}

export function createConversation(
  ...messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Message[] {
  return messages.map((m) =>
    m.role === 'user' ? createUserMessage(m.content) : createAssistantMessage(m.content)
  );
}
