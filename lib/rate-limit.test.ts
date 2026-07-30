import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimit } from './rate-limit'

describe('Rate Limiter', () => {
  it('should allow requests under the limit', async () => {
    const context = { id: 'test-user', limit: 2, windowMs: 1000 }
    
    const req1 = await rateLimit(context)
    expect(req1.success).toBe(true)
    
    const req2 = await rateLimit(context)
    expect(req2.success).toBe(true)
  })

  it('should block requests over the limit', async () => {
    const context = { id: 'test-user-2', limit: 2, windowMs: 1000 }
    
    await rateLimit(context)
    await rateLimit(context)
    
    // Third request should be blocked
    const req3 = await rateLimit(context)
    expect(req3.success).toBe(false)
  })
})
