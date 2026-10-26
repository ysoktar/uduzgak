/** @vitest-environment jsdom */
import { render, screen, within } from '@testing-library/react'
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

it('TDD 577: Board reset advertises what it clears', async () => {
  const { user } = await fixture()
  await user.type(screen.getByLabelText('Search tasks'), 'missing')
  expect(screen.getByRole('button', { name: 'Show all Board tasks' }).getAttribute('title')).toContain('filters')
})

it('TDD 578: Board filter reset has a stable test identifier', async () => {
  const { user } = await fixture()
  await user.type(screen.getByLabelText('Search tasks'), 'missing')
  expect(screen.getByRole('button', { name: 'Show all Board tasks' }).getAttribute('data-testid')).toBe('board-reset-filters')
})

it('TDD 579: Board reset button announces its shortcut-free usage', async () => {
  const { user } = await fixture()
  await user.type(screen.getByLabelText('Search tasks'), 'missing')
  expect(screen.getByRole('button', { name: 'Show all Board tasks' }).getAttribute('aria-keyshortcuts')).toBeNull()
})

it('TDD 580: Board reset button is part of the tab order', async () => {
  const { user } = await fixture()
  await user.type(screen.getByLabelText('Search tasks'), 'missing')
  expect(screen.getByRole('button', { name: 'Show all Board tasks' }).tabIndex).toBe(0)
})
