const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

class InMemoryCache {
  constructor({ defaultTtlMs = DEFAULT_TTL_MS } = {}) {
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map(); // key -> { expiresAt, value }
    this.inflight = new Map(); // key -> Promise
  }

  _now() {
    return Date.now();
  }

  _isExpired(entry) {
    return !entry || entry.expiresAt <= this._now();
  }

  _pruneKey(key) {
    const entry = this.store.get(key);
    if (this._isExpired(entry)) {
      this.store.delete(key);
      return true;
    }
    return false;
  }

  get(key) {
    const entry = this.store.get(key);
    if (this._isExpired(entry)) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    const expiresAt = this._now() + (Number(ttlMs) || this.defaultTtlMs);
    this.store.set(key, { value, expiresAt });
    return value;
  }

  /**
   * Request coalescing + caching wrapper.
   * - If cached: returns cached value.
   * - If in-flight: returns the same promise.
   * - Else: executes fn, caches the resolved value, coalesces concurrent callers.
   */
  wrap(key, fn, ttlMs = this.defaultTtlMs) {
    const cached = this.get(key);
    if (cached !== null) return Promise.resolve(cached);

    const existing = this.inflight.get(key);
    if (existing) return existing;

    const p = Promise.resolve()
      .then(fn)
      .then((value) => {
        this.set(key, value, ttlMs);
        return value;
      })
      .finally(() => {
        this.inflight.delete(key);
        this._pruneKey(key);
      });

    this.inflight.set(key, p);
    return p;
  }
}

module.exports = new InMemoryCache();

