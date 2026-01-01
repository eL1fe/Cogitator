---
'@cogitator-ai/neuro-symbolic': minor
'@cogitator-ai/types': patch
---

feat(neuro-symbolic): add neuro-symbolic AI package

Introduce @cogitator-ai/neuro-symbolic - a hybrid neural-symbolic reasoning package with four modules:

**Logic Programming**

- Prolog-style parser and knowledge base
- Robinson unification algorithm
- SLD resolution with backward chaining
- Built-in predicates (member, append, findall, etc.)
- Proof tree generation and visualization

**Knowledge Graph Queries**

- SPARQL-like query builder with fluent API
- Natural language query interface
- Multi-hop reasoning engine
- Transitive, inverse, and composition inference

**Constraint Solving**

- Fluent DSL for building constraint problems
- Z3 WASM solver integration (optional)
- Pure TypeScript SAT solver fallback
- Support for bool, int, real, bitvec variables
- Global constraints (allDifferent, atMost, atLeast)

**Plan Verification**

- PDDL-like action schema builder
- Plan validation with precondition/effect checking
- Safety property verification (invariant, eventually, always, never)
- LLM-assisted plan repair
- Dependency graph analysis
