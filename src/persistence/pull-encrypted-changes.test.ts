import { expect, it, vi } from 'vitest'
import { pullEncryptedChanges } from './pull-encrypted-changes'
import { createEncryptedInbox } from './encrypted-inbox'
const room = 'a'.repeat(64), id = 'b'.repeat(32)
const ciphertext = Uint8Array.from([1, ...Array(28).fill(0)])
function inbox() {
  const values = new Map<string, unknown>()
  return createEncryptedInbox({
    get: async key => values.get(key),
    set: async (key, value) => { values.set(key, value) },
    delete: async key => { values.delete(key) },
    keys: async () => [...values.keys()],
  })
}
it('TDD 807: retrieved ciphertext remains durable for future processing', async () => {
  const store = inbox()
  const client = { download: vi.fn(async () => [{ id, ciphertext }]) }
  expect(await pullEncryptedChanges(store, client, room)).toEqual({ received: 1, pending: 1 })
  expect((await store.pending(room))[0].ciphertext).toEqual(ciphertext)
})
it('TDD 808: repeating a remote download does not duplicate records', async () => {
  const store = inbox(), client = { download: async () => [{ id, ciphertext }] }
  await pullEncryptedChanges(store, client, room)
  expect(await pullEncryptedChanges(store, client, room)).toEqual({ received: 0, pending: 1 })
})
it('TDD 809: network errors leave existing received changes intact', async () => {
  const store = inbox()
  await store.receive(room, [{ id, ciphertext }])
  await expect(pullEncryptedChanges(store, { download: async () => { throw new Error('offline') } }, room)).rejects.toThrow('offline')
  expect(await store.pending(room)).toHaveLength(1)
})
it('TDD 810: invalid remote envelopes cannot be acknowledged as received', async () => {
  const store = inbox()
  await expect(pullEncryptedChanges(store, { download: async () => [{ id, ciphertext: new Uint8Array([1]) }] }, room))
    .rejects.toThrow('Invalid encrypted change')
  expect(await store.pending(room)).toEqual([])
})
it('TDD 811: an empty remote room leaves no local queue entries', async () => {
  const store = inbox()
  expect(await pullEncryptedChanges(store, { download: async () => [] }, room)).toEqual({ received: 0, pending: 0 })
})
