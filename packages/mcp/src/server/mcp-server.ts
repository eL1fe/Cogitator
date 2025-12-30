/**
 * MCP Server
 *
 * Exposes Cogitator tools as an MCP server that can be used by
 * other MCP clients (e.g., Claude Desktop, other AI assistants).
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Tool, ToolContext } from '@cogitator/types';
import type { MCPServerConfig } from '../types.js';
import { resultToMCPContent, zodToJsonSchema } from '../adapter/tool-adapter.js';

// MCP SDK compatible result type with index signature
interface MCPCallToolResult {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * MCP Server for exposing Cogitator tools
 *
 * @example
 * ```typescript
 * // Create server with tools
 * const server = new MCPServer({
 *   name: 'my-cogitator-server',
 *   version: '1.0.0',
 *   transport: 'stdio',
 * });
 *
 * // Register tools
 * server.registerTool(calculatorTool);
 * server.registerTool(fileReadTool);
 * server.registerTools([searchTool, weatherTool]);
 *
 * // Start serving
 * await server.start();
 * ```
 */
export class MCPServer {
  private server: McpServer;
  private config: MCPServerConfig;
  private tools = new Map<string, Tool>();
  private started = false;

  constructor(config: MCPServerConfig) {
    this.config = config;
    this.server = new McpServer({
      name: config.name,
      version: config.version,
    });
  }

  /**
   * Register a single Cogitator tool
   */
  registerTool(tool: Tool): void {
    if (this.started) {
      throw new Error('Cannot register tools after server has started');
    }

    this.tools.set(tool.name, tool);
    this.registerMCPTool(tool);
  }

  /**
   * Register multiple Cogitator tools
   */
  registerTools(tools: Tool[]): void {
    for (const tool of tools) {
      this.registerTool(tool);
    }
  }

  /**
   * Unregister a tool by name
   */
  unregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Get list of registered tool names
   */
  getRegisteredTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Register a tool with the MCP server
   */
  private registerMCPTool(tool: Tool): void {
    const inputSchema = this.buildInputSchema(tool);

    this.server.tool(
      tool.name,
      tool.description,
      inputSchema,
      async (args): Promise<MCPCallToolResult> => {
        return this.executeTool(tool, args as Record<string, unknown>);
      }
    );
  }

  /**
   * Build the input schema for MCP tool registration
   */
  private buildInputSchema(tool: Tool): Record<string, unknown> {
    // If we have a Zod schema, convert it to JSON Schema
    if (tool.parameters) {
      const jsonSchema = zodToJsonSchema(tool.parameters);
      return jsonSchema.properties ?? {};
    }

    // Fall back to tool's JSON representation
    const schema = tool.toJSON();
    return schema.parameters.properties;
  }

  /**
   * Execute a tool and return MCP-formatted result
   */
  private async executeTool(
    tool: Tool,
    args: Record<string, unknown>
  ): Promise<MCPCallToolResult> {
    // Create a minimal context for tool execution
    const context: ToolContext = {
      agentId: 'mcp-server',
      runId: `mcp_${Date.now()}`,
      signal: new AbortController().signal,
    };

    try {
      // Validate arguments if possible
      let validatedArgs = args;
      if (tool.parameters) {
        const parseResult = tool.parameters.safeParse(args);
        if (!parseResult.success) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Validation error: ${parseResult.error.message}`,
              },
            ],
            isError: true,
          } as MCPCallToolResult;
        }
        validatedArgs = parseResult.data as Record<string, unknown>;
      }

      // Execute the tool
      const result = await tool.execute(validatedArgs, context);

      // Convert result to MCP content format
      const rawContent = resultToMCPContent(result);
      
      // Convert to text-only content for MCP SDK compatibility
      const content: Array<{ type: 'text'; text: string }> = rawContent.map((item) => {
        if (item.type === 'text') {
          return { type: 'text' as const, text: item.text };
        }
        // Convert other types to text
        return { type: 'text' as const, text: JSON.stringify(item) };
      });

      return { content } as MCPCallToolResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (this.config.logging) {
        console.error(`[MCPServer] Tool ${tool.name} error:`, errorMessage);
      }

      return {
        content: [{ type: 'text' as const, text: `Error: ${errorMessage}` }],
        isError: true,
      } as MCPCallToolResult;
    }
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    if (this.started) {
      throw new Error('Server already started');
    }

    if (this.config.logging) {
      console.log(`[MCPServer] Starting ${this.config.name} v${this.config.version}`);
      console.log(`[MCPServer] Registered tools: ${this.getRegisteredTools().join(', ')}`);
    }

    switch (this.config.transport) {
      case 'stdio': {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        break;
      }

      case 'http':
      case 'sse': {
        // HTTP transport requires Express setup
        // We'll create a simple HTTP handler
        await this.startHttpServer();
        break;
      }

      default:
        throw new Error(`Unknown transport: ${this.config.transport}`);
    }

    this.started = true;

    if (this.config.logging) {
      console.log(`[MCPServer] Server started on ${this.config.transport} transport`);
    }
  }

  /**
   * Start HTTP server for MCP
   */
  private async startHttpServer(): Promise<void> {
    // Dynamic import to avoid requiring express when not using HTTP
    const { createServer } = await import('node:http');
    const { StreamableHTTPServerTransport } = await import(
      '@modelcontextprotocol/sdk/server/streamableHttp.js'
    );

    const port = this.config.port ?? 3000;
    const host = this.config.host ?? 'localhost';

    const httpServer = createServer(async (req, res) => {
      // Handle CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method !== 'POST' || req.url !== '/mcp') {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      // Read request body
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk as Buffer);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString()) as Record<string, unknown>;

      // Create transport for this request
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      // Connect and handle
      await this.server.connect(transport);
      await transport.handleRequest(req, res, body);
    });

    await new Promise<void>((resolve) => {
      httpServer.listen(port, host, () => {
        if (this.config.logging) {
          console.log(`[MCPServer] HTTP server listening on http://${host}:${port}/mcp`);
        }
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    await this.server.close();
    this.started = false;

    if (this.config.logging) {
      console.log('[MCPServer] Server stopped');
    }
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.started;
  }
}

/**
 * Create and start an MCP server with the given tools
 *
 * @example
 * ```typescript
 * await serveMCPTools([calculator, datetime], {
 *   name: 'my-tools',
 *   version: '1.0.0',
 *   transport: 'stdio',
 * });
 * ```
 */
export async function serveMCPTools(
  tools: Tool[],
  config: MCPServerConfig
): Promise<MCPServer> {
  const server = new MCPServer(config);
  server.registerTools(tools);
  await server.start();
  return server;
}
