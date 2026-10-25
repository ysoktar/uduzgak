/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createWorkspaceCommands } from './application/workspace-commands'
import { createWorkspaceStore } from './application/workspace-store'
import type { KeyValueStore } from './persistence/workspace-storage'
import { WorkspaceRoot } from './WorkspaceRoot'

class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>()
  getItem(key: string) { return this.data.get(key) ?? null }
  setItem(key: string, value: string) { this.data.set(key, value) }
}

function fixture(withTask = true) {
  const user = userEvent.setup()
  const store = createWorkspaceStore(new MemoryStore())
  let sequence = 0
  const commands = createWorkspaceCommands(store, {
    nextId: () => `local-${++sequence}`,
    now: () => '2026-10-26T08:00:00.000Z',
  })
  const project = commands.addProject('Discovery')
  if (withTask) commands.addTask(project.id, 'Alpha notes')
  render(<WorkspaceRoot store={store} commands={commands} />)
  return { user, store }
}

describe('local task discovery', () => {
  it('reports the currently visible task count', () => {
    fixture()
    expect(screen.getByRole('status', { name: 'Visible task count' }).textContent).toContain('1 visible task')
  })  it('explains when filters hide existing tasks', async () => {
    const { user } = fixture()
    await user.type(screen.getByLabelText('Search tasks'), 'not-found')
    expect(screen.getByRole('status', { name: 'No matching tasks' }).textContent).toContain('No tasks match')
  })
  it('clears active search from a zero-results recovery control', async () => {
    const { user } = fixture()
    await user.type(screen.getByLabelText('Search tasks'), 'not-found')
    await user.click(screen.getByRole('button', { name: 'Clear filters and show tasks' }))
    expect((screen.getByLabelText('Search tasks') as HTMLInputElement).value).toBe('')
    expect(screen.getByRole('status', { name: 'Visible task count' }).textContent).toContain('1 visible task')
  })

})
