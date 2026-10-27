import { expect, it } from 'vitest'
import { createCouchDbChangeAdapter } from './couchdb-changes.mjs'

const room = 'a'.repeat(64)
const id = 'b'.repeat(32)
const ciphertext = Buffer.from([1,...Array(12).fill(0),...Array(16).fill(3)])
function fixture() {
  const documents = new Map()
  const requests = []
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url, options })
    const key = decodeURIComponent(new URL(url).pathname.split('/').at(-1))
    if (options.method === 'PUT') {
      if (documents.has(key)) return new Response('{"error":"conflict"}', { status: 409 })
      documents.set(key, JSON.parse(options.body))
      return new Response('{"ok":true}', { status: 201 })
    }
    if (key === '_all_docs') {
      const prefix = new URL(url).searchParams.get('startkey')?.replaceAll('"','') ?? ''
      return new Response(JSON.stringify({ rows: [...documents].filter(([id]) => id.startsWith(prefix)).map(([id, doc]) => ({ id, doc })) }), { status: 200 })
    }
    return new Response(JSON.stringify(documents.get(key) ?? { error: 'not_found' }), { status: documents.has(key) ? 200 : 404 })
  }
  const adapter = createCouchDbChangeAdapter({
    url: 'http://127.0.0.1:5984', database: 'uduzgak-changes',
    username: 'service', password: 'password', fetchImpl,
  })
  return { adapter, requests, documents }
}
it('TDD 752: opaque ciphertext is stored without plaintext or client credentials', async () => {
  const { adapter, documents } = fixture()
  expect(await adapter.put(room,id,ciphertext)).toEqual({ created: true })
  const stored = [...documents.values()][0]
  expect(stored.ciphertext).toBe(ciphertext.toString('base64url'))
  expect(JSON.stringify(stored)).not.toContain('service')
})
it('TDD 753: repeating an identical change is idempotent', async () => {
  const { adapter } = fixture()
  await adapter.put(room,id,ciphertext)
  expect(await adapter.put(room,id,ciphertext)).toEqual({ created: false })
})
it('TDD 754: conflicting ciphertext under a reused message ID is rejected', async () => {
  const { adapter } = fixture()
  await adapter.put(room,id,ciphertext)
  await expect(adapter.put(room,id,Buffer.concat([ciphertext,Buffer.from([42])])))
    .rejects.toThrow('Change ID conflict')
})
it('TDD 755: invalid room IDs and unencrypted envelopes are rejected before network calls', async () => {
  const { adapter, requests } = fixture()
  await expect(adapter.put('../',id,ciphertext)).rejects.toThrow('Invalid change identity')
  await expect(adapter.put(room,id,Buffer.from('plaintext'))).rejects.toThrow('Invalid encrypted change')
  expect(requests).toEqual([])
})
it('TDD 756: reading only a room returns its encrypted change records', async () => {
  const { adapter } = fixture()
  await adapter.put(room,id,ciphertext)
  const rows = await adapter.list(room)
  expect(rows).toEqual([{ id, ciphertext: ciphertext.toString('base64url') }])
})
