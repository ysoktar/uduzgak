import { expect, it } from 'vitest'
import { createRelayInvitation } from '../p2p/relay-crypto'
import { openRoomChange, prepareRoomChange } from './room-change-envelope'
const data = Uint8Array.from([0, 1, 2, 255, 128])
it('TDD 817: opaque local changes survive encrypted round trip', async () => {
  const { roomId, secret } = createRelayInvitation()
  const item = await prepareRoomChange(roomId, secret, data)
  expect(item.id).toMatch(/^[a-f0-9]{32}$/)
  expect(await openRoomChange(roomId, item.id, secret, item.ciphertext)).toEqual(data)
})
it('TDD 818: ciphertext does not reveal the original change bytes', async () => {
  const { roomId, secret } = createRelayInvitation()
  const item = await prepareRoomChange(roomId, secret, data)
  expect(item.ciphertext).not.toEqual(data)
  expect(item.ciphertext[0]).toBe(1)
})
it('TDD 819: even with the same secret, another room cannot accept a packet', async () => {
  const { roomId, secret } = createRelayInvitation()
  const item = await prepareRoomChange(roomId, secret, data)
  await expect(openRoomChange('b'.repeat(64), item.id, secret, item.ciphertext))
    .rejects.toThrow('Encrypted change room mismatch')
})
it('TDD 820: replay under another change ID or wrong secret fails validation', async () => {
  const { roomId, secret } = createRelayInvitation()
  const item = await prepareRoomChange(roomId, secret, data)
  await expect(openRoomChange(roomId, 'f'.repeat(32), secret, item.ciphertext))
    .rejects.toThrow('Encrypted change ID mismatch')
  await expect(openRoomChange(roomId, item.id, createRelayInvitation().secret, item.ciphertext))
    .rejects.toThrow('Invalid sealed relay change')
})
it('TDD 821: tampering and malformed room IDs are rejected', async () => {
  const { roomId, secret } = createRelayInvitation()
  const item = await prepareRoomChange(roomId, secret, data)
  const corrupted = Uint8Array.from(item.ciphertext)
  corrupted[corrupted.length - 1] ^= 1
  await expect(openRoomChange(roomId, item.id, secret, corrupted))
    .rejects.toThrow('Invalid sealed relay change')
  await expect(prepareRoomChange('invalid', secret, data))
    .rejects.toThrow('Invalid change identity')
})
