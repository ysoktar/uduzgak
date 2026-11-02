import type { createDurableChangeOutbox } from './durable-change-outbox'
type Outbox = ReturnType<typeof createDurableChangeOutbox>
type Uploader = { upload(room: string, id: string, ciphertext: Uint8Array): Promise<boolean> }

/** A confirmed remote write, including idempotent retry, is acknowledged locally. */
export async function flushEncryptedOutbox(
  outbox: Outbox, client: Uploader, room: string,
): Promise<{ uploaded: number; remaining: number }> {
  const pending = await outbox.pending(room)
  let uploaded = 0
  for (const item of pending) {
    const receipt = await client.upload(room, item.id, item.ciphertext)
    if (typeof receipt !== 'boolean') {
      throw new Error('Invalid upload acknowledgement')
    }
    await outbox.acknowledge(room, item.id)
    uploaded++
  }
  return { uploaded, remaining: (await outbox.pending(room)).length }
}
