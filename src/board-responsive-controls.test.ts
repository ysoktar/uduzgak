import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
const css = () => readFileSync('src/styles.css', 'utf8')

it('TDD 557: Board drop headings signal movement, not copying', () => {
  expect(css()).toMatch(/\.task-board-heading\[aria-label\]\s*\{[^}]*cursor:\s*move/)
})

it('TDD 558: Board Task cards wrap long text without overflow', () => {
  expect(css()).toMatch(/\.task-board-card\s*\{[^}]*overflow-wrap:\s*anywhere/)
})

it('TDD 559: Board status controls meet touch target height', () => {
  expect(css()).toMatch(/\.task-board-card button\s*\{[^}]*min-height:\s*44px/)
})

it('TDD 560: Board status controls wrap on narrow widths', () => {
  expect(css()).toMatch(/\.task-board-card button\s*\{[^}]*max-width:\s*100%/)
})

it('TDD 561: Board headings break long labels safely', () => {
  expect(css()).toMatch(/\.task-board-heading\s*\{[^}]*overflow-wrap:\s*anywhere/)
})
