import type { createDurableChangeOutbox } from '../persistence/durable-change-outbox'

type Outbox = ReturnType<typeof createDurableChangeOutbox>

/** Read-only local queue summary. No payload or room key is exposed. */
export async function inspectEncryptedRoomOutbox(
  outbox: Outbox,
  room: string,
): Promise<{ pending: number }> {
  return { pending: (await outbox.pending(room)).length }
}
