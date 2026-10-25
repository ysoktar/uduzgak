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
