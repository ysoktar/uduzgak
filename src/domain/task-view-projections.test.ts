import { expect, it } from 'vitest'
import { createTask } from './task'
import { createTaskViewProjections } from './task-view-projections'

function task(id: string, dueDate?: string) {
  return { ...createTask({ id, projectId: 'project', title: id, now: '2026-10-19T08:00:00.000Z' }),
    ...(dueDate ? { dueDate } : {}) }
}
const tasks = [task('first', '2026-10-20'), task('second')]

it('TDD 677: list grouping retains the original task sequence', () => {
  const views = createTaskViewProjections(tasks, [], 'none')
  expect(views.groups[0].tasks.map(t => t.id)).toEqual(['first', 'second'])
})

it('TDD 678: Board columns represent all status categories', () => {
  const views = createTaskViewProjections(tasks, [], 'none')
  expect(views.board.map(column => column.key)).toEqual(['todo', 'doing', 'done'])
})

it('TDD 679: Calendar places undated work last', () => {
  const views = createTaskViewProjections(tasks, [], 'none')
  expect(views.calendar.map(section => section.label)).toEqual(['2026-10-20', 'No due date'])
})

it('TDD 680: Table projection provides a fallback for missing lists', () => {
  const views = createTaskViewProjections(tasks, [], 'none')
  expect(views.table[0].list).toBe('No list')
})

it('TDD 681: Timeline projection preserves dated then undated ordering', () => {
  const views = createTaskViewProjections([...tasks].reverse(), [], 'none')
  expect(views.timeline.map(item => item.task.id)).toEqual(['first', 'second'])
})
