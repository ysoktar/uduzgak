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

it('TDD 532: direct return to To do announces the readable column name', async () => {
  const { user } = await fixture('done')
  await user.click(screen.getByRole('button', { name: 'Move Alpha notes directly to To do' }))
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('Moved Alpha notes to To do')
})

it('TDD 533: quick To do advancement names Doing instead of a status code', async () => {
  const { user } = await fixture()
  await user.click(screen.getByRole('button', { name: 'Move Alpha notes to Doing' }))
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('Moved Alpha notes to Doing')
})

it('TDD 534: quick Doing advancement also names Done', async () => {
  const { user } = await fixture('doing')
  await user.click(screen.getByRole('button', { name: 'Move Alpha notes to Done' }))
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('Moved Alpha notes to Done')
})

it('TDD 535: quick backward transition names To do', async () => {
  const { user } = await fixture('doing')
  await user.click(screen.getByRole('button', { name: 'Move Alpha notes to To do' }))
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('Moved Alpha notes to To do')
})
