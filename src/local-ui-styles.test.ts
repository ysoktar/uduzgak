import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

describe('local workspace styling contracts', () => {
  it('reveals the skip link on keyboard focus and marks focused controls', () => {
    expect(css).toMatch(/\.skip-link:focus-visible\s*\{/)
    expect(css).toMatch(/:focus-visible\s*\{/)
    expect(css).toContain('outline-offset:')
  })  it('keeps workspace controls readable on narrow screens and respects reduced motion', () => {
    expect(css).toContain('@media (max-width: 600px)')
    expect(css).toContain('overflow-wrap: anywhere')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
  })

})
