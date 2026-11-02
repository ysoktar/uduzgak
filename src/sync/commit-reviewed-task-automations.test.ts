import { expect, it } from 'vitest'
import { createAutomation } from '../domain/automation'
import { createProject } from '../domain/project'
import { createTask } from '../domain/task'
import { createWorkspaceStore } from '../application/workspace-store'
import { saveWorkspace, loadWorkspace } from '../persistence/workspace-storage'
import { commitReviewedTaskChanges } from './commit-reviewed-task-changes'

const now = '2026-11-02T11:00:00.000Z'
const project = createProject({ id: 'project', name: 'Project', now })
const task = createTask({ id: 'task', projectId: project.id, title: 'Draft', now })
function fixture(automations: ReturnType<typeof createAutomation>[] = []) {
  const data = new Map<string, string>()
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
  }
  saveWorkspace(storage, { projects: [project], tasks: [task], automations })
  return { store: createWorkspaceStore(storage), storage }
}
const status = { taskId: task.id, field: 'status' as const, before: 'todo', after: 'doing' }
const priority = { taskId: task.id, field: 'priority' as const, before: 'normal', after: 'high' }

it('TDD 962: reviewed status triggers existing priority automation', () => {
  const automation = createAutomation({
    id: 'auto', name: 'Escalate', enabled: true,
    trigger: { kind: 'task.statusChanged' }, conditions: [],
    actions: [{ kind: 'priority.set', priority: 'high' }],
  })
  const f = fixture([automation])
  expect(commitReviewedTaskChanges(f.store, [status], now)).toBe(1)
  expect(f.store.getState().tasks[0]).toMatchObject({ status: 'doing', priority: 'high' })
  expect(loadWorkspace(f.storage).tasks[0]?.priority).toBe('high')
})

it('TDD 963: automation and reviewed field changes commit with one store notification', () => {
  const automation = createAutomation({
    id: 'auto', name: 'Escalate', enabled: true,
    trigger: { kind: 'task.statusChanged' }, conditions: [],
    actions: [{ kind: 'priority.set', priority: 'high' }],
  })
  const f = fixture([automation])
  let notified = 0
  f.store.subscribe(() => { notified++ })
  commitReviewedTaskChanges(f.store, [status], now)
  expect(notified).toBe(1)
  expect(f.store.getState().activity?.map(x => x.event.kind)).toEqual([
    'task.statusChanged', 'task.priorityChanged',
  ])
})

it('TDD 964: a failing automation rolls back every reviewed field edit', () => {
  const automation = createAutomation({
    id: 'auto', name: 'Escalate', enabled: true,
    trigger: { kind: 'task.statusChanged' }, conditions: [],
    actions: [{ kind: 'priority.set', priority: 'high' }],
  })
  const f = fixture([automation])
  const before = JSON.stringify(f.store.getState())
  expect(() => commitReviewedTaskChanges(f.store, [status], now, { maxAutomationActionApplications: 0 }))
    .toThrow()
  expect(JSON.stringify(f.store.getState())).toBe(before)
  expect(JSON.stringify(loadWorkspace(f.storage))).toBe(before)
})

it('TDD 965: two reviewed edits are simulated in sequence with automations', () => {
  const f = fixture()
  expect(commitReviewedTaskChanges(f.store, [status, priority], now)).toBe(2)
  expect(f.store.getState().tasks[0]).toMatchObject({ status: 'doing', priority: 'high' })
})

it('TDD 966: a stale reviewed value prevents automation side effects', () => {
  const automation = createAutomation({
    id: 'auto', name: 'Escalate', enabled: true,
    trigger: { kind: 'task.statusChanged' }, conditions: [],
    actions: [{ kind: 'priority.set', priority: 'high' }],
  })
  const f = fixture([automation])
  expect(() => commitReviewedTaskChanges(f.store, [
    { ...status, before: 'done' },
  ], now)).toThrow('Stale reviewed Task change')
  expect(f.store.getState().tasks[0]).toMatchObject({ status: 'todo', priority: 'normal' })
})
