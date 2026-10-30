import { expect, it } from 'vitest'
import { createEncryptedInbox } from './encrypted-inbox'
const room = 'a'.repeat(64)
const otherRoom = 'b'.repeat(64)
const first = '1'.repeat(32)
const second = '2'.repeat(32)
const sealed = Uint8Array.from([1, ...Array(28).fill(0)])
function storage() {
  const values = new Map<string, unknown>()
  return {
    get: async (key: string) => values.get(key),
    set: async (key: string, value: unknown) => { values.set(key, value) },
    delete: async (key: string) => { values.delete(key) },
    keys: async () => [...values.keys()],
  }
}
it('TDD 802: downloaded ciphertext persists for offline processing', async () => {
  const backend = storage()
  await createEncryptedInbox(backend).receive(room, [{ id: first, ciphertext: sealed }])
  expect(await createEncryptedInbox(backend).pending(room)).toEqual([{ id: first, ciphertext: sealed }])
})
it('TDD 803: repeated downloads do not duplicate an existing change', async () => {
  const inbox = createEncryptedInbox(storage())
  await inbox.receive(room, [{ id: first, ciphertext: sealed }])
  await inbox.receive(room, [{ id: first, ciphertext: sealed }])
  expect(await inbox.pending(room)).toHaveLength(1)
})
it('TDD 804: reused change identifiers with different ciphertext are rejected', async () => {
  const inbox = createEncryptedInbox(storage())
  await inbox.receive(room, [{ id: first, ciphertext: sealed }])
  await expect(inbox.receive(room, [{ id: first, ciphertext: Uint8Array.from([...sealed, 7]) }]))
    .rejects.toThrow('Change ID conflict')
})
it('TDD 805: one room cannot inspect or acknowledge another room changes', async () => {
  const inbox = createEncryptedInbox(storage())
  await inbox.receive(room, [{ id: first, ciphertext: sealed }])
  await inbox.receive(otherRoom, [{ id: second, ciphertext: sealed }])
  await inbox.acknowledge(room, first)
  expect(await inbox.pending(room)).toEqual([])
  expect(await inbox.pending(otherRoom)).toHaveLength(1)
})
it('TDD 806: malformed remote data cannot enter durable storage', async () => {
  const inbox = createEncryptedInbox(storage())
  await expect(inbox.receive(room, [{ id: first, ciphertext: new TextEncoder().encode('plaintext') }]))
    .rejects.toThrow('Invalid encrypted change')
  await expect(inbox.receive('wrong-room', [{ id: first, ciphertext: sealed }]))
    .rejects.toThrow('Invalid change identity')
  expect(await inbox.pending(room)).toEqual([])
})
