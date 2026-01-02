import type { CausalGraphData, CausalGraphStore } from '@cogitator-ai/types';

export class InMemoryCausalGraphStore implements CausalGraphStore {
  private graphs = new Map<string, CausalGraphData>();
  private agentIndex = new Map<string, string[]>();

  async save(graph: CausalGraphData): Promise<void> {
    this.graphs.set(graph.id, { ...graph });

    const agentId = graph.metadata?.agentId as string | undefined;
    if (agentId) {
      const agentGraphs = this.agentIndex.get(agentId) || [];
      if (!agentGraphs.includes(graph.id)) {
        agentGraphs.push(graph.id);
        this.agentIndex.set(agentId, agentGraphs);
      }
    }
  }

  async load(graphId: string): Promise<CausalGraphData | null> {
    const graph = this.graphs.get(graphId);
    return graph ? { ...graph } : null;
  }

  async loadForAgent(agentId: string): Promise<CausalGraphData | null> {
    const graphIds = this.agentIndex.get(agentId);
    if (!graphIds || graphIds.length === 0) return null;

    const latestId = graphIds[graphIds.length - 1];
    return this.load(latestId);
  }

  async delete(graphId: string): Promise<void> {
    const graph = this.graphs.get(graphId);
    if (graph) {
      const agentId = graph.metadata?.agentId as string | undefined;
      if (agentId) {
        const agentGraphs = this.agentIndex.get(agentId);
        if (agentGraphs) {
          const idx = agentGraphs.indexOf(graphId);
          if (idx >= 0) {
            agentGraphs.splice(idx, 1);
          }
        }
      }
      this.graphs.delete(graphId);
    }
  }

  async list(agentId?: string): Promise<CausalGraphData[]> {
    if (agentId) {
      const graphIds = this.agentIndex.get(agentId) || [];
      const graphs: CausalGraphData[] = [];
      for (const id of graphIds) {
        const graph = await this.load(id);
        if (graph) graphs.push(graph);
      }
      return graphs;
    }

    return Array.from(this.graphs.values()).map((g) => ({ ...g }));
  }

  clear(): void {
    this.graphs.clear();
    this.agentIndex.clear();
  }
}
