import { expect, it } from 'vitest'
import { createRoomCapabilityAuthorizer } from './room-capabilities.mjs'
const roomA = 'a'.repeat(64)
const roomB = 'b'.repeat(64)
const config = {
  [roomA]: { readers: ['read-a'], writers: ['write-a'] },
  [roomB]: { readers: ['read-b'], writers: ['write-b'] },
}
it('TDD 762: room A credential cannot access room B', () => {
  const auth = createRoomCapabilityAuthorizer(config)
  expect(auth.canRead(roomA, 'Bearer read-a')).toBe(true)
  expect(auth.canRead(roomB, 'Bearer read-a')).toBe(false)
})
it('TDD 763: read-only credentials cannot upload', () => {
  const auth = createRoomCapabilityAuthorizer(config)
  expect(auth.canRead(roomA, 'Bearer read-a')).toBe(true)
  expect(auth.canWrite(roomA, 'Bearer read-a')).toBe(false)
})
it('TDD 764: writers can read their own room and upload', () => {
  const auth = createRoomCapabilityAuthorizer(config)
  expect(auth.canRead(roomA, 'Bearer write-a')).toBe(true)
  expect(auth.canWrite(roomA, 'Bearer write-a')).toBe(true)
})
it('TDD 765: missing or malformed credentials are always denied', () => {
  const auth = createRoomCapabilityAuthorizer(config)
  for (const header of [undefined, '', 'read-a', 'Basic read-a', 'Bearer invalid']) {
    expect(auth.canRead(roomA, header)).toBe(false)
    expect(auth.canWrite(roomA, header)).toBe(false)
  }
})
it('TDD 766: duplicate credentials across rooms fail configuration validation', () => {
  expect(() => createRoomCapabilityAuthorizer({
    [roomA]: { readers: ['shared'], writers: [] },
    [roomB]: { readers: ['shared'], writers: [] },
  })).toThrow('Room capability reused across rooms')
})
