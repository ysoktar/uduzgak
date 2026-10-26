/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { createWorkspaceCommands } from './application/workspace-commands'
import { createWorkspaceStore } from './application/workspace-store'
import type { KeyValueStore } from './persistence/workspace-storage'
import type { TaskStatus } from './domain/task'
import { WorkspaceRoot } from './WorkspaceRoot'

class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>()
  getItem(key: string) { return this.data.get(key) ?? null }
  setItem(key: string, value: string) { this.data.set(key, value) }
}
async function fixture(initialStatus: TaskStatus = 'todo') {
  const user = userEvent.setup()
  const store = createWorkspaceStore(new MemoryStore())
  let sequence = 0
  const commands = createWorkspaceCommands(store, {
    nextId: () => `direct-${++sequence}`,
    now: () => '2026-10-26T12:00:00.000Z',
  })
  const project = commands.addProject('Direct Board')
  const task = commands.addTask(project.id, 'Alpha notes')
  if (initialStatus !== 'todo') commands.changeTaskStatus(task.id, initialStatus)
  render(<WorkspaceRoot store={store} commands={commands} />)
  await user.selectOptions(screen.getByLabelText('Task view'), 'board')
  return { user, store, task }
}

it('TDD 547: status dropdown invalidates a pending Board Undo', async () => {
  const { user } = await fixture()
  await user.click(screen.getByRole('button', { name: 'Move Alpha notes to Doing' }))
  await user.selectOptions(screen.getByLabelText('Status for Alpha notes'), 'done')
  expect(screen.queryByRole('button', { name: 'Undo Board status change' })).toBeNull()
})

it('TDD 548: Undo identifies which Task will be restored', async () => {
  const { user } = await fixture()
  await user.click(screen.getByRole('button', { name: 'Move Alpha notes to Doing' }))
  const undo = screen.getByRole('button', { name: 'Undo Board status change' })
  expect(undo.getAttribute('title')).toContain('Alpha notes')
})

it('TDD 549: a same-status Board drop preserves a prior valid Undo', async () => {
  const { user, task } = await fixture()
  await user.click(screen.getByRole('button', { name: 'Move Alpha notes to Doing' }))
  fireEvent.drop(screen.getByLabelText('Drop task into Doing'), {
    dataTransfer: { getData: () => task.id },
  })
  expect(screen.getByRole('button', { name: 'Undo Board status change' })).toBeTruthy()
})
