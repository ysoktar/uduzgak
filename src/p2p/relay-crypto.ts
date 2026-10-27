function hex(bytes: Uint8Array): string {
  return [...bytes].map(value => value.toString(16).padStart(2, '0')).join('')
}
function fromHex(value: string): Uint8Array {
  if (!/^[a-f0-9]{64}$/.test(value)) throw new Error('Invalid relay secret')
  return Uint8Array.from(value.match(/../g)!.map(part => Number.parseInt(part, 16)))
}
export function createRelayInvitation(): { roomId: string; secret: string } {
  const random = new Uint8Array(64)
  crypto.getRandomValues(random)
  return { roomId: hex(random.slice(0, 32)), secret: hex(random.slice(32)) }
}
async function aesKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', fromHex(secret) as BufferSource, 'AES-GCM', false, ['encrypt', 'decrypt'])
}
export async function sealRelayChange(secret: string, plaintext: Uint8Array): Promise<Uint8Array> {
  const key = await aesKey(secret)
  const nonce = crypto.getRandomValues(new Uint8Array(12))
  const cipher = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce }, key, plaintext as BufferSource,
  ))
  return Uint8Array.from([1, ...nonce, ...cipher])
}
export async function openRelayChange(secret: string, sealed: Uint8Array): Promise<Uint8Array> {
  const key = await aesKey(secret)
  if (sealed.length < 29 || sealed[0] !== 1) throw new Error('Invalid sealed relay change')
  try {
    return new Uint8Array(await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: sealed.slice(1, 13) as BufferSource },
      key,
      sealed.slice(13) as BufferSource,
    ))
  } catch {
    throw new Error('Invalid sealed relay change')
  }
}
