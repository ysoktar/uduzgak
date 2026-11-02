import { expect, it, vi } from 'vitest'
import { createIndexedDbRoomClockReservation } from './indexeddb-room-clock'

const room = 'a'.repeat(64)
const otherRoom = 'b'.repeat(64)

function fixture() {
  const records = new Map<string, unknown>()
  let transactionEnd = Promise.resolve()
  const factory = {
    open() {
      const request = {
        result: undefined as unknown,
        error: null,
        onsuccess: null as null | (() => void),
        onerror: null as null | (() => void),
        onupgradeneeded: null as null | (() => void),
        onblocked: null as null | (() => void),
      }
      const db = {
        objectStoreNames: { contains: (name: string) => name === 'changes' },
        createObjectStore: () => undefined,
        close: () => undefined,
        transaction(_name: string, mode: string) {
          expect(mode).toBe('readwrite')
          const previous = transactionEnd
          let unlock: () => void = () => undefined
          transactionEnd = new Promise<void>(resolve => { unlock = resolve })
          let aborted = false
          const tx = {
            oncomplete: null as null | (() => void),
            onabort: null as null | (() => void),
            onerror: null as null | (() => void),
            abort() {
              aborted = true
              queueMicrotask(() => { tx.onabort?.(); unlock() })
            },
            objectStore: () => ({
              get(key: string) {
                const getRequest = {
                  result: undefined as unknown,
                  error: null,
                  onsuccess: null as null | (() => void),
                  onerror: null as null | (() => void),
                }
                void previous.then(() => {
                  queueMicrotask(() => {
                    if (aborted) return
                    getRequest.result = records.get(key)
                    getRequest.onsuccess?.()
                    queueMicrotask(() => {
                      if (!aborted) { tx.oncomplete?.(); unlock() }
                    })
                  })
                })
                return getRequest
              },
              put(value: unknown, key: string) {
                records.set(key, value)
                return { error: null }
              },
            }),
          }
          return tx
        },
      }
      queueMicrotask(() => {
        request.result = db
        request.onsuccess?.()
      })
      return request
    },
  }
  return { factory: factory as unknown as IDBFactory, records }
}

it('TDD 902: first room allocation persists a device identity and next safe clock', async () => {
  const f = fixture()
  const newActor = vi.fn(() => 'device-1')
  const reserve = createIndexedDbRoomClockReservation(f.factory, newActor)
  expect(await reserve(room, 1)).toEqual({ actor: 'device-1', startingClock: 1 })
  expect(f.records.get('room-clock:' + room)).toEqual({ actor: 'device-1', nextClock: 2 })
  expect(newActor).toHaveBeenCalledTimes(1)
})

it('TDD 903: later allocations reuse actor and reserve consecutive non-overlapping ranges', async () => {
  const f = fixture()
  const reserve = createIndexedDbRoomClockReservation(f.factory, () => 'device-1')
  expect(await reserve(room, 2)).toEqual({ actor: 'device-1', startingClock: 1 })
  expect(await reserve(room, 3)).toEqual({ actor: 'device-1', startingClock: 3 })
  expect(f.records.get('room-clock:' + room)).toEqual({ actor: 'device-1', nextClock: 6 })
})

it('TDD 904: concurrent requests from one IndexedDB serialize to disjoint clock ranges', async () => {
  const f = fixture()
  const reserve = createIndexedDbRoomClockReservation(f.factory, () => 'device-1')
  const allocated = await Promise.all([reserve(room, 2), reserve(room, 2), reserve(room, 2)])
  expect(allocated.map(item => item.startingClock).sort((a, b) => a - b)).toEqual([1, 3, 5])
  expect(f.records.get('room-clock:' + room)).toEqual({ actor: 'device-1', nextClock: 7 })
})

it('TDD 905: separate rooms use independent actors and counters', async () => {
  const f = fixture()
  let number = 0
  const reserve = createIndexedDbRoomClockReservation(f.factory, () => 'device-' + ++number)
  expect(await reserve(room, 2)).toEqual({ actor: 'device-1', startingClock: 1 })
  expect(await reserve(otherRoom, 1)).toEqual({ actor: 'device-2', startingClock: 1 })
  expect(f.records.size).toBe(2)
})

it('TDD 906: invalid counts and corrupt saved clocks are rejected without overwriting state', async () => {
  const f = fixture()
  const reserve = createIndexedDbRoomClockReservation(f.factory, () => 'device-1')
  await expect(reserve(room, 0)).rejects.toThrow('Invalid clock reservation')
  await expect(reserve(room, Number.MAX_SAFE_INTEGER)).rejects.toThrow('Invalid clock reservation')
  await expect(reserve('bad-room', 1)).rejects.toThrow('Invalid change identity')
  f.records.set('room-clock:' + room, { actor: 'device-1', nextClock: Number.MAX_SAFE_INTEGER })
  await expect(reserve(room, 2)).rejects.toThrow('Invalid saved clock state')
  expect(f.records.get('room-clock:' + room)).toEqual({
    actor: 'device-1', nextClock: Number.MAX_SAFE_INTEGER,
  })
  expect(f.records.size).toBe(1)
})
