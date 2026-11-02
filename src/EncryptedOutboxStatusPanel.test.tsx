/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { EncryptedOutboxStatusPanel } from './EncryptedOutboxStatusPanel'

const room = 'a'.repeat(64)
const other = 'b'.repeat(64)
const inspect = () => screen.getByRole('button', { name: 'Check local encrypted queue' }) as HTMLButtonElement

it('TDD 917: inspecting the queue is opt-in and unavailable for invalid room IDs', () => {
  const onInspect = vi.fn(async () => ({ pending: 0 }))
  const { rerender } = render(<EncryptedOutboxStatusPanel room="invalid" onInspect={onInspect} />)
  expect(inspect().disabled).toBe(true)
  expect(onInspect).not.toHaveBeenCalled()
  rerender(<EncryptedOutboxStatusPanel room={room} onInspect={onInspect} />)
  expect(inspect().disabled).toBe(false)
  expect(onInspect).not.toHaveBeenCalled()
})

it('TDD 918: an explicit local check displays only the queued packet count', async () => {
  const onInspect = vi.fn(async () => ({ pending: 3 }))
  render(<EncryptedOutboxStatusPanel room={room} onInspect={onInspect} />)
  fireEvent.click(inspect())
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('3 encrypted changes pending locally'))
  expect(onInspect).toHaveBeenCalledExactlyOnceWith(room)
})

it('TDD 919: storage failures show a generic error without exposing sensitive details', async () => {
  const onInspect = vi.fn(async () => { throw new Error('secret credential value') })
  render(<EncryptedOutboxStatusPanel room={room} onInspect={onInspect} />)
  fireEvent.click(inspect())
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not inspect local encrypted queue'))
  expect(screen.getByRole('alert').textContent).not.toContain('secret credential')
  expect(screen.queryByRole('status')).toBeNull()
})

it('TDD 920: switching rooms hides a count and rejects a late response from the prior room', async () => {
  let finish: ((value: { pending: number }) => void) | undefined
  const onInspect = vi.fn(() => new Promise<{ pending: number }>(resolve => { finish = resolve }))
  const { rerender } = render(<EncryptedOutboxStatusPanel room={room} onInspect={onInspect} />)
  fireEvent.click(inspect())
  rerender(<EncryptedOutboxStatusPanel room={other} onInspect={onInspect} />)
  finish?.({ pending: 9 })
  await waitFor(() => expect(screen.queryByRole('status')).toBeNull())
  fireEvent.click(inspect())
  expect(onInspect).toHaveBeenLastCalledWith(other)
})

it('TDD 921: the button blocks duplicate checks until the first one finishes, then allows refresh', async () => {
  let finish: ((value: { pending: number }) => void) | undefined
  const onInspect = vi.fn(() => new Promise<{ pending: number }>(resolve => { finish = resolve }))
  render(<EncryptedOutboxStatusPanel room={room} onInspect={onInspect} />)
  fireEvent.click(inspect())
  expect(inspect().disabled).toBe(true)
  fireEvent.click(inspect())
  expect(onInspect).toHaveBeenCalledTimes(1)
  finish?.({ pending: 2 })
  await waitFor(() => expect(inspect().disabled).toBe(false))
  fireEvent.click(inspect())
  expect(onInspect).toHaveBeenCalledTimes(2)
})
