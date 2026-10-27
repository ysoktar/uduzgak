import { expect, it } from 'vitest'
import { createTask, type Task } from './task'
import { createTaskGanttResourceDateProjection } from './task-gantt-resource-plan'

function task(id: string): Task {
  return {
    ...createTask({ id, projectId: 'p', title: id, now: '2026-10-19T08:00:00.000Z' }),
    startDate: '2026-10-19',
    dueDate: '2026-10-20',
    assigneeIds: ['person-1'],
  }
}

it('TDD 622: invalid anchor is rejected even without scheduled Tasks', () => {
  expect(() => createTaskGanttResourceDateProjection([], [], '2026-02-30'))
    .toThrow('Invalid Gantt anchor date')
})
