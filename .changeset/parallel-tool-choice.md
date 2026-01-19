---
'@cogitator-ai/core': minor
'@cogitator-ai/types': minor
---

feat: add parallel tool execution and tool choice support

**Parallel Tool Execution:**

- New `parallelToolCalls` option in `RunOptions` enables concurrent tool execution
- When enabled, independent tool calls execute via `Promise.all` for improved performance
- Default remains sequential execution for deterministic behavior

**Tool Choice:**

- New `ToolChoice` type: `'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } }`
- New `toolChoice` field in `ChatRequest` interface
- Provider-specific implementations:
  - OpenAI: native tool_choice support
  - Anthropic: maps to `tool_choice` with `type: 'auto' | 'any' | 'tool'`
  - Google: uses `functionCallingConfig` with mode and allowedFunctionNames
  - Ollama: filters tools based on choice (workaround for no native API support)
