import { describe, expect, it } from 'vitest'
import {
  createTaskGanttCriticalGraph,
  createTaskGanttCriticalOrder,
  createTaskGanttCriticalPath,
  createTaskGanttEarliestOffsets,
  getTaskGanttDurationDays,
} from './task-gantt'
import { createTask, type Task } from './task'
import * as ganttModule from './task-gantt'
import type { TaskRelationship } from './task-relationship'

function task(id: string, startDate?: string, dueDate?: string, isMilestone = false): Task {
  const base = createTask({ id, projectId: 'p-1', title: id, now: '2026-10-16T08:00:00.000Z' })
  return { ...base, ...(startDate ? { startDate } : {}), ...(dueDate ? { dueDate } : {}), ...(isMilestone ? { isMilestone: true } : {}) }
}

function blocks(id: string, sourceTaskId: string, targetTaskId: string): TaskRelationship {
  return { id, type: 'blocks', sourceTaskId, targetTaskId, createdAt: '2026-10-16T08:00:00.000Z' }
}

describe('Gantt logical task duration', () => {
  it('counts exact UTC calendar days, preserves unscheduled Tasks, and treats milestones as zero duration', () => {
    const february = task('a', '2028-02-28', '2028-03-01')
    const snapshot = { ...february }
    expect(getTaskGanttDurationDays(february)).toBe(3)
    expect(getTaskGanttDurationDays(task('b', '2028-02-28', '2028-02-28'))).toBe(1)
    expect(getTaskGanttDurationDays(task('c', '2028-02-28'))).toBeNull()
    expect(getTaskGanttDurationDays(task('d', '2028-02-28', '2028-02-28', true))).toBe(0)
    expect(february).toEqual(snapshot)
  })
})

describe('Gantt critical-path graph projection', () => {
  it('keeps scheduled input Tasks and only unique in-scope blocking edges', () => {
    const tasks = [task('a', '2026-10-19', '2026-10-20'), task('b', '2026-10-19'), task('c', '2026-10-21', '2026-10-21')]
    const unrelated: TaskRelationship = { ...blocks('r4', 'a', 'c'), type: 'related' }
    const edges = [blocks('r1', 'a', 'c'), blocks('r2', 'a', 'b'), blocks('r3', 'a', 'c'), unrelated, blocks('r5', 'c', 'missing')]
    const before = JSON.stringify({ tasks, edges })
    expect(createTaskGanttCriticalGraph(tasks, edges)).toEqual({
      nodes: [{ taskId: 'a', durationDays: 2, isMilestone: false }, { taskId: 'c', durationDays: 1, isMilestone: false }],
      edges: [{ sourceTaskId: 'a', targetTaskId: 'c' }],
    })
    expect(JSON.stringify({ tasks, edges })).toBe(before)
  })
})

describe('Gantt dependency topological order', () => {
  it('respects blocking precedence, stable ties, and rejects dependency cycles', () => {
    const tasks = ['c', 'b', 'a', 'd'].map((id) => task(id, '2026-10-19', '2026-10-19'))
    const edges = [blocks('r1', 'a', 'c'), blocks('r2', 'b', 'c'), blocks('r3', 'c', 'd')]
    expect(createTaskGanttCriticalOrder(tasks, edges)).toEqual(['b', 'a', 'c', 'd'])
    expect(() => createTaskGanttCriticalOrder(tasks, [...edges, blocks('r4', 'd', 'a')])).toThrow('Gantt dependency cycle')
  })
})

describe('Gantt earliest logical offsets', () => {
  it('propagates finish-to-start precedence and preserves input projection order', () => {
    const tasks = [task('b', '2026-10-19', '2026-10-21'), task('d', '2026-10-19', '2026-10-20'), task('a', '2026-10-19', '2026-10-20'), task('c', '2026-10-22', '2026-10-22')]
    expect(createTaskGanttEarliestOffsets(tasks, [blocks('r1', 'a', 'b'), blocks('r2', 'b', 'c')])).toEqual([
      { taskId: 'b', earliestStart: 2, earliestFinish: 5 },
      { taskId: 'd', earliestStart: 0, earliestFinish: 2 },
      { taskId: 'a', earliestStart: 0, earliestFinish: 2 },
      { taskId: 'c', earliestStart: 5, earliestFinish: 6 },
    ])
  })
})

