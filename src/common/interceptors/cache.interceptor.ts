import { InterceptorInterface } from './interceptor.interface';
import { AnxietyRequest, AnxietyResponse } from '../../middleware/interfaces/middleware.interface';

/**
 * Cache configuration options
 */
export type CacheOptions = {
  /** Cache TTL in milliseconds */
  ttl?: number;
  /** Maximum cache size */
  maxSize?: number;
  /** Cache key generator function */
  keyGenerator?: (req: AnxietyRequest) => string;
  /** Exclude certain status codes from caching */
  excludeStatusCodes?: number[];
  /** Only cache specific HTTP methods */
  allowedMethods?: string[];
}

/**
 * Cache entry structure
 */
type CacheEntry = {
  data: any;
  timestamp: number;
  ttl: number;
}

/**
 * Cache Interceptor
 * Provides in-memory caching for response data
 */
export class CacheInterceptor implements InterceptorInterface {
  private cache = new Map<string, CacheEntry>();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 60000, // 1 minute default
      maxSize: 100,
      keyGenerator: this.defaultKeyGenerator.bind(this),
      excludeStatusCodes: [4, 5], // Exclude 4xx and 5xx status codes
      allowedMethods: ['GET', 'HEAD'],
      ...options
    };

    // Cleanup expired entries periodically
    setInterval(() => this.cleanupExpiredEntries(), this.options.ttl);
  }

  async intercept(
    req: AnxietyRequest,
    res: AnxietyResponse,
    _next: () => void,
    handler: () => any
  ): Promise<any> {
    const method = req.method.toUpperCase();
    
    // Only cache allowed methods
    if (!this.options.allowedMethods.includes(method)) {
      return handler();
    }

    const cacheKey = this.options.keyGenerator(req);
    
    // Check if we have a valid cached entry
    const cachedEntry = this.getCachedEntry(cacheKey);
    if (cachedEntry) {
      // Add cache headers
      res.set({
        'X-Cache': 'HIT',
        'X-Cache-Key': cacheKey,
        'Cache-Control': `max-age=${Math.floor((cachedEntry.timestamp + cachedEntry.ttl - Date.now()) / 1000)}`
      });
      
      res.json(cachedEntry.data);
      return cachedEntry.data;
    }

    // Execute handler
    const result = await handler();
    
    // Don't cache if response was already sent or if it's an excluded status code
    if (res.headersSent || this.shouldExcludeFromCache(res.statusCode)) {
      return result;
    }

    // Cache the result
    this.setCachedEntry(cacheKey, result);
    
    // Add cache headers
    res.set({
      'X-Cache': 'MISS',
      'X-Cache-Key': cacheKey,
      'Cache-Control': `max-age=${Math.floor(this.options.ttl / 1000)}`
    });

    return result;
  }

  /**
   * Get cached entry if valid
   */
  private getCachedEntry(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Set cached entry
   */
  private setCachedEntry(key: string, data: any): void {
    // Ensure cache doesn't exceed max size
    if (this.cache.size >= this.options.maxSize) {
      // Remove oldest entry (simple LRU)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry = {
      data: data,
      timestamp: Date.now(),
      ttl: this.options.ttl
    };

    this.cache.set(key, entry);
  }

  /**
   * Default cache key generator
   */
  private defaultKeyGenerator(req: AnxietyRequest): string {
    const { method, originalUrl, headers } = req;
    
    // Include relevant headers that might affect the response
    const relevantHeaders = {
      'accept': headers.accept,
      'accept-language': headers['accept-language'],
      'authorization': headers.authorization ? 'authenticated' : 'anonymous'
    };
    
    return `${method}:${originalUrl}:${JSON.stringify(relevantHeaders)}`;
  }

  /**
   * Check if status code should be excluded from cache
   */
  private shouldExcludeFromCache(statusCode: number): boolean {
    return this.options.excludeStatusCodes.some(excludeCode => {
      if (typeof excludeCode === 'number' && excludeCode < 10) {
        // Single digit means exclude entire status class (e.g., 4 means 4xx)
        return Math.floor(statusCode / 100) === excludeCode;
      }
      return statusCode === excludeCode;
    });
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}