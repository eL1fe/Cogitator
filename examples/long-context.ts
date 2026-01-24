/**
 * Long Context Example
 *
 * Demonstrates automatic context management for conversations
 * that exceed model token limits.
 */

import { Cogitator, Agent, tool, ContextManager } from '@cogitator-ai/core';
import { z } from 'zod';

const cog = new Cogitator({
  llm: {
    defaultProvider: 'openai',
  },
  context: {
    enabled: true,
    strategy: 'hybrid',
    compressionThreshold: 0.8,
    summaryModel: 'openai/gpt-4o-mini',
    windowSize: 10,
  },
});

const searchKnowledge = tool({
  name: 'search_knowledge',
  description: 'Search the knowledge base for information',
  parameters: z.object({
    query: z.string().describe('Search query'),
  }),
  execute: async ({ query }) => {
    const results = [
      `Result 1 for "${query}": Lorem ipsum dolor sit amet, consectetur adipiscing elit. `.repeat(
        20
      ),
      `Result 2 for "${query}": Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. `.repeat(
        20
      ),
      `Result 3 for "${query}": Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. `.repeat(
        20
      ),
    ];
    return { query, results };
  },
});

const assistant = new Agent({
  name: 'research-assistant',
  model: 'openai/gpt-4o-mini',
  instructions: `You are a research assistant that helps users explore topics in depth.
You have access to a knowledge base through the search_knowledge tool.
Always provide thorough, detailed responses based on your searches.`,
  tools: [searchKnowledge],
  maxIterations: 20,
});

async function demonstrateContextManagement() {
  console.log('=== Context Management Demo ===\n');

  const contextManager = new ContextManager(
    {
      enabled: true,
      strategy: 'hybrid',
      compressionThreshold: 0.5,
      windowSize: 4,
    },
    {}
  );

  const messages = [
    { role: 'system' as const, content: 'You are a helpful assistant.' },
    { role: 'user' as const, content: 'Tell me about machine learning.' },
    {
      role: 'assistant' as const,
      content: 'Machine learning is a subset of AI... '.repeat(100),
    },
    { role: 'user' as const, content: 'What about deep learning?' },
    {
      role: 'assistant' as const,
      content: 'Deep learning uses neural networks... '.repeat(100),
    },
    { role: 'user' as const, content: 'How do transformers work?' },
    {
      role: 'assistant' as const,
      content: 'Transformers use attention mechanisms... '.repeat(100),
    },
    { role: 'user' as const, content: 'Explain attention in detail.' },
    {
      role: 'assistant' as const,
      content: 'Attention allows the model to focus... '.repeat(100),
    },
  ];

  console.log('Initial messages:', messages.length);

  const state = contextManager.checkState(messages, 'gpt-4o-mini');
  console.log('\nContext state:');
  console.log(`  Current tokens: ${state.currentTokens}`);
  console.log(`  Max tokens: ${state.maxTokens}`);
  console.log(`  Utilization: ${state.utilizationPercent.toFixed(1)}%`);
  console.log(`  Needs compression: ${state.needsCompression}`);

  if (state.needsCompression) {
    console.log('\nCompressing context...');
    const result = await contextManager.compress(messages, 'gpt-4o-mini');
    console.log('\nCompression result:');
    console.log(`  Original tokens: ${result.originalTokens}`);
    console.log(`  Compressed tokens: ${result.compressedTokens}`);
    console.log(`  Strategy used: ${result.strategy}`);
    console.log(`  Messages summarized: ${result.summarized ?? 0}`);
    console.log(`  Messages truncated: ${result.truncated ?? 0}`);
    console.log(`  Final message count: ${result.messages.length}`);
  }
}

async function demonstrateLongConversation() {
  console.log('\n=== Long Conversation Demo ===\n');

  const threadId = `long-context-demo-${Date.now()}`;
  const questions = [
    'Search for information about quantum computing fundamentals.',
    'Now search for quantum entanglement and explain how it relates to what we found.',
    'What are the practical applications of quantum computing?',
    'Search for quantum error correction methods.',
    'How does all of this relate to cryptography?',
  ];

  for (const question of questions) {
    console.log(`\nUser: ${question}`);

    const result = await cog.run(assistant, {
      input: question,
      threadId,
      onToolCall: (call) => console.log(`  [Tool: ${call.name}]`),
    });

    console.log(`\nAssistant: ${result.output.slice(0, 200)}...`);
    console.log(`  Tokens: ${result.usage.totalTokens}`);
    console.log(`  Tool calls: ${result.toolCalls.length}`);
    console.log(`  Messages in context: ${result.messages.length}`);
  }
}

async function demonstrateStrategies() {
  console.log('\n=== Compression Strategies Demo ===\n');

  const strategies = ['truncate', 'sliding-window', 'summarize', 'hybrid'] as const;

  const testMessages = [
    { role: 'system' as const, content: 'You are a helpful assistant.' },
    ...Array.from({ length: 20 }, (_, i) => [
      { role: 'user' as const, content: `Question ${i + 1}: ${'Lorem ipsum '.repeat(50)}` },
      {
        role: 'assistant' as const,
        content: `Answer ${i + 1}: ${'Dolor sit amet '.repeat(50)}`,
      },
    ]).flat(),
  ];

  for (const strategy of strategies) {
    const manager = new ContextManager(
      {
        enabled: true,
        strategy,
        compressionThreshold: 0.3,
        windowSize: 6,
      },
      {}
    );

    const result = await manager.compress(testMessages, 'gpt-4o-mini');
    console.log(`Strategy: ${strategy}`);
    console.log(`  Original: ${result.originalTokens} tokens`);
    console.log(`  Compressed: ${result.compressedTokens} tokens`);
    console.log(
      `  Reduction: ${((1 - result.compressedTokens / result.originalTokens) * 100).toFixed(1)}%`
    );
    console.log(`  Messages: ${testMessages.length} → ${result.messages.length}`);
    console.log();
  }
}

async function main() {
  try {
    await demonstrateContextManagement();
    await demonstrateStrategies();

    if (process.env.OPENAI_API_KEY) {
      await demonstrateLongConversation();
    } else {
      console.log('\nSkipping live demo (set OPENAI_API_KEY to run)');
    }

    await cog.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
