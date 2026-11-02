import { expect, it, vi } from 'vitest'
import { createTask } from '../domain/task'
import { applyReviewedTaskChanges } from './apply-reviewed-task-changes'
import type { PreviewedTaskChange } from './task-change-preview'

const task = createTask({
  id: 'task-1', projectId: 'project-1', title: 'Local',
  now: '2026-11-02T09:00:00.000Z',
})
const change = (field: PreviewedTaskChange['field'], before: string, after: string): PreviewedTaskChange =>
  ({ taskId: task.id, field, before, after })

function commands() {
  return {
    renameTask: vi.fn(),
    changeTaskStatus: vi.fn(),
    changeTaskPriority: vi.fn(),
  }
}
function noCalls(callbacks: ReturnType<typeof commands>) {
  expect(callbacks.renameTask).not.toHaveBeenCalled()
  expect(callbacks.changeTaskStatus).not.toHaveBeenCalled()
  expect(callbacks.changeTaskPriority).not.toHaveBeenCalled()
}

it('TDD 952: approved title change reaches the normal Task command only on explicit invocation', () => {
  const callbacks = commands()
  applyReviewedTaskChanges([task], [change('title', 'Local', 'Remote')], callbacks)
  expect(callbacks.renameTask).toHaveBeenCalledExactlyOnceWith(task.id, 'Remote')
  expect(callbacks.changeTaskStatus).not.toHaveBeenCalled()
  expect(task.title).toBe('Local')
})

it('TDD 953: valid status and priority edits route to the existing Task commands', () => {
  const callbacks = commands()
  applyReviewedTaskChanges([task], [
    change('status', 'todo', 'doing'),
    change('priority', 'normal', 'high'),
  ], callbacks)
  expect(callbacks.changeTaskStatus).toHaveBeenCalledExactlyOnceWith(task.id, 'doing')
  expect(callbacks.changeTaskPriority).toHaveBeenCalledExactlyOnceWith(task.id, 'high')
})

it('TDD 954: one stale before-value blocks the entire reviewed set before any command runs', () => {
  const callbacks = commands()
  expect(() => applyReviewedTaskChanges([task], [
    change('title', 'Local', 'Remote'),
    change('status', 'done', 'doing'),
  ], callbacks)).toThrow('Stale reviewed Task change')
  noCalls(callbacks)
})

it('TDD 955: unknown and archived Tasks never receive remote field mutations', () => {
  const callbacks = commands()
  expect(() => applyReviewedTaskChanges([task], [
    { taskId: 'missing', field: 'title', before: 'X', after: 'Y' },
  ], callbacks)).toThrow('Unknown or archived reviewed Task')
  noCalls(callbacks)
  expect(() => applyReviewedTaskChanges([{ ...task, archivedAt: '2026-11-02T09:05:00.000Z' }], [
    change('title', 'Local', 'Remote'),
  ], callbacks)).toThrow('Unknown or archived reviewed Task')
  noCalls(callbacks)
})

it('TDD 956: duplicate fields or invalid values fail before mutating any Task', () => {
  const callbacks = commands()
  expect(() => applyReviewedTaskChanges([task], [
    change('title', 'Local', 'Remote'),
    change('title', 'Local', 'Another'),
  ], callbacks)).toThrow('Duplicate reviewed Task field')
  noCalls(callbacks)
  expect(() => applyReviewedTaskChanges([task], [
    change('title', 'Local', 'Remote'),
    change('priority', 'normal', 'critical'),
  ], callbacks)).toThrow('Invalid reviewed Task change')
  noCalls(callbacks)
})
