import type { ChangeOutboxBackend } from './durable-change-outbox'

const roomPattern = /^[a-f0-9]{64}$/
const idPattern = /^[a-f0-9]{32}$/
type EncryptedRecord = { id: string; ciphertext: Uint8Array }

function validate(room: string, id?: string): void {
  if (!roomPattern.test(room) || (id !== undefined && !idPattern.test(id)))
    throw new Error('Invalid change identity')
}
function copyCiphertext(input: unknown): number[] {
  if (!(input instanceof Uint8Array) || input.length < 29 || input.length > 65536 || input[0] !== 1)
    throw new Error('Invalid encrypted change')
  return Array.from(input)
}
function storedCiphertext(value: unknown): Uint8Array {
  if (!Array.isArray(value) || value.length < 29 || value.length > 65536 ||
    value[0] !== 1 || !value.every(x => Number.isInteger(x) && x >= 0 && x <= 255))
    throw new Error('Invalid encrypted change')
  return Uint8Array.from(value)
}
const entryKey = (room: string, id: string) => `encrypted-inbox:${room}:${id}`

/** Keeps remote ciphertext until a separate verified CRDT consumer acknowledges it. */
export function createEncryptedInbox(backend: ChangeOutboxBackend) {
  return {
    async receive(room: string, records: readonly EncryptedRecord[]): Promise<void> {
      validate(room)
      // Validate the whole batch and identify conflicting duplicate IDs before any writes.
      const checked = new Map<string, number[]>()
      for (const record of records) {
        validate(room, record.id)
        const encoded = copyCiphertext(record.ciphertext)
        const duplicate = checked.get(record.id)
        if (duplicate && (duplicate.length !== encoded.length ||
          duplicate.some((byte, index) => byte !== encoded[index])))
          throw new Error('Change ID conflict')
        checked.set(record.id, encoded)
      }
      // Check persisted identities before writing new records. This prevents
      // a later conflict from leaving earlier new packets in the inbox.
      const toWrite: Array<{ key: string; encoded: number[] }> = []
      for (const [id, encoded] of checked) {
        const key = entryKey(room, id)
        const previous = await backend.get(key)
        if (previous !== undefined) {
          const saved = storedCiphertext(previous)
          if (saved.length !== encoded.length ||
            saved.some((byte, index) => byte !== encoded[index]))
            throw new Error('Change ID conflict')
        } else {
          toWrite.push({ key, encoded })
        }
      }
      for (const { key, encoded } of toWrite) await backend.set(key, encoded)
    },
    async pending(room: string): Promise<EncryptedRecord[]> {
      validate(room)
      const prefix = `encrypted-inbox:${room}:`
      const keys = (await backend.keys()).filter(key =>
        key.startsWith(prefix) && idPattern.test(key.slice(prefix.length))).sort()
      const records: EncryptedRecord[] = []
      for (const key of keys) {
        const value = await backend.get(key)
        if (value !== undefined) records.push({
          id: key.slice(prefix.length), ciphertext: storedCiphertext(value),
        })
      }
      return records
    },
    async acknowledge(room: string, id: string): Promise<void> {
      validate(room, id)
      await backend.delete(entryKey(room, id))
    },
  }
}
