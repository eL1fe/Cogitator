---
'@cogitator-ai/core': minor
'@cogitator-ai/types': minor
---

feat(core): add Azure OpenAI and AWS Bedrock backends

Enterprise LLM providers for production deployments:

**Azure OpenAI:**

- Full chat and streaming support via official OpenAI SDK
- Configurable deployment, endpoint, and API version
- Tool calling, structured outputs, vision

**AWS Bedrock:**

- Uses Converse API for unified chat interface
- Dynamic SDK import (optional peer dependency)
- Supports Claude, Llama, Mistral, Cohere, Titan models
- Tool calling with proper type safety

Both backends integrate seamlessly with the universal LLM interface.
