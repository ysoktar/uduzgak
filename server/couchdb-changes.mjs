import { timingSafeEqual } from 'node:crypto'

const roomPattern = /^[a-f0-9]{64}$/
const idPattern = /^[a-f0-9]{32}$/
const same = (a, b) => a.length === b.length && timingSafeEqual(a, b)

export function createCouchDbChangeAdapter({ url, database, username, password, fetchImpl = fetch }) {
  const endpoint = new URL(url)
  if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.pathname !== '/' ||
    endpoint.search || endpoint.hash || endpoint.username || endpoint.password ||
    (endpoint.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname)) ||
    !/^[a-z][a-z0-9_$()+-]*$/.test(database) ||
    !username || !password) throw new Error('Invalid CouchDB configuration')
  const root = `${endpoint.origin}/${encodeURIComponent(database)}`
  const credentials = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
  const request = (path, options = {}) => fetchImpl(`${root}/${path}`, {
    ...options,
    headers: { Authorization: credentials, ...options.headers },
    redirect: 'error',
    signal: AbortSignal.timeout(5000),
  })
  const key = (room, id) => `${room}:${id}`
  const validate = (room, id) => {
    if (!roomPattern.test(room) || (id !== undefined && !idPattern.test(id)))
      throw new Error('Invalid change identity')
  }
  return {
    kind: 'couchdb',
    async put(room, id, sealed) {
      validate(room, id)
      if (!(sealed instanceof Uint8Array) || sealed.length < 29 || sealed.length > 65536 || sealed[0] !== 1)
        throw new Error('Invalid encrypted change')
      const ciphertext = Buffer.from(sealed).toString('base64url')
      const doc = { _id: key(room,id), room, messageId: id, ciphertext }
      const response = await request(encodeURIComponent(doc._id), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(doc),
      })
      if (response.ok) return { created: true }
      if (response.status === 409) {
        const existing = await request(encodeURIComponent(doc._id))
        if (!existing.ok) throw new Error('CouchDB read failed')
        const saved = await existing.json()
        if (typeof saved.ciphertext === 'string' && same(Buffer.from(saved.ciphertext), Buffer.from(ciphertext)))
          return { created: false }
        throw new Error('Change ID conflict')
      }
      throw new Error('CouchDB write failed')
    },
    async list(room) {
      validate(room)
      const startkey = JSON.stringify(`${room}:`)
      const endkey = JSON.stringify(`${room}:\ufff0`)
      const query = new URLSearchParams({ include_docs: 'true', startkey, endkey })
      const response = await request(`_all_docs?${query.toString()}`)
      if (!response.ok) throw new Error('CouchDB read failed')
      const body = await response.json()
      if (!Array.isArray(body.rows)) throw new Error('Invalid CouchDB response')
      return body.rows.filter(row =>
        row?.doc?.room === room &&
        idPattern.test(row?.doc?.messageId ?? '') &&
        typeof row?.doc?.ciphertext === 'string'
      ).map(row => ({ id: row.doc.messageId, ciphertext: row.doc.ciphertext }))
    },
  }
}
