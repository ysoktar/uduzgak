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

it('TDD 607: derived resource plan identifies blocked task IDs', () => {
  const plan=createTaskGanttResourcePlan([task('a',['p1']),task('b',['p1'])],[])
  expect(plan.waitingTaskIds).toEqual(['b'])
})

it('TDD 608: contention-free schedules have no waiting Tasks', () => {
  const plan=createTaskGanttResourcePlan([task('a',['p1']),task('b',['p2'])],[])
  expect(plan.waitingTaskIds).toEqual([])
})

it('TDD 609: resource-wait identifiers preserve the source Task order', () => {
  const plan=createTaskGanttResourcePlan([task('a',['p1']),task('b',['p1']),task('c',['p1'])],[])
  expect(plan.waitingTaskIds).toEqual(['b','c'])
})

it('TDD 610: dependency-only delays do not count as contention', () => {
  const plan=createTaskGanttResourcePlan([task('a',['p1']),task('b',['p2'])],[blocks('r1','a','b')])
  expect(plan.waitingTaskIds).toEqual([])
})
