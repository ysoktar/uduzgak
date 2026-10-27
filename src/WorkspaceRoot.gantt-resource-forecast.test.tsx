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

it('TDD 637: shared resource forecast displays projected completion', () => {
  fixture()
  expect(screen.getByLabelText('Gantt resource forecast for Forecast Demo').textContent).toContain('2026-10-22')
})

it('TDD 638: parallel resources finish sooner', () => {
  fixture({ shared: false })
  expect(screen.getByLabelText('Gantt resource forecast for Forecast Demo').textContent).toContain('2026-10-20')
})

it('TDD 639: forecast reports inclusive calendar length', () => {
  fixture()
  expect(screen.getByLabelText('Gantt resource forecast for Forecast Demo').textContent).toContain('4 calendar days')
})

it('TDD 640: unscheduled tasks do not show an invented forecast', () => {
  fixture({ scheduled: false })
  expect(screen.queryByLabelText('Gantt resource forecast for Forecast Demo')).toBeNull()
})

it('TDD 641: forecast summary is Gantt only', () => {
  fixture({ mode: 'list' })
  expect(screen.queryByLabelText('Gantt resource forecast for Forecast Demo')).toBeNull()
})
