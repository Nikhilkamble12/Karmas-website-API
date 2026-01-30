// ============================================================================
// FILE: server/websocket/managers/RateLimiter.js
// ============================================================================
export class RateLimiter {
  constructor(options = {}) {
    this.tokensPerInterval = options.tokensPerInterval || 100;
    this.interval = options.interval || 60000;
    this.buckets = new Map();
    this.cleanupInterval = options.cleanupInterval || 300000;
    
    // Auto-cleanup
    this.cleanupTimer = setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  consume(userId, tokens = 1) {
    const now = Date.now();
    let bucket = this.buckets.get(userId);

    if (!bucket) {
      bucket = {
        tokens: this.tokensPerInterval - tokens,
        lastRefill: now
      };
      this.buckets.set(userId, bucket);
      return { allowed: true, remaining: bucket.tokens };
    }

    const timePassed = now - bucket.lastRefill;
    const refillTokens = Math.floor((timePassed / this.interval) * this.tokensPerInterval);
    
    if (refillTokens > 0) {
      bucket.tokens = Math.min(this.tokensPerInterval, bucket.tokens + refillTokens);
      bucket.lastRefill = now;
    }

    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      return { allowed: true, remaining: bucket.tokens };
    }

    return { allowed: false, remaining: 0, retryAfter: this.interval - timePassed };
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [userId, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > this.interval * 2) {
        this.buckets.delete(userId);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  destroy() {
    clearInterval(this.cleanupTimer);
    this.buckets.clear();
  }
}