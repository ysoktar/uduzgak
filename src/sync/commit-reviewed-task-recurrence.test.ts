import { expect, it, vi } from 'vitest'
import { createProject } from '../domain/project'
import { createTask } from '../domain/task'
import { createWorkspaceStore } from '../application/workspace-store'
import { loadWorkspace, saveWorkspace } from '../persistence/workspace-storage'
import { commitReviewedTaskChanges } from './commit-reviewed-task-changes'

const at = '2026-11-02T12:00:00.000Z'
const project = createProject({ id: 'project-1', name: 'Project', now: at })
const plain = createTask({ id: 'plain', projectId: project.id, title: 'Simple', now: at })
const recurring = {
  ...createTask({ id: 'recurring', projectId: project.id, title: 'Daily', now: at }),
  dueDate: '2026-11-02',
  recurrence: { unit: 'day' as const, interval: 1 },
  checklist: [{ id: 'item-1', text: 'Inspect', completed: true }],
}
function fixture(tasks = [recurring, plain]) {
  const data = new Map<string, string>()
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
  }
  saveWorkspace(storage, { projects: [project], tasks })
  return { store: createWorkspaceStore(storage), storage }
}
const status = (taskId: string, before: string, after: string) => ({
  taskId, field: 'status' as const, before, after,
})

it('TDD 967: reviewed recurring completion creates the next occurrence atomically', () => {
  const f = fixture()
  const nextId = vi.fn(() => 'next-recurring')
  expect(commitReviewedTaskChanges(f.store, [
    status('recurring', 'todo', 'done'),
  ], at, { nextId })).toBe(1)
  expect(nextId).toHaveBeenCalledTimes(1)
  expect(f.store.getState().tasks).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'recurring', status: 'done' }),
    expect.objectContaining({
      id: 'next-recurring', status: 'todo', dueDate: '2026-11-03',
      checklist: [{ id: 'item-1', text: 'Inspect', completed: false }],
    }),
  ]))
  expect(loadWorkspace(f.storage).tasks).toHaveLength(3)
})

it('TDD 968: ordinary status changes do not allocate occurrence IDs', () => {
  const f = fixture()
  const nextId = vi.fn(() => 'unused')
  commitReviewedTaskChanges(f.store, [
    status('plain', 'todo', 'done'),
    status('recurring', 'todo', 'doing'),
  ], at, { nextId })
  expect(nextId).not.toHaveBeenCalled()
  expect(f.store.getState().tasks).toHaveLength(2)
})

it('TDD 969: recurring completion without an ID allocator aborts before persistence', () => {
  const f = fixture()
  const original = JSON.stringify(f.store.getState())
  expect(() => commitReviewedTaskChanges(f.store, [
    status('recurring', 'todo', 'done'),
  ], at)).toThrow('Reviewed recurring Task requires an ID allocator')
  expect(JSON.stringify(f.store.getState())).toBe(original)
  expect(JSON.stringify(loadWorkspace(f.storage))).toBe(original)
})

it('TDD 970: duplicate generated occurrence ID is rejected without committing', () => {
  const f = fixture()
  expect(() => commitReviewedTaskChanges(f.store, [
    status('recurring', 'todo', 'done'),
  ], at, { nextId: () => 'plain' })).toThrow('Reviewed recurring Task ID conflict')
  expect(f.store.getState().tasks).toHaveLength(2)
  expect(f.store.getState().tasks[0]?.status).toBe('todo')
})

it('TDD 971: invalid recurring rule rejects the whole reviewed batch', () => {
  const f = fixture([{ ...recurring, recurrence: { unit: 'day' as const, interval: 0 } }, plain])
  const original = JSON.stringify(f.store.getState())
  expect(() => commitReviewedTaskChanges(f.store, [
    status('plain', 'todo', 'doing'),
    status('recurring', 'todo', 'done'),
  ], at, { nextId: () => 'new' })).toThrow('Task recurrence interval must be a positive integer')
  expect(JSON.stringify(f.store.getState())).toBe(original)
})
