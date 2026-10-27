const OBJECT_STORE = 'replicas'

/** Optional browser-local replica storage. Does not replace legacy storage on its own. */
export class IndexedDbReplicaStore {
  constructor(
    private readonly factory: IDBFactory,
    private readonly databaseName = 'uduzgak-local-first',
  ) {}

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = this.factory.open(this.databaseName, 1)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(OBJECT_STORE)) {
          request.result.createObjectStore(OBJECT_STORE)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened'))
    })
  }

  private validKey(key: string): void {
    if (!key.trim()) throw new Error('Replica key is required')
  }

  async read(key: string): Promise<string | null> {
    this.validKey(key)
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(OBJECT_STORE, 'readonly')
      const req = tx.objectStore(OBJECT_STORE).get(key)
      let value: unknown
      req.onsuccess = () => { value = req.result }
      req.onerror = () => reject(req.error ?? new Error('Replica read failed'))
      tx.oncomplete = () => {
        db.close()
        resolve(typeof value === 'string' ? value : null)
      }
      tx.onerror = () => {
        db.close()
        reject(tx.error ?? new Error('Replica read transaction failed'))
      }
      tx.onabort = () => {
        db.close()
        reject(tx.error ?? new Error('Replica read transaction aborted'))
      }
    })
  }

  async write(key: string, contents: string): Promise<void> {
    this.validKey(key)
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(OBJECT_STORE, 'readwrite')
      tx.objectStore(OBJECT_STORE).put(contents, key)
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        reject(tx.error ?? new Error('Replica write transaction failed'))
      }
      tx.onabort = () => {
        db.close()
        reject(tx.error ?? new Error('Replica write transaction aborted'))
      }
    })
  }
}
