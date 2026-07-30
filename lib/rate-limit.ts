import { LRUCache } from 'lru-cache'

type RateLimitContext = {
  id: string
  limit: number
  windowMs: number
}

// Global cache instance (persists across requests in Server Actions Node.js environment)
const rateLimitCache = new LRUCache<string, number>({
  max: 500, // Maximum number of IPs/Users to track
  ttl: 60000, // Default TTL 1 minute
})

export async function rateLimit(context: RateLimitContext): Promise<{ success: boolean }> {
  const { id, limit, windowMs } = context
  
  const currentCount = rateLimitCache.get(id) || 0
  
  if (currentCount >= limit) {
    return { success: false }
  }
  
  rateLimitCache.set(id, currentCount + 1, { ttl: windowMs })
  return { success: true }
}
