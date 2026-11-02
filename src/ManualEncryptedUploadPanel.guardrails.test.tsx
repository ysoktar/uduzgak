/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ManualEncryptedUploadPanel } from './ManualEncryptedUploadPanel'

const room = 'a'.repeat(64)
const button = () => screen.getByRole('button', { name: 'Upload pending encrypted changes' }) as HTMLButtonElement
function fill(serverUrl = 'https://sync.example.org') {
  fireEvent.change(screen.getByLabelText('Upload server URL'), { target: { value: serverUrl } })
  fireEvent.change(screen.getByLabelText('Upload room ID'), { target: { value: room } })
  fireEvent.change(screen.getByLabelText('Upload room access token'), { target: { value: 'session-only-token' } })
}

it('TDD 942: malformed and credential-embedded server URLs never permit submission', () => {
  const onUpload = vi.fn(async () => ({ uploaded: 1, remaining: 0 }))
  render(<ManualEncryptedUploadPanel onUpload={onUpload} />)
  for (const value of ['https://', 'https://user:pass@sync.example.org', 'https://sync.example.org/path', 'https://sync.example.org/?token=x', 'http://sync.example.org']) {
    fill(value)
    expect(button().disabled).toBe(true)
    fireEvent.click(button())
  }
  expect(onUpload).not.toHaveBeenCalled()
})

it('TDD 943: localhost-only HTTP is permitted for a self-hosted development server', async () => {
  const onUpload = vi.fn(async () => ({ uploaded: 0, remaining: 0 }))
  render(<ManualEncryptedUploadPanel onUpload={onUpload} />)
  fill('http://127.0.0.1:8787')
  expect(button().disabled).toBe(false)
  fireEvent.click(button())
  await waitFor(() => expect(onUpload).toHaveBeenCalledExactlyOnceWith({
    serverUrl: 'http://127.0.0.1:8787', room, token: 'session-only-token',
  }))
})

it('TDD 944: changing destination while upload is pending hides late success', async () => {
  let finish: ((value: { uploaded: number; remaining: number }) => void) | undefined
  const onUpload = vi.fn(() => new Promise<{ uploaded: number; remaining: number }>(resolve => { finish = resolve }))
  render(<ManualEncryptedUploadPanel onUpload={onUpload} />)
  fill()
  fireEvent.click(button())
  fireEvent.change(screen.getByLabelText('Upload room ID'), { target: { value: 'b'.repeat(64) } })
  finish?.({ uploaded: 3, remaining: 0 })
  await waitFor(() => expect(button().disabled).toBe(false))
  expect(screen.queryByText('3 encrypted changes uploaded; 0 remaining locally.')).toBeNull()
  expect(onUpload).toHaveBeenCalledTimes(1)
})

it('TDD 945: changing access token while pending hides late failure', async () => {
  let rejectUpload: ((reason: Error) => void) | undefined
  const onUpload = vi.fn(() => new Promise<{ uploaded: number; remaining: number }>((_resolve, reject) => { rejectUpload = reject }))
  render(<ManualEncryptedUploadPanel onUpload={onUpload} />)
  fill()
  fireEvent.click(button())
  fireEvent.change(screen.getByLabelText('Upload room access token'), { target: { value: 'another-token' } })
  rejectUpload?.(new Error('old server error'))
  await waitFor(() => expect(button().disabled).toBe(false))
  expect(screen.queryByRole('alert')).toBeNull()
  expect(onUpload).toHaveBeenCalledTimes(1)
})

it('TDD 946: invalid uploaded and remaining counts never display a fabricated success', async () => {
  const onUpload = vi.fn(async () => ({ uploaded: -1, remaining: 0 }))
  render(<ManualEncryptedUploadPanel onUpload={onUpload} />)
  fill()
  fireEvent.click(button())
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not upload encrypted changes'))
  expect(screen.queryByText(/encrypted changes uploaded/)).toBeNull()
})
