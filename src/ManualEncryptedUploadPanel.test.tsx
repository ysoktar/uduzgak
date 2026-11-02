/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ManualEncryptedUploadPanel } from './ManualEncryptedUploadPanel'

const room = 'a'.repeat(64)
const settings = { serverUrl: 'https://sync.example.org', room, token: 'private-token' }
const button = () => screen.getByRole('button', { name: 'Upload pending encrypted changes' }) as HTMLButtonElement

function configure() {
  fireEvent.change(screen.getByLabelText('Upload server URL'), { target: { value: settings.serverUrl } })
  fireEvent.change(screen.getByLabelText('Upload room ID'), { target: { value: settings.room } })
  fireEvent.change(screen.getByLabelText('Upload room access token'), { target: { value: settings.token } })
}

it('TDD 932: rendering upload controls never sends a request', () => {
  const onUpload = vi.fn(async () => ({ uploaded: 0, remaining: 0 }))
  render(<ManualEncryptedUploadPanel onUpload={onUpload} />)
  expect(onUpload).not.toHaveBeenCalled()
  expect(button().disabled).toBe(true)
})

it('TDD 933: only an explicit submit uploads for the selected server and room', async () => {
  const onUpload = vi.fn(async () => ({ uploaded: 2, remaining: 1 }))
  render(<ManualEncryptedUploadPanel onUpload={onUpload} />)
  configure()
  expect(onUpload).not.toHaveBeenCalled()
  fireEvent.click(button())
  await waitFor(() => expect(onUpload).toHaveBeenCalledExactlyOnceWith(settings))
  await waitFor(() => expect(screen.getByText('2 encrypted changes uploaded; 1 remaining locally.')).toBeTruthy())
})

it('TDD 934: malformed settings cannot trigger upload', () => {
  const onUpload = vi.fn(async () => ({ uploaded: 0, remaining: 0 }))
  render(<ManualEncryptedUploadPanel onUpload={onUpload} />)
  configure()
  fireEvent.change(screen.getByLabelText('Upload room ID'), { target: { value: 'bad' } })
  expect(button().disabled).toBe(true)
  fireEvent.click(button())
  expect(onUpload).not.toHaveBeenCalled()
})

it('TDD 935: pending upload blocks double submission', async () => {
  let finish: ((result: { uploaded: number; remaining: number }) => void) | undefined
  const onUpload = vi.fn(() => new Promise<{ uploaded: number; remaining: number }>(resolve => { finish = resolve }))
  render(<ManualEncryptedUploadPanel onUpload={onUpload} />)
  configure()
  fireEvent.click(button())
  expect(button().disabled).toBe(true)
  fireEvent.click(button())
  expect(onUpload).toHaveBeenCalledTimes(1)
  finish?.({ uploaded: 1, remaining: 0 })
  await waitFor(() => expect(button().disabled).toBe(false))
})

it('TDD 936: failed upload reveals no token or backend details and never claims success', async () => {
  const onUpload = vi.fn(async () => { throw new Error('private-token: denied') })
  render(<ManualEncryptedUploadPanel onUpload={onUpload} />)
  configure()
  fireEvent.click(button())
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not upload encrypted changes'))
  expect(screen.getByRole('alert').textContent).not.toContain(settings.token)
  expect(screen.queryByText(/encrypted changes uploaded/)).toBeNull()
  expect((screen.getByLabelText('Upload room access token') as HTMLInputElement).type).toBe('password')
})
