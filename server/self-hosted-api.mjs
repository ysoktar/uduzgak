import { createServer } from 'node:http'
import { timingSafeEqual } from 'node:crypto'

export function createCouchDbHealthAdapter({ url, username, password, fetchImpl = fetch }) {
  const endpoint = new URL(url)
  if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || endpoint.pathname !== '/' ||
    (endpoint.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname))) {
    throw new Error('Invalid CouchDB endpoint')
  }
  return {
    kind: 'couchdb',
    async health() {
      try {
        const authorization = Buffer.from(`${username}:${password}`).toString('base64')
        const response = await fetchImpl(`${endpoint.origin}/_up`, {
          method: 'GET',
          headers: { Authorization: `Basic ${authorization}` },
          redirect: 'error',
          signal: AbortSignal.timeout(4000),
        })
        return response.ok
      } catch { return false }
    },
  }
}

function authorized(header, token) {
  if (typeof header !== 'string') return false
  const candidate = Buffer.from(header)
  const expected = Buffer.from(`Bearer ${token}`)
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

export function createSelfHostedServer({ token, adapter, allowedOrigins = [] }) {
  if (typeof token !== 'string' || token.length < 8 || !adapter ||
    typeof adapter.kind !== 'string' || typeof adapter.health !== 'function') throw new Error('Invalid server configuration')
  return createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    const origin = request.headers.origin
    if (origin && !allowedOrigins.includes(origin)) {
      response.writeHead(403).end()
      return
    }
    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin)
      response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
      response.setHeader('Vary', 'Origin')
    }
    if (request.method === 'OPTIONS') {
      response.writeHead(204).end()
      return
    }
    if (request.url !== '/v1/session' || request.method !== 'GET') {
      response.writeHead(404).end()
      return
    }
    if (!authorized(request.headers.authorization, token)) {
      response.writeHead(401).end()
      return
    }
    if (!(await adapter.health())) {
      response.writeHead(503).end()
      return
    }
    response.setHeader('Content-Type', 'application/json')
    response.writeHead(200).end(JSON.stringify({ protocol: 'uduzgak-sync-v1', storage: adapter.kind }))
  })
}
