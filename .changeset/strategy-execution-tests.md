---
'@cogitator-ai/swarms': patch
---

Add comprehensive execution tests for all 7 swarm strategies

- Add mock infrastructure: MockCoordinator, mock-helpers
- Add tests for RoundRobinStrategy: sequential/random rotation, sticky sessions
- Add tests for HierarchicalStrategy: supervisor-worker delegation, worker info
- Add tests for ConsensusStrategy: vote extraction, resolution methods, multiple rounds
- Add tests for AuctionStrategy: bid parsing, winner selection, minBid filtering
- Add tests for PipelineStrategy: sequential execution, gates, retry-previous, goto
- Add tests for DebateStrategy: rounds, moderator synthesis, transcript
- Add tests for NegotiationStrategy: phase progression, deadlock handling, convergence
