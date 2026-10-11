/**
 * Defensive Security Utilities for EYEVENGERS
 * Provides sliding-window rate limiting and concurrency locks
 * to protect authentication routes, sensitive operations, and game rewards.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale rate limits every 5 minutes to avoid memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Check and increment rate limit for a specific key (IP, User ID, Mobile)
 * @param key Unique identifier for the rate limit (e.g. `login:192.168.1.1` or `play:usr-123`)
 * @param maxRequests Maximum allowed requests in the window
 * @param windowMs Time window in milliseconds
 * @returns { allowed: boolean, remaining: number, resetInSeconds: number }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetInSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}

/**
 * Get client IP address from standard proxy/CDN request headers
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}

/**
 * In-memory concurrency lock to prevent race-condition exploits during reward allocation.
 * If a malicious user attempts to send 20 parallel requests to `/api/games/play` within
 * the same millisecond to bypass play limits, this lock guarantees only ONE request executes.
 */
const activePlayLocks = new Set<string>();

export function acquirePlayLock(identifier: string): boolean {
  if (activePlayLocks.has(identifier)) {
    return false; // Already processing an active play request for this user
  }
  activePlayLocks.add(identifier);
  return true;
}

export function releasePlayLock(identifier: string): void {
  activePlayLocks.delete(identifier);
}
