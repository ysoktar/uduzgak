import { expect, it, vi } from 'vitest'
import { flushEncryptedOutbox } from './flush-encrypted-outbox'
import { createDurableChangeOutbox } from './durable-change-outbox'
const room='a'.repeat(64), a='b'.repeat(32), b='c'.repeat(32)
const sealed=Uint8Array.from([1,...Array(28).fill(0)])
function fixture(){
 const data=new Map<string,unknown>()
 const backend={get:async(k:string)=>data.get(k),set:async(k:string,v:unknown)=>{data.set(k,v)},delete:async(k:string)=>{data.delete(k)},keys:async()=>[...data.keys()]}
 return createDurableChangeOutbox(backend)
}
it('TDD 797: successful upload acknowledges only the delivered change',async()=>{
 const q=fixture();await q.enqueue(room,a,sealed)
 const upload=vi.fn(async()=>true)
 expect(await flushEncryptedOutbox(q,{upload},room)).toEqual({uploaded:1,remaining:0})
 expect(upload).toHaveBeenCalledWith(room,a,sealed)
 expect(await q.pending(room)).toEqual([])
})
it('TDD 798: network failure retains pending ciphertext for later retry',async()=>{
 const q=fixture();await q.enqueue(room,a,sealed)
 await expect(flushEncryptedOutbox(q,{upload:async()=>{throw new Error('offline')}},room)).rejects.toThrow('offline')
 expect(await q.pending(room)).toHaveLength(1)
})
it('TDD 799: retries of already-existing immutable remote changes count as delivered',async()=>{
 const q=fixture();await q.enqueue(room,a,sealed)
 expect(await flushEncryptedOutbox(q,{upload:async()=>false},room)).toEqual({uploaded:1,remaining:0})
})
it('TDD 800: a failed upload stops the batch without acknowledging later changes',async()=>{
 const q=fixture();await q.enqueue(room,a,sealed);await q.enqueue(room,b,sealed)
 const upload=vi.fn(async()=>{throw new Error('denied')})
 await expect(flushEncryptedOutbox(q,{upload},room)).rejects.toThrow('denied')
 expect(upload).toHaveBeenCalledTimes(1)
 expect(await q.pending(room)).toHaveLength(2)
})
it('TDD 801: an empty outbox makes no HTTP calls',async()=>{
 const q=fixture(),upload=vi.fn(async()=>true)
 expect(await flushEncryptedOutbox(q,{upload},room)).toEqual({uploaded:0,remaining:0})
 expect(upload).not.toHaveBeenCalled()
})
