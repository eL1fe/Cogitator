import { NextResponse } from 'next/server';
import { getRedis } from './redis';
import type { AuthenticatedRequest, AuthenticatedRouteHandler } from '@/lib/auth/middleware';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { windowMs, maxRequests } = config;
  const now = Date.now();
  const windowKey = Math.floor(now / windowMs);

  try {
    const redis = await getRedis();

    const redisKey = `ratelimit:${key}:${windowKey}`;

    const countStr = await redis.get(redisKey);
    const count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= maxRequests) {
      const resetAt = (windowKey + 1) * windowMs;
      return {
        success: false,
        remaining: 0,
        resetAt,
      };
    }

    await redis.setex(redisKey, Math.ceil(windowMs / 1000), String(count + 1));

    const resetAt = (windowKey + 1) * windowMs;
    return {
      success: true,
      remaining: maxRequests - count - 1,
      resetAt,
    };
  } catch (error) {
    console.warn('[rate-limit] Redis error, allowing request:', error);

    return {
      success: true,
      remaining: maxRequests,
      resetAt: now + windowMs,
    };
  }
}

function getClientKey(request: AuthenticatedRequest): string {

  if (request.user?.id) {
    return `user:${request.user.id}`;
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  return `ip:${ip}`;
}

export function withRateLimit(
  config: RateLimitConfig,
  handler: AuthenticatedRouteHandler
): AuthenticatedRouteHandler {
  const { keyPrefix = 'default' } = config;

  return async (request, context) => {
    const clientKey = getClientKey(request);
    const rateLimitKey = `${keyPrefix}:${clientKey}`;

    const result = await checkRateLimit(rateLimitKey, config);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
            'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const response = await handler(request, context);

    response.headers.set('X-RateLimit-Limit', String(config.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

    return response;
  };
}

export async function rateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const { keyPrefix = 'default' } = config;

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const clientKey = `ip:${ip}`;
  const rateLimitKey = `${keyPrefix}:${clientKey}`;

  const result = await checkRateLimit(rateLimitKey, config);

  if (!result.success) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
            'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        }
      ),
    };
  }

  return { allowed: true };
}

export const RATE_LIMITS = {

  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'auth',
  },

  playground: {
    windowMs: 60 * 1000,
    maxRequests: 20,
    keyPrefix: 'playground',
  },

  api: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: 'api',
  },

  heavy: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'heavy',
  },
} as const;
