import { expect, it, vi } from 'vitest'
import { createRelayInvitation } from '../p2p/relay-crypto'
import { createTask } from '../domain/task'
import { createEncryptedInbox } from '../persistence/encrypted-inbox'
import { prepareRoomChange } from '../persistence/room-change-envelope'
import { previewRemoteRoom } from './manual-room-preview'
const task=createTask({id:'task-1',projectId:'p',title:'Original',now:'2026-10-30T00:00:00.000Z'})
const change={id:'a:1',actor:'a',clock:1,entity:'task-1',field:'title',value:'Remote'}
function storage(){
 const data=new Map<string,unknown>()
 return {get:async(k:string)=>data.get(k),set:async(k:string,v:unknown)=>{data.set(k,v)},delete:async(k:string)=>{data.delete(k)},keys:async()=>[...data.keys()]}
}
async function fixture(value:unknown=change){
 const {roomId,secret}=createRelayInvitation(),backend=storage()
 const record=await prepareRoomChange(roomId,secret,new TextEncoder().encode(JSON.stringify(value)))
 const client={download:vi.fn(async()=>[record]),upload:vi.fn(async()=>true)}
 return {roomId,secret,backend,client,inbox:createEncryptedInbox(backend)}
}
it('TDD 857: a preview downloads and displays verified remote edits without changing Task',async()=>{
 const f=await fixture()
 const preview=await previewRemoteRoom(f.inbox,f.backend,f.client,f.roomId,f.secret,[task])
 expect(preview).toEqual([{taskId:'task-1',field:'title',before:'Original',after:'Remote'}])
 expect(task.title).toBe('Original')
})
it('TDD 858: preview never uploads pending local changes',async()=>{
 const f=await fixture()
 await previewRemoteRoom(f.inbox,f.backend,f.client,f.roomId,f.secret,[task])
 expect(f.client.upload).not.toHaveBeenCalled()
})
it('TDD 859: replaying the same remote change remains idempotent',async()=>{
 const f=await fixture()
 expect(await previewRemoteRoom(f.inbox,f.backend,f.client,f.roomId,f.secret,[task]))
  .toEqual(await previewRemoteRoom(f.inbox,f.backend,f.client,f.roomId,f.secret,[task]))
})
it('TDD 860: wrong decryption key keeps the received ciphertext for recovery',async()=>{
 const f=await fixture()
 await expect(previewRemoteRoom(f.inbox,f.backend,f.client,f.roomId,createRelayInvitation().secret,[task]))
  .rejects.toThrow('Invalid sealed relay change')
 expect(await f.inbox.pending(f.roomId)).toHaveLength(1)
})
it('TDD 861: unknown Task IDs fail closed rather than creating Tasks',async()=>{
 const f=await fixture({...change,entity:'missing'})
 await expect(previewRemoteRoom(f.inbox,f.backend,f.client,f.roomId,f.secret,[task]))
  .rejects.toThrow('Unknown Task in remote preview')
 expect(task.title).toBe('Original')
})
