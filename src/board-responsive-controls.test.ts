import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
const css = () => readFileSync('src/styles.css', 'utf8')

it('TDD 557: Board drop headings signal movement, not copying', () => {
  expect(css()).toMatch(/\.task-board-heading\[aria-label\]\s*\{[^}]*cursor:\s*move/)
})

it('TDD 558: Board Task cards wrap long text without overflow', () => {
  expect(css()).toMatch(/\.task-board-card\s*\{[^}]*overflow-wrap:\s*anywhere/)
})
