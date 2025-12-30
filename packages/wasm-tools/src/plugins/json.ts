/**
 * JSON Processor WASM Plugin
 *
 * This file is compiled to WASM using the Extism JS PDK.
 * It provides safe JSON parsing and basic querying.
 *
 * Build command:
 *   esbuild src/plugins/json.ts -o dist/temp/json.js --bundle --format=cjs --target=es2020
 *   extism-js dist/temp/json.js -o dist/wasm/json.wasm
 */

interface JsonInput {
  json: string;
  query?: string;
}

interface JsonOutput {
  result: unknown;
  type: string;
  error?: string;
}

function getByPath(obj: unknown, path: string): unknown {
  if (!path || path === '$') return obj;

  const parts = path.replace(/^\$\.?/, '').split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    const arrayMatch = /^(\w+)\[(\d+)\]$/.exec(part);
    if (arrayMatch) {
      const [, key, indexStr] = arrayMatch;
      const index = parseInt(indexStr, 10);
      current = (current as Record<string, unknown>)[key];
      if (Array.isArray(current)) {
        current = current[index];
      } else {
        return undefined;
      }
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }

  return current;
}

export function process(): number {
  try {
    const inputStr = Host.inputString();
    const input: JsonInput = JSON.parse(inputStr);

    const parsed = JSON.parse(input.json);
    const result = input.query ? getByPath(parsed, input.query) : parsed;

    const output: JsonOutput = {
      result,
      type: Array.isArray(result) ? 'array' : typeof result,
    };

    Host.outputString(JSON.stringify(output));
    return 0;
  } catch (error) {
    const output: JsonOutput = {
      result: null,
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
    Host.outputString(JSON.stringify(output));
    return 1;
  }
}

declare const Host: {
  inputString(): string;
  outputString(s: string): void;
};
