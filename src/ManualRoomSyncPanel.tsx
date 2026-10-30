import { useState } from 'react'
import type { PreviewedTaskChange } from './sync/task-change-preview'
export interface ManualRoomPreviewSettings {
  serverUrl: string
  room: string
  secret: string
  token: string
}
export interface ManualRoomSyncPanelProps {
  onPreview: (settings: ManualRoomPreviewSettings) => Promise<PreviewedTaskChange[]>
}
/** No automatic network traffic or persisted credentials. This is a read-only preview. */
export function ManualRoomSyncPanel({ onPreview }: ManualRoomSyncPanelProps) {
  const [serverUrl,setServerUrl]=useState('')
  const [room,setRoom]=useState('')
  const [secret,setSecret]=useState('')
  const [token,setToken]=useState('')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [changes,setChanges]=useState<PreviewedTaskChange[] | null>(null)
  const canPreview = !!serverUrl.trim() && /^[a-f0-9]{64}$/.test(room) &&
    /^[a-f0-9]{64}$/.test(secret) && !!token.trim()
  return (
    <section aria-label="Encrypted room preview" className="manual-room-sync-panel">
      <h2>Encrypted room preview</h2>
      <p>Manual, preview only. No changes are applied to your Workspace.</p>
      <form onSubmit={event => {
        event.preventDefault()
        if (!canPreview || busy) return
        setBusy(true)
        setError('')
        setChanges(null)
        void onPreview({serverUrl,room,secret,token})
          .then(setChanges)
          .catch(() => setError('Could not retrieve or verify encrypted room changes.'))
          .finally(() => setBusy(false))
      }}>
        <label htmlFor="manual-sync-url">Server URL</label>
        <input id="manual-sync-url" type="url" value={serverUrl}
          onChange={event => setServerUrl(event.target.value)} placeholder="https://sync.example.org" />
        <label htmlFor="manual-sync-room">Room ID</label>
        <input id="manual-sync-room" value={room} autoComplete="off"
          onChange={event => setRoom(event.target.value)} />
        <label htmlFor="manual-sync-secret">Room encryption key</label>
        <input id="manual-sync-secret" type="password" value={secret} autoComplete="off"
          onChange={event => setSecret(event.target.value)} />
        <label htmlFor="manual-sync-token">Room access token</label>
        <input id="manual-sync-token" type="password" value={token} autoComplete="off"
          onChange={event => setToken(event.target.value)} />
        <button type="submit" disabled={!canPreview || busy}>Preview encrypted changes</button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
      {changes ? (
        <div role="region" aria-label="Proposed remote Task changes">
          {changes.length===0 ? <p>No supported remote Task changes.</p> : (
            <ul>{changes.map(change=><li key={`${change.taskId}:${change.field}`}>
              {change.taskId}, {change.field}: {change.before} → {change.after}
            </li>)}</ul>
          )}
        </div>
      ) : null}
    </section>
  )
}
