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

it('TDD 592: milestones do not consume resource capacity', () => {
  const rows = createTaskGanttResourcePlan([task('milestone',['p1'],'2026-10-19','2026-10-19',true),task('a',['p1'])],[]).rows
  expect(rows.map(row => [row.earliestStart,row.earliestFinish])).toEqual([[0,0],[0,2]])
})
