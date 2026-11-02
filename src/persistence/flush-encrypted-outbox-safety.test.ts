import { expect, it, vi } from 'vitest'
import { createDurableChangeOutbox } from './durable-change-outbox'
import { flushEncryptedOutbox } from './flush-encrypted-outbox'

const room = 'a'.repeat(64)
const id = 'b'.repeat(32)
const cipher = Uint8Array.from([1, ...Array(28).fill(0)])
function fixture() {
  const values = new Map<string, unknown>()
  const backend = {
    get: async (key: string) => values.get(key),
    set: async (key: string, value: unknown) => { values.set(key, value) },
    delete: vi.fn(async (key: string) => { values.delete(key) }),
    keys: async () => [...values.keys()],
  }
  return { outbox: createDurableChangeOutbox(backend), backend }
}

it('TDD 947: a non-boolean upload response is rejected without acknowledging ciphertext', async () => {
  const f = fixture()
  await f.outbox.enqueue(room, id, cipher)
  const client = { upload: vi.fn(async () => undefined as unknown as boolean) }
  await expect(flushEncryptedOutbox(f.outbox, client, room)).rejects.toThrow('Invalid upload acknowledgement')
  expect(await f.outbox.pending(room)).toHaveLength(1)
  expect(f.backend.delete).not.toHaveBeenCalled()
})

it('TDD 948: a rejected upload leaves the ciphertext available for retry', async () => {
  const f = fixture()
  await f.outbox.enqueue(room, id, cipher)
  await expect(flushEncryptedOutbox(f.outbox, { upload: async () => { throw new Error('offline') } }, room)).rejects.toThrow('offline')
  expect(await f.outbox.pending(room)).toHaveLength(1)
  expect(f.backend.delete).not.toHaveBeenCalled()
})

it('TDD 949: an idempotent false response is a confirmed delivery and is acknowledged', async () => {
  const f = fixture()
  await f.outbox.enqueue(room, id, cipher)
  expect(await flushEncryptedOutbox(f.outbox, { upload: async () => false }, room)).toEqual({ uploaded: 1, remaining: 0 })
  expect(await f.outbox.pending(room)).toEqual([])
})

it('TDD 950: local acknowledgement failure does not claim successful completion', async () => {
  const f = fixture()
  await f.outbox.enqueue(room, id, cipher)
  f.backend.delete.mockRejectedValueOnce(new Error('storage unavailable'))
  await expect(flushEncryptedOutbox(f.outbox, { upload: async () => true }, room)).rejects.toThrow('storage unavailable')
  expect(await f.outbox.pending(room)).toHaveLength(1)
})

it('TDD 951: no pending ciphertext never invokes the uploader', async () => {
  const f = fixture()
  const upload = vi.fn(async () => true)
  expect(await flushEncryptedOutbox(f.outbox, { upload }, room)).toEqual({ uploaded: 0, remaining: 0 })
  expect(upload).not.toHaveBeenCalled()
})
