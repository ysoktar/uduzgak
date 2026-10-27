import { expect, it } from 'vitest'
import { createTask, type Task } from './task'
import { createTaskGanttResourceOverview } from './task-gantt-resource-overview'

function scheduled(id: string, assigneeIds: string[]): Task {
  return {
    ...createTask({ id, projectId: 'project', title: id, now: '2026-10-19T08:00:00.000Z' }),
    startDate: '2026-10-19',
    dueDate: '2026-10-20',
    assigneeIds,
  }
}

it('TDD 647: resource overview exposes one consistent plan and dated projection', () => {
  const overview = createTaskGanttResourceOverview(
    [scheduled('first', ['p']), scheduled('second', ['p'])], [],
  )
  expect(overview.plan.durationDays).toBe(4)
  expect(overview.plan.waitingTaskIds).toEqual(['second'])
  expect(overview.forecast?.completionDate).toBe('2026-10-22')
})

it('TDD 648: overview omits dates when no task is scheduled', () => {
  const overview = createTaskGanttResourceOverview([], [])
  expect(overview.plan.rows).toEqual([])
  expect(overview.forecast).toBeNull()
})

it('TDD 649: overview respects explicitly excluded calendar dates', () => {
  const overview = createTaskGanttResourceOverview([scheduled('first', ['p'])], [], ['2026-10-20'])
  expect(overview.forecast?.calendarWindow).toEqual({
    startDate: '2026-10-19', finishDate: '2026-10-21', calendarDays: 3,
  })
})

it('TDD 650: overview preserves input task order without mutating dates', () => {
  const tasks = [scheduled('first', ['one']), scheduled('second', ['two'])]
  const before = JSON.stringify(tasks)
  const overview = createTaskGanttResourceOverview(tasks, [])
  expect(overview.forecast?.rows.map(row => row.taskId)).toEqual(['first', 'second'])
  expect(JSON.stringify(tasks)).toBe(before)
})

it('TDD 651: overview allows a Sunday-to-Thursday week', () => {
  const overview = createTaskGanttResourceOverview(
    [scheduled('first', ['p'])], [], [], [0, 1, 2, 3, 4],
  )
  expect(overview.forecast?.rows[0].startDate).toBe('2026-10-19')
})
