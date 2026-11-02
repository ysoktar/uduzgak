import { useEffect, useRef, useState } from 'react'

export interface EncryptedOutboxStatusPanelProps {
  room: string
  onInspect: (room: string) => Promise<{ pending: number }>
}

/** Explicit read-only inspection. Never reads or displays encrypted payloads. */
export function EncryptedOutboxStatusPanel({ room, onInspect }: EncryptedOutboxStatusPanelProps) {
  const [result, setResult] = useState<{ room: string; pending: number } | null>(null)
  const [error, setError] = useState<{ room: string } | null>(null)
  const [inFlight, setInFlight] = useState<{ room: string } | null>(null)
  const generation = useRef(0)
  const valid = /^[a-f0-9]{64}$/.test(room)
  useEffect(() => {
    generation.current += 1
  }, [room])
  const busy = inFlight?.room === room
  return (
    <section aria-label="Local encrypted queue status">
      <button type="button" disabled={!valid || busy} onClick={() => {
        if (!valid || busy) return
        const request = ++generation.current
        setResult(null)
        setError(null)
        setInFlight({ room })
        void onInspect(room)
          .then(status => {
            if (request !== generation.current) return
            if (!Number.isSafeInteger(status.pending) || status.pending < 0)
              throw new Error('Invalid queue status')
            setResult({ room, pending: status.pending })
          })
          .catch(() => {
            if (request === generation.current) setError({ room })
          })
          .finally(() => {
            if (request === generation.current) setInFlight(null)
          })
      }}>Check local encrypted queue</button>
      {error?.room === room ? <p role="alert">Could not inspect local encrypted queue.</p> : null}
      {result?.room === room ? <p role="status">{result.pending} encrypted changes pending locally.</p> : null}
    </section>
  )
}
