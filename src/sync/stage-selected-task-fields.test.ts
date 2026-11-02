import { expect, it, vi } from 'vitest'
import { createTask } from '../domain/task'
import { createDurableChangeOutbox } from '../persistence/durable-change-outbox'
import { openRoomChange } from '../persistence/room-change-envelope'
import { stageSelectedTaskFields } from './stage-selected-task-fields'

const room = 'a'.repeat(64)
const secret = 'b'.repeat(64)
const task = createTask({ id: 'task-1', projectId: 'project-1', title: 'Private', now: '2026-11-02T00:00:00.000Z' })

function fixture() {
  const values = new Map<string, unknown>()
  const backend = {
    get: async (key: string) => values.get(key),
    set: vi.fn(async (key: string, value: unknown) => { values.set(key, value) }),
    delete: async (key: string) => { values.delete(key) },
    keys: async () => [...values.keys()],
  }
  return { backend, outbox: createDurableChangeOutbox(backend) }
}

async function read(outbox: ReturnType<typeof createDurableChangeOutbox>) {
  return Promise.all((await outbox.pending(room)).map(async packet =>
    JSON.parse(new TextDecoder().decode(await openRoomChange(room, packet.id, secret, packet.ciphertext))) as {
      actor: string; clock: number; field: string; entity: string; value: string
    },
  ))
}

it('TDD 897: selected field staging creates ciphertext without any transport dependency', async () => {
  const f = fixture()
  const reserve = vi.fn(async () => ({ actor: 'device-1', startingClock: 7 }))
  const ids = await stageSelectedTaskFields(f.backend, reserve, { room, secret }, task, ['title'])
  expect(ids).toHaveLength(1)
  expect(reserve).toHaveBeenCalledWith(room, 1)
  expect((await read(f.outbox))[0]).toMatchObject({ actor: 'device-1', clock: 7, field: 'title', entity: task.id, value: 'Private' })
  expect((await f.outbox.pending(room))[0].ciphertext).toBeInstanceOf(Uint8Array)
})

it('TDD 898: repeated selections use reserved monotonic clocks, not packet ID order', async () => {
  const f = fixture()
  let next = 20
  const reserve = vi.fn(async (_room: string, count: number) => {
    const start = next
    next += count
    return { actor: 'device-1', startingClock: start }
  })
  await stageSelectedTaskFields(f.backend, reserve, { room, secret }, task, ['title', 'status'])
  await stageSelectedTaskFields(f.backend, reserve, { room, secret }, task, ['priority'])
  const changes = (await read(f.outbox)).sort((a, b) => a.clock - b.clock)
  expect(changes.map(change => change.clock)).toEqual([20, 21, 22])
  expect(changes.map(change => change.field)).toEqual(['title', 'status', 'priority'])
  expect(reserve).toHaveBeenCalledTimes(2)
})

it('TDD 899: clock reservation failure does not enqueue partially encrypted changes', async () => {
  const f = fixture()
  await expect(stageSelectedTaskFields(f.backend, async () => {
    throw new Error('IndexedDB quota')
  }, { room, secret }, task, ['title'])).rejects.toThrow('IndexedDB quota')
  expect(await f.outbox.pending(room)).toEqual([])
  expect(f.backend.set).not.toHaveBeenCalled()
})

it('TDD 900: a reserved identity is validated before a packet is written', async () => {
  const f = fixture()
  await expect(stageSelectedTaskFields(f.backend, async () => ({
    actor: '', startingClock: 1,
  }), { room, secret }, task, ['title'])).rejects.toThrow('Invalid register actor')
  expect(await f.outbox.pending(room)).toEqual([])
})

it('TDD 901: an empty field selection does not consume clocks or write ciphertext', async () => {
  const f = fixture()
  const reserve = vi.fn(async () => ({ actor: 'device-1', startingClock: 1 }))
  expect(await stageSelectedTaskFields(f.backend, reserve, { room, secret }, task, [])).toEqual([])
  expect(reserve).not.toHaveBeenCalled()
  expect(f.backend.set).not.toHaveBeenCalled()
})
