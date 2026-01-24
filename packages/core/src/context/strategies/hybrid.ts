import type {
  CompressionContext,
  CompressionResult,
  CompressionStrategyHandler,
} from '@cogitator-ai/types';
import { countMessagesTokens } from './token-utils';
import { TruncateStrategy } from './truncate';
import { SlidingWindowStrategy } from './sliding-window';
import { SummarizeStrategy } from './summarize';

export class HybridStrategy implements CompressionStrategyHandler {
  readonly name = 'hybrid' as const;

  private truncate = new TruncateStrategy();
  private slidingWindow = new SlidingWindowStrategy();
  private summarize = new SummarizeStrategy();

  async compress(ctx: CompressionContext): Promise<CompressionResult> {
    const { messages, targetTokens, backend, summaryModel } = ctx;
    const currentTokens = countMessagesTokens(messages);

    if (currentTokens <= targetTokens) {
      return {
        messages,
        originalTokens: currentTokens,
        compressedTokens: currentTokens,
        strategy: this.name,
      };
    }

    const utilization = currentTokens / targetTokens;

    if (utilization <= 1.5) {
      const result = await this.slidingWindow.compress(ctx);
      return { ...result, strategy: this.name };
    }

    if (backend && summaryModel) {
      const result = await this.summarize.compress(ctx);
      return { ...result, strategy: this.name };
    }

    if (utilization <= 2.0) {
      const result = await this.slidingWindow.compress(ctx);
      return { ...result, strategy: this.name };
    }

    const result = await this.truncate.compress(ctx);
    return { ...result, strategy: this.name };
  }
}
