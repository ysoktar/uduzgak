import { expect, it, vi } from 'vitest'
import { createOptionalRoomTransport } from './optional-room-transport'
const room='a'.repeat(64),id='b'.repeat(32),packet=Uint8Array.from([1,...Array(28).fill(0)])
const url='https://sync.example.org'
it('TDD 867: durable mode targets the authenticated CouchDB changes endpoint',async()=>{
 const fetchImpl=vi.fn(async()=>new Response('',{status:201}))
 const client=createOptionalRoomTransport('durable',url,'token',fetchImpl)
 await client.upload(room,id,packet)
 expect(fetchImpl.mock.calls[0][0]).toContain('/changes/')
})
it('TDD 868: temporary mode targets the authenticated relay messages endpoint',async()=>{
 const fetchImpl=vi.fn(async()=>new Response('',{status:201}))
 const client=createOptionalRoomTransport('temporary',url,'token',fetchImpl)
 await client.upload(room,id,packet)
 expect(fetchImpl.mock.calls[0][0]).toContain('/messages/')
})
it('TDD 869: choosing a backend never contacts any server automatically',()=>{
 const fetchImpl=vi.fn()
 createOptionalRoomTransport('durable',url,'token',fetchImpl)
 createOptionalRoomTransport('temporary',url,'token',fetchImpl)
 expect(fetchImpl).not.toHaveBeenCalled()
})
it('TDD 870: unknown backend identifiers cannot silently choose a storage service',()=>{
 expect(()=>createOptionalRoomTransport('unsupported' as 'durable',url,'token',vi.fn()))
  .toThrow('Unsupported remote transport')
})
it('TDD 871: temporary and durable clients preserve the same no-redirect contract',async()=>{
 for(const mode of ['durable','temporary'] as const){
  const fetchImpl=vi.fn(async()=>new Response('',{status:201}))
  await createOptionalRoomTransport(mode,url,'token',fetchImpl).upload(room,id,packet)
  const options=fetchImpl.mock.calls[0][1] as RequestInit
  expect(options.redirect).toBe('error')
 }
})
