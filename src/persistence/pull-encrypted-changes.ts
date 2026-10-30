import type { createEncryptedInbox } from './encrypted-inbox'

type Inbox = ReturnType<typeof createEncryptedInbox>
type Downloader = {
  download(room: string): Promise<Array<{ id: string; ciphertext: Uint8Array }>>
}

/** Persist received ciphertext without acknowledging its CRDT application. */
export async function pullEncryptedChanges(
  inbox: Inbox, client: Downloader, room: string,
): Promise<{ received: number; pending: number }> {
  const known = new Set((await inbox.pending(room)).map(item => item.id))
  const changes = await client.download(room)
  await inbox.receive(room, changes)
  return {
    received: new Set(changes.filter(change => !known.has(change.id)).map(change => change.id)).size,
    pending: (await inbox.pending(room)).length,
  }
}
