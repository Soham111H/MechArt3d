/**
 * src/lib/security/rate-limit.ts
 * Sliding-window in-memory rate limiter — no external service needed.
 * Works per-IP or per-user-identifier.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up entries older than 1 hour periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - 60 * 60 * 1000;
    for (const [key, entry] of Array.from(store.entries())) {
      entry.timestamps = entry.timestamps.filter((t: number) => t > cutoff);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

// Check environment variables
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = !!(redisUrl && redisToken);

// Startup log for developers
if (typeof window === "undefined") {
  console.log(`[RateLimiter] Active backend: ${useRedis ? 'Upstash Redis' : 'In-Memory Map (Fallback)'}`);
}

const redis = useRedis ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Cache limiters so we don't recreate them every request
const ratelimiters = new Map<string, Ratelimit>();

function getRedisLimiter(limit: number, windowMs: number): Ratelimit {
  const key = `${limit}_${windowMs}`;
  if (!ratelimiters.has(key)) {
    ratelimiters.set(
      key,
      new Ratelimit({
        redis: redis!,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
        analytics: true,
      })
    );
  }
  return ratelimiters.get(key)!;
}

/**
 * Check if a key has exceeded the rate limit.
 * @param key     - unique identifier (e.g. IP, email, userId)
 * @param limit   - max requests allowed in window
 * @param windowMs - time window in milliseconds
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 */
export async function rateLimit(key: string, limit: number, windowMs: number) {
  if (useRedis) {
    try {
      const limiter = getRedisLimiter(limit, windowMs);
      const { success, remaining, reset } = await limiter.limit(key);
      return { allowed: success, remaining, resetAt: reset };
    } catch (error) {
      console.warn('[RateLimiter] Redis failed, falling back to memory', error);
      // Fall through to memory if Redis is down
    }
  }

  // --- In-Memory Fallback ---
  const now = Date.now();
  const cutoff = now - windowMs;

  if (!store.has(key)) {
    store.set(key, { timestamps: [] });
  }

  const entry = store.get(key)!;

  // Remove timestamps outside window
  entry.timestamps = entry.timestamps.filter(t => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldestInWindow = entry.timestamps[0];
    const resetAt = oldestInWindow + windowMs;
    return { allowed: false, remaining: 0, resetAt };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    resetAt: now + windowMs,
  };
}

/** Pre-configured rate limiters for common routes */
export const limits = {
  login:           { limit: 10,  windowMs: 15 * 60 * 1000 },   // 10/15min
  register:        { limit: 5,   windowMs: 60 * 60 * 1000 },   // 5/hour
  forgotPassword:  { limit: 3,   windowMs: 60 * 60 * 1000 },   // 3/hour
  sendOtp:         { limit: 3,   windowMs: 10 * 60 * 1000 },   // 3/10min
  contact:         { limit: 5,   windowMs: 60 * 60 * 1000 },   // 5/hour
  newsletter:      { limit: 3,   windowMs: 60 * 60 * 1000 },   // 3/hour
  api:             { limit: 100, windowMs: 60 * 1000 },         // 100/min
  admin:           { limit: 200, windowMs: 60 * 1000 },         // 200/min
  review:          { limit: 10,  windowMs: 60 * 60 * 1000 },   // 10/hour
};

/** Helper to extract IP from NextRequest */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
