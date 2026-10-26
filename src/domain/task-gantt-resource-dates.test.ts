import { expect, it } from 'vitest'
import { createTask, type Task } from './task'
import type { TaskRelationship } from './task-relationship'
import { createTaskGanttResourceDateProjection } from './task-gantt-resource-plan'

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

it('TDD 617: same-person tasks map to successive working-date ranges', () => {
  const rows=createTaskGanttResourceDateProjection([task('a',['p1']),task('b',['p1'])],[],'2026-10-19').rows
  expect(rows.map(row=>[row.startDate,row.finishDate])).toEqual([
    ['2026-10-19','2026-10-20'],
    ['2026-10-21','2026-10-22'],
  ])
})

it('TDD 618: independent resources share projected working dates', () => {
  const rows=createTaskGanttResourceDateProjection([task('a',['p1']),task('b',['p2'])],[],'2026-10-19').rows
  expect(rows.map(row=>row.startDate)).toEqual(['2026-10-19','2026-10-19'])
})

it('TDD 619: excluded holidays shift projected finish dates', () => {
  const rows=createTaskGanttResourceDateProjection([task('a',['p1'])],[],'2026-10-19',['2026-10-20']).rows
  expect(rows[0].startDate).toBe('2026-10-19')
  expect(rows[0].finishDate).toBe('2026-10-21')
})

it('TDD 620: zero-day milestones project to a single working date', () => {
  const rows=createTaskGanttResourceDateProjection([task('m',['p1'],'2026-10-19','2026-10-19',true)],[],'2026-10-19').rows
  expect(rows[0]).toEqual({taskId:'m',startDate:'2026-10-19',finishDate:'2026-10-19',isMilestone:true})
})

it('TDD 621: invalid projection anchors are rejected', () => {
  expect(()=>createTaskGanttResourceDateProjection([task('a',['p1'])],[],'2026-02-30')).toThrow('Invalid Gantt anchor date')
})
