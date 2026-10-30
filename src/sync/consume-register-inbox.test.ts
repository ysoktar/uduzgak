import { expect, it } from 'vitest'
import { createEncryptedInbox } from '../persistence/encrypted-inbox'
import { prepareRoomChange } from '../persistence/room-change-envelope'
import { createRelayInvitation } from '../p2p/relay-crypto'
import { consumeRegisterInbox } from './consume-register-inbox'
import type { RegisterChange } from './convergent-registers'
const utf8 = new TextEncoder()
function storage() {
  const data = new Map<string, unknown>()
  return {
    get: async (key: string) => data.get(key),
    set: async (key: string, value: unknown) => { data.set(key, value) },
    delete: async (key: string) => { data.delete(key) },
    keys: async () => [...data.keys()],
  }
}
const change: RegisterChange = { id: 'actor:1', actor: 'actor', clock: 1, entity: 'task', field: 'title', value: 'Offline' }
async function fixture(bytes: Uint8Array = utf8.encode(JSON.stringify(change))) {
  const { roomId, secret } = createRelayInvitation()
  const backend = storage()
  const inbox = createEncryptedInbox(backend)
  const packet = await prepareRoomChange(roomId, secret, bytes)
  await inbox.receive(roomId, [packet])
  return { roomId, secret, backend, inbox, packet }
}
it('TDD 827: a valid decrypted register change is persisted before inbox acknowledgement', async () => {
  const f = await fixture()
  expect(await consumeRegisterInbox(f.inbox, f.backend, f.roomId, f.secret)).toEqual({ applied: 1, pending: 0 })
  expect(await f.inbox.pending(f.roomId)).toEqual([])
  expect(await f.backend.get(`register-change:${f.roomId}:actor:1`)).toEqual(change)
})
it('TDD 828: invalid decrypted JSON preserves the original encrypted message', async () => {
  const f = await fixture(utf8.encode('not JSON'))
  await expect(consumeRegisterInbox(f.inbox, f.backend, f.roomId, f.secret)).rejects.toThrow('Invalid register payload')
  expect(await f.inbox.pending(f.roomId)).toHaveLength(1)
})
it('TDD 829: tampered ciphertext cannot be acknowledged or applied', async () => {
  const f = await fixture()
  const tampered = Uint8Array.from(f.packet.ciphertext)
  tampered[tampered.length - 1] ^= 1
  await f.inbox.acknowledge(f.roomId, f.packet.id)
  await f.inbox.receive(f.roomId, [{ id: f.packet.id, ciphertext: tampered }])
  await expect(consumeRegisterInbox(f.inbox, f.backend, f.roomId, f.secret)).rejects.toThrow('Invalid sealed relay change')
  expect(await f.inbox.pending(f.roomId)).toHaveLength(1)
})
it('TDD 830: a repeated remote register change is idempotent', async () => {
  const f = await fixture()
  await consumeRegisterInbox(f.inbox, f.backend, f.roomId, f.secret)
  await f.inbox.receive(f.roomId, [f.packet])
  expect(await consumeRegisterInbox(f.inbox, f.backend, f.roomId, f.secret)).toEqual({ applied: 0, pending: 0 })
})
it('TDD 831: failed durable writes retain the inbox packet for retry', async () => {
  const f = await fixture()
  const refusing = { ...f.backend, set: async () => { throw new Error('quota exceeded') } }
  await expect(consumeRegisterInbox(f.inbox, refusing, f.roomId, f.secret)).rejects.toThrow('quota exceeded')
  expect(await f.inbox.pending(f.roomId)).toHaveLength(1)
})
