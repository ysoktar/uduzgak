/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
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

it('TDD 527: To do Task can skip Doing and move straight to Done', async () => {
  const { user, store, task } = await fixture()
  await user.click(screen.getByRole('button', { name: 'Move Alpha notes directly to Done' }))
  expect(store.getState().tasks.find(t => t.id === task.id)?.status).toBe('done')
})

it('TDD 528: Done Task can return directly to To do', async () => {
  const { user, store, task } = await fixture('done')
  await user.click(screen.getByRole('button', { name: 'Move Alpha notes directly to To do' }))
  expect(store.getState().tasks.find(t => t.id === task.id)?.status).toBe('todo')
})

it('TDD 529: Doing Tasks have no direct skip-status action', async () => {
  await fixture('doing')
  expect(screen.queryByRole('button', { name: /directly to/ })).toBeNull()
})

it('TDD 530: direct Done feedback uses the readable column label', async () => {
  const { user } = await fixture()
  await user.click(screen.getByRole('button', { name: 'Move Alpha notes directly to Done' }))
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('Moved Alpha notes to Done')
})

it('TDD 531: direct status shortcuts remain hidden outside Board', async () => {
  const { user } = await fixture()
  await user.selectOptions(screen.getByLabelText('Task view'), 'list')
  expect(screen.queryByRole('button', { name: /directly to/ })).toBeNull()
})
