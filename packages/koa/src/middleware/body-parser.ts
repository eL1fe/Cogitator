import type { Context, Next } from 'koa';

export function createBodyParser() {
  return async (ctx: Context, next: Next) => {
    if (ctx.method === 'POST' && ctx.is('application/json')) {
      const body = await readBody(ctx);
      if (body) {
        (ctx.request as unknown as { body: unknown }).body = JSON.parse(body);
      }
    }
    await next();
  };
}

function readBody(ctx: Context): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    ctx.req.on('data', (chunk: Buffer) => chunks.push(chunk));
    ctx.req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    ctx.req.on('error', reject);
  });
}
