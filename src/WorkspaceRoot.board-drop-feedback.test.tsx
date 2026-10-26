/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { createWorkspaceCommands } from './application/workspace-commands'
import { createWorkspaceStore } from './application/workspace-store'
import type { KeyValueStore } from './persistence/workspace-storage'
import { WorkspaceRoot } from './WorkspaceRoot'

class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>()
  getItem(key: string) { return this.data.get(key) ?? null }
  setItem(key: string, value: string) { this.data.set(key, value) }
}
async function fixture() {
  const user = userEvent.setup()
  const store = createWorkspaceStore(new MemoryStore())
  let sequence = 0
  const commands = createWorkspaceCommands(store, {
    nextId: () => `board-${++sequence}`,
    now: () => '2026-10-26T12:00:00.000Z',
  })
  const project = commands.addProject('Board project')
  const task = commands.addTask(project.id, 'Alpha notes')
  render(<WorkspaceRoot store={store} commands={commands} />)
  await user.selectOptions(screen.getByLabelText('Task view'), 'board')
  return { user, store, task }
}
const transfer = (id: string) => ({
  setData: (_kind: string, _id: string) => {},
  getData: (_kind: string) => id,
  effectAllowed: 'move',
  dropEffect: 'move',
})

it('TDD 517: an empty Board drop announces that no task was selected', async () => {
  const { store } = await fixture()
  fireEvent.drop(screen.getByLabelText('Drop task into Doing'), { dataTransfer: transfer('') })
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('No task selected')
  expect(store.getState().tasks[0].status).toBe('todo')
})

it('TDD 518: an unknown Task drop reports a stale Task', async () => {
  const { store } = await fixture()
  fireEvent.drop(screen.getByLabelText('Drop task into Doing'), { dataTransfer: transfer('missing-task') })
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('Task is no longer available')
  expect(store.getState().tasks[0].status).toBe('todo')
})

it('TDD 519: dropping a Task into its current column announces no change', async () => {
  const { store, task } = await fixture()
  fireEvent.drop(screen.getByLabelText('Drop task into To do'), { dataTransfer: transfer(task.id) })
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('already in To do')
  expect(store.getState().tasks[0].status).toBe('todo')
})

it('TDD 520: cross-project drop error identifies the attempted Task', async () => {
  const { store, task } = await fixture()
  const other = store.getState().projects.find(project => project.name === 'Board project')
  expect(other).toBeDefined()
  fireEvent.drop(screen.getByLabelText('Drop task into Doing'), { dataTransfer: transfer('other-project-task') })
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('Task is no longer available')
  expect(store.getState().tasks.find(t => t.id === task.id)?.status).toBe('todo')
})

it('TDD 521: a successful Board drop clears a previous stale-task warning', async () => {
  const { store, task } = await fixture()
  const target = screen.getByLabelText('Drop task into Doing')
  fireEvent.drop(target, { dataTransfer: transfer('missing-task') })
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('Task is no longer available')
  fireEvent.drop(target, { dataTransfer: transfer(task.id) })
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('Moved Alpha notes into doing')
  expect(store.getState().tasks.find(t => t.id === task.id)?.status).toBe('doing')
})
