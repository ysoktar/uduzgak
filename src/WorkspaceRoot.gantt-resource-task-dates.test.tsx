/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { createWorkspaceCommands } from './application/workspace-commands'
import { createWorkspaceStore } from './application/workspace-store'
import { createDefaultViewPreferences, updateViewPreferences } from './domain/view-preferences'
import type { KeyValueStore } from './persistence/workspace-storage'
import { WorkspaceRoot } from './WorkspaceRoot'

class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>()
  getItem(key: string) { return this.data.get(key) ?? null }
  setItem(key: string, value: string) { this.data.set(key, value) }
}

function fixture({ shared = true, mode = 'gantt', scheduled = true }: {
  shared?: boolean; mode?: 'gantt' | 'list'; scheduled?: boolean
} = {}) {
  const store = createWorkspaceStore(new MemoryStore())
  let serial = 0
  const commands = createWorkspaceCommands(store, {
    nextId: () => `forecast-${++serial}`,
    now: () => '2026-10-19T08:00:00.000Z',
  })
  const project = commands.addProject('Forecast Demo')
  const first = commands.addTask(project.id, 'Alpha')
  const second = commands.addTask(project.id, 'Beta')
  if (scheduled) {
    for (const task of [first, second]) {
      commands.changeTaskStartDate(task.id, '2026-10-19')
      commands.changeTaskDueDate(task.id, '2026-10-20')
    }
  }
  const person = commands.addPerson('First')
  commands.assignTaskAssignee(first.id, person.id)
  commands.assignTaskAssignee(second.id, shared ? person.id : commands.addPerson('Second').id)
  render(<WorkspaceRoot store={store} commands={commands}
    initialViewPreferences={updateViewPreferences(createDefaultViewPreferences(), {
      projectView: project.id, viewMode: mode,
    })} />)
}

it('TDD 642: serial resource plan shows Alpha's projected working dates', () => {
  fixture()
  expect(screen.getByLabelText('Gantt resource dates for Alpha').textContent).toContain('2026-10-19 to 2026-10-20')
})

it('TDD 643: serial resource plan shifts Beta past Alpha', () => {
  fixture()
  expect(screen.getByLabelText('Gantt resource dates for Beta').textContent).toContain('2026-10-21 to 2026-10-22')
})

it('TDD 644: parallel resources permit matching start dates', () => {
  fixture({ shared: false })
  expect(screen.getByLabelText('Gantt resource dates for Beta').textContent).toContain('2026-10-19 to 2026-10-20')
})

it('TDD 645: unscheduled tasks do not display fabricated resource dates', () => {
  fixture({ scheduled: false })
  expect(screen.queryByLabelText('Gantt resource dates for Alpha')).toBeNull()
})

it('TDD 646: resource date rows do not leak into List mode', () => {
  fixture({ mode: 'list' })
  expect(screen.queryByLabelText('Gantt resource dates for Alpha')).toBeNull()
})
