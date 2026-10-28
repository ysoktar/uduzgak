import { openRelayChange, sealRelayChange } from '../p2p/relay-crypto'

const roomPattern = /^[a-f0-9]{64}$/
const idPattern = /^[a-f0-9]{32}$/
const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })
function validate(room: string, id?: string) {
  if (!roomPattern.test(room) || (id !== undefined && !idPattern.test(id)))
    throw new Error('Invalid change identity')
}
function asHex(bytes: Uint8Array): string {
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
}
/** The room and change ID are authenticated inside the encrypted envelope. */
export async function prepareRoomChange(
  room: string, secret: string, payload: Uint8Array,
): Promise<{ id: string; ciphertext: Uint8Array }> {
  validate(room)
  if (!(payload instanceof Uint8Array) || payload.byteLength === 0 || payload.byteLength > 48000)
    throw new Error('Invalid change payload')
  const nonce = crypto.getRandomValues(new Uint8Array(16))
  const id = asHex(nonce)
  const document = { room, id, payload: [...payload] }
  return { id, ciphertext: await sealRelayChange(secret, encoder.encode(JSON.stringify(document))) }
}
export async function openRoomChange(
  room: string, id: string, secret: string, ciphertext: Uint8Array,
): Promise<Uint8Array> {
  validate(room, id)
  const plaintext = await openRelayChange(secret, ciphertext)
  let value: unknown
  try { value = JSON.parse(decoder.decode(plaintext)) } catch { throw new Error('Invalid encrypted change payload') }
  if (!value || typeof value !== 'object' || !('room' in value) || !('id' in value) || !('payload' in value))
    throw new Error('Invalid encrypted change payload')
  if (value.room !== room) throw new Error('Encrypted change room mismatch')
  if (value.id !== id) throw new Error('Encrypted change ID mismatch')
  if (!Array.isArray(value.payload) || !value.payload.length || value.payload.length > 48000 ||
    !value.payload.every(byte => Number.isInteger(byte) && byte >= 0 && byte <= 255))
    throw new Error('Invalid encrypted change payload')
  return Uint8Array.from(value.payload)
}
