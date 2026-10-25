/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { App } from './App'

it('TDD 497: Control+K focuses Task search', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.keyboard('{Control>}k{/Control}')
  expect(document.activeElement).toBe(screen.getByLabelText('Search tasks'))
})

it('TDD 498: Meta+K focuses Task search', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.keyboard('{Meta>}k{/Meta}')
  expect(document.activeElement).toBe(screen.getByLabelText('Search tasks'))
})

it('TDD 499: Control+K works when a project selector has focus', async () => {
  const user = userEvent.setup()
  render(<App />)
  const projectPicker = screen.getByLabelText('View project')
  await user.click(projectPicker)
  expect(document.activeElement).toBe(projectPicker)
  await user.keyboard('{Control>}k{/Control}')
  expect(document.activeElement).toBe(screen.getByLabelText('Search tasks'))
})

it('TDD 500: Escape blurs an already-empty Task search', async () => {
  const user = userEvent.setup()
  render(<App />)
  const search = screen.getByLabelText('Search tasks')
  await user.click(search)
  expect(document.activeElement).toBe(search)
  await user.keyboard('{Escape}')
  expect(document.activeElement).not.toBe(search)
})

it('TDD 501: search advertises its Ctrl+K and Meta+K alternatives', () => {
  render(<App />)
  const search = screen.getByLabelText('Search tasks')
  expect(search.getAttribute('aria-keyshortcuts')).toContain('Control+K')
  expect(search.getAttribute('aria-keyshortcuts')).toContain('Meta+K')
  expect(screen.getByText('Or use Ctrl+K / Cmd+K')).toBeTruthy()
})
