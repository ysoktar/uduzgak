import { createCouchDbHealthAdapter, createSelfHostedServer } from './self-hosted-api.mjs'

const token = process.env.UDUZGAK_SERVER_TOKEN
const dbUrl = process.env.COUCHDB_URL
const username = process.env.COUCHDB_USERNAME
const password = process.env.COUCHDB_PASSWORD
const host = process.env.UDUZGAK_SERVER_HOST || '127.0.0.1'
const port = Number(process.env.UDUZGAK_SERVER_PORT || '8788')
const allowedOrigins = (process.env.UDUZGAK_ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean)
if (!token || !dbUrl || !username || !password || !Number.isSafeInteger(port) || port < 1 || port > 65535) {
  throw new Error('Server token, CouchDB URL, database credentials and valid port are required')
}
const adapter = createCouchDbHealthAdapter({ url: dbUrl, username, password })
const server = createSelfHostedServer({ token, adapter, allowedOrigins })
server.listen(port, host, () => {
  process.stdout.write(`Uduzgak self-hosted API ready on ${host}:${port}\n`)
})
function stop() { server.close(() => process.exit(0)) }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
