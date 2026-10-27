import { expect, it, vi } from 'vitest'
import { createProject } from '../domain/project'
import { createDefaultViewPreferences, updateViewPreferences } from '../domain/view-preferences'
import { saveViewPreferences } from './view-preferences-storage'
import { saveWorkspace, type KeyValueStore } from './workspace-storage'
import { parseWorkspaceBackup } from './workspace-backup'
import { seedLocalFirstReplica } from './local-first-replica-seed'

class MemoryStore implements KeyValueStore {
  readonly data = new Map<string, string>()
  readonly writes: string[] = []
  getItem(key: string) { return this.data.get(key) ?? null }
  setItem(key: string, value: string) { this.writes.push(key); this.data.set(key, value) }
}
const now = '2026-10-27T10:00:00.000Z'

function source() {
  const storage = new MemoryStore()
  saveWorkspace(storage, {
    projects: [createProject({ id: 'p1', name: 'Local project', now })],
    tasks: [],
  })
  saveViewPreferences(storage, updateViewPreferences(createDefaultViewPreferences(), { projectView: 'p1' }))
  storage.writes.length = 0
  return storage
}

it('TDD 717: replica seed retains current Workspace entities', async () => {
  const storage = source()
  const published: string[] = []
  await seedLocalFirstReplica(storage, now, async doc => { published.push(doc) })
  expect(parseWorkspaceBackup(published[0]).workspace.projects[0].name).toBe('Local project')
})

it('TDD 718: replica seed retains saved view preferences', async () => {
  const published: string[] = []
  await seedLocalFirstReplica(source(), now, async doc => { published.push(doc) })
  expect(parseWorkspaceBackup(published[0]).viewPreferences.projectView).toBe('p1')
})

it('TDD 719: existing browser data is never mutated during seed', async () => {
  const storage = source()
  const before = new Map(storage.data)
  await seedLocalFirstReplica(storage, now, async () => undefined)
  expect(storage.writes).toEqual([])
  expect(storage.data).toEqual(before)
})

it('TDD 720: failed destination leaves original data intact', async () => {
  const storage = source()
  const before = new Map(storage.data)
  await expect(seedLocalFirstReplica(storage, now, async () => { throw new Error('Disk full') }))
    .rejects.toThrow('Disk full')
  expect(storage.data).toEqual(before)
  expect(storage.writes).toEqual([])
})

it('TDD 721: destination is invoked only once with a versioned document', async () => {
  const publish = vi.fn(async (_document: string) => undefined)
  await seedLocalFirstReplica(source(), now, publish)
  expect(publish).toHaveBeenCalledOnce()
  expect(parseWorkspaceBackup(publish.mock.calls[0][0]).version).toBe(1)
})
