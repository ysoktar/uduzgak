/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { StorageConnectionPanel } from './StorageConnectionPanel'

it('TDD 742: local-only mode is the default and requires no credentials', () => {
  render(<StorageConnectionPanel onCheck={vi.fn()} />)
  expect((screen.getByRole('radio', { name: 'This device only' }) as HTMLInputElement).checked).toBe(true)
  expect(screen.queryByLabelText('Server URL')).toBeNull()
})
it('TDD 743: self-hosted mode offers URL and in-memory access token', () => {
  render(<StorageConnectionPanel onCheck={vi.fn()} />)
  fireEvent.click(screen.getByRole('radio', { name: 'My server' }))
  expect(screen.getByLabelText('Server URL')).toBeTruthy()
  expect((screen.getByLabelText('Access token') as HTMLInputElement).type).toBe('password')
})
it('TDD 744: test connection forwards settings without storing credentials', () => {
  const onCheck = vi.fn(async () => ({ storage: 'couchdb' }))
  render(<StorageConnectionPanel onCheck={onCheck} />)
  fireEvent.click(screen.getByRole('radio', { name: 'My server' }))
  fireEvent.change(screen.getByLabelText('Server URL'), { target: { value: 'https://sync.example.org' } })
  fireEvent.change(screen.getByLabelText('Access token'), { target: { value: 'secret' } })
  fireEvent.click(screen.getByRole('button', { name: 'Test connection' }))
  expect(onCheck).toHaveBeenCalledWith('https://sync.example.org', 'secret')
})
it('TDD 745: switching back to local mode clears the sensitive token field', () => {
  render(<StorageConnectionPanel onCheck={vi.fn()} />)
  fireEvent.click(screen.getByRole('radio', { name: 'My server' }))
  fireEvent.change(screen.getByLabelText('Access token'), { target: { value: 'secret' } })
  fireEvent.click(screen.getByRole('radio', { name: 'This device only' }))
  fireEvent.click(screen.getByRole('radio', { name: 'My server' }))
  expect((screen.getByLabelText('Access token') as HTMLInputElement).value).toBe('')
})
it('TDD 746: self-hosted mode is identified as a connection test, not completed sync', () => {
  render(<StorageConnectionPanel onCheck={vi.fn()} />)
  fireEvent.click(screen.getByRole('radio', { name: 'My server' }))
  expect(screen.getByText(/Connection test only/)).toBeTruthy()
})
