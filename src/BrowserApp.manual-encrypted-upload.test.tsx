/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { BrowserApp } from './BrowserApp'
import type { ManualEncryptedUploadSettings } from './ManualEncryptedUploadPanel'

const settings: ManualEncryptedUploadSettings = {
  serverUrl: 'https://sync.example.org',
  room: 'a'.repeat(64),
  token: 'access-secret',
}
function configure() {
  fireEvent.change(screen.getByLabelText('Upload server URL'), { target: { value: settings.serverUrl } })
  fireEvent.change(screen.getByLabelText('Upload room ID'), { target: { value: settings.room } })
  fireEvent.change(screen.getByLabelText('Upload room access token'), { target: { value: settings.token } })
}
function mount(upload: (settings: ManualEncryptedUploadSettings) => Promise<{ uploaded: number; remaining: number }>) {
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
  }
  render(<BrowserApp storage={storage} uploadEncryptedQueue={upload} />)
  return storage
}
function uploadButton() {
  return screen.getByRole('button', { name: 'Upload pending encrypted changes' })
}

it('TDD 937: BrowserApp never uploads on initial rendering', () => {
  const upload = vi.fn(async () => ({ uploaded: 0, remaining: 0 }))
  mount(upload)
  expect(upload).not.toHaveBeenCalled()
  expect(uploadButton()).toBeTruthy()
})

it('TDD 938: explicit submit sends the selected destination and token', async () => {
  const upload = vi.fn(async () => ({ uploaded: 1, remaining: 0 }))
  mount(upload)
  configure()
  fireEvent.click(uploadButton())
  await waitFor(() => expect(upload).toHaveBeenCalledExactlyOnceWith(settings))
  expect(screen.getByText('1 encrypted changes uploaded; 0 remaining locally.')).toBeTruthy()
})

it('TDD 939: malformed room prevents submission', () => {
  const upload = vi.fn(async () => ({ uploaded: 0, remaining: 0 }))
  mount(upload)
  configure()
  fireEvent.change(screen.getByLabelText('Upload room ID'), { target: { value: 'invalid' } })
  expect((uploadButton() as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(uploadButton())
  expect(upload).not.toHaveBeenCalled()
})

it('TDD 940: upload errors hide backend information from the workspace', async () => {
  const upload = vi.fn(async () => { throw new Error('access-secret: denied') })
  mount(upload)
  configure()
  fireEvent.click(uploadButton())
  await waitFor(() => expect(screen.getByText('Could not upload encrypted changes.')).toBeTruthy())
  expect(screen.getByText('Could not upload encrypted changes.').textContent).not.toContain(settings.token)
})

it('TDD 941: the upload workflow does not alter persisted Workspace state', async () => {
  const upload = vi.fn(async () => ({ uploaded: 0, remaining: 0 }))
  const storage = mount(upload)
  const before = storage.getItem('workspace-app.workspace')
  configure()
  fireEvent.click(uploadButton())
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(1))
  expect(storage.getItem('workspace-app.workspace')).toBe(before)
})
