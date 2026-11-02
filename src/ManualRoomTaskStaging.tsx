import { useState } from 'react'
import type { Task } from './domain/task'
import type { ShareableTaskField } from './sync/stage-task-fields'
import { ManualTaskSharePanel } from './ManualTaskSharePanel'

export interface ManualRoomTaskStagingProps {
  tasks: readonly Task[]
  onStage: (
    settings: { room: string; secret: string },
    task: Task,
    fields: readonly ShareableTaskField[],
  ) => Promise<readonly string[]>
}

/** Session-only room credentials. No token, network request, or persistent secret. */
export function ManualRoomTaskStaging({ tasks, onStage }: ManualRoomTaskStagingProps) {
  const [room, setRoom] = useState('')
  const [secret, setSecret] = useState('')
  const valid = /^[a-f0-9]{64}$/.test(room) && /^[a-f0-9]{64}$/.test(secret)
  return (
    <section aria-label="Encrypted local Task staging">
      <h2>Local encrypted Task staging</h2>
      <label htmlFor="local-stage-room">Local staging room ID</label>
      <input id="local-stage-room" value={room} autoComplete="off"
        onChange={event => setRoom(event.target.value)} />
      <label htmlFor="local-stage-secret">Local staging encryption key</label>
      <input id="local-stage-secret" type="password" value={secret} autoComplete="off"
        onChange={event => setSecret(event.target.value)} />
      <ManualTaskSharePanel key={room + ':' + secret} tasks={valid ? tasks : []}
        onStage={(task, fields) => {
          if (!valid) return Promise.reject(new Error('Invalid encrypted room settings'))
          return onStage({ room, secret }, task, fields)
        }} />
    </section>
  )
}
