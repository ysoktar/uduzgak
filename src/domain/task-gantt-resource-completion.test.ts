import { expect, it } from 'vitest'
import { createTask, type Task } from './task'
import { createTaskGanttResourceDateProjection } from './task-gantt-resource-plan'

function task(id: string, person: string, milestone = false): Task {
  return {
    ...createTask({ id, projectId: 'p1', title: id, now: '2026-10-19T08:00:00.000Z' }),
    startDate: '2026-10-19',
    dueDate: milestone ? '2026-10-19' : '2026-10-20',
    assigneeIds: [person],
    ...(milestone ? { isMilestone: true } : {}),
  }
}

it('TDD 627: an empty resource forecast has no completion date', () => {
  expect(createTaskGanttResourceDateProjection([], [], '2026-10-19').completionDate).toBeNull()
})
