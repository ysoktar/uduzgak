/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
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
async function fixture(withCustomField = false) {
  const user = userEvent.setup()
  const store = createWorkspaceStore(new MemoryStore())
  let sequence = 0
  const commands = createWorkspaceCommands(store, {
    nextId: () => `filter-${++sequence}`,
    now: () => '2026-10-26T12:00:00.000Z',
  })
  const project = commands.addProject('Filter Board')
  const task = commands.addTask(project.id, 'Alpha notes')
  if (withCustomField) commands.addCustomField('Reviewed', 'checkbox')
  render(<WorkspaceRoot store={store} commands={commands} />)
  await user.selectOptions(screen.getByLabelText('Task view'), 'board')
  return { user, store, task }
}

it('TDD 582: clearing Board filters announces completion', async () => {
  const { user } = await fixture()
  await user.type(screen.getByLabelText('Search tasks'), 'unmatched')
  await user.click(screen.getByRole('button', { name: 'Show all Board tasks' }))
  expect(screen.getByRole('status', { name: 'Board drag result' }).textContent).toContain('Board filters cleared')
})

it('TDD 583: resetting Board filters returns focus to search', async () => {
  const { user } = await fixture()
  const search = screen.getByLabelText('Search tasks')
  await user.type(search, 'unmatched')
  await user.click(screen.getByRole('button', { name: 'Show all Board tasks' }))
  expect(document.activeElement).toBe(search)
})
