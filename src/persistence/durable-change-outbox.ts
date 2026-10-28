export interface ChangeOutboxBackend {
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
  keys(): Promise<string[]>
}
const roomPattern = /^[a-f0-9]{64}$/
const idPattern = /^[a-f0-9]{32}$/
function validate(room: string, id?: string): void {
  if (!roomPattern.test(room) || (id !== undefined && !idPattern.test(id)))
    throw new Error('Invalid change identity')
}
function key(room: string, id: string): string { return `encrypted-change:${room}:${id}` }
function bytes(value: unknown): Uint8Array {
  if (!Array.isArray(value) || value.length < 29 || value.length > 65536 ||
    !value.every(x => Number.isInteger(x) && x >= 0 && x <= 255) || value[0] !== 1)
    throw new Error('Invalid encrypted change')
  return Uint8Array.from(value)
}
/** Explicitly opt-in ciphertext queue; no Workspace migration or plaintext is stored. */
export function createDurableChangeOutbox(backend: ChangeOutboxBackend) {
  return {
    async enqueue(room: string, id: string, ciphertext: Uint8Array): Promise<void> {
      validate(room, id)
      const copy = bytes([...ciphertext])
      const identifier = key(room,id)
      const previous = await backend.get(identifier)
      if (previous !== undefined) {
        const existing = bytes(previous)
        if (existing.length !== copy.length || existing.some((x,i) => x !== copy[i]))
          throw new Error('Change ID conflict')
        return
      }
      await backend.set(identifier, [...copy])
    },
    async pending(room: string): Promise<Array<{ id: string; ciphertext: Uint8Array }>> {
      validate(room)
      const prefix = `encrypted-change:${room}:`
      const ids = (await backend.keys()).filter(k => k.startsWith(prefix) && idPattern.test(k.slice(prefix.length))).sort()
      const result: Array<{ id: string; ciphertext: Uint8Array }> = []
      for (const identifier of ids) {
        const value = await backend.get(identifier)
        if (value !== undefined) result.push({ id: identifier.slice(prefix.length), ciphertext: bytes(value) })
      }
      return result
    },
    async acknowledge(room: string, id: string): Promise<void> {
      validate(room,id)
      await backend.delete(key(room,id))
    },
  }
}
