import { expect, it } from 'vitest'
import { loadDurableRegisters } from './durable-register-snapshot'
import type { RegisterChange } from './convergent-registers'

const room = 'a'.repeat(64)
const other = 'b'.repeat(64)
const alpha: RegisterChange = { id: 'a:1', actor: 'a', clock: 1, entity: 'task-1', field: 'title', value: 'Alpha' }
const beta: RegisterChange = { id: 'b:1', actor: 'b', clock: 1, entity: 'task-1', field: 'status', value: 'doing' }
function backend(records: Record<string,unknown>) {
  const data = new Map(Object.entries(records))
  return { get: async (key: string) => data.get(key), keys: async () => [...data.keys()] }
}
const key = (r: string, id: string) => `register-change:${r}:${id}`
it('TDD 832: independently persisted changes materialize one convergent view', async () => {
  const result = await loadDurableRegisters(backend({ [key(room, alpha.id)]: alpha, [key(room,beta.id)]: beta }), room)
  expect(result['task-1']).toEqual({ title: 'Alpha', status: 'doing' })
})
it('TDD 833: register snapshots are strictly isolated by workspace room', async () => {
  const result = await loadDurableRegisters(backend({ [key(other,alpha.id)]: alpha }), room)
  expect(Object.keys(result)).toEqual([])
})
it('TDD 834: corrupted durable records reject the snapshot rather than silently disappearing', async () => {
  await expect(loadDurableRegisters(backend({ [key(room,alpha.id)]: { ...alpha, clock: -2 } }), room))
    .rejects.toThrow('Invalid register change')
})
it('TDD 835: stored key identity must match the actual change ID', async () => {
  await expect(loadDurableRegisters(backend({ [key(room,'impostor')]: alpha }), room))
    .rejects.toThrow('Stored register identity mismatch')
})
it('TDD 836: tombstones are respected after reload and cannot resurrect old fields', async () => {
  const deleted: RegisterChange = { id: 'b:2', actor: 'b', clock: 2, entity: 'task-1', field: '$deleted', value: true }
  const result = await loadDurableRegisters(backend({ [key(room,alpha.id)]: alpha, [key(room,deleted.id)]: deleted }), room)
  expect(result['task-1']).toBeUndefined()
})
