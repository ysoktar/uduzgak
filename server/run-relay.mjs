import { createEphemeralMailboxStore, createRelayHttpServer } from './ephemeral-relay.mjs'

const host = process.env.RELAY_HOST || '127.0.0.1'
const port = Number(process.env.RELAY_PORT || '8787')
const origins = (process.env.RELAY_ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean)
if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error('Invalid relay port')
const store = createEphemeralMailboxStore()
const server = createRelayHttpServer({ store, allowedOrigins: origins })
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
