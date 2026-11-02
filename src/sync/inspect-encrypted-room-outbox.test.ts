import { expect, it, vi } from 'vitest'
import { createDurableChangeOutbox } from '../persistence/durable-change-outbox'
import { inspectEncryptedRoomOutbox } from './inspect-encrypted-room-outbox'

const room = 'a'.repeat(64)
const other = 'b'.repeat(64)
const id1 = '1'.repeat(32)
const id2 = '2'.repeat(32)
const sealed = Uint8Array.from([1, ...Array(28).fill(0)])

function fixture() {
  const data = new Map<string,unknown>()
  const backend = {
    get: vi.fn(async (key: string) => data.get(key)),
    set: vi.fn(async (key: string, value: unknown) => { data.set(key,value) }),
    delete: vi.fn(async (key: string) => { data.delete(key) }),
    keys: vi.fn(async () => [...data.keys()]),
  }
  return { backend, outbox: createDurableChangeOutbox(backend) }
}

it('TDD 912: empty room returns zero locally queued packets', async () => {
  const f = fixture()
  expect(await inspectEncryptedRoomOutbox(f.outbox,room)).toEqual({ pending: 0 })
})

it('TDD 913: queued room packets are counted without exposing ciphertext', async () => {
  const f = fixture()
  await f.outbox.enqueue(room,id1,sealed)
  await f.outbox.enqueue(room,id2,sealed)
  expect(await inspectEncryptedRoomOutbox(f.outbox,room)).toEqual({ pending: 2 })
})

it('TDD 914: counts are strictly isolated by room', async () => {
  const f = fixture()
  await f.outbox.enqueue(other,id1,sealed)
  expect(await inspectEncryptedRoomOutbox(f.outbox,room)).toEqual({ pending: 0 })
  expect(await inspectEncryptedRoomOutbox(f.outbox,other)).toEqual({ pending: 1 })
})

it('TDD 915: status inspection never acknowledges or writes anything', async () => {
  const f = fixture()
  await f.outbox.enqueue(room,id1,sealed)
  f.backend.set.mockClear()
  expect(await inspectEncryptedRoomOutbox(f.outbox,room)).toEqual({ pending: 1 })
  expect(f.backend.set).not.toHaveBeenCalled()
  expect(f.backend.delete).not.toHaveBeenCalled()
})

it('TDD 916: invalid room and read failures propagate without fabricated success', async () => {
  const f = fixture()
  await expect(inspectEncryptedRoomOutbox(f.outbox,'wrong')).rejects.toThrow('Invalid change identity')
  f.backend.keys.mockRejectedValueOnce(new Error('IndexedDB unavailable'))
  await expect(inspectEncryptedRoomOutbox(f.outbox,room)).rejects.toThrow('IndexedDB unavailable')
})
