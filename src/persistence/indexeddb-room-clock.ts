import type { ClockReservation, ReserveTaskClocks } from '../sync/stage-selected-task-fields'

interface SavedClock {
  actor: string
  nextClock: number
}

const roomPattern = /^[a-f0-9]{64}$/

/** Reserve a contiguous clock range in one readwrite transaction per room. */
export function createIndexedDbRoomClockReservation(
  indexedDb: IDBFactory = indexedDB,
  createActor: () => string = () => crypto.randomUUID(),
): ReserveTaskClocks {
  return async (room: string, count: number): Promise<ClockReservation> => {
    if (!roomPattern.test(room)) throw new Error('Invalid change identity')
    if (!Number.isSafeInteger(count) || count < 1 || count >= Number.MAX_SAFE_INTEGER)
      throw new Error('Invalid clock reservation')
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDb.open('uduzgak-encrypted-outbox', 1)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('changes'))
          request.result.createObjectStore('changes')
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('IndexedDB unavailable'))
      request.onblocked = () => reject(new Error('IndexedDB upgrade blocked'))
    })
    return new Promise<ClockReservation>((resolve, reject) => {
      const tx = db.transaction('changes', 'readwrite')
      const store = tx.objectStore('changes')
      const key = 'room-clock:' + room
      let allocation: ClockReservation | undefined
      let failure: Error | undefined
      const request = store.get(key)
      request.onsuccess = () => {
        try {
          const existing = request.result as SavedClock | undefined
          if (existing !== undefined &&
            (!existing || typeof existing.actor !== 'string' ||
              !existing.actor.trim() || !Number.isSafeInteger(existing.nextClock) ||
              existing.nextClock < 1 || existing.nextClock > Number.MAX_SAFE_INTEGER - count))
            throw new Error('Invalid saved clock state')
          const actor = existing?.actor ?? createActor()
          if (typeof actor !== 'string' || !actor.trim() || actor !== actor.trim())
            throw new Error('Invalid register actor')
          const startingClock = existing?.nextClock ?? 1
          if (startingClock > Number.MAX_SAFE_INTEGER - count)
            throw new Error('Invalid saved clock state')
          allocation = { actor, startingClock }
          store.put({ actor, nextClock: startingClock + count } satisfies SavedClock, key)
        } catch (error) {
          failure = error instanceof Error ? error : new Error('Clock reservation failed')
          tx.abort()
        }
      }
      request.onerror = () => {
        failure = request.error ?? new Error('Clock reservation failed')
        tx.abort()
      }
      tx.oncomplete = () => {
        db.close()
        if (allocation) resolve(allocation)
        else reject(new Error('Clock reservation did not commit'))
      }
      tx.onabort = () => {
        db.close()
        reject(failure ?? tx.error ?? new Error('Clock reservation aborted'))
      }
      tx.onerror = () => {
        db.close()
        reject(failure ?? tx.error ?? new Error('Clock reservation failed'))
      }
    })
  }
}
