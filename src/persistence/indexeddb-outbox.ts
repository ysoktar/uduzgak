import type { ChangeOutboxBackend } from './durable-change-outbox'

/** IndexedDB storage dedicated to encrypted pending changes. Never touches the v1 Workspace key. */
export function createIndexedDbOutboxBackend(
  indexedDb: IDBFactory = indexedDB,
): ChangeOutboxBackend {
  const open = () => new Promise<IDBDatabase>((resolve,reject) => {
    const request = indexedDb.open('uduzgak-encrypted-outbox', 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('changes')) db.createObjectStore('changes')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB unavailable'))
    request.onblocked = () => reject(new Error('IndexedDB upgrade blocked'))
  })
  async function execute<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await open()
    return new Promise<T>((resolve,reject) => {
      const tx = db.transaction('changes',mode)
      const request = operation(tx.objectStore('changes'))
      let value: T
      request.onsuccess = () => { value = request.result }
      request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
      tx.oncomplete = () => { db.close(); resolve(value) }
      tx.onerror = () => { db.close(); reject(tx.error ?? new Error('IndexedDB transaction failed')) }
      tx.onabort = () => { db.close(); reject(tx.error ?? new Error('IndexedDB transaction aborted')) }
    })
  }
  return {
    get: key => execute('readonly', store => store.get(key)),
    set: async (key,value) => { await execute('readwrite',store => store.put(value,key)) },
    delete: async key => { await execute('readwrite',store => store.delete(key)) },
    keys: async () => (await execute('readonly', store => store.getAllKeys())).map(String),
  }
}
