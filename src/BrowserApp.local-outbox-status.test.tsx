/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { createTask } from './domain/task'
import { createProject } from './domain/project'
import { saveWorkspace } from './persistence/workspace-storage'
import { BrowserApp } from './BrowserApp'

const room = 'a'.repeat(64)
const task = createTask({ id: 'task-1', projectId: 'project-1', title: 'Private', now: '2026-11-02T00:00:00.000Z' })
function mount(onInspect: (room: string) => Promise<{ pending: number }>) {
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
  }
  saveWorkspace(storage, { projects: [createProject({ id: 'project-1', name: 'One', now: '2026-11-02T00:00:00.000Z' })], tasks: [task] })
  render(<BrowserApp storage={storage} inspectEncryptedQueue={onInspect} />)
  return { storage }
}
function checkButton() { return screen.getByRole('button', { name: 'Check local encrypted queue' }) as HTMLButtonElement }
function enterRoom(value: string) {
  fireEvent.change(screen.getByLabelText('Local staging room ID'), { target: { value } })
}

it('TDD 922: BrowserApp exposes queue inspection without starting it on mount', () => {
  const onInspect = vi.fn(async () => ({ pending: 0 }))
  mount(onInspect)
  expect(checkButton().disabled).toBe(true)
  expect(onInspect).not.toHaveBeenCalled()
})

it('TDD 923: only a manual check queries the chosen staging room', async () => {
  const onInspect = vi.fn(async () => ({ pending: 2 }))
  mount(onInspect)
  enterRoom(room)
  fireEvent.click(checkButton())
  await waitFor(() => expect(onInspect).toHaveBeenCalledWith(room))
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('2 encrypted changes pending locally'))
})

it('TDD 924: invalid staging room cannot inspect an outbox', () => {
  const onInspect = vi.fn(async () => ({ pending: 0 }))
  mount(onInspect)
  enterRoom('invalid')
  expect(checkButton().disabled).toBe(true)
  fireEvent.click(checkButton())
  expect(onInspect).not.toHaveBeenCalled()
})

it('TDD 925: checking a room never mutates the persisted Workspace document', async () => {
  const onInspect = vi.fn(async () => ({ pending: 0 }))
  const { storage } = mount(onInspect)
  const before = storage.getItem('workspace-app.workspace')
  enterRoom(room)
  fireEvent.click(checkButton())
  await waitFor(() => expect(onInspect).toHaveBeenCalledTimes(1))
  expect(storage.getItem('workspace-app.workspace')).toBe(before)
})

it('TDD 926: a failed queue check reports a safe error without leaking backend messages', async () => {
  const onInspect = vi.fn(async () => { throw new Error('private backend secret') })
  mount(onInspect)
  enterRoom(room)
  fireEvent.click(checkButton())
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not inspect local encrypted queue'))
  expect(screen.getByRole('alert').textContent).not.toContain('private backend secret')
})
