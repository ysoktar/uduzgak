import { expect, it } from 'vitest'
import { createTask } from './task'
import { createTaskGanttOverviewSelection } from './task-gantt-overview-selection'

const tasks = ['a', 'b', 'c'].map(id => ({
  task: createTask({ id, projectId: 'project', title: id, now: '2026-10-19T08:00:00.000Z' }),
  startDate: null, dueDate: null, isScheduled: false,
}))
const edges = [
  { relationshipId: 'r1', sourceTaskId: 'a', targetTaskId: 'b', sourceTitle: 'a', targetTitle: 'b', directionLabel: 'a blocks b' },
  { relationshipId: 'r2', sourceTaskId: 'b', targetTaskId: 'c', sourceTitle: 'b', targetTitle: 'c', directionLabel: 'b blocks c' },
]

it('TDD 672: unfiltered overview preserves Task and dependency order', () => {
  const selected = createTaskGanttOverviewSelection(tasks, edges, new Set(['a']), new Set(['b']), false, false)
  expect(selected.items.map(item => item.task.id)).toEqual(['a', 'b', 'c'])
  expect(selected.edges.map(edge => edge.relationshipId)).toEqual(['r1', 'r2'])
})

it('TDD 673: dependency-critical selection returns only selected Tasks', () => {
  const selected = createTaskGanttOverviewSelection(tasks, edges, new Set(['a', 'b']), new Set(['c']), true, false)
  expect(selected.items.map(item => item.task.id)).toEqual(['a', 'b'])
})

it('TDD 674: dependency edges stay within filtered endpoints', () => {
  const selected = createTaskGanttOverviewSelection(tasks, edges, new Set(['a', 'b']), new Set(['c']), true, false)
  expect(selected.edges.map(edge => edge.relationshipId)).toEqual(['r1'])
})

it('TDD 675: working-critical selection uses working rather than calendar set', () => {
  const selected = createTaskGanttOverviewSelection(tasks, edges, new Set(['a']), new Set(['b', 'c']), false, true)
  expect(selected.items.map(item => item.task.id)).toEqual(['b', 'c'])
})

it('TDD 676: input collections are never mutated', () => {
  const beforeTasks = JSON.stringify(tasks)
  const beforeEdges = JSON.stringify(edges)
  createTaskGanttOverviewSelection(tasks, edges, new Set(['a']), new Set(['b']), true, false)
  expect(JSON.stringify(tasks)).toBe(beforeTasks)
  expect(JSON.stringify(edges)).toBe(beforeEdges)
})
