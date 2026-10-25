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
