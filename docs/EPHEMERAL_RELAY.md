# Optional encrypted ephemeral relay

This is a small, opt-in HTTP mailbox for encrypted CRDT change packets. It is not a durable database or complete P2P collaboration implementation.

Start locally with Node 22 or newer:

```bash
npm run relay
```

Configure `RELAY_HOST` (default 127.0.0.1), `RELAY_PORT` (default 8787) and comma-separated `RELAY_ALLOWED_ORIGINS`. Exposing the relay publicly requires HTTPS termination, rate limiting, a network firewall, monitoring and additional abuse protections.

Each room uses a random 32-byte opaque locator. Each invitation carries a separate random 32-byte secret. The app encrypts opaque packets locally with AES-256-GCM using a new 12-byte nonce per packet. Never send the secret to the relay. Upload with `PUT /v1/rooms/:roomId/messages/:messageId` using `application/octet-stream`. Fetch pending ciphertext with `GET /v1/rooms/:roomId/messages`. Payloads are base64url-encoded in the JSON response.

Default limits: one hour TTL, 64 KiB per packet, 2 MiB and 128 packets per room, and 32 MiB total across all rooms. Writes have no TTL refresh, and expired records are removed on reads/writes and by a periodic sweep. All state disappears on process restart. Configured reader and writer tokens authorize access by room. Do not deploy publicly until network protections and anti-abuse controls are completed. Encryption protects contents, not room existence, packet size or traffic timing.

Offline senders can leave encrypted changes temporarily, but recipients must poll before expiry. The device's durable local CRDT history remains authoritative. This relay offers no guaranteed delivery, no security against flooding or deletion through server restart, and no key exchange or conflict resolution. It has no relationship with the current version-1 browser localStorage keys.

See [LOCAL_FIRST_P2P.md](LOCAL_FIRST_P2P.md) for the staged production design.

## Authenticated opt-in relay

The runnable relay now requires `UDUZGAK_ROOM_CAPABILITIES_JSON`, the same
room-grant JSON used by the self-hosted API. A reader capability permits
downloading ciphertext for one room. A writer permits downloading and
uploading ciphertext for that room. Unauthenticated and cross-room requests
are rejected. Local development unit tests can instantiate a temporary
HTTP server without capabilities to verify basic transport behavior, but
`npm run relay` refuses to start without explicit room grants.

This does not make the service ready for untrusted public traffic. Add
per-identity rate limits, replay defenses, audit logging, reverse proxy TLS,
and abuse response before production deployment. The relay's state remains
memory-only and expires after the configured retention period.
