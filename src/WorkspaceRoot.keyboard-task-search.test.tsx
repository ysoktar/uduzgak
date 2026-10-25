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

it('TDD 494: slash from the app heading focuses Task search', async () => {
  const user = userEvent.setup()
  render(<App />)
  const heading = screen.getByRole('heading', { name: 'uduzgak' })
  await user.click(heading)
  await user.keyboard('/')
  expect(document.activeElement).toBe(screen.getByLabelText('Search tasks'))
})

it('TDD 495: slash reopens collapsed filters before focusing search', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: 'Hide task filters' }))
  expect(document.getElementById('workspace-filters')?.hidden).toBe(true)
  await user.click(screen.getByRole('heading', { name: 'uduzgak' }))
  await user.keyboard('/')
  expect(document.getElementById('workspace-filters')?.hidden).toBe(false)
  expect(document.activeElement).toBe(screen.getByLabelText('Search tasks'))
})

it('TDD 496: the Task search advertises its slash keyboard shortcut', () => {
  render(<App />)
  const search = screen.getByLabelText('Search tasks')
  expect(search.getAttribute('aria-keyshortcuts')).toBe('/')
  expect(screen.getByText('Press / to search tasks')).toBeTruthy()
})