describe('Gantt critical-path slack calculation', () => {
  it('computes backward slack, milestone criticality, and immutable input-order rows', () => {
    const tasks = [task('c', '2026-10-20', '2026-10-20'), task('a', '2026-10-19', '2026-10-20'), task('m', '2026-10-23', '2026-10-23', true), task('d', '2026-10-21', '2026-10-21'), task('b', '2026-10-21', '2026-10-23')]
    const edges = [blocks('r1', 'a', 'b'), blocks('r2', 'a', 'c'), blocks('r3', 'c', 'd'), blocks('r4', 'b', 'm')]
    const before = JSON.stringify({ tasks, edges })
    const path = createTaskGanttCriticalPath(tasks, edges)
    expect(path.durationDays).toBe(5)
    expect(path.criticalTaskIds).toEqual(['a', 'm', 'b'])
    expect(path.rows.map(({ taskId, slackDays, isCritical, isMilestone }) => ({ taskId, slackDays, isCritical, isMilestone }))).toEqual([
      { taskId: 'c', slackDays: 1, isCritical: false, isMilestone: false },
      { taskId: 'a', slackDays: 0, isCritical: true, isMilestone: false },
      { taskId: 'm', slackDays: 0, isCritical: true, isMilestone: true },
      { taskId: 'd', slackDays: 1, isCritical: false, isMilestone: false },
      { taskId: 'b', slackDays: 0, isCritical: true, isMilestone: false },
    ])
    expect(path.rows.find((row) => row.taskId === 'm')).toMatchObject({ earliestStart: 5, earliestFinish: 5, latestStart: 5, latestFinish: 5 })
    expect(JSON.stringify({ tasks, edges })).toBe(before)
    expect(createTaskGanttCriticalPath([], [])).toEqual({ durationDays: 0, rows: [], criticalTaskIds: [] })
  })
})


it('finds only actual blocking date conflicts, treating milestone same-day handoffs as valid', () => {
  type ConflictsFn = (
    tasks: readonly Task[], relationships: readonly TaskRelationship[],
  ) => Array<{ sourceTaskId: string; targetTaskId: string; sourceFinishDate: string; targetStartDate: string }>
  const inspect = (ganttModule as unknown as { createTaskGanttScheduleConflicts: ConflictsFn }).createTaskGanttScheduleConflicts
  expect(typeof inspect).toBe('function')
  const tasks = [
    task('a', '2026-10-19', '2026-10-20'),
    task('b', '2026-10-20', '2026-10-22'),
    task('c', '2026-10-21', '2026-10-22'),
    task('m', '2026-10-22', '2026-10-22', true),
    task('d', '2026-10-22', '2026-10-23'),
    task('u', '2026-10-20'),
  ]
  const edges = [blocks('r1', 'a', 'b'), blocks('r2', 'a', 'c'), blocks('r3', 'm', 'd'),
    blocks('r4', 'a', 'u'), blocks('r5', 'a', 'b'),
    { ...blocks('r6', 'b', 'c'), type: 'related' as const }]
  const snapshot = JSON.stringify({ tasks, edges })
  expect(inspect(tasks, edges)).toEqual([
    { sourceTaskId: 'a', targetTaskId: 'b', sourceFinishDate: '2026-10-20', targetStartDate: '2026-10-20' },
  ])
  expect(JSON.stringify({ tasks, edges })).toBe(snapshot)
})


describe('Gantt working calendar: weekdays', () => {
  it('counts inclusive UTC weekdays without changing milestones or unscheduled Tasks', () => {
    const working = (ganttModule as unknown as {
      countTaskGanttWorkingDays: (candidate: Task) => number | null
    }).countTaskGanttWorkingDays
    expect(typeof working).toBe('function')
    const fridayThroughTuesday = task('weekday', '2026-10-16', '2026-10-20')
    const snapshot = { ...fridayThroughTuesday }
    expect(working(fridayThroughTuesday)).toBe(3)
    expect(working(task('weekend', '2026-10-17', '2026-10-18'))).toBe(0)
    expect(working(task('one', '2026-10-19', '2026-10-19'))).toBe(1)
    expect(working(task('milestone', '2026-10-19', '2026-10-19', true))).toBe(0)
    expect(working(task('missing', '2026-10-19'))).toBeNull()
    expect(fridayThroughTuesday).toEqual(snapshot)
  })
})


it('excludes distinct valid non-working dates without removing weekends twice', () => {
  const working = (ganttModule as unknown as {
    countTaskGanttWorkingDays: (candidate: Task, nonWorkingDates?: readonly string[]) => number | null
  }).countTaskGanttWorkingDays
  const candidate = task('holiday', '2026-10-16', '2026-10-20')
  const exceptions = ['2026-10-19', '2026-10-19', '2026-10-17', '2026-11-01']
  const before = JSON.stringify({ candidate, exceptions })
  expect(working(candidate, exceptions)).toBe(2)
  expect(working(candidate)).toBe(3)
  expect(() => working(candidate, ['2026-02-30'])).toThrow('Invalid Gantt non-working date')
  expect(JSON.stringify({ candidate, exceptions })).toBe(before)
})


