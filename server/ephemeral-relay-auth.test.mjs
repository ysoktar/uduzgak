import { afterEach, expect, it } from 'vitest'
import { createRelayHttpServer } from './ephemeral-relay.mjs'
import { createRoomCapabilityAuthorizer } from './room-capabilities.mjs'
const a='a'.repeat(64), b='b'.repeat(64), id='1'.repeat(32)
const body=Uint8Array.from([1,...new Uint8Array(12),...new Uint8Array(16),42])
const active=[]
async function start(){
 const server=createRelayHttpServer({roomAuthorizer:createRoomCapabilityAuthorizer({
  [a]:{readers:['reader-secret'],writers:['writer-secret']},
  [b]:{readers:['other-reader'],writers:['other-writer']},
 })})
 await new Promise(done=>server.listen(0,'127.0.0.1',done))
 active.push(server)
 return `http://127.0.0.1:${server.address().port}`
}
afterEach(async()=>Promise.all(active.splice(0).map(server=>new Promise(done=>server.close(done)))))
it('TDD 782: anonymous uploads cannot fill protected room memory',async()=>{
 const url=await start()
 const res=await fetch(`${url}/v1/rooms/${a}/messages/${id}`,{method:'PUT',headers:{'Content-Type':'application/octet-stream'},body})
 expect(res.status).toBe(403)
})
it('TDD 783: authorized readers can fetch but cannot upload',async()=>{
 const url=await start(),headers={Authorization:'Bearer reader-secret'}
 expect((await fetch(`${url}/v1/rooms/${a}/messages`,{headers})).status).toBe(200)
 expect((await fetch(`${url}/v1/rooms/${a}/messages/${id}`,{method:'PUT',headers:{...headers,'Content-Type':'application/octet-stream'},body})).status).toBe(403)
})
it('TDD 784: writers can upload ciphertext and retrieve it',async()=>{
 const url=await start(),headers={Authorization:'Bearer writer-secret'}
 expect((await fetch(`${url}/v1/rooms/${a}/messages/${id}`,{method:'PUT',headers:{...headers,'Content-Type':'application/octet-stream'},body})).status).toBe(201)
 const response=await fetch(`${url}/v1/rooms/${a}/messages`,{headers})
 expect((await response.json()).messages).toHaveLength(1)
})
it('TDD 785: tokens cannot read another room',async()=>{
 const url=await start()
 expect((await fetch(`${url}/v1/rooms/${b}/messages`,{headers:{Authorization:'Bearer writer-secret'}})).status).toBe(403)
})
it('TDD 786: origin restrictions still reject unauthorized browser origins',async()=>{
 const url=await start()
 expect((await fetch(`${url}/v1/rooms/${a}/messages`,{headers:{Origin:'https://untrusted.example',Authorization:'Bearer reader-secret'}})).status).toBe(403)
})
