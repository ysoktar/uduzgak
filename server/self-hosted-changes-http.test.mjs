import { afterEach, expect, it } from 'vitest'
import { createSelfHostedServer } from './self-hosted-api.mjs'
const servers = []
const room = 'a'.repeat(64)
const id = 'b'.repeat(32)
const encoded = Buffer.from([1, ...Array(28).fill(0)])
async function start(adapter) {
  const server = createSelfHostedServer({ token: 'test-token', adapter })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  servers.push(server)
  return `http://127.0.0.1:${server.address().port}`
}
afterEach(async () => Promise.all(servers.splice(0).map(server => new Promise(resolve => server.close(resolve)))))
const header = { Authorization: 'Bearer test-token' }
it('TDD 757: authenticated clients can upload encrypted changes', async () => {
  const changes = []
  const url = await start({ kind: 'couchdb', health: async () => true, put: async (...args) => { changes.push(args); return { created: true } }, list: async () => [] })
  const response = await fetch(`${url}/v1/rooms/${room}/changes/${id}`, {
    method: 'PUT', headers: { ...header, 'Content-Type': 'application/octet-stream' }, body: encoded,
  })
  expect(response.status).toBe(201)
  expect(changes[0][0]).toBe(room)
  expect(changes[0][1]).toBe(id)
})
it('TDD 758: requests without a valid token cannot write', async () => {
  const url = await start({ kind: 'couchdb', health: async () => true, put: async () => { throw new Error('unauthorized write') }, list: async () => [] })
  const response = await fetch(`${url}/v1/rooms/${room}/changes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: encoded })
  expect(response.status).toBe(401)
})
it('TDD 759: authenticated clients can retrieve opaque encrypted changes', async () => {
  const url = await start({ kind: 'couchdb', health: async () => true, put: async () => ({ created: true }), list: async () => [{ id, ciphertext: encoded.toString('base64url') }] })
  const response = await fetch(`${url}/v1/rooms/${room}/changes`, { headers: header })
  expect(response.status).toBe(200)
  expect((await response.json()).changes).toEqual([{ id, ciphertext: encoded.toString('base64url') }])
})
it('TDD 760: oversized uploads are rejected before hitting the database', async () => {
  let writes = 0
  const url = await start({ kind: 'couchdb', health: async () => true, put: async () => { writes++; return { created: true } }, list: async () => [] })
  const response = await fetch(`${url}/v1/rooms/${room}/changes/${id}`, { method: 'PUT', headers: { ...header, 'Content-Type': 'application/octet-stream' }, body: new Uint8Array(65537) })
  expect(response.status).toBe(413)
  expect(writes).toBe(0)
})
it('TDD 761: malformed room IDs cannot reach the database', async () => {
  const url = await start({ kind: 'couchdb', health: async () => true, put: async () => ({ created: true }), list: async () => [] })
  const response = await fetch(`${url}/v1/rooms/invalid/changes`, { headers: header })
  expect(response.status).toBe(404)
})
