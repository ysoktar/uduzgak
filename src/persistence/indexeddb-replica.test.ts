import { expect, it } from 'vitest'
import { IndexedDbReplicaStore } from './indexeddb-replica'

function fakeIndexedDb() {
  const records = new Map<string, string>()
  const factory = {
    open() {
      const request: {
        result: unknown; error: Error | null
        onsuccess: (() => void) | null; onerror: (() => void) | null
        onupgradeneeded: (() => void) | null
      } = { result: null, error: null, onsuccess: null, onerror: null, onupgradeneeded: null }
      const db = {
        objectStoreNames: { contains: () => false },
        createObjectStore: () => undefined,
        close: () => undefined,
        transaction() {
          const tx: {
            oncomplete: (() => void) | null
            onerror: (() => void) | null
            onabort: (() => void) | null
            objectStore: () => {
              get: (key: string) => unknown
              put: (value: string, key: string) => unknown
            }
          } = {
            oncomplete: null, onerror: null, onabort: null,
            objectStore: () => ({
              get: key => {
                const req: { result: unknown; error: null; onsuccess: (() => void) | null; onerror: null } =
                  { result: undefined, error: null, onsuccess: null, onerror: null }
                queueMicrotask(() => {
                  req.result = records.get(key)
                  req.onsuccess?.()
                  queueMicrotask(() => tx.oncomplete?.())
                })
                return req
              },
              put: (value, key) => {
                queueMicrotask(() => { records.set(key, value); tx.oncomplete?.() })
                return { error: null }
              },
            }),
          }
          return tx
        },
      }
      queueMicrotask(() => {
        request.result = db
        request.onupgradeneeded?.()
        request.onsuccess?.()
      })
      return request
    },
  }
  return factory as unknown as IDBFactory
}

it('TDD 722: a missing document returns null', async () => {
  expect(await new IndexedDbReplicaStore(fakeIndexedDb()).read('unknown')).toBeNull()
})

it('TDD 723: raw document can be written and loaded', async () => {
  const store = new IndexedDbReplicaStore(fakeIndexedDb())
  await store.write('workspace', '{"version":1}')
  expect(await store.read('workspace')).toBe('{"version":1}')
})

it('TDD 724: later writes replace the same replica key', async () => {
  const store = new IndexedDbReplicaStore(fakeIndexedDb())
  await store.write('workspace', 'first')
  await store.write('workspace', 'second')
  expect(await store.read('workspace')).toBe('second')
})

it('TDD 725: unavailable IndexedDB rejects without a fake successful read', async () => {
  const factory = { open: () => {
    const req: { error: Error; onerror: (() => void) | null } =
      { error: new Error('IndexedDB unavailable'), onerror: null }
    queueMicrotask(() => req.onerror?.())
    return req
  } } as unknown as IDBFactory
  await expect(new IndexedDbReplicaStore(factory).read('workspace')).rejects.toThrow('IndexedDB unavailable')
})

it('TDD 726: blank replica keys are rejected before touching the database', async () => {
  const store = new IndexedDbReplicaStore(fakeIndexedDb())
  await expect(store.write(' ', 'data')).rejects.toThrow('Replica key is required')
})
