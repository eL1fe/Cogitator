/**
 * Auction strategy - Agents bid for tasks, winner executes
 */

import type {
  SwarmRunOptions,
  StrategyResult,
  AuctionConfig,
  RunResult,
  SwarmAgent,
} from '@cogitator/types';
import { BaseStrategy } from './base.js';
import type { SwarmCoordinator } from '../coordinator.js';

interface Bid {
  agentName: string;
  score: number;
  capabilities: string[];
  reasoning?: string;
}

export class AuctionStrategy extends BaseStrategy {
  private config: AuctionConfig;

  constructor(coordinator: SwarmCoordinator, config: AuctionConfig) {
    super(coordinator);
    this.config = {
      minBid: 0,
      ...config,
    };
  }

  async execute(options: SwarmRunOptions): Promise<StrategyResult> {
    const agentResults = new Map<string, RunResult>();
    const agents = this.coordinator.getAgents();

    if (agents.length === 0) {
      throw new Error('Auction strategy requires at least 1 agent');
    }

    this.coordinator.events.emit('auction:start', {
      task: options.input.slice(0, 100),
      participants: agents.map(a => a.agent.name),
    });

    // Initialize auction state on blackboard
    this.coordinator.blackboard.write('auction', {
      task: options.input,
      participants: agents.map(a => a.agent.name),
      bids: [],
      status: 'bidding',
    }, 'system');

    // Collect bids from all agents
    const bids = await this.collectBids(agents, options);

    // Filter bids below minimum
    const validBids = bids.filter(b => b.score >= (this.config.minBid ?? 0));

    if (validBids.length === 0) {
      throw new Error('No valid bids received (all below minimum threshold)');
    }

    // Update blackboard with bids
    const auctionState = this.coordinator.blackboard.read<{ bids: Bid[] }>('auction');
    this.coordinator.blackboard.write('auction', {
      ...auctionState,
      bids: validBids,
      status: 'selecting',
    }, 'system');

    // Select winner
    const winner = this.selectWinner(validBids);

    this.coordinator.events.emit('auction:winner', {
      winner: winner.agentName,
      score: winner.score,
      totalBids: validBids.length,
    });

    // Update blackboard with winner
    const currentAuctionState = this.coordinator.blackboard.read<Record<string, unknown>>('auction') ?? {};
    this.coordinator.blackboard.write('auction', {
      ...currentAuctionState,
      winner: winner.agentName,
      winningBid: winner.score,
      status: 'executing',
    }, 'system');

    // Execute task with winning agent
    const winningAgent = agents.find(a => a.agent.name === winner.agentName)!;

    const winnerContext = {
      ...options.context,
      auctionContext: {
        wonBid: true,
        bidScore: winner.score,
        totalParticipants: agents.length,
        competingBids: validBids.filter(b => b.agentName !== winner.agentName).length,
      },
      auctionInstructions: `You won the bid for this task with a score of ${winner.score.toFixed(2)}. Execute the task to the best of your abilities.`,
    };

    const result = await this.coordinator.runAgent(
      winningAgent.agent.name,
      options.input,
      winnerContext
    );
    agentResults.set(winningAgent.agent.name, result);

    // Finalize auction state
    const finalAuctionState = this.coordinator.blackboard.read<Record<string, unknown>>('auction') ?? {};
    this.coordinator.blackboard.write('auction', {
      ...finalAuctionState,
      status: 'completed',
      result: String(result.output).slice(0, 200),
    }, 'system');

    this.coordinator.events.emit('auction:complete', {
      winner: winner.agentName,
      success: true,
    });

    // Convert bids to Map for StrategyResult
    const bidsMap = new Map<string, number>();
    for (const bid of validBids) {
      bidsMap.set(bid.agentName, bid.score);
    }

    return {
      output: result.output,
      structured: result.structured,
      agentResults,
      bids: bidsMap,
      auctionWinner: winner.agentName,
    };
  }

