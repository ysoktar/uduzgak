import { expect, it } from 'vitest'
import { createTask, type Task } from './task'
import { createTaskGanttResourceDateProjection } from './task-gantt-resource-plan'

function task(id: string, person: string, milestone = false): Task {
  return { ...createTask({ id, projectId: 'p', title: id, now: '2026-10-19T08:00:00.000Z' }),
    startDate: '2026-10-19', dueDate: milestone ? '2026-10-19' : '2026-10-20',
    assigneeIds: [person], ...(milestone ? { isMilestone: true } : {}) }
}

it('TDD 632: empty forecast has no calendar window', () => {
  expect(createTaskGanttResourceDateProjection([], [], '2026-10-19').calendarWindow).toBeNull()
})

it('TDD 633: one ordinary two-day task produces two calendar days', () => {
  expect(createTaskGanttResourceDateProjection([task('a','p1')], [], '2026-10-19').calendarWindow).toEqual({ startDate: '2026-10-19', finishDate: '2026-10-20', calendarDays: 2 })
})

it('TDD 634: holiday gap is counted in calendar span', () => {
  expect(createTaskGanttResourceDateProjection([task('a','p1')], [], '2026-10-19', ['2026-10-20']).calendarWindow).toEqual({ startDate: '2026-10-19', finishDate: '2026-10-21', calendarDays: 3 })
})

it('TDD 635: serialized assignment forecast includes weekend in calendar span', () => {
  expect(createTaskGanttResourceDateProjection([task('a','p1'), task('b','p1')], [], '2026-10-22').calendarWindow).toEqual({ startDate: '2026-10-22', finishDate: '2026-10-27', calendarDays: 6 })
})

it('TDD 636: milestone-only forecast occupies one calendar day', () => {
  expect(createTaskGanttResourceDateProjection([task('m','p1',true)], [], '2026-10-17').calendarWindow).toEqual({ startDate: '2026-10-19', finishDate: '2026-10-19', calendarDays: 1 })
})
