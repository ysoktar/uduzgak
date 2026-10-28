import { expect, it } from 'vitest'
import { createDurableChangeOutbox } from './durable-change-outbox'

const room = 'a'.repeat(64)
const id = 'b'.repeat(32)
const sealed = Uint8Array.from([1, ...Array(28).fill(0)])
function memoryBackend() {
  const data = new Map<string, unknown>()
  return {
    get: async (key: string) => data.get(key),
    set: async (key: string, value: unknown) => { data.set(key, value) },
    delete: async (key: string) => { data.delete(key) },
    keys: async () => [...data.keys()],
  }
}
it('TDD 792: queued ciphertext survives recreating the outbox', async () => {
  const backend = memoryBackend()
  await createDurableChangeOutbox(backend).enqueue(room, id, sealed)
  expect(await createDurableChangeOutbox(backend).pending(room)).toEqual([{ id, ciphertext: sealed }])
})
it('TDD 793: an acknowledged upload disappears without disturbing other rooms', async () => {
  const outbox = createDurableChangeOutbox(memoryBackend())
  await outbox.enqueue(room, id, sealed)
  await outbox.enqueue('c'.repeat(64), 'd'.repeat(32), sealed)
  await outbox.acknowledge(room,id)
  expect(await outbox.pending(room)).toEqual([])
  expect(await outbox.pending('c'.repeat(64))).toHaveLength(1)
})
it('TDD 794: duplicate retries preserve the same queued ciphertext', async () => {
  const outbox = createDurableChangeOutbox(memoryBackend())
  await outbox.enqueue(room,id,sealed)
  await outbox.enqueue(room,id,sealed)
  await expect(outbox.enqueue(room,id,Uint8Array.from([...sealed,1]))).rejects.toThrow('Change ID conflict')
  expect(await outbox.pending(room)).toHaveLength(1)
})
it('TDD 795: corrupt and plaintext envelopes never enter the outbox', async () => {
  const outbox = createDurableChangeOutbox(memoryBackend())
  await expect(outbox.enqueue(room,id,new TextEncoder().encode('plaintext'))).rejects.toThrow('Invalid encrypted change')
  await expect(outbox.enqueue('invalid',id,sealed)).rejects.toThrow('Invalid change identity')
})
it('TDD 796: returned ciphertext cannot alter the saved pending bytes', async () => {
  const outbox = createDurableChangeOutbox(memoryBackend())
  await outbox.enqueue(room,id,sealed)
  const pending = await outbox.pending(room)
  pending[0].ciphertext[0] = 77
  expect((await outbox.pending(room))[0].ciphertext[0]).toBe(1)
})
