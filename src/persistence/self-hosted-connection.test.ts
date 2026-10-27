import { expect, it, vi } from 'vitest'
import { checkSelfHostedServer, normalizeSelfHostedUrl } from './self-hosted-connection'

it('TDD 737: local servers can use loopback HTTP without direct database credentials', () => {
  expect(normalizeSelfHostedUrl('http://localhost:8787/')).toBe('http://localhost:8787')
  expect(normalizeSelfHostedUrl('http://127.0.0.1:9000')).toBe('http://127.0.0.1:9000')
})

it('TDD 738: leased servers must use an HTTPS Uduzgak API endpoint', () => {
  expect(normalizeSelfHostedUrl('https://sync.example.org/')).toBe('https://sync.example.org')
  expect(() => normalizeSelfHostedUrl('http://sync.example.org')).toThrow('HTTPS is required')
})

it('TDD 739: URL credentials, queries, fragments and database URLs are rejected', () => {
  for (const url of [
    'https://admin:pass@sync.example.org',
    'https://sync.example.org?secret=123',
    'https://sync.example.org/#token',
    'mongodb://localhost:27017',
    'https://sync.example.org/custom/path',
  ]) {
    expect(() => normalizeSelfHostedUrl(url)).toThrow()
  }
})

it('TDD 740: testing a server sends the token only in an authorization header', async () => {
  const fetchImpl = vi.fn(async () => new Response(
    JSON.stringify({ protocol: 'uduzgak-sync-v1', storage: 'couchdb' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  ))
  expect(await checkSelfHostedServer('https://sync.example.org', 'session-secret', fetchImpl))
    .toEqual({ storage: 'couchdb' })
  expect(fetchImpl).toHaveBeenCalledWith(
    'https://sync.example.org/v1/session',
    expect.objectContaining({
      method: 'GET',
      redirect: 'error',
      headers: expect.objectContaining({ Authorization: 'Bearer session-secret' }),
    }),
  )
})

it('TDD 741: failure or unexpected server protocol never counts as connected', async () => {
  await expect(checkSelfHostedServer('https://sync.example.org', '', vi.fn()))
    .rejects.toThrow('Access token is required')
  await expect(checkSelfHostedServer('https://sync.example.org', 'secret', async () =>
    new Response(JSON.stringify({ ok: true }), { status: 200 })))
    .rejects.toThrow('Incompatible Uduzgak server')
  await expect(checkSelfHostedServer('https://sync.example.org', 'secret', async () =>
    new Response('', { status: 401 })))
    .rejects.toThrow('Server authentication failed')
})
