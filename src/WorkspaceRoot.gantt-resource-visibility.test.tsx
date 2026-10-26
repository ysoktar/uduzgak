/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { createWorkspaceCommands } from './application/workspace-commands'
import { createWorkspaceStore } from './application/workspace-store'
import { createDefaultViewPreferences, updateViewPreferences } from './domain/view-preferences'
import type { KeyValueStore } from './persistence/workspace-storage'
import { WorkspaceRoot } from './WorkspaceRoot'

class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string,string>()
  getItem(key:string) { return this.data.get(key) ?? null }
  setItem(key:string,value:string) { this.data.set(key,value) }
}
function fixture(scheduled = true, mode: 'gantt' | 'list' = 'gantt') {
  const user = userEvent.setup()
  const store = createWorkspaceStore(new MemoryStore())
  let n = 0
  const commands = createWorkspaceCommands(store,{
    nextId: () => `resource-${++n}`,
    now: () => '2026-10-19T08:00:00.000Z',
  })
  const project = commands.addProject('Resource Demo')
  const task = commands.addTask(project.id,'Alpha notes')
  if (scheduled) {
    commands.changeTaskStartDate(task.id,'2026-10-19')
    commands.changeTaskDueDate(task.id,'2026-10-20')
  }
  render(<WorkspaceRoot store={store} commands={commands}
    initialViewPreferences={updateViewPreferences(createDefaultViewPreferences(),{projectView:project.id,viewMode:mode})} />)
  return {user,store,task}
}

it('TDD 597: Gantt shows derived resource-plan duration', () => {
  fixture()
  expect(screen.getByLabelText('Gantt resource plan for Resource Demo').textContent).toContain('2 working days')
})

it('TDD 598: each scheduled Gantt task shows its logical resource slot', () => {
  fixture()
  expect(screen.getByLabelText('Gantt resource slot for Alpha notes').textContent).toContain('0–2')
})
