import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

it('TDD 712: workspace visual tokens are centralized', () => {
  expect(css).toContain('--workspace-surface:')
  expect(css).toContain('--workspace-border:')
})
it('TDD 713: application surface has a constrained responsive width', () => {
  expect(css).toMatch(/\.workspace-app-header h1\s*\{[^}]*max-width:/s)
})
it('TDD 714: panel controls allow narrow-screen wrapping', () => {
  expect(css).toContain('.workspace-section-nav a')
  expect(css).toContain('flex-wrap: wrap')
})
it('TDD 715: interactive controls meet minimum touch target size', () => {
  expect(css).toMatch(/\.workspace-data-toolbar-actions button,\s*\.workspace-section-nav a\s*\{[^}]*min-height: 44px/s)
})
it('TDD 716: scrollable tables remain usable on narrow screens', () => {
  expect(css).toMatch(/@media \(max-width: 720px\)[\s\S]*?\.task-table-details\s*\{[^}]*overflow-x: auto/s)
})
