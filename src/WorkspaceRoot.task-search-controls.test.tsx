/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { App } from './App'

it('TDD 507: Clear search control removes the Task query', async () => {
  const user = userEvent.setup()
  render(<App />)
  const search = screen.getByLabelText('Search tasks') as HTMLInputElement
  await user.type(search, 'Alpha')
  await user.click(screen.getByRole('button', { name: 'Clear task search' }))
  expect(search.value).toBe('')
})

it('TDD 508: Clear search is disabled for an empty query', () => {
  render(<App />)
  const clear = screen.getByRole('button', { name: 'Clear task search' }) as HTMLButtonElement
  expect(clear.disabled).toBe(true)
})

it('TDD 509: clearing the query returns focus to Task search', async () => {
  const user = userEvent.setup()
  render(<App />)
  const search = screen.getByLabelText('Search tasks') as HTMLInputElement
  await user.type(search, 'Alpha')
  await user.click(screen.getByRole('button', { name: 'Clear task search' }))
  expect(document.activeElement).toBe(search)
})

it('TDD 510: Task search exposes its input search semantics', () => {
  render(<App />)
  const search = screen.getByLabelText('Search tasks') as HTMLInputElement
  expect(search.type).toBe('search')
})

it('TDD 511: mobile keyboard advertises a search submit action', () => {
  render(<App />)
  const search = screen.getByLabelText('Search tasks')
  expect(search.getAttribute('enterkeyhint')).toBe('search')
})
