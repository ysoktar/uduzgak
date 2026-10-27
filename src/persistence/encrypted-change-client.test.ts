import { expect, it, vi } from 'vitest'
import { createEncryptedChangeClient } from './encrypted-change-client'
const room = 'a'.repeat(64)
const id = 'b'.repeat(32)
const data = Uint8Array.from([1, ...Array(28).fill(0)])
const base = 'https://sync.example.org'
it('TDD 772: encrypted uploads use room-scoped authenticated binary PUT without redirects', async () => {
  const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ created: true }), { status: 201 }))
  const client = createEncryptedChangeClient(base, 'room-token', fetchImpl)
  expect(await client.upload(room, id, data)).toBe(true)
  const [url, options] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
  expect(url).toBe(`${base}/v1/rooms/${room}/changes/${id}`)
  expect(options.method).toBe('PUT')
  expect(options.redirect).toBe('error')
  expect((options.headers as Record<string,string>).Authorization).toBe('Bearer room-token')
  expect((options.headers as Record<string,string>)['Content-Type']).toBe('application/octet-stream')
})
it('TDD 773: rejecting malformed or plaintext change packets occurs before fetching', async () => {
  const fetchImpl = vi.fn()
  const client = createEncryptedChangeClient(base, 'room-token', fetchImpl)
  await expect(client.upload('invalid',id,data)).rejects.toThrow('Invalid change identity')
  await expect(client.upload(room,id,new TextEncoder().encode('plaintext'))).rejects.toThrow('Invalid encrypted change')
  expect(fetchImpl).not.toHaveBeenCalled()
})
it('TDD 774: a conflicting remote change ID is not silently overwritten', async () => {
  const client = createEncryptedChangeClient(base, 'room-token', async () => new Response('', { status: 409 }))
  await expect(client.upload(room,id,data)).rejects.toThrow('Change ID conflict')
})
it('TDD 775: room-scoped downloads decode binary ciphertext without exposing another room', async () => {
  const ciphertext = 'AQ' + 'A'.repeat(38)
  const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ changes: [{ id, ciphertext }] }), { status: 200 }))
  const client = createEncryptedChangeClient(base, 'room-token', fetchImpl)
  const result = await client.download(room)
  expect(result[0].id).toBe(id)
  expect(result[0].ciphertext[0]).toBe(1)
  expect(fetchImpl.mock.calls[0][0]).toBe(`${base}/v1/rooms/${room}/changes`)
})
it('TDD 776: an unauthorized response is not reported as successful synchronization', async () => {
  const client = createEncryptedChangeClient(base, 'room-token', async () => new Response('', { status: 403 }))
  await expect(client.download(room)).rejects.toThrow('Room permission denied')
})
