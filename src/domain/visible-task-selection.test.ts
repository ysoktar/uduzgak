import { expect, it } from 'vitest'
import { createTask } from './task'
import { selectVisibleTasks } from './visible-task-selection'

function task(id: string, title: string, status: 'todo' | 'doing' | 'done' = 'todo', dueDate?: string) {
  return {
    ...createTask({ id, projectId: 'p', title, now: '2026-10-19T08:00:00.000Z' }),
    status, ...(dueDate ? { dueDate } : {}),
  }
}
const tasks = [
  task('a', 'Alpha', 'todo', '2026-10-20'),
  task('b', 'Beta', 'doing'),
  task('c', 'Gamma', 'done', '2026-10-21'),
]
const all = { query: '', status: 'all' as const, priority: 'all' as const, dueDate: 'all' as const }

it('TDD 682: matching Task title filters before sorting', () => {
  expect(selectVisibleTasks(tasks, { ...all, query: 'bet' }, 'title').map(t => t.id)).toEqual(['b'])
})
it('TDD 683: status filter excludes unrelated tasks', () => {
  expect(selectVisibleTasks(tasks, { ...all, status: 'done' }, 'created').map(t => t.id)).toEqual(['c'])
})
it('TDD 684: due-date presence excludes undated tasks', () => {
  expect(selectVisibleTasks(tasks, { ...all, dueDate: 'withDueDate' }, 'title').map(t => t.id)).toEqual(['a', 'c'])
})
it('TDD 685: title sort orders filtered tasks deterministically', () => {
  expect(selectVisibleTasks([...tasks].reverse(), all, 'title').map(t => t.id)).toEqual(['a', 'b', 'c'])
})
it('TDD 686: source Task ordering is not mutated', () => {
  const reverse = [...tasks].reverse()
  const before = reverse.map(t => t.id)
  selectVisibleTasks(reverse, all, 'title')
  expect(reverse.map(t => t.id)).toEqual(before)
})
