import type { Task } from '../domain/task'
import { createDurableChangeOutbox, type ChangeOutboxBackend } from '../persistence/durable-change-outbox'
import { stageTaskFields, type ShareableTaskField } from './stage-task-fields'

export interface ClockReservation {
  actor: string
  startingClock: number
}

export type ReserveTaskClocks = (room: string, count: number) => Promise<ClockReservation>

/** Explicitly reserve an identity range before encrypting selected fields locally. */
export async function stageSelectedTaskFields(
  backend: ChangeOutboxBackend,
  reserve: ReserveTaskClocks,
  settings: { room: string; secret: string },
  task: Task,
  fields: readonly ShareableTaskField[],
): Promise<string[]> {
  if (!Array.isArray(fields)) throw new Error('Invalid Task fields')
  if (fields.length === 0) return []
  const reservation = await reserve(settings.room, fields.length)
  return stageTaskFields(
    createDurableChangeOutbox(backend),
    settings.room,
    settings.secret,
    task,
    fields,
    reservation.actor,
    reservation.startingClock,
  )
}
