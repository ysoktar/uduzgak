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
