import { normalizeSelfHostedUrl } from './self-hosted-connection'

const roomPattern = /^[a-f0-9]{64}$/
const changePattern = /^[a-f0-9]{32}$/
const maxBytes = 65536

function validate(room: string, id?: string) {
  if (!roomPattern.test(room) || (id !== undefined && !changePattern.test(id)))
    throw new Error('Invalid change identity')
}

function decodeCiphertext(value: unknown): Uint8Array {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value) || value.length > 87384)
    throw new Error('Invalid encrypted change')
  try {
    const encoded = value.replaceAll('-', '+').replaceAll('_', '/')
    const binary = atob(encoded)
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    if (bytes.length < 29 || bytes.length > maxBytes || bytes[0] !== 1)
      throw new Error('Invalid encrypted change')
    return bytes
  } catch {
    throw new Error('Invalid encrypted change')
  }
}

/** Transport only. The caller must encrypt and merge CRDT changes separately. */
export function createEncryptedChangeClient(
  serverUrl: string, roomToken: string, fetchImpl: typeof fetch = fetch,
) {
  const origin = normalizeSelfHostedUrl(serverUrl)
  if (!roomToken.trim()) throw new Error('Room access token is required')
  const headers = { Authorization: `Bearer ${roomToken}` }
  return {
    async upload(room: string, id: string, sealed: Uint8Array): Promise<boolean> {
      validate(room, id)
      if (!(sealed instanceof Uint8Array) || sealed.length < 29 || sealed.length > maxBytes || sealed[0] !== 1)
        throw new Error('Invalid encrypted change')
      const response = await fetchImpl(`${origin}/v1/rooms/${room}/changes/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/octet-stream' },
        body: new Uint8Array(sealed) as BodyInit,
        redirect: 'error',
        cache: 'no-store',
      })
      if (response.status === 401 || response.status === 403) throw new Error('Room permission denied')
      if (response.status === 409) throw new Error('Change ID conflict')
      if (!response.ok) throw new Error('Encrypted change upload failed')
      return response.status === 201
    },
    async download(room: string): Promise<Array<{ id: string; ciphertext: Uint8Array }>> {
      validate(room)
      const response = await fetchImpl(`${origin}/v1/rooms/${room}/changes`, {
        method: 'GET', headers, redirect: 'error', cache: 'no-store',
      })
      if (response.status === 401 || response.status === 403) throw new Error('Room permission denied')
      if (!response.ok) throw new Error('Encrypted change download failed')
      const body: unknown = await response.json()
      if (!body || typeof body !== 'object' || !('changes' in body) || !Array.isArray(body.changes))
        throw new Error('Invalid change response')
      return body.changes.map((item: unknown) => {
        if (!item || typeof item !== 'object' || !('id' in item) || !('ciphertext' in item) ||
          typeof item.id !== 'string' || !changePattern.test(item.id)) throw new Error('Invalid change response')
        return { id: item.id, ciphertext: decodeCiphertext(item.ciphertext) }
      })
    },
  }
}
