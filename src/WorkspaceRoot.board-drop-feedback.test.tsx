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
