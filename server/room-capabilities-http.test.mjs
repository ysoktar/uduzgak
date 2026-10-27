import { afterEach, expect, it } from 'vitest'
import { createSelfHostedServer } from './self-hosted-api.mjs'
import { createRoomCapabilityAuthorizer } from './room-capabilities.mjs'
const roomA='a'.repeat(64), roomB='b'.repeat(64), id='c'.repeat(32)
const ciphertext=Buffer.from([1,...Array(28).fill(0)])
const active=[]
async function start(){
 let writes=0
 const adapter={kind:'couchdb',health:async()=>true,put:async()=>{writes++;return {created:true}},list:async()=>[{id,ciphertext:ciphertext.toString('base64url')}]}
 const server=createSelfHostedServer({token:'admin-token',adapter,roomAuthorizer:createRoomCapabilityAuthorizer({
  [roomA]:{readers:['reader-a'],writers:['writer-a']},
  [roomB]:{readers:['reader-b'],writers:['writer-b']},
 })})
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));active.push(server)
 return {url:`http://127.0.0.1:${server.address().port}`,getWrites:()=>writes}
}
afterEach(async()=>Promise.all(active.splice(0).map(server=>new Promise(ok=>server.close(ok)))))
it('TDD 767: a read-only room capability can fetch ciphertext but cannot upload',async()=>{
 const {url,getWrites}=await start()
 const headers={Authorization:'Bearer reader-a'}
 expect((await fetch(`${url}/v1/rooms/${roomA}/changes`,{headers})).status).toBe(200)
 expect((await fetch(`${url}/v1/rooms/${roomA}/changes/${id}`,{method:'PUT',headers:{...headers,'Content-Type':'application/octet-stream'},body:ciphertext})).status).toBe(403)
 expect(getWrites()).toBe(0)
})
it('TDD 768: a room writer cannot access another room',async()=>{
 const {url}=await start()
 expect((await fetch(`${url}/v1/rooms/${roomB}/changes`,{headers:{Authorization:'Bearer writer-a'}})).status).toBe(403)
})
it('TDD 769: a valid room writer can upload an encrypted packet',async()=>{
 const {url,getWrites}=await start()
 expect((await fetch(`${url}/v1/rooms/${roomA}/changes/${id}`,{method:'PUT',headers:{Authorization:'Bearer writer-a','Content-Type':'application/octet-stream'},body:ciphertext})).status).toBe(201)
 expect(getWrites()).toBe(1)
})
it('TDD 770: the legacy server-wide credential cannot bypass room restrictions',async()=>{
 const {url,getWrites}=await start()
 expect((await fetch(`${url}/v1/rooms/${roomA}/changes/${id}`,{method:'PUT',headers:{Authorization:'Bearer admin-token','Content-Type':'application/octet-stream'},body:ciphertext})).status).toBe(403)
 expect(getWrites()).toBe(0)
})
it('TDD 771: session handshake still uses the server credential',async()=>{
 const {url}=await start()
 expect((await fetch(`${url}/v1/session`,{headers:{Authorization:'Bearer admin-token'}})).status).toBe(200)
 expect((await fetch(`${url}/v1/session`,{headers:{Authorization:'Bearer reader-a'}})).status).toBe(401)
})
