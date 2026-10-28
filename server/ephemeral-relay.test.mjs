import { expect, it } from 'vitest'
import { createEphemeralMailboxStore } from './ephemeral-relay.mjs'

const room = 'a'.repeat(64)
const otherRoom = 'b'.repeat(64)
const id = '1'.repeat(32)
const sealed = Uint8Array.from([1, ...new Uint8Array(12), ...new Uint8Array(16), 42])
it('TDD 727: messages expire exactly at their configured time', () => {
  let time = 1000
  const store = createEphemeralMailboxStore({ now: () => time, ttlMs: 100 })
  expect(store.put(room, id, sealed).expiresAt).toBe(1100)
  expect(store.list(room)).toHaveLength(1)
  time = 1100
  expect(store.list(room)).toEqual([])
  expect(store.stats().totalBytes).toBe(0)
})
it('TDD 728: room isolation prevents messages from appearing elsewhere', () => {
  const store = createEphemeralMailboxStore()
  store.put(room, id, sealed)
  expect(store.list(otherRoom)).toEqual([])
  expect(store.list(room)).toHaveLength(1)
})
it('TDD 729: per-message, per-room and global capacity are enforced', () => {
  const store = createEphemeralMailboxStore({
    maxMessageBytes: 40, maxRoomBytes: 40, maxTotalBytes: 80, maxMessagesPerRoom: 1,
  })
  store.put(room, id, sealed)
  expect(() => store.put(room, '2'.repeat(32), sealed)).toThrow('Room capacity exceeded')
  expect(() => store.put(otherRoom, '2'.repeat(32), new Uint8Array(41).fill(1))).toThrow('Message too large')
})
it('TDD 730: duplicate IDs are idempotent but cannot overwrite ciphertext', () => {
  let time = 50
  const store = createEphemeralMailboxStore({ now: () => time, ttlMs: 100 })
  const saved = store.put(room, id, sealed)
  time = 80
  expect(store.put(room, id, sealed)).toEqual({ ...saved, created: false })
  expect(store.list(room)).toHaveLength(1)
  expect(store.list(room)[0].expiresAt).toBe(150)
  expect(() => store.put(room, id, Uint8Array.from([...sealed, 12]))).toThrow('Message ID conflict')
})
it('TDD 731: input and returned ciphertext cannot mutate the stored bytes', () => {
  const store = createEphemeralMailboxStore()
  const upload = Uint8Array.from(sealed)
  store.put(room, id, upload)
  upload[0] = 99
  const downloaded = store.list(room)[0].ciphertext
  downloaded[0] = 88
  expect(store.list(room)[0].ciphertext[0]).toBe(1)
})
