export interface LocalReplicaChange {
  version: 1
  workspaceId: string
  changeId: string
  payload: string
}

export interface LocalReplicaTransport {
  postMessage(data: unknown): void
  addEventListener(type: 'message', listener: (event: { data: unknown }) => void): void
  removeEventListener(type: 'message', listener: (event: { data: unknown }) => void): void
  close(): void
}

function isChange(value: unknown): value is LocalReplicaChange {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return record.version === 1
    && typeof record.workspaceId === 'string' && record.workspaceId.length > 0
    && typeof record.changeId === 'string' && record.changeId.length > 0
    && typeof record.payload === 'string'
}

/** Local tab transport only; not authenticated cross-device networking. */
export class LocalReplicaBus {
  private readonly seen = new Set<string>()
  private readonly listeners = new Set<(change: LocalReplicaChange) => void>()
  private readonly receive = (event: { data: unknown }) => {
    if (!isChange(event.data) || event.data.workspaceId !== this.workspaceId) return
    if (this.seen.has(event.data.changeId)) return
    this.seen.add(event.data.changeId)
    for (const listener of this.listeners) listener(event.data)
  }

  constructor(
    private readonly workspaceId: string,
    private readonly transport: LocalReplicaTransport,
  ) {
    this.transport.addEventListener('message', this.receive)
  }

  publish(changeId: string, payload: string): void {
    if (!changeId.trim()) throw new Error('Change ID is required')
    const change: LocalReplicaChange = {
      version: 1, workspaceId: this.workspaceId, changeId, payload,
    }
    this.seen.add(changeId)
    this.transport.postMessage(change)
  }

  subscribe(listener: (change: LocalReplicaChange) => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  close(): void {
    this.transport.removeEventListener('message', this.receive)
    this.listeners.clear()
    this.transport.close()
  }
}
