export async function waitFor<T>(
  condition: () => T | Promise<T>,
  options?: { timeout?: number; interval?: number }
): Promise<T> {
  const timeout = options?.timeout ?? 5000;
  const interval = options?.interval ?? 50;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`waitFor timed out after ${timeout}ms`);
}

export async function eventually(
  assertion: () => void | Promise<void>,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  const timeout = options?.timeout ?? 5000;
  const interval = options?.interval ?? 50;
  const startTime = Date.now();
  let lastError: Error | undefined;

  while (Date.now() - startTime < timeout) {
    try {
      await assertion();
      return;
    } catch (error) {
      lastError = error as Error;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw lastError ?? new Error(`eventually timed out after ${timeout}ms`);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeoutPromise]);
}
