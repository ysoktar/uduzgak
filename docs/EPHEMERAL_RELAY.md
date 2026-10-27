# Optional encrypted ephemeral relay

This is a small, opt-in HTTP mailbox for encrypted CRDT change packets. It is not a durable database or complete P2P collaboration implementation.

Start locally with Node 22 or newer:

```bash
npm run relay
```

Configure `RELAY_HOST` (default 127.0.0.1), `RELAY_PORT` (default 8787) and comma-separated `RELAY_ALLOWED_ORIGINS`. Exposing the relay publicly requires HTTPS termination, rate limiting, a network firewall, monitoring and additional abuse protections.

Each room uses a random 32-byte opaque locator. Each invitation carries a separate random 32-byte secret. The app encrypts opaque packets locally with AES-256-GCM using a new 12-byte nonce per packet. Never send the secret to the relay. Upload with `PUT /v1/rooms/:roomId/messages/:messageId` using `application/octet-stream`. Fetch pending ciphertext with `GET /v1/rooms/:roomId/messages`. Payloads are base64url-encoded in the JSON response.

Default limits: one hour TTL, 64 KiB per packet, 2 MiB and 128 packets per room, and 32 MiB total across all rooms. Writes have no TTL refresh, and expired records are removed on reads/writes and by a periodic sweep. All state disappears on process restart. Room identifiers alone are currently bearer read/write capabilities, so **do not deploy publicly with private data until authenticated write authorization, anti-spam quotas and operational hardening are added**. Encryption protects contents, not room existence, packet size or traffic timing.

Offline senders can leave encrypted changes temporarily, but recipients must poll before expiry. The device's durable local CRDT history remains authoritative. This relay offers no guaranteed delivery, no security against flooding or deletion through server restart, and no key exchange or conflict resolution. It has no relationship with the current version-1 browser localStorage keys.

See [LOCAL_FIRST_P2P.md](LOCAL_FIRST_P2P.md) for the staged production design.
