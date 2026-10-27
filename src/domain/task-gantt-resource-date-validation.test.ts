import { expect, it } from 'vitest'
import { createTask, type Task } from './task'
import { createTaskGanttResourceDateProjection } from './task-gantt-resource-plan'

function task(id: string): Task {
  return {
    ...createTask({ id, projectId: 'p', title: id, now: '2026-10-19T08:00:00.000Z' }),
    startDate: '2026-10-19',
    dueDate: '2026-10-20',
    assigneeIds: ['person-1'],
  }
}

it('TDD 622: invalid anchor is rejected even without scheduled Tasks', () => {
  expect(() => createTaskGanttResourceDateProjection([], [], '2026-02-30'))
    .toThrow('Invalid Gantt anchor date')
})

it('TDD 623: weekend anchor starts at the first working Monday', () => {
  const rows = createTaskGanttResourceDateProjection([task('a')], [], '2026-10-17').rows
  expect(rows[0]).toMatchObject({ startDate: '2026-10-19', finishDate: '2026-10-20' })
})

it('TDD 624: excluded anchor holiday advances the entire date range', () => {
  const rows = createTaskGanttResourceDateProjection([task('a')], [], '2026-10-19', ['2026-10-19']).rows
  expect(rows[0]).toMatchObject({ startDate: '2026-10-20', finishDate: '2026-10-21' })
})

it('TDD 625: serialized work after a weekend anchor retains two full working-day ranges', () => {
  const rows = createTaskGanttResourceDateProjection([task('a'), task('b')], [], '2026-10-17').rows
  expect(rows.map(({startDate,finishDate}) => [startDate,finishDate])).toEqual([
    ['2026-10-19','2026-10-20'],
    ['2026-10-21','2026-10-22'],
  ])
})
