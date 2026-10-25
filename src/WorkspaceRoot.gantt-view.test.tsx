/** @vitest-environment jsdom */

import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { createWorkspaceCommands } from './application/workspace-commands'
import { createWorkspaceStore } from './application/workspace-store'
import {
  createDefaultViewPreferences,
  updateViewPreferences,
} from './domain/view-preferences'
import type { KeyValueStore } from './persistence/workspace-storage'
import { WorkspaceRoot } from './WorkspaceRoot'

class MemoryStore implements KeyValueStore {
  private readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

function renderCriticalGanttWorkspace({ conflicting = false } = {}) {
  const user = userEvent.setup()
  const store = createWorkspaceStore(new MemoryStore())
  const ids = ['project-1', 'task-a', 'task-b', 'task-c', 'task-u', 'edge-1', 'edge-2']
  const commands = createWorkspaceCommands(store, {
    nextId: () => ids.shift() ?? 'unexpected-id',
    now: () => '2026-10-17T01:00:00.000Z',
  })
  const project = commands.addProject('Demo')
  const alpha = commands.addTask(project.id, 'Alpha')
  const beta = commands.addTask(project.id, 'Beta')
  const side = commands.addTask(project.id, 'Side task')
  commands.addTask(project.id, 'Unscheduled')
  commands.changeTaskStartDate(alpha.id, '2026-10-19')
  commands.changeTaskDueDate(alpha.id, '2026-10-20')
  commands.changeTaskStartDate(beta.id, conflicting ? '2026-10-20' : '2026-10-21')
  commands.changeTaskDueDate(beta.id, '2026-10-23')
  commands.changeTaskStartDate(side.id, '2026-10-21')
  commands.changeTaskDueDate(side.id, '2026-10-21')
  commands.addTaskRelationship('blocks', alpha.id, beta.id)
  commands.addTaskRelationship('blocks', alpha.id, side.id)
  const initialViewPreferences = updateViewPreferences(
    createDefaultViewPreferences(),
    { projectView: project.id, viewMode: 'gantt' },
  )
  render(<WorkspaceRoot store={store} commands={commands} initialViewPreferences={initialViewPreferences} />)
  return { user, store, commands, alpha, beta, side, ids }
}

describe('WorkspaceRoot Gantt view', () => {
  it('renders every incoming Task row and marks only complete date ranges scheduled', () => {
    const store = createWorkspaceStore(new MemoryStore())
    const ids = ['project-1', 'task-a', 'task-b', 'task-c', 'task-d']
    const commands = createWorkspaceCommands(store, {
      nextId: () => ids.shift() ?? 'unexpected-id',
      now: () => '2026-09-12T02:40:00.000Z',
    })
    const project = commands.addProject('Robotics Research')
    const alpha = commands.addTask(project.id, 'Alpha scheduled')
    const beta = commands.addTask(project.id, 'Beta missing start')
    const gamma = commands.addTask(project.id, 'Gamma missing due')
    commands.addTask(project.id, 'Delta unscheduled')
    commands.changeTaskStartDate(alpha.id, '2026-09-14')
    commands.changeTaskDueDate(alpha.id, '2026-09-16')
    commands.changeTaskDueDate(beta.id, '2026-09-17')
    commands.changeTaskStartDate(gamma.id, '2026-09-18')

    const initialViewPreferences = updateViewPreferences(
      createDefaultViewPreferences(),
      {
        projectView: project.id,
        sort: 'title',
        viewMode: 'gantt',
      },
    )

    render(
      <WorkspaceRoot
        store={store}
        commands={commands}
        initialViewPreferences={initialViewPreferences}
      />,
    )

    const gantt = screen.getByRole('list', {
      name: 'Task Gantt for Robotics Research',
    })
    expect(
      within(gantt)
        .getAllByRole('listitem')
        .map((item) => item.getAttribute('aria-label')),
    ).toEqual([
      '2026-09-14 to 2026-09-16 Gantt item Alpha scheduled',
      'Unscheduled Gantt item Beta missing start',
      'Unscheduled Gantt item Delta unscheduled',
      'Unscheduled Gantt item Gamma missing due',
    ])
    expect(within(gantt).getAllByText('Unscheduled')).toHaveLength(3)
    expect(ids).toEqual([])
  })

  it('filters only the Gantt overview to critical Tasks, preserving detail controls and stored data', async () => {
    const { user, store, ids } = renderCriticalGanttWorkspace()
    const snapshot = JSON.stringify(store.getState())
    const overview = () => screen.getByRole('list', { name: 'Task Gantt for Demo' })
    const dependencies = () => screen.getByRole('list', { name: 'Gantt dependencies for Demo' })
    const toggle = screen.getByRole('button', { name: 'Critical tasks only in Gantt overview' })

    expect(within(overview()).getAllByRole('listitem')).toHaveLength(4)
    expect(within(dependencies()).getAllByRole('listitem')).toHaveLength(2)
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    await user.click(toggle)
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(within(overview()).getAllByRole('listitem')).toHaveLength(2)
    expect(within(overview()).getByText('Alpha')).toBeTruthy()
    expect(within(overview()).getByText('Beta')).toBeTruthy()
    expect(within(overview()).queryByText('Side task')).toBeNull()
    expect(within(overview()).queryByText('Unscheduled')).toBeNull()
    expect(within(dependencies()).getAllByRole('listitem')).toHaveLength(1)
    expect(within(dependencies()).getByText('Alpha blocks Beta')).toBeTruthy()
    expect(screen.getByRole('listitem', { name: 'Gantt task details Side task' })).toBeTruthy()
    expect(screen.getByText(/Logical critical path: 5 days/)).toBeTruthy()
    await user.click(toggle)
    expect(within(overview()).getAllByRole('listitem')).toHaveLength(4)
    expect(within(dependencies()).getAllByRole('listitem')).toHaveLength(2)
    expect(JSON.stringify(store.getState())).toBe(snapshot)
    expect(ids).toEqual([])
  })

  it('reveals early and late Gantt logical offsets on request without editing schedules', async () => {
    const { user, store } = renderCriticalGanttWorkspace()
    const before = JSON.stringify(store.getState())
    const toggle = screen.getByRole('button', { name: 'Show Gantt logical offsets' })
    expect(screen.queryByLabelText('Gantt logical offsets for Alpha')).toBeNull()
    await user.click(toggle)
    expect(screen.getByLabelText('Gantt logical offsets for Alpha').textContent).toContain('Earliest 0 to 2 days; latest 0 to 2 days')
    expect(screen.getByLabelText('Gantt logical offsets for Side task').textContent).toContain('Earliest 2 to 3 days; latest 4 to 5 days')
    expect(screen.queryByLabelText('Gantt logical offsets for Unscheduled')).toBeNull()
    await user.click(toggle)
    expect(screen.queryByLabelText('Gantt logical offsets for Alpha')).toBeNull()
    expect(JSON.stringify(store.getState())).toBe(before)
  })

  it('selects visible critical Tasks for existing bulk controls without changing Workspace state', async () => {
    const { user, store } = renderCriticalGanttWorkspace()
    const before = JSON.stringify(store.getState())
    await user.click(screen.getByRole('button', { name: 'Select visible critical Gantt tasks' }))
    expect(screen.getByText('2 tasks selected')).toBeTruthy()
    expect((screen.getByRole('checkbox', { name: 'Select task Alpha' }) as HTMLInputElement).checked).toBe(true)
    expect((screen.getByRole('checkbox', { name: 'Select task Beta' }) as HTMLInputElement).checked).toBe(true)
    expect((screen.getByRole('checkbox', { name: 'Select task Side task' }) as HTMLInputElement).checked).toBe(false)
    expect((screen.getByRole('checkbox', { name: 'Select task Unscheduled' }) as HTMLInputElement).checked).toBe(false)
    expect(JSON.stringify(store.getState())).toBe(before)
  })

  it('warns about a real Gantt blocking date conflict and clears it after schedule correction', async () => {
    const { store, commands, beta } = renderCriticalGanttWorkspace({ conflicting: true })
    const warning = screen.getByRole('list', { name: 'Gantt schedule conflicts for Demo' })
    expect(within(warning).getByText('Alpha ends 2026-10-20; Beta starts 2026-10-20')).toBeTruthy()
    expect(screen.getByText('1 Gantt dependency schedule conflict')).toBeTruthy()
    await act(async () => { commands.changeTaskStartDate(beta.id, '2026-10-21') })
    expect(screen.queryByRole('list', { name: 'Gantt schedule conflicts for Demo' })).toBeNull()
    expect(store.getState().tasks.find((task) => task.id === beta.id)?.startDate).toBe('2026-10-21')
  })
})


it('shows a separate working-day Gantt analysis without altering calendar-day metrics or Task data', async () => {
  const { user, commands, beta, store } = renderCriticalGanttWorkspace()
  await act(async () => { commands.changeTaskDueDate(beta.id, '2026-10-25') })
  const before = JSON.stringify(store.getState())
  expect(screen.getByText(/Logical critical path: 7 days/)).toBeTruthy()
  const toggle = screen.getByRole('button', { name: 'Show Gantt working-day analysis' })
  expect(screen.queryByLabelText('Gantt working-day critical path for Demo')).toBeNull()
  await user.click(toggle)
  expect(toggle.getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByLabelText('Gantt working-day critical path for Demo').textContent).toContain('5 working days')
  expect(screen.getByLabelText('Gantt working-day status for Beta').textContent).toContain('Critical (0 working days slack)')
  expect(screen.getByLabelText('Gantt working-day status for Side task').textContent).toContain('Not critical (2 working days slack)')
  expect(screen.queryByLabelText('Gantt working-day status for Unscheduled')).toBeNull()
  await user.click(toggle)
  expect(screen.queryByLabelText('Gantt working-day critical path for Demo')).toBeNull()
  expect(screen.getByText(/Logical critical path: 7 days/)).toBeTruthy()
  expect(JSON.stringify(store.getState())).toBe(before)
})


async function addGanttNonWorkingDate(user: ReturnType<typeof userEvent.setup>, date: string) {
  fireEvent.change(screen.getByLabelText('Gantt non-working date'), { target: { value: date } })
  await user.click(screen.getByRole('button', { name: 'Add Gantt non-working date' }))
}

it('adds a working-calendar exception from Gantt without mutating Workspace data', async () => {
  const { user, store } = renderCriticalGanttWorkspace()
  const before = JSON.stringify(store.getState())
  await user.click(screen.getByRole('button', { name: 'Show Gantt working-day analysis' }))
  const summary = screen.getByLabelText('Gantt working-day critical path for Demo')
  expect(summary.textContent).toContain('5 working days')
  expect(screen.getByRole('button', { name: 'Add Gantt non-working date' })).toBeTruthy()
  await addGanttNonWorkingDate(user, '2026-10-22')
  expect(summary.textContent).toContain('4 working days')
  expect(summary.textContent).toContain('1 excluded date')
  expect((screen.getByLabelText('Gantt non-working date') as HTMLInputElement).value).toBe('')
  expect(JSON.stringify(store.getState())).toBe(before)
})


it('removes only the chosen Gantt non-working date and restores the derived working duration', async () => {
  const { user, store } = renderCriticalGanttWorkspace()
  const before = JSON.stringify(store.getState())
  await user.click(screen.getByRole('button', { name: 'Show Gantt working-day analysis' }))
  await addGanttNonWorkingDate(user, '2026-10-22')
  const summary = screen.getByLabelText('Gantt working-day critical path for Demo')
  expect(summary.textContent).toContain('4 working days')
  await user.click(screen.getByRole('button', { name: 'Remove Gantt non-working date 2026-10-22' }))
  expect(summary.textContent).toContain('5 working days')
  expect(summary.textContent).toContain('holidays not configured')
  expect(screen.queryByRole('button', { name: 'Remove Gantt non-working date 2026-10-22' })).toBeNull()
  expect(JSON.stringify(store.getState())).toBe(before)
})


it('filters by working-day rather than calendar-day criticality and keeps overview edges in sync', async () => {
  const { user, store } = renderCriticalGanttWorkspace()
  const before = JSON.stringify(store.getState())
  await user.click(screen.getByRole('button', { name: 'Show Gantt working-day analysis' }))
  await addGanttNonWorkingDate(user, '2026-10-22')
  await addGanttNonWorkingDate(user, '2026-10-23')
  const overview = () => screen.getByRole('list', { name: 'Task Gantt for Demo' })
  const dependencies = () => screen.getByRole('list', { name: 'Gantt dependencies for Demo' })
  const calendarToggle = screen.getByRole('button', { name: 'Critical tasks only in Gantt overview' })
  await user.click(calendarToggle)
  expect(within(overview()).getAllByRole('listitem')).toHaveLength(2)
  const workingToggle = screen.getByRole('button', { name: 'Working-day critical tasks only in Gantt overview' })
  await user.click(workingToggle)
  expect(calendarToggle.getAttribute('aria-pressed')).toBe('false')
  expect(workingToggle.getAttribute('aria-pressed')).toBe('true')
  expect(within(overview()).getAllByRole('listitem')).toHaveLength(3)
  expect(within(overview()).getByText('Side task')).toBeTruthy()
  expect(within(overview()).queryByText('Unscheduled')).toBeNull()
  expect(within(dependencies()).getAllByRole('listitem')).toHaveLength(2)
  await user.click(workingToggle)
  expect(within(overview()).getAllByRole('listitem')).toHaveLength(4)
  expect(JSON.stringify(store.getState())).toBe(before)
})


it('bulk-selects only visible working-day critical Tasks using configured exceptions', async () => {
  const { user, store } = renderCriticalGanttWorkspace()
  const before = JSON.stringify(store.getState())
  await user.click(screen.getByRole('button', { name: 'Show Gantt working-day analysis' }))
  await addGanttNonWorkingDate(user, '2026-10-22')
  await addGanttNonWorkingDate(user, '2026-10-23')
  await user.click(screen.getByRole('button', { name: 'Select visible working-day critical Gantt tasks' }))
  expect(screen.getByText('3 tasks selected')).toBeTruthy()
  for (const title of ['Alpha', 'Beta', 'Side task']) {
    expect((screen.getByRole('checkbox', { name: `Select task ${title}` }) as HTMLInputElement).checked).toBe(true)
  }
  expect((screen.getByRole('checkbox', { name: 'Select task Unscheduled' }) as HTMLInputElement).checked).toBe(false)
  expect(JSON.stringify(store.getState())).toBe(before)
})


it('switches Gantt to a Sunday-Thursday workweek without mutating saved Tasks', async () => {
  const { user, store } = renderCriticalGanttWorkspace()
  const before = JSON.stringify(store.getState())
  await user.click(screen.getByRole('button', { name: 'Show Gantt working-day analysis' }))
  const summary = screen.getByLabelText('Gantt working-day critical path for Demo')
  expect(summary.textContent).toContain('5 working days')
  const toggle = screen.getByRole('button', { name: 'Use Sunday-Thursday Gantt workweek' })
  expect(toggle.getAttribute('aria-pressed')).toBe('false')
  await user.click(toggle)
  expect(toggle.getAttribute('aria-pressed')).toBe('true')
  expect(summary.textContent).toContain('4 working days')
  expect(summary.textContent).toContain('Sunday-Thursday')
  expect(screen.getByLabelText('Gantt critical path for Demo').textContent).toContain('5 days')
  await user.click(toggle)
  expect(summary.textContent).toContain('5 working days')
  expect(summary.textContent).toContain('Monday-Friday')
  expect(JSON.stringify(store.getState())).toBe(before)
})


it('loads saved Gantt workweek and holiday exceptions into the initial working-day analysis', async () => {
  const user = userEvent.setup()
  const store = createWorkspaceStore(new MemoryStore())
  const ids = ['saved-p', 'saved-t']
  const commands = createWorkspaceCommands(store, {
    nextId: () => ids.shift() ?? 'unexpected-id',
    now: () => '2026-10-17T01:00:00.000Z',
  })
  const project = commands.addProject('Saved calendar')
  const task = commands.addTask(project.id, 'Across weekend')
  commands.changeTaskStartDate(task.id, '2026-10-18')
  commands.changeTaskDueDate(task.id, '2026-10-19')
  const before = JSON.stringify(store.getState())
  render(<WorkspaceRoot store={store} commands={commands} initialViewPreferences={{
    ...createDefaultViewPreferences(), projectView: project.id, viewMode: 'gantt',
    ganttWorkingWeek: 'sun-thu', ganttNonWorkingDates: ['2026-10-19'],
  }} />)
  await user.click(screen.getByRole('button', { name: 'Show Gantt working-day analysis' }))
  const summary = screen.getByLabelText('Gantt working-day critical path for Saved calendar')
  expect(summary.textContent).toContain('1 working days')
  expect(summary.textContent).toContain('Sunday-Thursday')
  expect(summary.textContent).toContain('1 excluded date')
  expect(screen.getByRole('button', { name: 'Use Sunday-Thursday Gantt workweek' }).getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByRole('button', { name: 'Remove Gantt non-working date 2026-10-19' })).toBeTruthy()
  expect(JSON.stringify(store.getState())).toBe(before)
})

it('reveals optional derived Gantt working dates without changing Task schedules', async () => {
  const { user, store } = renderCriticalGanttWorkspace()
  const before = JSON.stringify(store.getState())
  await user.click(screen.getByRole('button', { name: 'Show Gantt working-day analysis' }))
  expect(screen.queryByLabelText('Gantt projected working dates for Alpha')).toBeNull()
  const toggle = screen.getByRole('button', { name: 'Show Gantt projected working dates' })
  await user.click(toggle)
  expect(toggle.getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByLabelText('Gantt projected working dates for Alpha').textContent).toContain(
    'Earliest 2026-10-19 to 2026-10-20',
  )
  expect(screen.getByLabelText('Gantt projected working dates for Beta').textContent).toContain(
    'Earliest 2026-10-21 to 2026-10-23',
  )
  expect(screen.queryByLabelText('Gantt projected working dates for Unscheduled')).toBeNull()
  await user.click(toggle)
  expect(screen.queryByLabelText('Gantt projected working dates for Alpha')).toBeNull()
  expect(JSON.stringify(store.getState())).toBe(before)
})
