/**
 * Generic cache implementation with automatic cleanup and size management.
 * 
 * Features:
 * - Automatic cleanup of expired entries
 * - Maximum size limit with LRU-like eviction
 * - Type-safe generic implementation
 * - Configurable TTL (Time To Live)
 * - Cache statistics
 * 
 * @example Basic Usage
 * ```typescript
 * // Create a cache for user data
 * const userCache = new Cache<UserData>();
 * 
 * // Store data
 * userCache.set('user123', { name: 'John', age: 30 });
 * 
 * // Retrieve data
 * const user = userCache.get('user123'); // Returns UserData | undefined
 * ```
 * 
 * @example With Custom Configuration
 * ```typescript
 * // Create a cache with 1 hour TTL and max 1000 entries
 * const cache = new Cache<any>({ 
 *   ttlSeconds: 60 * 60, 
 *   maxSize: 1000 
 * });
 * ```
 * 
 * @example Error Handling
 * ```typescript
 * const cache = new Cache<string>({ maxSize: 2 });
 * 
 * try {
 *   cache.set('key1', 'value1');
 *   cache.set('key2', 'value2');
 *   cache.set('key3', 'value3'); // Throws Error: Cache has reached maximum size
 * } catch (error) {
 *   console.error('Cache error:', error);
 * }
 * ```
 * 
 * @example Monitoring Cache Status
 * ```typescript
 * const stats = cache.getStats();
 * console.log(`Cache size: ${stats.size}`);
 * console.log(`TTL: ${stats.ttlSeconds} seconds`);
 * console.log(`Cache age: ${Date.now() - stats.createdAt}ms`);
 * ```
 */

/** 
 * Represents a single entry in the cache with its data and expiration time.
 */
interface CacheEntry<T> {
  /** The cached data */
  data: T;
  /** Timestamp when this entry expires (milliseconds since epoch) */
  expiresAt: number;
}

/** 
 * Statistics about the cache's current state.
 */
interface CacheStats {
  /** Current number of entries in the cache */
  size: number;
  /** Time-to-live in seconds for cache entries */
  ttlSeconds: number;
  /** Timestamp when the cache was created */
  createdAt: number;
}

export class Cache<T> {
  private store: Map<string, CacheEntry<T>>;
  private ttlMs: number;
  private readonly createdAt: number;
  private readonly maxSize?: number;

  /**
   * Creates a new Cache instance.
   * 
   * @param options - Cache configuration options
   * @param options.ttlSeconds - Time-to-live in seconds for cache entries (default: 7 days)
   * @param options.maxSize - Maximum number of entries allowed in the cache (optional)
   * 
   * @example
   * ```typescript
   * // Cache with default settings (7 days TTL, no size limit)
   * const defaultCache = new Cache<string>();
   * 
   * // Cache with custom TTL and size limit
   * const customCache = new Cache<UserData>({
   *   ttlSeconds: 3600, // 1 hour
   *   maxSize: 1000
   * });
   * ```
   */
  constructor({ 
    ttlSeconds = 7 * 24 * 60 * 60,
    maxSize }: { 
      ttlSeconds?: number; 
      maxSize?: number; 
    } = {}) {
    this.store = new Map();
    this.ttlMs = ttlSeconds * 1000;
    this.createdAt = Date.now();
    this.maxSize = maxSize;
  }

  /**
   * Removes expired entries and enforces size limits.
   * Called automatically before most operations.
   * 
   * @private
   */
  private cleanup(): void {
    const now = Date.now();
    // Remove expired entries
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }

    // Enforce size limits by removing oldest entries if needed
    if (this.maxSize && this.store.size > this.maxSize) {
      const entriesToRemove = this.store.size - this.maxSize;
      const entries = Array.from(this.store.entries())
        .sort(([, a], [, b]) => a.expiresAt - b.expiresAt);
      
      for (let i = 0; i < entriesToRemove; i++) {
        this.store.delete(entries[i][0]);
      }
    }
  }

  /**
   * Stores a value in the cache.
   * 
   * @param key - Unique identifier for the cached item
   * @param value - Data to store
   * @throws {Error} If cache has reached maximum size
   * 
   * @example
   * ```typescript
   * const cache = new Cache<UserData>();
   * try {
   *   cache.set('user123', { id: 123, name: 'John' });
   * } catch (error) {
   *   console.error('Failed to cache user data:', error);
   * }
   * ```
   */
  set(key: string, value: T): void {
    this.cleanup();
    
    if (this.maxSize && this.store.size >= this.maxSize && !this.store.has(key)) {
      throw new Error('Cache has reached maximum size');
    }

    this.store.set(key, {
      data: value,
      expiresAt: Date.now() + this.ttlMs
    });
  }

  /**
   * Retrieves a value from the cache.
   * 
   * @param key - Identifier of the cached item
   * @returns The cached value if found and not expired, undefined otherwise
   * 
   * @example
   * ```typescript
   * const userData = cache.get('user123');
   * if (userData) {
   *   console.log('User found:', userData);
   * } else {
   *   console.log('User not in cache');
   * }
   * ```
   */
  get(key: string): T | undefined {
    this.cleanup();
    const entry = this.store.get(key);
    
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    
    if (entry) {
      this.store.delete(key);
    }
    
    return undefined;
  }

  /**
   * Checks if a key exists in the cache and is not expired.
   * 
   * @param key - Key to check
   * @returns true if the key exists and is not expired
   */
  has(key: string): boolean {
    this.cleanup();
    const entry = this.store.get(key);
    return entry !== undefined && entry.expiresAt > Date.now();
  }

  /**
   * Removes an item from the cache.
   * 
   * @param key - Key to remove
   * @returns true if an item was removed
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Removes all items from the cache.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Returns all valid (not expired) entries in the cache.
   * 
   * @returns Map of all valid entries
   * 
   * @example
   * ```typescript
   * const allUsers = cache.getAll();
   * allUsers.forEach((userData, userId) => {
   *   console.log(`User ${userId}:`, userData);
   * });
   * ```
   */
  getAll(): Map<string, T> {
    this.cleanup();
    const validEntries = new Map<string, T>();
    this.store.forEach((entry, key) => {
      if (entry.expiresAt > Date.now()) {
        validEntries.set(key, entry.data);
      }
    });
    return validEntries;
  }

  /**
   * Returns current cache statistics.
   * 
   * @returns Object containing cache statistics
   * 
   * @example
   * ```typescript
   * const stats = cache.getStats();
   * console.log(`Cache contains ${stats.size} items`);
   * console.log(`Cache TTL: ${stats.ttlSeconds} seconds`);
   * console.log(`Cache age: ${Date.now() - stats.createdAt}ms`);
   * ```
   */
  getStats(): CacheStats {
    this.cleanup();
    return {
      size: this.store.size,
      ttlSeconds: this.ttlMs / 1000,
      createdAt: this.createdAt
    };
  }
} 