it('projects only scheduled blocking edges into a holiday-aware working-day graph', () => {
  const workingGraph = (ganttModule as unknown as {
    createTaskGanttWorkingGraph: (
      tasks: readonly Task[], relationships: readonly TaskRelationship[], holidays?: readonly string[],
    ) => { nodes: Array<{ taskId: string; durationDays: number; isMilestone: boolean }>; edges: Array<{ sourceTaskId: string; targetTaskId: string }> }
  }).createTaskGanttWorkingGraph
  expect(typeof workingGraph).toBe('function')
  const tasks = [task('a', '2026-10-16', '2026-10-20'), task('b', '2026-10-21', '2026-10-23'), task('u', '2026-10-21')]
  const edges = [blocks('edge-1', 'a', 'b'), blocks('edge-2', 'a', 'u'), { ...blocks('edge-3', 'b', 'a'), type: 'related' as const }]
  expect(workingGraph(tasks, edges, ['2026-10-19'])).toEqual({
    nodes: [{ taskId: 'a', durationDays: 2, isMilestone: false }, { taskId: 'b', durationDays: 3, isMilestone: false }],
    edges: [{ sourceTaskId: 'a', targetTaskId: 'b' }],
  })
})


it('computes working-day longest path and slack with a custom non-working day', () => {
  const workingPath = (ganttModule as unknown as {
    createTaskGanttWorkingCriticalPath: (
      tasks: readonly Task[], relationships: readonly TaskRelationship[], holidays?: readonly string[],
    ) => { durationDays: number; criticalTaskIds: string[]; rows: Array<{ taskId: string; slackDays: number; earliestStart: number; earliestFinish: number; isCritical: boolean }> }
  }).createTaskGanttWorkingCriticalPath
  expect(typeof workingPath).toBe('function')
  const tasks = [task('side', '2026-10-21', '2026-10-21'), task('a', '2026-10-16', '2026-10-20'),
    task('b', '2026-10-21', '2026-10-23'), task('u', '2026-10-21')]
  const edges = [blocks('r1', 'a', 'b'), blocks('r2', 'a', 'side')]
  const before = JSON.stringify({ tasks, edges })
  const result = workingPath(tasks, edges, ['2026-10-19'])
  expect(result.durationDays).toBe(5)
  expect(result.criticalTaskIds).toEqual(['a', 'b'])
  expect(result.rows.map(({ taskId, slackDays, isCritical }) => ({ taskId, slackDays, isCritical }))).toEqual([
    { taskId: 'side', slackDays: 2, isCritical: false },
    { taskId: 'a', slackDays: 0, isCritical: true },
    { taskId: 'b', slackDays: 0, isCritical: true },
  ])
  expect(result.rows.find((row) => row.taskId === 'b')).toMatchObject({ earliestStart: 2, earliestFinish: 5 })
  expect(workingPath([], [])).toEqual({ durationDays: 0, rows: [], criticalTaskIds: [] })
  expect(JSON.stringify({ tasks, edges })).toBe(before)
})


it('canonicalizes Gantt non-working dates with sorted unique ISO days and rejects invalid dates', () => {
  const normalize = (ganttModule as unknown as {
    normalizeTaskGanttNonWorkingDates: (dates: readonly string[]) => string[]
  }).normalizeTaskGanttNonWorkingDates
  expect(typeof normalize).toBe('function')
  const dates = ['2026-10-23', '2026-10-22', '2026-10-23', '2026-10-17']
  const snapshot = [...dates]
  expect(normalize(dates)).toEqual(['2026-10-17', '2026-10-22', '2026-10-23'])
  expect(normalize([])).toEqual([])
  expect(() => normalize(['2026-02-30'])).toThrow('Invalid Gantt non-working date')
  expect(() => normalize(['not-a-date'])).toThrow('Invalid Gantt non-working date')
  expect(dates).toEqual(snapshot)
})


it('validates and canonicalizes Gantt working weekdays without mutating the supplied days', () => {
  const normalize = (ganttModule as unknown as {
    normalizeTaskGanttWorkingWeekdays?: (days: readonly number[]) => number[]
  }).normalizeTaskGanttWorkingWeekdays
  expect(typeof normalize).toBe('function')
  const weekdays = [4, 0, 2, 2, 1, 3]
  const snapshot = [...weekdays]
  expect(normalize!(weekdays)).toEqual([0, 1, 2, 3, 4])
  expect(weekdays).toEqual(snapshot)
  expect(() => normalize!([])).toThrow('Invalid Gantt working weekdays')
  expect(() => normalize!([1, 7])).toThrow('Invalid Gantt working weekdays')
  expect(() => normalize!([1, 1.5])).toThrow('Invalid Gantt working weekdays')
})


