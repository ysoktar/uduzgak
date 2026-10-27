import { useState } from 'react'

export interface StorageConnectionPanelProps {
  onCheck: (url: string, token: string) => Promise<{ storage: string }>
}

export function StorageConnectionPanel({ onCheck }: StorageConnectionPanelProps) {
  const [mode, setMode] = useState<'local' | 'server'>('local')
  const [url, setUrl] = useState('')
  const [token, setToken] = useState('')
  const [status, setStatus] = useState('')
  const [checking, setChecking] = useState(false)
  return (
    <section aria-label="Storage connection" className="storage-connection-panel">
      <h2>Storage</h2>
      <fieldset>
        <legend>Where to keep your workspace</legend>
        <label><input type="radio" name="storage-mode" checked={mode === 'local'}
          onChange={() => { setMode('local'); setToken(''); setStatus('') }} />This device only</label>
        <label><input type="radio" name="storage-mode" checked={mode === 'server'}
          onChange={() => { setMode('server'); setStatus('') }} />My server</label>
      </fieldset>
      {mode === 'server' ? (
        <div className="storage-connection-details">
          <p>Connection test only. Automatic synchronization is not enabled yet.</p>
          <label htmlFor="storage-server-url">Server URL</label>
          <input id="storage-server-url" type="url" value={url} placeholder="https://sync.example.org"
            onChange={event => setUrl(event.target.value)} />
          <label htmlFor="storage-access-token">Access token</label>
          <input id="storage-access-token" type="password" autoComplete="off" value={token}
            onChange={event => setToken(event.target.value)} />
          <button type="button" disabled={checking || !url.trim() || !token.trim()}
            onClick={() => {
              setChecking(true)
              setStatus('')
              void onCheck(url, token)
                .then(result => setStatus(`Connected to ${result.storage} API. Synchronization is not enabled.`))
                .catch(() => setStatus('Connection failed. Check server URL and access permissions.'))
                .finally(() => setChecking(false))
            }}>Test connection</button>
          {status ? <p role="status">{status}</p> : null}
        </div>
      ) : <p>Your data stays on this device. No server is required.</p>}
    </section>
  )
}
