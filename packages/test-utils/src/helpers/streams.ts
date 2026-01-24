import type { ChatStreamChunk } from '@cogitator-ai/types';

export async function collectStreamContent(
  stream: AsyncGenerator<ChatStreamChunk>
): Promise<string> {
  let content = '';
  for await (const chunk of stream) {
    if (chunk.delta.content) {
      content += chunk.delta.content;
    }
  }
  return content;
}

export async function collectStreamChunks(
  stream: AsyncGenerator<ChatStreamChunk>
): Promise<ChatStreamChunk[]> {
  const chunks: ChatStreamChunk[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
}

export async function collectStreamToolCalls(
  stream: AsyncGenerator<ChatStreamChunk>
): Promise<Array<{ name: string; arguments: Record<string, unknown> }>> {
  const toolCalls: Array<{ name: string; arguments: Record<string, unknown> }> = [];

  for await (const chunk of stream) {
    if (chunk.delta.toolCalls) {
      for (const tc of chunk.delta.toolCalls) {
        if (tc.name && tc.arguments) {
          toolCalls.push({
            name: tc.name,
            arguments: tc.arguments as Record<string, unknown>,
          });
        }
      }
    }
  }

  return toolCalls;
}

export function createMockReadableStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index++]));
      } else {
        controller.close();
      }
    },
  });
}
