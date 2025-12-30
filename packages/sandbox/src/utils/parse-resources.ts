/**
 * Utilities for parsing resource limits
 */

/**
 * Parse memory string to bytes
 * @example parseMemory('256MB') => 268435456
 */
export function parseMemory(memory: string): number {
  const match = memory.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)?$/i);
  if (!match) {
    throw new Error(`Invalid memory format: ${memory}`);
  }

  const value = parseFloat(match[1]);
  const unit = (match[2] ?? 'B').toUpperCase();

  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };

  return Math.floor(value * multipliers[unit]);
}

/**
 * Parse CPU count to nanoseconds (Docker format)
 * @example parseCpus(0.5) => 500000000
 */
export function cpusToNanoCpus(cpus: number): number {
  return Math.floor(cpus * 1e9);
}
