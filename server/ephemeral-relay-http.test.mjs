import { afterEach, expect, it } from 'vitest'
import { createEphemeralMailboxStore, createRelayHttpServer } from './ephemeral-relay.mjs'

const room = 'c'.repeat(64)
const otherRoom = 'd'.repeat(64)
const id = 'e'.repeat(32)
const sealed = Uint8Array.from([1, ...new Uint8Array(12), ...new Uint8Array(16), 42])
const running = []
async function start(options = {}) {
  const server = createRelayHttpServer(options)
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  running.push(server)
  return `http://127.0.0.1:${server.address().port}`
}
afterEach(async () => {
  await Promise.all(running.splice(0).map(server => new Promise(resolve => server.close(resolve))))
})
it('TDD 732: encrypted opaque bytes can be uploaded and fetched after sender disconnects', async () => {
  const url = await start()
  const put = await fetch(`${url}/v1/rooms/${room}/messages/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: sealed,
  })
  expect(put.status).toBe(201)
  const response = await fetch(`${url}/v1/rooms/${room}/messages`)
  const document = await response.json()
  expect(document.messages).toHaveLength(1)
  expect(document.messages[0].ciphertext).toBe(Buffer.from(sealed).toString('base64url'))
  expect(response.headers.get('cache-control')).toBe('no-store')
})
it('TDD 733: a missing mailbox does not leak another room contents', async () => {
  const url = await start()
  await fetch(`${url}/v1/rooms/${room}/messages/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: sealed,
  })
  const response = await fetch(`${url}/v1/rooms/${otherRoom}/messages`)
  expect((await response.json()).messages).toEqual([])
})
it('TDD 734: expired messages disappear from HTTP reads', async () => {
  let time = 100
  const store = createEphemeralMailboxStore({ ttlMs: 20, now: () => time })
  const url = await start({ store })
  await fetch(`${url}/v1/rooms/${room}/messages/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: sealed,
  })
  time = 120
  const response = await fetch(`${url}/v1/rooms/${room}/messages`)
  expect((await response.json()).messages).toEqual([])
})
it('TDD 735: malformed and oversized writes are rejected without storing them', async () => {
  const store = createEphemeralMailboxStore({ maxMessageBytes: 32 })
  const url = await start({ store })
  const response = await fetch(`${url}/v1/rooms/${room}/messages/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' },
    body: new Uint8Array(60),
  })
  expect(response.status).toBe(413)
  expect(store.list(room)).toEqual([])
})
it('TDD 736: browser cross-origin access needs an explicit allowed origin', async () => {
  const url = await start({ allowedOrigins: ['https://app.example'] })
  const allowed = await fetch(`${url}/v1/rooms/${room}/messages`, {
    headers: { Origin: 'https://app.example' },
  })
  const denied = await fetch(`${url}/v1/rooms/${room}/messages`, {
    headers: { Origin: 'https://untrusted.example' },
  })
  expect(allowed.headers.get('access-control-allow-origin')).toBe('https://app.example')
  expect(denied.status).toBe(403)
  expect(denied.headers.get('access-control-allow-origin')).toBeNull()
})
