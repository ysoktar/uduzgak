import { expect, it, vi } from 'vitest'
import { syncEncryptedRoom } from './sync-encrypted-room'
import { createDurableChangeOutbox } from './durable-change-outbox'
import { createEncryptedInbox } from './encrypted-inbox'
const room='a'.repeat(64), id='b'.repeat(32)
const payload=Uint8Array.from([1,...Array(28).fill(0)])
function backend(){
 const values=new Map<string,unknown>()
 return {get:async(k:string)=>values.get(k),set:async(k:string,v:unknown)=>{values.set(k,v)},delete:async(k:string)=>{values.delete(k)},keys:async()=>[...values.keys()]}
}
function fixture(){
 const store=backend()
 return {outbox:createDurableChangeOutbox(store),inbox:createEncryptedInbox(store)}
}
it('TDD 812: one sync pass uploads and retrieves encrypted changes',async()=>{
 const {outbox,inbox}=fixture()
 await outbox.enqueue(room,id,payload)
 const transport={upload:vi.fn(async()=>true),download:vi.fn(async()=>[{id,ciphertext:payload}])}
 const result=await syncEncryptedRoom({outbox,inbox,transport},room)
 expect(result).toEqual({uploaded:1,remaining:0,received:1,pending:1})
 expect(transport.upload).toHaveBeenCalledOnce()
 expect(await outbox.pending(room)).toEqual([])
})
it('TDD 813: a failed upload does not attempt remote download or clear queued edits',async()=>{
 const {outbox,inbox}=fixture();await outbox.enqueue(room,id,payload)
 const transport={upload:async()=>{throw new Error('offline')},download:vi.fn(async()=>[])}
 await expect(syncEncryptedRoom({outbox,inbox,transport},room)).rejects.toThrow('offline')
 expect(transport.download).not.toHaveBeenCalled()
 expect(await outbox.pending(room)).toHaveLength(1)
})
it('TDD 814: repeated successful sync does not duplicate inbox entries',async()=>{
 const {outbox,inbox}=fixture()
 const transport={upload:async()=>true,download:async()=>[{id,ciphertext:payload}]}
 await syncEncryptedRoom({outbox,inbox,transport},room)
 expect((await syncEncryptedRoom({outbox,inbox,transport},room)).received).toBe(0)
 expect(await inbox.pending(room)).toHaveLength(1)
})
it('TDD 815: an invalid remote ciphertext cannot be counted as applied',async()=>{
 const {outbox,inbox}=fixture()
 const transport={upload:async()=>true,download:async()=>[{id,ciphertext:new Uint8Array([1])}]}
 await expect(syncEncryptedRoom({outbox,inbox,transport},room)).rejects.toThrow('Invalid encrypted change')
 expect(await inbox.pending(room)).toEqual([])
})
it('TDD 816: empty queues and remote lists are a no-op',async()=>{
 const {outbox,inbox}=fixture(),transport={upload:vi.fn(async()=>true),download:async()=>[]}
 expect(await syncEncryptedRoom({outbox,inbox,transport},room)).toEqual({uploaded:0,remaining:0,received:0,pending:0})
 expect(transport.upload).not.toHaveBeenCalled()
})
