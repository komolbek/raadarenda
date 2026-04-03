import { Injectable } from '@nestjs/common';

interface RateLimitEntry {
  timestamps: number[];
}

@Injectable()
export class RateLimitService {
  private stores = new Map<string, Map<string, RateLimitEntry>>();

  private getStore(namespace: string): Map<string, RateLimitEntry> {
    let store = this.stores.get(namespace);
    if (!store) {
      store = new Map();
      this.stores.set(namespace, store);
    }
    return store;
  }

  check(
    namespace: string,
    key: string,
    maxRequests: number,
    windowMs: number,
  ): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const store = this.getStore(namespace);
    const now = Date.now();
    const windowStart = now - windowMs;

    let entry = store.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      store.set(key, entry);
    }

    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

    if (entry.timestamps.length >= maxRequests) {
      const oldestInWindow = entry.timestamps[0];
      const retryAfterMs = oldestInWindow + windowMs - now;
      return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, retryAfterMs) };
    }

    entry.timestamps.push(now);
    return {
      allowed: true,
      remaining: maxRequests - entry.timestamps.length,
      retryAfterMs: 0,
    };
  }
}
