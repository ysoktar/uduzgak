import { afterEach, expect, it } from 'vitest'
import { createSelfHostedServer, createCouchDbHealthAdapter } from './self-hosted-api.mjs'

const active = []
async function listen(options) {
  const server = createSelfHostedServer(options)
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  active.push(server)
  return `http://127.0.0.1:${server.address().port}`
}
afterEach(async () => {
  await Promise.all(active.splice(0).map(server => new Promise(resolve => server.close(resolve))))
})
const auth = { Authorization: 'Bearer safe-token' }

it('TDD 747: self-hosted server responds with compatible storage protocol', async () => {
  const url = await listen({ token: 'safe-token', adapter: { kind: 'couchdb', health: async () => true } })
  const response = await fetch(`${url}/v1/session`, { headers: auth })
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ protocol: 'uduzgak-sync-v1', storage: 'couchdb' })
})
it('TDD 748: requests without the correct token never reveal server information', async () => {
  const url = await listen({ token: 'safe-token', adapter: { kind: 'couchdb', health: async () => true } })
  for (const headers of [{}, { Authorization: 'Bearer wrong' }]) {
    const response = await fetch(`${url}/v1/session`, { headers })
    expect(response.status).toBe(401)
    expect((await response.text())).not.toContain('couchdb')
  }
})
it('TDD 749: unreachable database does not report an active connection', async () => {
  const url = await listen({ token: 'safe-token', adapter: { kind: 'couchdb', health: async () => false } })
  const response = await fetch(`${url}/v1/session`, { headers: auth })
  expect(response.status).toBe(503)
})
it('TDD 750: browser origins are allowlisted and preflight is supported', async () => {
  const url = await listen({ token: 'safe-token', adapter: { kind: 'couchdb', health: async () => true }, allowedOrigins: ['https://app.example'] })
  const allowed = await fetch(`${url}/v1/session`, { method: 'OPTIONS', headers: { Origin: 'https://app.example', 'Access-Control-Request-Method': 'GET' } })
  expect(allowed.status).toBe(204)
  expect(allowed.headers.get('access-control-allow-origin')).toBe('https://app.example')
  const denied = await fetch(`${url}/v1/session`, { headers: { ...auth, Origin: 'https://bad.example' } })
  expect(denied.status).toBe(403)
})
it('TDD 751: CouchDB adapter checks health using server-held credentials', async () => {
  const calls = []
  const adapter = createCouchDbHealthAdapter({
    url: 'http://127.0.0.1:5984', username: 'db-user', password: 'db-password',
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
    },
  })
  expect(await adapter.health()).toBe(true)
  expect(adapter.kind).toBe('couchdb')
  expect(calls[0].url).toBe('http://127.0.0.1:5984/_up')
  expect(calls[0].options.headers.Authorization).toBe(`Basic ${Buffer.from('db-user:db-password').toString('base64')}`)
})
