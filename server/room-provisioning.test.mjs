import { expect, it } from 'vitest'
import { createRoomProvisioning } from './room-provisioning.mjs'
import { createRoomCapabilityAuthorizer } from './room-capabilities.mjs'
it('TDD 777: new workspace room IDs use 256 bits of random hex', () => {
 const room = createRoomProvisioning()
 expect(room.roomId).toMatch(/^[a-f0-9]{64}$/)
 expect(createRoomProvisioning().roomId).not.toBe(room.roomId)
})
it('TDD 778: reader and writer capabilities are independent high-entropy secrets', () => {
 const room = createRoomProvisioning()
 expect(room.readerToken).toMatch(/^[a-f0-9]{64}$/)
 expect(room.writerToken).toMatch(/^[a-f0-9]{64}$/)
 expect(room.readerToken).not.toBe(room.writerToken)
})
it('TDD 779: generated configuration grants the intended reader and writer rights', () => {
 const room = createRoomProvisioning()
 const auth = createRoomCapabilityAuthorizer(room.serverConfig)
 expect(auth.canRead(room.roomId, `Bearer ${room.readerToken}`)).toBe(true)
 expect(auth.canWrite(room.roomId, `Bearer ${room.readerToken}`)).toBe(false)
 expect(auth.canWrite(room.roomId, `Bearer ${room.writerToken}`)).toBe(true)
})
it('TDD 780: separately provisioned rooms never share access credentials', () => {
 const a = createRoomProvisioning()
 const b = createRoomProvisioning()
 const merged = createRoomCapabilityAuthorizer({...a.serverConfig,...b.serverConfig})
 expect(merged.canRead(b.roomId,`Bearer ${a.readerToken}`)).toBe(false)
})
it('TDD 781: configurations survive JSON serialization without unexpected fields', () => {
 const room = createRoomProvisioning()
 expect(JSON.parse(JSON.stringify(room.serverConfig))).toEqual({
   [room.roomId]: { readers:[room.readerToken], writers:[room.writerToken] },
 })
})