it('counts a Sunday workday and respects excluded Sundays in a custom Gantt week', () => {
  const count = (ganttModule as unknown as {
    countTaskGanttWorkingDays: (candidate: Task, holidays?: readonly string[], weekdays?: readonly number[]) => number | null
  }).countTaskGanttWorkingDays
  const sunday = task('sun', '2026-10-18', '2026-10-18')
  const week = [0, 1, 2, 3, 4]
  const before = JSON.stringify({ sunday, week })
  expect(count(sunday)).toBe(0)
  expect(count(sunday, [], week)).toBe(1)
  expect(count(sunday, ['2026-10-18'], week)).toBe(0)
  expect(count(task('milestone', '2026-10-18', '2026-10-18', true), [], week)).toBe(0)
  expect(count(task('unplanned'), [], week)).toBeNull()
  expect(JSON.stringify({ sunday, week })).toBe(before)
})


it('projects configured weekdays into the blocking working-day Gantt graph', () => {
  const graph = ganttModule.createTaskGanttWorkingGraph
  const friday = task('fri', '2026-10-16', '2026-10-16')
  const sunday = task('sun', '2026-10-18', '2026-10-18')
  const tasks = [friday, sunday]
  const relationships = [blocks('edge', 'fri', 'sun')]
  const snapshot = JSON.stringify({ tasks, relationships })
  expect(graph(tasks, relationships, [], [0, 1, 2, 3, 4])).toEqual({
    nodes: [
      { taskId: 'fri', durationDays: 0, isMilestone: false },
      { taskId: 'sun', durationDays: 1, isMilestone: false },
    ],
    edges: [{ sourceTaskId: 'fri', targetTaskId: 'sun' }],
  })
  expect(JSON.stringify({ tasks, relationships })).toBe(snapshot)
})


it('recomputes critical path when Sunday replaces Friday in a Gantt workweek', () => {
  const friday = task('fri', '2026-10-16', '2026-10-16')
  const sunday = task('sun', '2026-10-18', '2026-10-18')
  const tasks = [friday, sunday]
  const original = ganttModule.createTaskGanttWorkingCriticalPath(tasks, [])
  expect(original.durationDays).toBe(1)
  expect(original.criticalTaskIds).toEqual(['fri'])
  const revised = ganttModule.createTaskGanttWorkingCriticalPath(tasks, [], [], [0, 1, 2, 3, 4])
  expect(revised.durationDays).toBe(1)
  expect(revised.criticalTaskIds).toEqual(['sun'])
  expect(revised.rows.map(({ taskId, slackDays }) => ({ taskId, slackDays }))).toEqual([
    { taskId: 'fri', slackDays: 1 },
    { taskId: 'sun', slackDays: 0 },
  ])
  expect(tasks).toEqual([friday, sunday])
})

it('advances a Gantt working-date anchor across weekends and configured holidays', () => {
  const move = (ganttModule as unknown as {
    shiftTaskGanttWorkingDate?: (
      anchor: string, workingOffset: number, holidays?: readonly string[], weekdays?: readonly number[],
    ) => string
  }).shiftTaskGanttWorkingDate
  expect(typeof move).toBe('function')
  expect(move!('2026-10-16', 0)).toBe('2026-10-16')
  expect(move!('2026-10-16', 1)).toBe('2026-10-19')
  expect(move!('2026-10-17', 0)).toBe('2026-10-19')
  expect(move!('2026-10-16', 1, ['2026-10-19'])).toBe('2026-10-20')
  expect(move!('2026-10-16', 1, [], [0, 1, 2, 3, 4])).toBe('2026-10-18')
  expect(() => move!('2026-02-30', 0)).toThrow('Invalid Gantt anchor date')
  expect(() => move!('2026-10-16', -1)).toThrow('Invalid Gantt working offset')
})

it('projects earliest Gantt working offsets into dates across a holiday', () => {
  const project = (ganttModule as unknown as {
    createTaskGanttWorkingDateProjection?: (
      tasks: readonly Task[], relationships: readonly TaskRelationship[], anchor: string,
      holidays?: readonly string[], weekdays?: readonly number[],
    ) => { rows: Array<{ taskId: string; earliestStartDate: string; earliestFinishDate: string }> }
  }).createTaskGanttWorkingDateProjection
  expect(typeof project).toBe('function')
  const tasks = [task('a', '2026-10-19', '2026-10-20'), task('b', '2026-10-21', '2026-10-23')]
  const relationships = [blocks('r1', 'a', 'b')]
  const before = JSON.stringify({ tasks, relationships })
  expect(project!(tasks, relationships, '2026-10-19', ['2026-10-22']).rows.map(
    ({ taskId, earliestStartDate, earliestFinishDate }) => ({ taskId, earliestStartDate, earliestFinishDate }),
  )).toEqual([
    { taskId: 'a', earliestStartDate: '2026-10-19', earliestFinishDate: '2026-10-20' },
    { taskId: 'b', earliestStartDate: '2026-10-21', earliestFinishDate: '2026-10-23' },
  ])
  expect(JSON.stringify({ tasks, relationships })).toBe(before)
})
