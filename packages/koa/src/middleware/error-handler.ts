import type { Context, Next } from 'koa';
import { CogitatorError, ERROR_STATUS_CODES, ErrorCode } from '@cogitator-ai/types';

export function createErrorHandler() {
  return async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (err) {
      if (CogitatorError.isCogitatorError(err)) {
        ctx.status = ERROR_STATUS_CODES[err.code] || 500;
        ctx.body = {
          error: {
            message: err.message,
            code: err.code,
          },
        };
        return;
      }

      console.error('[CogitatorKoa] Unhandled error:', err);

      ctx.status = 500;
      ctx.body = {
        error: {
          message: 'Internal server error',
          code: ErrorCode.INTERNAL_ERROR,
        },
      };
    }
  };
}
