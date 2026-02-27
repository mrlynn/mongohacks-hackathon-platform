/**
 * Simple in-memory rate limiter for chat API.
 * Tracks message counts per session with a sliding window.
 */

const MAX_MESSAGES_PER_MINUTE = 20;
const WINDOW_MS = 60_000;

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean up stale entries (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      entry.timestamps = entry.timestamps.filter(
        (t) => now - t < WINDOW_MS
      );
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    });
  }, 5 * 60_000);
}

/**
 * Check and consume a rate limit token for the given session.
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export function checkRateLimit(sessionId: string): {
  allowed: boolean;
  retryAfterMs?: number;
  remaining?: number;
} {
  const now = Date.now();
  let entry = store.get(sessionId);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(sessionId, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_MESSAGES_PER_MINUTE) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = WINDOW_MS - (now - oldest);
    return { allowed: false, retryAfterMs };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: MAX_MESSAGES_PER_MINUTE - entry.timestamps.length,
  };
}
