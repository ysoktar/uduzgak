/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
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

it('TDD 503: IME composition does not invoke the search shortcut', () => {
  render(<App />)
  fireEvent.keyDown(document.body, { key: '/', isComposing: true })
  expect(document.activeElement).not.toBe(screen.getByLabelText('Search tasks'))
})

it('TDD 504: holding the slash key cannot repeatedly seize focus', () => {
  render(<App />)
  fireEvent.keyDown(document.body, { key: '/', repeat: true })
  expect(document.activeElement).not.toBe(screen.getByLabelText('Search tasks'))
})

it('TDD 505: an already-consumed slash event does not steal focus', () => {
  render(<App />)
  const event = new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true })
  event.preventDefault()
  document.body.dispatchEvent(event)
  expect(document.activeElement).not.toBe(screen.getByLabelText('Search tasks'))
})
