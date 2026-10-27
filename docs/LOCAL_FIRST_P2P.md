# Local-first and peer-to-peer storage RFC

Status: proposed, not implemented.

## Product objective

Uduzgak should work without a mandatory account, central application database, or continuous network connection. The current browser data model is persisted in localStorage with existing workspace-app keys. Do not silently reset or overwrite those keys.

## Decisions

1. Keep the current version-1 Workspace data compatible. Add a versioned migration and tested rollback/export before changing durable storage.
2. Introduce an asynchronous IndexedDB persistence adapter, retaining the current synchronous storage abstraction until callers can be migrated safely.
3. Use a CRDT document layer such as Automerge to represent collaborative changes. Do not copy entire Workspace JSON snapshots between peers as last-writer-wins data.
4. Use authenticated peer identities and encrypted transport, with capability-based authorization for shared workspaces. WebRTC alone is not an application authorization scheme.
5. Treat discovery/signaling and TURN relay as optional infrastructure. P2P connections may fail on restricted networks, and no online peer implies no remote availability.
6. Maintain durable local change history, snapshots, export/import and a conflict recovery interface. Peer acknowledgements must not be equated with durable backups.
7. Never expose imported plaintext backup contents to unknown peers, trackers, or signaling services.
8. Keep multi-device merge logic separate from React components and view preferences.

## Minimum acceptance tests before enabling sync

- Existing storage version-1 workspaces and view preferences survive upgrade and rollback.
- Two offline peers can independently edit different tasks and converge after reconnecting.
- Two peers editing the same scalar field converge deterministically under documented conflict rules.
- Deletion versus concurrent edit is handled without accidental resurrection or silent loss.
- Duplicate, reordered and replayed changes are idempotent.
- Unauthorized peers cannot read workspace contents, write changes, or issue invitations.
- Peer loss, expired signaling, denied storage quota and interrupted migrations preserve recoverable local data.
- Import/export round trips preserve all supported entities including relationships, goals, documents and automation rules.

## Delivery stages

1. UI accessibility, global layout and data integrity checks.
2. IndexedDB adapter and explicit reversible storage migration.
3. CRDT model adapter with two-peer simulation tests.
4. Encrypted invite and identity flow.
5. WebRTC transport with offline recovery, optional signaling and relay.
6. Opt-in collaborative UI, conflict history and diagnostic status.

## Non-goals

No generic torrent seeding of private Workspace data. No requirement to run a central SQL database. No claim of guaranteed 24/7 access when all peer devices are offline. No forced rewrite of current local data.
