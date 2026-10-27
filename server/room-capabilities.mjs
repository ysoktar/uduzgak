import { timingSafeEqual } from 'node:crypto'
const roomIdPattern = /^[a-f0-9]{64}$/
function equal(a, b) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}
export function createRoomCapabilityAuthorizer(rooms) {
  const tokens = new Map()
  for (const [room, permissions] of Object.entries(rooms)) {
    if (!roomIdPattern.test(room) || !Array.isArray(permissions.readers) || !Array.isArray(permissions.writers))
      throw new Error('Invalid room capability configuration')
    for (const [role, values] of [['reader', permissions.readers], ['writer', permissions.writers]]) {
      for (const token of values) {
        if (typeof token !== 'string' || token.length < 6 || token.includes(' ')) throw new Error('Invalid room capability')
        if (tokens.has(token) && tokens.get(token).room !== room) throw new Error('Room capability reused across rooms')
        tokens.set(token, { room, role })
      }
    }
  }
  function check(room, header, write) {
    if (!roomIdPattern.test(room) || typeof header !== 'string' || !header.startsWith('Bearer ')) return false
    const candidate = header.slice(7)
    let allowed = false
    for (const [token, grant] of tokens) {
      if (equal(candidate, token) && grant.room === room && (!write || grant.role === 'writer')) allowed = true
    }
    return allowed
  }
  return { canRead: (room, header) => check(room, header, false), canWrite: (room, header) => check(room, header, true) }
}
