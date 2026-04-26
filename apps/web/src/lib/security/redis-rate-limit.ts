import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      })
    : null;

export async function checkRedisRateLimit(params: {
  key: string;
  limit: number;
  windowSeconds: number;
}) {
  if (!redis) {
    return {
      allowed: true,
      remaining: params.limit,
      resetAt: Date.now() + params.windowSeconds * 1000,
      fallback: true
    };
  }

  const current = await redis.incr(params.key);

  if (current === 1) {
    await redis.expire(params.key, params.windowSeconds);
  }

  const ttl = await redis.ttl(params.key);
  const resetAt = Date.now() + Math.max(ttl, 0) * 1000;

  return {
    allowed: current <= params.limit,
    remaining: Math.max(0, params.limit - current),
    resetAt,
    fallback: false
  };
}
