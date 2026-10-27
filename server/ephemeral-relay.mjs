import { createServer } from 'node:http'

const hex64 = /^[a-f0-9]{64}$/
const hex32 = /^[a-f0-9]{32}$/
const same = (a, b) => a.length === b.length && a.every((value, index) => value === b[index])
/** Fixed-window, bounded in-memory request quotas for room-scoped relay traffic. */
export function createRelayRateLimiter({
  now = Date.now, windowMs = 60_000, maxRequests = 120, maxBuckets = 10_000,
} = {}) {
  if (![windowMs, maxRequests, maxBuckets].every(value => Number.isSafeInteger(value) && value > 0))
    throw new Error('Invalid relay rate limits')
  const buckets = new Map()
  function allow(identity) {
    const time = now()
    for (const [key, bucket] of buckets) {
      if (bucket.until <= time) buckets.delete(key)
    }
    const current = buckets.get(identity)
    if (current) {
      if (current.count >= maxRequests) return false
      current.count++
      return true
    }
    if (buckets.size >= maxBuckets) return false
    buckets.set(identity, { count: 1, until: time + windowMs })
    return true
  }
  return { allow, stats: () => ({ buckets: buckets.size }) }
}

export function createEphemeralMailboxStore({
  now = Date.now, ttlMs = 3600_000, maxMessageBytes = 64 * 1024,
  maxRoomBytes = 2 * 1024 * 1024, maxTotalBytes = 32 * 1024 * 1024,
  maxMessagesPerRoom = 128,
} = {}) {
  if (![ttlMs, maxMessageBytes, maxRoomBytes, maxTotalBytes, maxMessagesPerRoom]
    .every(n => Number.isSafeInteger(n) && n > 0) || ttlMs > 24 * 3600_000) {
    throw new Error('Invalid relay limits')
  }
  const rooms = new Map()
  let totalBytes = 0
  function purge() {
    const time = now()
    for (const [room, messages] of rooms) {
      for (const [id, record] of messages) {
        if (record.expiresAt <= time) {
          totalBytes -= record.ciphertext.length
          messages.delete(id)
        }
      }
      if (!messages.size) rooms.delete(room)
    }
  }
  function valid(room, id) {
    if (!hex64.test(room) || (id !== undefined && !hex32.test(id))) throw new Error('Invalid mailbox ID')
  }
  function put(room, id, ciphertext) {
    valid(room, id)
    if (!(ciphertext instanceof Uint8Array) || ciphertext.length < 29 || ciphertext[0] !== 1 ||
      ciphertext.length > maxMessageBytes) throw new Error('Message too large')
    purge()
    const messages = rooms.get(room) ?? new Map()
    const previous = messages.get(id)
    if (previous) {
      if (!same(previous.ciphertext, ciphertext)) throw new Error('Message ID conflict')
      return { id, expiresAt: previous.expiresAt, created: false }
    }
    const roomBytes = [...messages.values()].reduce((sum, msg) => sum + msg.ciphertext.length, 0)
    if (messages.size >= maxMessagesPerRoom || roomBytes + ciphertext.length > maxRoomBytes ||
      totalBytes + ciphertext.length > maxTotalBytes) throw new Error('Room capacity exceeded')
    const record = { id, expiresAt: now() + ttlMs, ciphertext: Uint8Array.from(ciphertext) }
    messages.set(id, record)
    rooms.set(room, messages)
    totalBytes += ciphertext.length
    return { id, expiresAt: record.expiresAt, created: true }
  }
  function list(room) {
    valid(room)
    purge()
    return [...(rooms.get(room)?.values() ?? [])].map(x => ({
      id: x.id, expiresAt: x.expiresAt, ciphertext: Uint8Array.from(x.ciphertext),
    }))
  }
  function stats() { purge(); return { totalBytes, rooms: rooms.size } }
  return { put, list, stats, purge, limits: { maxMessageBytes } }
}

export function createRelayHttpServer({ store = createEphemeralMailboxStore(), allowedOrigins = [], roomAuthorizer, rateLimiter = createRelayRateLimiter() } = {}) {
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    const origin = req.headers.origin
    if (origin && !allowedOrigins.includes(origin)) {
      res.writeHead(403).end()
      return
    }
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Vary', 'Origin')
      res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
    }
    if (req.method === 'OPTIONS') { res.writeHead(204).end(); return }
    const path = new URL(req.url ?? '/', 'http://relay.invalid').pathname
    const match = /^\/v1\/rooms\/([a-f0-9]{64})\/messages(?:\/([a-f0-9]{32}))?$/.exec(path)
    if (!match) { res.writeHead(404).end(); return }
    const [, room, id] = match
    if (roomAuthorizer) {
      const permitted = req.method === 'GET' && !id
        ? roomAuthorizer.canRead(room, req.headers.authorization)
        : req.method === 'PUT' && id
          ? roomAuthorizer.canWrite(room, req.headers.authorization)
          : false
      if (!permitted) { res.writeHead(403).end(); return }
    }
    if (!rateLimiter.allow(room)) { res.writeHead(429).end(); return }
    try {
      if (req.method === 'GET' && !id) {
        const messages = store.list(room).map(record => ({
          id: record.id, expiresAt: record.expiresAt,
          ciphertext: Buffer.from(record.ciphertext).toString('base64url'),
        }))
        res.setHeader('Content-Type', 'application/json')
        res.writeHead(200).end(JSON.stringify({ messages }))
      } else if (req.method === 'PUT' && id) {
        if (req.headers['content-type'] !== 'application/octet-stream') {
          res.writeHead(415).end(); return
        }
        const parts = []
        let size = 0
        for await (const part of req) {
          size += part.length
          if (size > store.limits.maxMessageBytes) {
            res.writeHead(413).end(); return
          }
          parts.push(part)
        }
        const saved = store.put(room, id, new Uint8Array(Buffer.concat(parts)))
        res.setHeader('Content-Type', 'application/json')
        res.writeHead(saved.created ? 201 : 200).end(JSON.stringify(saved))
      } else { res.writeHead(405).end() }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Invalid request'
      const code = msg === 'Message too large' ? 413 :
        msg === 'Room capacity exceeded' ? 429 :
        msg === 'Message ID conflict' ? 409 : 400
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(code).end(JSON.stringify({ error: msg }))
    }
  })
  return server
}
