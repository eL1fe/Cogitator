/**
 * Calculator WASM Plugin
 *
 * This file is compiled to WASM using the Extism JS PDK.
 * It provides safe mathematical expression evaluation.
 *
 * Build command:
 *   esbuild src/plugins/calc.ts -o dist/temp/calc.js --bundle --format=cjs --target=es2020
 *   extism-js dist/temp/calc.js -o dist/wasm/calc.wasm
 */

interface CalcInput {
  expression: string;
}

interface CalcOutput {
  result: number;
  expression: string;
  error?: string;
}

function safeEval(expression: string): number {
  const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');

  if (sanitized !== expression.trim()) {
    throw new Error('Invalid characters in expression');
  }

  const tokens = sanitized.match(/(\d+\.?\d*|[+\-*/()%])/g);
  if (!tokens) {
    throw new Error('No valid tokens in expression');
  }

  let result = 0;
  let currentNumber = '';
  let operator = '+';
  const stack: number[] = [];

  for (let i = 0; i <= tokens.length; i++) {
    const token = tokens[i];

    if (token && /\d/.test(token)) {
      currentNumber = token;
    } else {
      const num = parseFloat(currentNumber) || 0;

      if (operator === '+') {
        stack.push(num);
      } else if (operator === '-') {
        stack.push(-num);
      } else if (operator === '*') {
        const prev = stack.pop() || 0;
        stack.push(prev * num);
      } else if (operator === '/') {
        const prev = stack.pop() || 0;
        if (num === 0) throw new Error('Division by zero');
        stack.push(prev / num);
      } else if (operator === '%') {
        const prev = stack.pop() || 0;
        stack.push(prev % num);
      }

      operator = token || '+';
      currentNumber = '';
    }
  }

  result = stack.reduce((a, b) => a + b, 0);
  return result;
}

export function calculate(): number {
  try {
    const inputStr = Host.inputString();
    const input: CalcInput = JSON.parse(inputStr);

    const result = safeEval(input.expression);

    const output: CalcOutput = {
      result,
      expression: input.expression,
    };

    Host.outputString(JSON.stringify(output));
    return 0;
  } catch (error) {
    const output: CalcOutput = {
      result: NaN,
      expression: '',
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
