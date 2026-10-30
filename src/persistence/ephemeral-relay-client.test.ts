import { expect, it, vi } from 'vitest'
import { createEphemeralRelayChangeClient } from './ephemeral-relay-client'
const room='a'.repeat(64),id='b'.repeat(32)
const packet=Uint8Array.from([1,...Array(28).fill(0)])
const url='https://relay.example.org'
it('TDD 862: uploaded ciphertext uses the relay message endpoint and Bearer authorization',async()=>{
 const fetchImpl=vi.fn(async()=>new Response('',{status:201}))
 const client=createEphemeralRelayChangeClient(url,'writer-secret',fetchImpl)
 expect(await client.upload(room,id,packet)).toBe(true)
 const [path,options]=fetchImpl.mock.calls[0] as unknown as [string,RequestInit]
 expect(path).toBe(`${url}/v1/rooms/${room}/messages/${id}`)
 expect(options.method).toBe('PUT')
 expect(options.redirect).toBe('error')
 expect((options.headers as Record<string,string>).Authorization).toBe('Bearer writer-secret')
})
it('TDD 863: valid downloaded ciphertext is decoded from the bounded relay response',async()=>{
 const ciphertext=Buffer.from(packet).toString('base64url')
 const fetchImpl=vi.fn(async()=>new Response(JSON.stringify({messages:[{id,expiresAt:999999,ciphertext}]}),{status:200}))
 const client=createEphemeralRelayChangeClient(url,'reader-secret',fetchImpl)
 expect(await client.download(room)).toEqual([{id,ciphertext:packet}])
 expect(fetchImpl.mock.calls[0][0]).toBe(`${url}/v1/rooms/${room}/messages`)
})
it('TDD 864: relay quota exhaustion is surfaced rather than acknowledged',async()=>{
 const client=createEphemeralRelayChangeClient(url,'writer-secret',async()=>new Response('',{status:429}))
 await expect(client.upload(room,id,packet)).rejects.toThrow('Relay rate limit reached')
})
it('TDD 865: malformed room IDs and plaintext packets never reach the relay',async()=>{
 const fetchImpl=vi.fn()
 const client=createEphemeralRelayChangeClient(url,'writer-secret',fetchImpl)
 await expect(client.upload('wrong',id,packet)).rejects.toThrow('Invalid change identity')
 await expect(client.upload(room,id,new TextEncoder().encode('plaintext'))).rejects.toThrow('Invalid encrypted change')
 expect(fetchImpl).not.toHaveBeenCalled()
})
it('TDD 866: unauthorized relay reads are denied without returning fabricated changes',async()=>{
 const client=createEphemeralRelayChangeClient(url,'reader-secret',async()=>new Response('',{status:403}))
 await expect(client.download(room)).rejects.toThrow('Room permission denied')
})
