import { expect, it, vi } from 'vitest'
import { createDurableChangeOutbox } from '../persistence/durable-change-outbox'
import { openRoomChange } from '../persistence/room-change-envelope'
import { createTask } from '../domain/task'
import { stageTaskFields } from './stage-task-fields'

const room = 'a'.repeat(64)
const secret = 'b'.repeat(64)
const actor = 'device-local'
const task = createTask({ id: 'task-1', projectId: 'project-1', title: 'Private plan', now: '2026-11-02T00:00:00.000Z' })

function fixture() {
  const records = new Map<string, unknown>()
  const set = vi.fn(async (key: string, value: unknown) => { records.set(key, value) })
  const backend = {
    get: async (key: string) => records.get(key),
    set,
    delete: async (key: string) => { records.delete(key) },
    keys: async () => [...records.keys()],
  }
  return { outbox: createDurableChangeOutbox(backend), set, records }
}

async function decoded(outbox: ReturnType<typeof createDurableChangeOutbox>) {
  const packets = await outbox.pending(room)
  return Promise.all(packets.map(async packet => JSON.parse(new TextDecoder().decode(
    await openRoomChange(room, packet.id, secret, packet.ciphertext),
  )) as { id: string; actor: string; clock: number; entity: string; field: string; value: unknown }))
}

it('TDD 882: explicitly selected Task title is staged as ciphertext without editing the Task', async () => {
  const f = fixture()
  const before = { ...task }
  const ids = await stageTaskFields(f.outbox, room, secret, task, ['title'], actor, 10)
  expect(ids).toHaveLength(1)
  const packets = await f.outbox.pending(room)
  expect(packets).toHaveLength(1)
  expect(packets[0].id).toBe(ids[0])
  expect(JSON.stringify([...packets[0].ciphertext])).not.toContain(task.title)
  expect((await decoded(f.outbox))[0]).toMatchObject({
    actor, clock: 10, entity: task.id, field: 'title', value: task.title,
  })
  expect(task).toEqual(before)
})

it('TDD 883: only selected status and priority fields receive distinct ordered clocks', async () => {
  const f = fixture()
  const edited = { ...task, status: 'doing' as const, priority: 'high' as const }
  await stageTaskFields(f.outbox, room, secret, edited, ['status', 'priority'], actor, 11)
  const changes = (await decoded(f.outbox)).sort((left, right) => left.clock - right.clock)
  expect(changes).toHaveLength(2)
  expect(changes.map(change => change.field)).toEqual(['status', 'priority'])
  expect(changes.map(change => change.clock)).toEqual([11, 12])
  expect(changes.map(change => change.value)).toEqual(['doing', 'high'])
  expect(new Set(changes.map(change => change.id)).size).toBe(2)
})

it('TDD 884: an empty field selection never writes or sends anything', async () => {
  const f = fixture()
  expect(await stageTaskFields(f.outbox, room, secret, task, [], actor, 1)).toEqual([])
  expect(f.set).not.toHaveBeenCalled()
  expect(await f.outbox.pending(room)).toEqual([])
})

it('TDD 885: invalid author, clock or archived Task is rejected before any write', async () => {
  const f = fixture()
  await expect(stageTaskFields(f.outbox, room, secret, task, ['title'], '', 1)).rejects.toThrow()
  await expect(stageTaskFields(f.outbox, room, secret, task, ['title'], actor, 0)).rejects.toThrow()
  await expect(stageTaskFields(f.outbox, room, secret, task, ['title', 'status'], actor, Number.MAX_SAFE_INTEGER)).rejects.toThrow()
  await expect(stageTaskFields(f.outbox, room, secret, { ...task, archivedAt: '2026-11-02T00:00:00.000Z' }, ['title'], actor, 1)).rejects.toThrow()
  expect(f.set).not.toHaveBeenCalled()
})

it('TDD 886: duplicate or unsupported Task fields cannot partially stage changes', async () => {
  const f = fixture()
  await expect(stageTaskFields(f.outbox, room, secret, task, ['title', 'title'], actor, 1)).rejects.toThrow()
  await expect(stageTaskFields(f.outbox, room, secret, task, ['title', 'description' as 'title'], actor, 1)).rejects.toThrow()
  expect(f.set).not.toHaveBeenCalled()
  expect(await f.outbox.pending(room)).toEqual([])
})
