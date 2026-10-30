import type { createDurableChangeOutbox, ChangeOutboxBackend } from '../persistence/durable-change-outbox'
import type { createEncryptedInbox } from '../persistence/encrypted-inbox'
import { prepareRoomChange } from '../persistence/room-change-envelope'
import { syncEncryptedRoom } from '../persistence/sync-encrypted-room'
import { mergeRegisterChanges, type RegisterChange } from './convergent-registers'
import { consumeRegisterInbox } from './consume-register-inbox'

type Outbox = ReturnType<typeof createDurableChangeOutbox>
type Inbox = ReturnType<typeof createEncryptedInbox>
type Transport = {
  upload(room: string, id: string, ciphertext: Uint8Array): Promise<boolean>
  download(room: string): Promise<Array<{ id: string; ciphertext: Uint8Array }>>
}
const encoder = new TextEncoder()

/** Queue an opaque scalar operation. The persisted packet is encrypted before storage. */
export async function enqueueLocalRegisterChange(
  outbox: Outbox, room: string, secret: string, change: RegisterChange,
): Promise<string> {
  const checked = mergeRegisterChanges([change], [])[0]
  const packet = await prepareRoomChange(room, secret, encoder.encode(JSON.stringify(checked)))
  await outbox.enqueue(room, packet.id, packet.ciphertext)
  return packet.id
}

/** Explicit two-way exchange, then verified scalar persistence. No Workspace mutation. */
export async function exchangeRegisterRoom(
  services: { outbox: Outbox; inbox: Inbox; backend: ChangeOutboxBackend },
  transport: Transport, room: string, secret: string,
): Promise<{ uploaded: number; remaining: number; received: number; pending: number; applied: number }> {
  const transferred = await syncEncryptedRoom({ outbox: services.outbox, inbox: services.inbox, transport }, room)
  const consumed = await consumeRegisterInbox(services.inbox, services.backend, room, secret)
  return { ...transferred, applied: consumed.applied, pending: consumed.pending }
}
