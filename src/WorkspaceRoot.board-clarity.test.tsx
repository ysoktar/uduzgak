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

async function fixture(withSecondTask = false) {
  const user = userEvent.setup()
  const store = createWorkspaceStore(new MemoryStore())
  let sequence = 0
  const commands = createWorkspaceCommands(store, {
    nextId: () => `board-${++sequence}`,
    now: () => '2026-10-26T10:00:00.000Z',
  })
  const project = commands.addProject('Board project')
  commands.addTask(project.id, 'Alpha notes')
  if (withSecondTask) commands.addTask(project.id, 'Beta review')
  render(<WorkspaceRoot store={store} commands={commands} />)
  await user.selectOptions(screen.getByLabelText('Task view'), 'board')
  return { user, store }
}

it('TDD 512: Board headings show visible per-status Task counts', async () => {
  await fixture()
  expect(screen.getByLabelText('Drop task into To do').textContent).toContain('1 task')
  expect(screen.getByLabelText('Drop task into Doing').textContent).toContain('0 tasks')
  expect(screen.getByLabelText('Drop task into Done').textContent).toContain('0 tasks')
})
