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
