/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { createTask } from './domain/task'
import { createProject } from './domain/project'
import { saveWorkspace } from './persistence/workspace-storage'
import { BrowserApp } from './BrowserApp'
import type { Task } from './domain/task'
import type { ShareableTaskField } from './sync/stage-task-fields'

const room = 'a'.repeat(64)
const secret = 'b'.repeat(64)
const task = createTask({ id: 'task-1', projectId: 'project-1', title: 'Private', now: '2026-11-02T00:00:00.000Z' })
function fixture(onStage: (settings: {room: string; secret: string}, task: Task, fields: readonly ShareableTaskField[]) => Promise<readonly string[]>) {
  const data = new Map<string,string>()
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
  }
  saveWorkspace(storage, { projects: [createProject({id: 'project-1', name: 'One', now: '2026-11-02T00:00:00.000Z'})], tasks: [task] })
  render(<BrowserApp storage={storage} stageEncryptedTask={onStage} />)
  return { storage }
}
function configure() {
  fireEvent.change(screen.getByLabelText('Local staging room ID'), { target: { value: room } })
  fireEvent.change(screen.getByLabelText('Local staging encryption key'), { target: { value: secret } })
  fireEvent.change(screen.getByLabelText('Task to share'), { target: { value: task.id } })
}

it('TDD 907: BrowserApp displays local staging without issuing network or queue writes on mount', () => {
  const onStage = vi.fn(async () => ['id'])
  fixture(onStage)
  expect(screen.getByRole('region', { name: 'Encrypted local Task staging' })).toBeTruthy()
  expect(onStage).not.toHaveBeenCalled()
})

it('TDD 908: explicit user selection is passed to the staging boundary', async () => {
  const onStage = vi.fn(async () => ['id'])
  fixture(onStage)
  configure()
  fireEvent.click(screen.getByRole('button', { name: 'Stage encrypted changes' }))
  await waitFor(() => expect(onStage).toHaveBeenCalledWith({ room, secret }, task, ['title']))
})

it('TDD 909: local staging does not change persisted Workspace data', async () => {
  const onStage = vi.fn(async () => ['id'])
  const { storage } = fixture(onStage)
  const before = storage.getItem('workspace-app.workspace')
  configure()
  fireEvent.click(screen.getByRole('button', { name: 'Stage encrypted changes' }))
  await waitFor(() => expect(onStage).toHaveBeenCalledTimes(1))
  expect(storage.getItem('workspace-app.workspace')).toBe(before)
})

it('TDD 910: invalid room input disables the staging action in BrowserApp', () => {
  const onStage = vi.fn(async () => ['id'])
  fixture(onStage)
  configure()
  fireEvent.change(screen.getByLabelText('Local staging room ID'), { target: { value: 'bad' } })
  const button = screen.getByRole('button', { name: 'Stage encrypted changes' }) as HTMLButtonElement
  expect(button.disabled).toBe(true)
  expect(onStage).not.toHaveBeenCalled()
})

it('TDD 911: a rejected staging operation surfaces a safe error without modifying the Workspace', async () => {
  const onStage = vi.fn(async () => { throw new Error(secret) })
  const { storage } = fixture(onStage)
  const before = storage.getItem('workspace-app.workspace')
  configure()
  fireEvent.click(screen.getByRole('button', { name: 'Stage encrypted changes' }))
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not stage encrypted changes'))
  expect(screen.getByRole('alert').textContent).not.toContain(secret)
  expect(storage.getItem('workspace-app.workspace')).toBe(before)
})
