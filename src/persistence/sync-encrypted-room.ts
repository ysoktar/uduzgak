import type { createDurableChangeOutbox } from './durable-change-outbox'
import type { createEncryptedInbox } from './encrypted-inbox'
import { flushEncryptedOutbox } from './flush-encrypted-outbox'
import { pullEncryptedChanges } from './pull-encrypted-changes'
type Outbox = ReturnType<typeof createDurableChangeOutbox>
type Inbox = ReturnType<typeof createEncryptedInbox>
type Transport = {
  upload(room: string, id: string, ciphertext: Uint8Array): Promise<boolean>
  download(room: string): Promise<Array<{ id: string; ciphertext: Uint8Array }>>
}
/** Explicit, one-shot transport pass. No background jobs or CRDT application. */
export async function syncEncryptedRoom(
  services: { outbox: Outbox; inbox: Inbox; transport: Transport },
  room: string,
): Promise<{ uploaded: number; remaining: number; received: number; pending: number }> {
  const sent = await flushEncryptedOutbox(services.outbox, services.transport, room)
  const received = await pullEncryptedChanges(services.inbox, services.transport, room)
  return { ...sent, ...received }
}
