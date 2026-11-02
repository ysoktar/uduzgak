import { expect, it, vi } from 'vitest'
import { createEncryptedInbox } from './encrypted-inbox'
import { pullEncryptedChanges } from './pull-encrypted-changes'

const room = 'a'.repeat(64)
const firstId = 'b'.repeat(32)
const secondId = 'c'.repeat(32)
const packet = (last = 0) => Uint8Array.from([1, ...Array(27).fill(0), last])

function fixture() {
  const data = new Map<string, unknown>()
  const get = vi.fn(async (key: string) => data.get(key))
  const set = vi.fn(async (key: string, value: unknown) => { data.set(key, value) })
  const backend = {
    get,
    set,
    delete: async (key: string) => { data.delete(key) },
    keys: async () => [...data.keys()],
  }
  return { inbox: createEncryptedInbox(backend), get, set }
}

it('TDD 877: stored conflicts reject an entire incoming batch before writing fresh packets', async () => {
  const { inbox } = fixture()
  await inbox.receive(room, [{ id: secondId, ciphertext: packet(1) }])
  await expect(inbox.receive(room, [
    { id: firstId, ciphertext: packet() },
    { id: secondId, ciphertext: packet(2) },
  ])).rejects.toThrow('Change ID conflict')
  expect((await inbox.pending(room)).map(change => change.id)).toEqual([secondId])
})

it('TDD 878: conflicting duplicate IDs in one download cannot leave a partial inbox entry', async () => {
  const { inbox } = fixture()
  await expect(inbox.receive(room, [
    { id: firstId, ciphertext: packet() },
    { id: firstId, ciphertext: packet(1) },
  ])).rejects.toThrow('Change ID conflict')
  expect(await inbox.pending(room)).toEqual([])
})

it('TDD 879: identical duplicate packets are checked and written only once', async () => {
  const { inbox, get, set } = fixture()
  await inbox.receive(room, [
    { id: firstId, ciphertext: packet() },
    { id: firstId, ciphertext: packet() },
  ])
  expect(get).toHaveBeenCalledTimes(1)
  expect(set).toHaveBeenCalledTimes(1)
  expect(await inbox.pending(room)).toHaveLength(1)
})

it('TDD 880: remote receive reports the number of distinct new packets', async () => {
  const { inbox } = fixture()
  const result = await pullEncryptedChanges(inbox, {
    download: async () => [
      { id: firstId, ciphertext: packet() },
      { id: firstId, ciphertext: packet() },
    ],
  }, room)
  expect(result).toEqual({ received: 1, pending: 1 })
})

it('TDD 881: mixed replay and duplicate fresh packets only count new identities once', async () => {
  const { inbox } = fixture()
  await inbox.receive(room, [{ id: firstId, ciphertext: packet() }])
  const result = await pullEncryptedChanges(inbox, {
    download: async () => [
      { id: firstId, ciphertext: packet() },
      { id: secondId, ciphertext: packet(1) },
      { id: secondId, ciphertext: packet(1) },
    ],
  }, room)
  expect(result).toEqual({ received: 1, pending: 2 })
})
