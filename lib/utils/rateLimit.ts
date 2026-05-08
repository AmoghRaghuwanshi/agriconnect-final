/**
 * In-memory rate limiter.
 * Key = `${identifier}:${action}` — tracks attempts per window.
 * Returns true if BLOCKED, false if allowed.
 *
 * Used for: OTP requests (5 per 10 min per phone number)
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  action: string,
  maxAttempts: number,
  windowSeconds: number
): boolean {
  const key = `${identifier}:${action}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return false; // allowed
  }

  if (entry.count >= maxAttempts) {
    return true; // blocked
  }

  entry.count++;
  return false; // allowed
}

/** For testing only — clears all rate limit entries */
export function clearRateLimitForTesting(): void {
  store.clear();
}
