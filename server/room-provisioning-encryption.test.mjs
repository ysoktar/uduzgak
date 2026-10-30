import { expect, it } from 'vitest'
import { createRoomProvisioning } from './room-provisioning.mjs'
it('TDD 872: each generated room includes a random 256-bit encryption secret',()=>{
  expect(createRoomProvisioning().encryptionSecret).toMatch(/^[a-f0-9]{64}$/)
})
it('TDD 873: encryption key differs from every access credential and room locator',()=>{
  const room=createRoomProvisioning()
  expect(room.encryptionSecret).not.toBe(room.roomId)
  expect(room.encryptionSecret).not.toBe(room.readerToken)
  expect(room.encryptionSecret).not.toBe(room.writerToken)
})
it('TDD 874: server-side room configuration never includes the encryption key',()=>{
  const room=createRoomProvisioning()
  expect(JSON.stringify(room.serverConfig)).not.toContain(room.encryptionSecret)
  expect(room.serverConfig[room.roomId]).toEqual({readers:[room.readerToken],writers:[room.writerToken]})
})
it('TDD 875: independently generated rooms do not reuse encryption keys',()=>{
  const first=createRoomProvisioning(),second=createRoomProvisioning()
  expect(first.encryptionSecret).not.toBe(second.encryptionSecret)
})
it('TDD 876: a generated key can encrypt and decrypt a client-side AES-GCM packet',async()=>{
  const room=createRoomProvisioning()
  const {sealRelayChange,openRelayChange}=await import('../src/p2p/relay-crypto.ts')
  const contents=new TextEncoder().encode('private document')
  const sealed=await sealRelayChange(room.encryptionSecret,contents)
  expect(await openRelayChange(room.encryptionSecret,sealed)).toEqual(contents)
})
