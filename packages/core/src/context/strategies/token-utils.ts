import type { Message } from '@cogitator-ai/types';

const CHARS_PER_TOKEN = 4;
const MESSAGE_OVERHEAD = 4;

function getTextContent(content: Message['content']): string {
  if (typeof content === 'string') {
    return content;
  }
  return content
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join(' ');
}

export function countTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function countMessageTokens(message: Message): number {
  return countTokens(getTextContent(message.content)) + MESSAGE_OVERHEAD;
}

export function countMessagesTokens(messages: Message[]): number {
  return messages.reduce((sum, msg) => sum + countMessageTokens(msg), 0);
}
