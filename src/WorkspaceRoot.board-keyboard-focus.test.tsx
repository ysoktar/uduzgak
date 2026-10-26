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

it('TDD 567: keyboard activating quick advance focuses status selector', async () => {
  await fixture()
  fireEvent.click(screen.getByRole('button', { name: 'Move Alpha notes to Doing' }), { detail: 0 })
  expect(document.activeElement).toBe(screen.getByLabelText('Status for Alpha notes'))
})
