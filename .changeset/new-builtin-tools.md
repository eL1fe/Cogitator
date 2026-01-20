---
'@cogitator-ai/core': minor
'@cogitator-ai/types': patch
---

feat(core): add 6 new built-in tools

New tools for web, database, and productivity:

- `webSearch` - Search the web via Tavily, Brave, or Serper APIs
- `webScrape` - Extract content from web pages (text/markdown/html output, CSS selectors)
- `sqlQuery` - Execute SQL queries against PostgreSQL or SQLite
- `vectorSearch` - Semantic search with embeddings (OpenAI/Ollama/Google + pgvector)
- `sendEmail` - Send emails via Resend API or SMTP
- `githubApi` - GitHub API integration (issues, PRs, files, commits, search)

All tools support auto-detection of providers from environment variables and use dynamic imports for optional dependencies.

Also adds new tool categories (`web`, `database`, `communication`, `development`) and `external` side effect type.
