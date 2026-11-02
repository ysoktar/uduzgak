import { expect, it } from 'vitest'
import { createProject } from '../domain/project'
import { createTask } from '../domain/task'
import { createWorkspaceStore } from '../application/workspace-store'
import { loadWorkspace, saveWorkspace } from '../persistence/workspace-storage'
import { commitReviewedTaskChanges } from './commit-reviewed-task-changes'
import type { PreviewedTaskChange } from './task-change-preview'

const now = '2026-11-02T09:00:00.000Z'
const task = createTask({ id: 'task-1', projectId: 'project-1', title: 'Original', now })
const project = createProject({ id: 'project-1', name: 'Project', now })
function fixture(failWrites = false) {
  const values = new Map<string, string>()
  let writes = 0
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (failWrites) throw new Error('Disk unavailable')
      writes++
      values.set(key, value)
    },
  }
  if (!failWrites) saveWorkspace(storage, { projects: [project], tasks: [task] })
  const store = createWorkspaceStore(storage)
  const count = () => writes
  return { store, storage, count }
}
function change(field: PreviewedTaskChange['field'], before: string, after: string): PreviewedTaskChange {
  return { taskId: task.id, field, before, after }
}

it('TDD 957: two reviewed field edits are persisted with one notification and one write', () => {
  const f = fixture()
  const events: string[] = []
  f.store.subscribe(() => events.push(f.store.getState().tasks[0]?.title ?? ''))
  const baseline = f.count()
  const result = commitReviewedTaskChanges(f.store, [
    change('title', 'Original', 'Remote'),
    change('priority', 'normal', 'high'),
  ], now)
  expect(result).toBe(2)
  expect(f.store.getState().tasks[0]).toMatchObject({ title: 'Remote', priority: 'high' })
  expect(f.count()).toBe(baseline + 1)
  expect(events).toEqual(['Remote'])
  expect(loadWorkspace(f.storage).tasks[0]).toMatchObject({ title: 'Remote', priority: 'high' })
})

it('TDD 958: stale reviewed edits reject the entire batch without writing', () => {
  const f = fixture()
  const before = JSON.stringify(f.store.getState())
  const baseline = f.count()
  expect(() => commitReviewedTaskChanges(f.store, [
    change('title', 'Original', 'Remote'),
    change('status', 'done', 'doing'),
  ], now)).toThrow('Stale reviewed Task change')
  expect(JSON.stringify(f.store.getState())).toBe(before)
  expect(f.count()).toBe(baseline)
})

it('TDD 959: rejected persistence leaves the in-memory Workspace and subscribers unchanged', () => {
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (value.includes('Remote')) throw new Error('Disk unavailable')
      values.set(key, value)
    },
  }
  saveWorkspace(storage, { projects: [project], tasks: [task] })
  const store = createWorkspaceStore(storage)
  let observed = 0
  store.subscribe(() => { observed++ })
  expect(() => commitReviewedTaskChanges(store, [
    change('title', 'Original', 'Remote'),
    change('priority', 'normal', 'high'),
  ], now)).toThrow('Disk unavailable')
  expect(store.getState().tasks[0]).toMatchObject({ title: 'Original', priority: 'normal' })
  expect(loadWorkspace(storage).tasks[0]).toMatchObject({ title: 'Original', priority: 'normal' })
  expect(observed).toBe(0)
})

it('TDD 960: reviewed edits retain the normal Task activity history', () => {
  const f = fixture()
  commitReviewedTaskChanges(f.store, [
    change('title', 'Original', 'Remote'),
    change('status', 'todo', 'doing'),
  ], now)
  expect(f.store.getState().activity?.map(entry => entry.event.kind)).toEqual([
    'task.titleChanged',
    'task.statusChanged',
  ])
  expect(f.store.getState().activity?.every(entry => entry.occurredAt === now)).toBe(true)
})

it('TDD 961: a transaction simulation error cannot commit an earlier valid edit', () => {
  const f = fixture()
  const baseline = f.count()
  expect(() => commitReviewedTaskChanges(f.store, [
    change('title', 'Original', 'Remote'),
    change('priority', 'normal', 'high'),
  ], 'invalid-date')).toThrow('Task activity timestamp')
  expect(f.store.getState().tasks[0]?.title).toBe('Original')
  expect(f.store.getState().tasks[0]?.priority).toBe('normal')
  expect(f.count()).toBe(baseline)
})
