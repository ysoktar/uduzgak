import { expect, it } from 'vitest'
import { createRelayRateLimiter } from './ephemeral-relay.mjs'
it('TDD 787: repeated requests exhaust a bounded room quota', () => {
 const limiter=createRelayRateLimiter({maxRequests:2})
 expect(limiter.allow('a')).toBe(true)
 expect(limiter.allow('a')).toBe(true)
 expect(limiter.allow('a')).toBe(false)
})
it('TDD 788: the quota resets only after the complete time window', () => {
 let now=100
 const limiter=createRelayRateLimiter({maxRequests:1,windowMs:100,now:()=>now})
 expect(limiter.allow('a')).toBe(true)
 now=199
 expect(limiter.allow('a')).toBe(false)
 now=200
 expect(limiter.allow('a')).toBe(true)
})
it('TDD 789: one room cannot exhaust another room quota', () => {
 const limiter=createRelayRateLimiter({maxRequests:1})
 expect(limiter.allow('a')).toBe(true)
 expect(limiter.allow('a')).toBe(false)
 expect(limiter.allow('b')).toBe(true)
})
it('TDD 790: the limiter bounds memory used by tracking new rooms', () => {
 const limiter=createRelayRateLimiter({maxRequests:1,maxBuckets:1})
 expect(limiter.allow('a')).toBe(true)
 expect(limiter.allow('b')).toBe(false)
 expect(limiter.stats().buckets).toBe(1)
})
it('TDD 791: invalid quota configuration is rejected immediately', () => {
 expect(()=>createRelayRateLimiter({maxRequests:0})).toThrow('Invalid relay rate limits')
 expect(()=>createRelayRateLimiter({windowMs:-1})).toThrow('Invalid relay rate limits')
})
