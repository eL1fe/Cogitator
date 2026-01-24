import type {
  CompressionContext,
  CompressionResult,
  CompressionStrategyHandler,
  Message,
} from '@cogitator-ai/types';
import { countMessageTokens } from './token-utils';

export class TruncateStrategy implements CompressionStrategyHandler {
  readonly name = 'truncate' as const;

  async compress(ctx: CompressionContext): Promise<CompressionResult> {
    const { messages, targetTokens } = ctx;

    if (messages.length === 0) {
      return {
        messages: [],
        originalTokens: 0,
        compressedTokens: 0,
        strategy: this.name,
        truncated: 0,
      };
    }

    const originalTokens = messages.reduce((sum, m) => sum + countMessageTokens(m), 0);

    const systemMessages: Message[] = [];
    const otherMessages: Message[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemMessages.push(msg);
      } else {
        otherMessages.push(msg);
      }
    }

    const systemTokens = systemMessages.reduce((sum, m) => sum + countMessageTokens(m), 0);
    const availableForHistory = targetTokens - systemTokens;

    if (availableForHistory <= 0) {
      return {
        messages: systemMessages,
        originalTokens,
        compressedTokens: systemTokens,
        strategy: this.name,
        truncated: otherMessages.length,
      };
    }

    const kept: Message[] = [];
    let usedTokens = 0;

    for (let i = otherMessages.length - 1; i >= 0; i--) {
      const msg = otherMessages[i];
      const msgTokens = countMessageTokens(msg);

      if (usedTokens + msgTokens <= availableForHistory) {
        kept.unshift(msg);
        usedTokens += msgTokens;
      } else {
        break;
      }
    }

    const result = [...systemMessages, ...kept];
    const compressedTokens = systemTokens + usedTokens;

    return {
      messages: result,
      originalTokens,
      compressedTokens,
      strategy: this.name,
      truncated: otherMessages.length - kept.length,
    };
  }
}
