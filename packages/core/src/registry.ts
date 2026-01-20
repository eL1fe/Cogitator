import type { Tool, ToolSchema } from '@cogitator-ai/types';
import { toolToSchema } from './tool';

/**
 * Registry for managing and organizing tools available to agents.
 *
 * ToolRegistry provides a centralized store for tools with
 * lookup, registration, and schema generation capabilities.
 *
 * @example
 * ```ts
 * import { ToolRegistry, tool } from '@cogitator-ai/core';
 * import { z } from 'zod';
 *
 * const registry = new ToolRegistry();
 *
 * registry.register(tool({
 *   name: 'calculator',
 *   description: 'Perform math operations',
 *   parameters: z.object({ expression: z.string() }),
 *   execute: async ({ expression }) => eval(expression),
 * }));
 *
 * const schemas = registry.getSchemas(); // For LLM function calling
 * const calc = registry.get('calculator'); // Get tool by name
 * ```
 */
export class ToolRegistry {
  private tools = new Map<string, Tool>();

  /**
   * Register a single tool in the registry.
   * If a tool with the same name exists, it will be replaced.
   *
   * @param tool - Tool to register
   */
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Register multiple tools at once.
   *
   * @param tools - Array of tools to register
   */
  registerMany(tools: Tool[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * Get a tool by its name.
   *
   * @param name - Name of the tool to retrieve
   * @returns The tool if found, undefined otherwise
   */
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool with the given name exists in the registry.
   *
   * @param name - Name of the tool to check
   * @returns true if the tool exists
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all registered tools.
   *
   * @returns Array of all tools in the registry
   */
  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get JSON schemas for all tools (for LLM function calling).
   *
   * @returns Array of tool schemas in OpenAPI format
   */
  getSchemas(): ToolSchema[] {
    return this.getAll().map(toolToSchema);
  }

  /**
   * Get names of all registered tools.
   *
   * @returns Array of tool names
   */
  getNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Remove all tools from the registry.
   */
  clear(): void {
    this.tools.clear();
  }
}
