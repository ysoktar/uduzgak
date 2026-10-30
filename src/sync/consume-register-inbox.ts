import type { ChangeOutboxBackend } from '../persistence/durable-change-outbox'
import type { createEncryptedInbox } from '../persistence/encrypted-inbox'
import { openRoomChange } from '../persistence/room-change-envelope'
import { mergeRegisterChanges, type RegisterChange } from './convergent-registers'

type Inbox = ReturnType<typeof createEncryptedInbox>
const decoder = new TextDecoder('utf-8', { fatal: true })
/** Only acknowledges ciphertext after a verified change is durably stored. */
export async function consumeRegisterInbox(
  inbox: Inbox, backend: ChangeOutboxBackend, room: string, secret: string,
): Promise<{ applied: number; pending: number }> {
  const pending = await inbox.pending(room)
  let applied = 0
  for (const packet of pending) {
    const contents = await openRoomChange(room, packet.id, secret, packet.ciphertext)
    let candidate: unknown
    try { candidate = JSON.parse(decoder.decode(contents)) }
    catch { throw new Error('Invalid register payload') }
    let checked: RegisterChange
    try { checked = mergeRegisterChanges([candidate as RegisterChange], [])[0] }
    catch { throw new Error('Invalid register payload') }
    const key = `register-change:${room}:${checked.id}`
    const previous = await backend.get(key)
    if (previous !== undefined) {
      mergeRegisterChanges([previous as RegisterChange], [checked])
    } else {
      await backend.set(key, checked)
      applied++
    }
    await inbox.acknowledge(room, packet.id)
  }
  return { applied, pending: (await inbox.pending(room)).length }
}
