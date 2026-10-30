import { expect, it } from 'vitest'
import { createRelayInvitation } from '../p2p/relay-crypto'
import { createDurableChangeOutbox } from '../persistence/durable-change-outbox'
import { createEncryptedInbox } from '../persistence/encrypted-inbox'
import { loadDurableRegisters } from './durable-register-snapshot'
import { enqueueLocalRegisterChange, exchangeRegisterRoom } from './register-replication'
import type { RegisterChange } from './convergent-registers'
function storage() {
  const data=new Map<string,unknown>()
  return {get:async(k:string)=>data.get(k),set:async(k:string,v:unknown)=>{data.set(k,v)},delete:async(k:string)=>{data.delete(k)},keys:async()=>[...data.keys()]}
}
function device(){
  const backend=storage()
  return {backend,outbox:createDurableChangeOutbox(backend),inbox:createEncryptedInbox(backend)}
}
function relay(){
  const data=new Map<string,Uint8Array>()
  return {
    upload:async (_room:string,id:string,packet:Uint8Array)=>{
      const previous=data.get(id)
      if(previous && (previous.length!==packet.length||previous.some((x,i)=>x!==packet[i])))throw new Error('Change ID conflict')
      data.set(id,Uint8Array.from(packet))
      return !previous
    },
    download:async ()=>[...data].map(([id,ciphertext])=>({id,ciphertext:Uint8Array.from(ciphertext)})),
  }
}
const edit=(id:string,actor:string,value:string):RegisterChange=>({id,actor,clock:1,entity:'task-1',field:'title',value})
it('TDD 842: a local register operation becomes durable encrypted pending ciphertext',async()=>{
  const d=device(),{roomId,secret}=createRelayInvitation()
  await enqueueLocalRegisterChange(d.outbox,roomId,secret,edit('a:1','a','hello'))
  expect(await d.outbox.pending(roomId)).toHaveLength(1)
  expect((await d.outbox.pending(roomId))[0].ciphertext[0]).toBe(1)
})
it('TDD 843: malformed local scalar operations cannot enter the outbox',async()=>{
  const d=device(),{roomId,secret}=createRelayInvitation()
  await expect(enqueueLocalRegisterChange(d.outbox,roomId,secret,{...edit('a:1','a','x'),clock:-1}))
    .rejects.toThrow('Invalid register change')
  expect(await d.outbox.pending(roomId)).toEqual([])
})
it('TDD 844: two offline replicas exchange independent changes and converge after reconnecting',async()=>{
  const {roomId,secret}=createRelayInvitation(),a=device(),b=device(),remote=relay()
  await enqueueLocalRegisterChange(a.outbox,roomId,secret,edit('a:1','a','alpha'))
  await enqueueLocalRegisterChange(b.outbox,roomId,secret,{...edit('b:1','b','doing'),field:'status'})
  await exchangeRegisterRoom(a,remote,roomId,secret)
  await exchangeRegisterRoom(b,remote,roomId,secret)
  await exchangeRegisterRoom(a,remote,roomId,secret)
  expect(await loadDurableRegisters(a.backend,roomId)).toEqual(await loadDurableRegisters(b.backend,roomId))
  expect((await loadDurableRegisters(a.backend,roomId))['task-1']).toEqual({title:'alpha',status:'doing'})
})
it('TDD 845: wrong room encryption key retains received packets without applying them',async()=>{
  const {roomId,secret}=createRelayInvitation(),a=device(),b=device(),remote=relay()
  await enqueueLocalRegisterChange(a.outbox,roomId,secret,edit('a:1','a','secret'))
  await exchangeRegisterRoom(a,remote,roomId,secret)
  await expect(exchangeRegisterRoom(b,remote,roomId,createRelayInvitation().secret))
    .rejects.toThrow('Invalid sealed relay change')
  expect(await b.inbox.pending(roomId)).toHaveLength(1)
  expect(await loadDurableRegisters(b.backend,roomId)).toEqual({})
})
it('TDD 846: concurrent edits converge deterministically and retransmissions remain idempotent',async()=>{
  const {roomId,secret}=createRelayInvitation(),a=device(),b=device(),remote=relay()
  await enqueueLocalRegisterChange(a.outbox,roomId,secret,edit('a:1','a','alpha'))
  await enqueueLocalRegisterChange(b.outbox,roomId,secret,edit('b:1','b','beta'))
  await exchangeRegisterRoom(a,remote,roomId,secret)
  await exchangeRegisterRoom(b,remote,roomId,secret)
  await exchangeRegisterRoom(a,remote,roomId,secret)
  await exchangeRegisterRoom(b,remote,roomId,secret)
  expect((await loadDurableRegisters(a.backend,roomId))['task-1'].title).toBe('beta')
  expect(await loadDurableRegisters(a.backend,roomId)).toEqual(await loadDurableRegisters(b.backend,roomId))
})
