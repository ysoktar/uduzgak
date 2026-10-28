import { createRoomCapabilityAuthorizer } from './room-capabilities.mjs'
import { createEphemeralMailboxStore, createRelayHttpServer } from './ephemeral-relay.mjs'

const host = process.env.RELAY_HOST || '127.0.0.1'
const port = Number(process.env.RELAY_PORT || '8787')
const origins = (process.env.RELAY_ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean)
if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error('Invalid relay port')
const store = createEphemeralMailboxStore()
const rawGrants = process.env.UDUZGAK_ROOM_CAPABILITIES_JSON
if (!rawGrants) throw new Error('UDUZGAK_ROOM_CAPABILITIES_JSON is required for relay access')
const roomAuthorizer = createRoomCapabilityAuthorizer(JSON.parse(rawGrants))
const server = createRelayHttpServer({ store, allowedOrigins: origins, roomAuthorizer })
const sweep = setInterval(() => store.purge(), 60_000)
sweep.unref()
server.listen(port, host, () => {
  process.stdout.write(`Encrypted ephemeral relay listening on ${host}:${port}\n`)
})
function close() {
  clearInterval(sweep)
  server.close(() => process.exit(0))
}
process.on('SIGINT', close)
process.on('SIGTERM', close)
