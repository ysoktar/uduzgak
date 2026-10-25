/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { App } from './App'

it('TDD 492: slash focuses Task search from the Workspace surface', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.keyboard('/')
  expect(document.activeElement).toBe(screen.getByLabelText('Search tasks'))
})

it('TDD 493: slash typed in an editable field does not steal focus', async () => {
  const user = userEvent.setup()
  render(<App />)
  const search = screen.getByLabelText('Search tasks') as HTMLInputElement
  await user.click(search)
  await user.keyboard('/')
  expect(document.activeElement).toBe(search)
  expect(search.value).toBe('/')
})
