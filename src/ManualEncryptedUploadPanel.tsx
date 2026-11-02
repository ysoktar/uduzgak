import { useState } from 'react'

export interface ManualEncryptedUploadSettings {
  serverUrl: string
  room: string
  token: string
}
export interface ManualEncryptedUploadPanelProps {
  onUpload: (settings: ManualEncryptedUploadSettings) => Promise<{ uploaded: number; remaining: number }>
}
export function ManualEncryptedUploadPanel({ onUpload }: ManualEncryptedUploadPanelProps) {
  const [serverUrl, setServerUrl] = useState('')
  const [room, setRoom] = useState('')
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ uploaded: number; remaining: number } | null>(null)
  const [error, setError] = useState(false)
  const valid = serverUrl.startsWith('https://') && serverUrl.length > 8 &&
    /^[a-f0-9]{64}$/.test(room) && !!token.trim()
  return (
    <section aria-label="Manual encrypted queue upload">
      <h2>Upload encrypted changes</h2>
      <p>Only an explicit click uploads pending encrypted ciphertext. No automatic synchronization is enabled.</p>
      <form onSubmit={event => {
        event.preventDefault()
        if (!valid || busy) return
        setBusy(true)
        setResult(null)
        setError(false)
        void onUpload({ serverUrl, room, token })
          .then(next => setResult(next))
          .catch(() => setError(true))
          .finally(() => setBusy(false))
      }}>
        <label htmlFor="upload-url">Upload server URL</label>
        <input id="upload-url" type="url" value={serverUrl}
          onChange={event => { setServerUrl(event.target.value); setResult(null) }} />
        <label htmlFor="upload-room">Upload room ID</label>
        <input id="upload-room" value={room} autoComplete="off"
          onChange={event => { setRoom(event.target.value); setResult(null) }} />
        <label htmlFor="upload-token">Upload room access token</label>
        <input id="upload-token" type="password" value={token} autoComplete="off"
          onChange={event => { setToken(event.target.value); setResult(null) }} />
        <button type="submit" disabled={!valid || busy}>Upload pending encrypted changes</button>
      </form>
      {error ? <p role="alert">Could not upload encrypted changes.</p> : null}
      {result ? <p role="status">{result.uploaded} encrypted changes uploaded; {result.remaining} remaining locally.</p> : null}
    </section>
  )
}
