import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

describe('local workspace styling contracts', () => {
  it('reveals the skip link on keyboard focus and marks focused controls', () => {
    expect(css).toMatch(/\.skip-link:focus-visible\s*\{/)
    expect(css).toMatch(/:focus-visible\s*\{/)
    expect(css).toContain('outline-offset:')
  })
})
