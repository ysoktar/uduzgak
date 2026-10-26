import { expect, it } from 'vitest'
import { createTask, type Task } from './task'
import type { TaskRelationship } from './task-relationship'
import { createTaskGanttResourcePlan } from './task-gantt-resource-plan'

function task(id: string, people: string[], start = '2026-10-19', end = '2026-10-20', milestone = false): Task {
  return {
    ...createTask({ id, projectId: 'p-1', title: id, now: '2026-10-19T08:00:00.000Z' }),
    startDate: start, dueDate: end, assigneeIds: people,
    ...(milestone ? { isMilestone: true } : {}),
  }
}
function blocks(id: string, sourceTaskId: string, targetTaskId: string): TaskRelationship {
  return { id, type: 'blocks', sourceTaskId, targetTaskId, createdAt: '2026-10-19T08:00:00.000Z' }
}

it('TDD 587: two scheduled tasks sharing one person occupy successive slots', () => {
  const rows = createTaskGanttResourcePlan([
    task('a', ['person-1']), task('b', ['person-1']),
  ], []).rows
  expect(rows.map(row => [row.taskId, row.earliestStart, row.earliestFinish]))
    .toEqual([['a', 0, 2], ['b', 2, 4]])
})

it('TDD 588: independent assignees may be scheduled concurrently', () => {
  const rows = createTaskGanttResourcePlan([task('a', ['p1']), task('b', ['p2'])], []).rows
  expect(rows.map(row => row.earliestStart)).toEqual([0, 0])
})

it('TDD 589: dependency successors wait for predecessor completion', () => {
  const rows = createTaskGanttResourcePlan([task('a', ['p1']), task('b', ['p2'])], [blocks('r1', 'a', 'b')]).rows
  expect(rows.map(row => row.earliestStart)).toEqual([0, 2])
})

it('TDD 590: unassigned tasks do not block assigned resources', () => {
  const rows = createTaskGanttResourcePlan([task('a', []), task('b', ['p1']), task('c', ['p1'])], []).rows
  expect(rows.map(row => row.earliestStart)).toEqual([0, 0, 2])
})

it('TDD 591: holidays and workweek determine each resource occupancy length', () => {
  const before = [task('a', ['p1'], '2026-10-19', '2026-10-21'), task('b', ['p1'])]
  const rows = createTaskGanttResourcePlan(before, [], ['2026-10-20']).rows
  expect(rows.map(row => [row.earliestStart, row.earliestFinish])).toEqual([[0, 2], [2, 3]])
  expect(before[0].dueDate).toBe('2026-10-21')
})
