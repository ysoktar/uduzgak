import { expect, it } from 'vitest'
import { createWorkspaceCommands } from './workspace-commands'
import { createWorkspaceStore } from './workspace-store'
import type { KeyValueStore } from '../persistence/workspace-storage'

class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>()
  getItem(key: string) { return this.data.get(key) ?? null }
  setItem(key: string, value: string) { this.data.set(key, value) }
}

it('reorders Task siblings using one persisted Workspace command', () => {
  const storage = new MemoryStore()
  const store = createWorkspaceStore(storage)
  let serial = 0
  const commands = createWorkspaceCommands(store, {
    nextId: () => `reorder-${++serial}`,
    now: () => '2026-10-26T00:00:00.000Z',
  })
  const project = commands.addProject('A')
  const a = commands.addTask(project.id, 'Alpha')
  const b = commands.addTask(project.id, 'Beta')
  const c = commands.addTask(project.id, 'Gamma')
  const rearrange = (commands as typeof commands & {
    moveTaskBefore?: (sourceId: string, targetId: string) => void
  }).moveTaskBefore
  expect(typeof rearrange).toBe('function')
  rearrange!(a.id, c.id)
  expect(store.getState().tasks.map((task) => task.id)).toEqual([b.id, a.id, c.id])
})
