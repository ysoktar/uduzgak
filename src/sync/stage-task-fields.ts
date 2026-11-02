import type { Task } from '../domain/task'
import type { createDurableChangeOutbox } from '../persistence/durable-change-outbox'
import { prepareRoomChange } from '../persistence/room-change-envelope'
import type { RegisterChange } from './convergent-registers'

type Outbox = ReturnType<typeof createDurableChangeOutbox>
export type ShareableTaskField = 'title' | 'status' | 'priority'

const encoder = new TextEncoder()
const statuses = new Set(['todo', 'doing', 'done'])
const priorities = new Set(['low', 'normal', 'high'])
const allowedFields = new Set<ShareableTaskField>(['title', 'status', 'priority'])

/**
 * Explicitly stages selected Task scalars as locally stored ciphertext.
 * No server request or Workspace mutation occurs.
 */
export async function stageTaskFields(
  outbox: Outbox,
  room: string,
  secret: string,
  task: Task,
  fields: readonly ShareableTaskField[],
  actor: string,
  startingClock: number,
): Promise<string[]> {
  if (!Array.isArray(fields)) throw new Error('Invalid Task fields')
  if (fields.length === 0) return []

  if (typeof actor !== 'string' || !actor.trim() || actor !== actor.trim())
    throw new Error('Invalid register actor')
  if (!Number.isSafeInteger(startingClock) || startingClock < 1 ||
      startingClock > Number.MAX_SAFE_INTEGER - fields.length + 1)
    throw new Error('Invalid register clock')
  if (!task || typeof task.id !== 'string' || !task.id ||
      task.archivedAt !== undefined)
    throw new Error('Invalid shareable Task')

  const uniqueFields = new Set<ShareableTaskField>()
  const changes: RegisterChange[] = []
  for (const field of fields) {
    if (!allowedFields.has(field) || uniqueFields.has(field))
      throw new Error('Invalid or duplicated Task field')
    uniqueFields.add(field)
    const value = task[field]
    if (typeof value !== 'string' || (field === 'title' && !value.trim()) ||
        (field === 'status' && !statuses.has(value)) ||
        (field === 'priority' && !priorities.has(value)))
      throw new Error('Invalid shareable Task field value')
    const clock = startingClock + changes.length
    changes.push({
      id: actor + ':' + clock,
      actor,
      clock,
      entity: task.id,
      field,
      value,
    })
  }

  // Complete validation and encryption before making the first durable write.
  const packets = await Promise.all(changes.map(change =>
    prepareRoomChange(room, secret, encoder.encode(JSON.stringify(change))),
  ))
  for (const packet of packets) {
    await outbox.enqueue(room, packet.id, packet.ciphertext)
  }
  return packets.map(packet => packet.id)
}
