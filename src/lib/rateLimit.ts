
interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp (ms)
}

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** 허용 요청 횟수 */
  limit: number;
  /** 윈도우 시간 (초) */
  windowSec: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const { limit, windowSec } = options;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const entry = store.get(key);

  // 윈도우 만료 or 첫 요청
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  // 한도 초과
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  // 카운트 증가
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
