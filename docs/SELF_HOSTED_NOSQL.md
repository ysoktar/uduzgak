# Self-hosted NoSQL connection option

Uduzgak remains local-first. The new Storage panel has two modes:

* **This device only**: the existing browser workspace, with no server dependency.
* **My server**: a connection test for a user-managed Uduzgak API on a local machine, home server, VPS, or rented host.

## Connection contract

The browser requests `GET /v1/session` with `Authorization: Bearer <access token>`. Successful servers return JSON:

```json
{"protocol":"uduzgak-sync-v1","storage":"couchdb"}
```

The Node-based CouchDB connection API is available using `npm run server:self-hosted`. Configure `UDUZGAK_SERVER_TOKEN`, `COUCHDB_URL`, `COUCHDB_USERNAME`, `COUCHDB_PASSWORD`, `UDUZGAK_SERVER_HOST`, `UDUZGAK_SERVER_PORT` and comma-separated `UDUZGAK_ALLOWED_ORIGINS` in your environment. The default API bind address is `127.0.0.1:8788`. CouchDB credentials remain on the server. For any non-loopback CouchDB endpoint the adapter requires HTTPS. The API itself must be deployed behind HTTPS for remote browser access.

This is a **handshake only**. It does not yet upload data, migrate storage, or enable collaboration. Tokens live only in the component's memory, are cleared when the user selects local mode, and are not placed in URLs, localStorage, or backups.

Public hostnames require HTTPS. Plain HTTP is accepted only for localhost, 127.0.0.1, or IPv6 loopback during local development. Redirects are rejected to avoid forwarding authorization tokens. Server operators must configure CORS and TLS when hosting the API remotely.

## NoSQL first

A self-hosted Uduzgak API should provide a database-independent contract with a **NoSQL adapter behind it**. CouchDB is a good first backend because its HTTP API and replication-oriented model fit offline collaboration. MongoDB and other document databases can be supported by additional server adapters, but cannot be assumed compatible automatically.

Never put database credentials in the browser. Clients communicate with the authenticated Uduzgak API, which owns access to CouchDB, MongoDB, or another configured data store. This is an alternative to the optional memory relay, not a requirement for local-only usage.

## Before enabling synchronization

Add authenticated per-workspace access, encryption and secret rotation, an append-only durable change log or CRDT document storage, conflict handling and two-device convergence tests. Implement the server API and database adapter, and only then provide a persisted connection profile and opt-in sync toggle.

The temporary encrypted relay remains separate and non-durable. See `EPHEMERAL_RELAY.md` and `LOCAL_FIRST_P2P.md`.

## Durable encrypted change prototype (TDD 752-761)

With the server running, authenticated clients can submit opaque, client-encrypted
change envelopes to `PUT /v1/rooms/:roomId/changes/:changeId` and retrieve
them using `GET /v1/rooms/:roomId/changes`. Both requests use the same
server-issued Bearer credential as `/v1/session`. The server stores only
opaque ciphertext in a CouchDB database named by
`COUCHDB_CHANGES_DATABASE` (default `uduzgak-changes`). Create that database
and restrict its service-account permissions before starting the API.

Changes are immutable and are keyed by room and change identifier.
Uploads have a 64 KiB maximum; identical IDs and ciphertext are idempotent,
while an ID reused with different contents is rejected. The CouchDB adapter
must be configured on the server and database credentials are never returned.

This is **not yet a complete sync engine**. A single server bearer token
currently grants access to all rooms on that server. Per-workspace roles,
revocation, conflict merging, rate limits, database retention policies,
and snapshot compaction must be implemented before public deployment.
The browser remains local-first; this does not activate automatic uploads.

## Room-scoped API permissions (TDD 762-771)

The self-hosted launcher now requires `UDUZGAK_ROOM_CAPABILITIES_JSON`, a JSON object keyed by 64-character hex room IDs. Each room defines separate `readers` and `writers` arrays of bearer tokens. A writer can read and upload; a reader can read but cannot upload. A token reused across different rooms is rejected during configuration. The server-wide token is still for the `/v1/session` handshake and cannot access change routes when room capabilities are configured.

Example structure, with placeholder values only:

```json
{
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": {
    "readers": ["random-reader-secret"],
    "writers": ["random-writer-secret"]
  }
}
```

Use cryptographically random secrets and transfer them through a secure invitation channel. Do not commit secrets to Git. Public deployment additionally requires rate limiting, token rotation and revocation, auditing, HTTPS, and capacity controls. The adapter does not yet synchronize or merge CRDT changes, and local-only storage remains unchanged.

## Generating room credentials

Run `npm run server:generate-room` on a trusted device to create a cryptographically random 256-bit room ID, read token and write token. Insert the generated `serverConfig` entry into `UDUZGAK_ROOM_CAPABILITIES_JSON`. Share tokens through a trusted channel. Do not commit or publicly log them. Reader tokens cannot upload; writer tokens can upload and read. Revocation and secure invitations are not yet implemented.