  private async collectBids(
    agents: SwarmAgent[],
    options: SwarmRunOptions
  ): Promise<Bid[]> {
    const bids: Bid[] = [];

    if (this.config.bidding === 'custom' && this.config.bidFunction) {
      // Use custom bid function
      for (const agent of agents) {
        try {
          const score = await Promise.resolve(this.config.bidFunction(agent, options.input));
          bids.push({
            agentName: agent.agent.name,
            score,
            capabilities: agent.metadata.expertise ?? [],
          });
          this.coordinator.events.emit('auction:bid', {
            agent: agent.agent.name,
            score,
          });
        } catch {
          // Agent failed to bid, skip
          bids.push({
            agentName: agent.agent.name,
            score: 0,
            capabilities: [],
          });
        }
      }
    } else {
      // Capability-match bidding - ask agents to self-assess
      const bidResults = await this.coordinator.runAgentsParallel(
        agents.map(agent => ({
          name: agent.agent.name,
          input: this.buildBidPrompt(options.input),
          context: {
            ...options.context,
            biddingContext: {
              isBidPhase: true,
              expertise: agent.metadata.expertise ?? [],
            },
          },
        }))
      );

      for (const [agentName, result] of bidResults) {
        const bid = this.parseBidResponse(agentName, result.output, agents.find(a => a.agent.name === agentName)!);
        bids.push(bid);
        this.coordinator.events.emit('auction:bid', {
          agent: agentName,
          score: bid.score,
        });
      }
    }

    return bids;
  }

  private buildBidPrompt(task: string): string {
    return `
You are participating in an auction to determine which agent should handle a task.

Task:
${task}

Please assess your capability to handle this task and provide:
1. A confidence score from 0.0 to 1.0 (where 1.0 means you're perfectly suited)
2. Your relevant capabilities for this task
3. Brief reasoning for your bid

Respond in this format:
SCORE: [number between 0.0 and 1.0]
CAPABILITIES: [comma-separated list]
REASONING: [brief explanation]

Be honest in your assessment. Only bid high if you're truly well-suited for the task.
`.trim();
  }

  private parseBidResponse(agentName: string, output: string, agent: SwarmAgent): Bid {
    // Parse score
    const scoreMatch = output.match(/SCORE:\s*([\d.]+)/i);
    let score = 0.5; // Default

    if (scoreMatch) {
      score = Math.min(1, Math.max(0, parseFloat(scoreMatch[1])));
      if (isNaN(score)) score = 0.5;
    }

    // Parse capabilities
    const capMatch = output.match(/CAPABILITIES:\s*([^\n]+)/i);
    let capabilities = agent.metadata.expertise ?? [];

    if (capMatch) {
      capabilities = capMatch[1].split(',').map(c => c.trim()).filter(Boolean);
    }

    // Parse reasoning
    const reasonMatch = output.match(/REASONING:\s*(.+)/is);
    const reasoning = reasonMatch ? reasonMatch[1].trim() : undefined;

    return {
      agentName,
      score,
      capabilities,
      reasoning,
    };
  }

  private selectWinner(bids: Bid[]): Bid {
    if (bids.length === 0) {
      throw new Error('No bids to select from');
    }

    if (this.config.selection === 'weighted-random') {
      return this.weightedRandomSelect(bids);
    }

    // Highest bid wins
    return bids.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  }

  private weightedRandomSelect(bids: Bid[]): Bid {
    const totalWeight = bids.reduce((sum, b) => sum + b.score, 0);

    if (totalWeight === 0) {
      // All scores are 0, pick randomly
      return bids[Math.floor(Math.random() * bids.length)];
    }

    const random = Math.random() * totalWeight;
    let cumulative = 0;

    for (const bid of bids) {
      cumulative += bid.score;
      if (random <= cumulative) {
        return bid;
      }
    }

    // Fallback
    return bids[bids.length - 1];
  }
}
