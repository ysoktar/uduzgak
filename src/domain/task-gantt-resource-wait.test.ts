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

it('TDD 602: shared-assignee task records resource wait separately', () => {
  const rows=createTaskGanttResourcePlan([task('a',['p1']),task('b',['p1'])],[]).rows
  expect(rows.map(row=>row.resourceWaitDays)).toEqual([0,2])
})

it('TDD 603: independent assignees have no resource wait', () => {
  const rows=createTaskGanttResourcePlan([task('a',['p1']),task('b',['p2'])],[]).rows
  expect(rows.map(row=>row.resourceWaitDays)).toEqual([0,0])
})

it('TDD 604: dependency wait is not double-counted as resource wait', () => {
  const rows=createTaskGanttResourcePlan([task('a',['p1']),task('b',['p2'])],[blocks('edge','a','b')]).rows
  expect(rows[1].earliestStart).toBe(2)
  expect(rows[1].resourceWaitDays).toBe(0)
})

it('TDD 605: multi-person task waits for its latest available assignee', () => {
  const rows=createTaskGanttResourcePlan([task('a',['p1']),task('b',['p2']),task('c',['p1','p2'])],[]).rows
  expect(rows[2].resourceWaitDays).toBe(2)
  expect(rows[2].earliestStart).toBe(2)
})
