/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { App } from './App'

it('TDD 502: shortcut selects existing Task search text for immediate replacement', async () => {
  const user = userEvent.setup()
  render(<App />)
  const search = screen.getByLabelText('Search tasks') as HTMLInputElement
  await user.type(search, 'Alpha')
  await user.tab()
  await user.keyboard('{Control>}k{/Control}')
  expect(document.activeElement).toBe(search)
  expect(search.selectionStart).toBe(0)
  expect(search.selectionEnd).toBe(search.value.length)
})
