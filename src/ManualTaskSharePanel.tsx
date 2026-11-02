import { useState } from 'react'
import type { Task } from './domain/task'
import type { ShareableTaskField } from './sync/stage-task-fields'

export interface ManualTaskSharePanelProps {
  tasks: readonly Task[]
  onStage: (task: Task, fields: readonly ShareableTaskField[]) => Promise<readonly string[]>
}

/** Explicit local-only staging. No automatic upload, credential storage or Workspace edits. */
export function ManualTaskSharePanel({ tasks, onStage }: ManualTaskSharePanelProps) {
  const [taskId, setTaskId] = useState('')
  const [selected, setSelected] = useState<ShareableTaskField[]>(['title'])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [count, setCount] = useState<number | null>(null)
  const task = tasks.find(item => item.id === taskId && item.archivedAt === undefined)
  const fields: readonly ShareableTaskField[] = ['title', 'status', 'priority']
  const canStage = !!task && selected.length > 0 && !busy
  function toggle(field: ShareableTaskField, checked: boolean) {
    setSelected(current => checked ? [...current, field] : current.filter(item => item !== field))
    setCount(null)
    setError(false)
  }
  return (
    <section aria-label="Local encrypted Task staging">
      <h2>Stage encrypted Task changes</h2>
      <p>Selected fields are encrypted locally. Staging does not upload changes.</p>
      <form onSubmit={event => {
        event.preventDefault()
        if (!canStage || !task) return
        setBusy(true)
        setCount(null)
        setError(false)
        const ordered = fields.filter(field => selected.includes(field))
        void onStage(task, ordered)
          .then(ids => setCount(ids.length))
          .catch(() => setError(true))
          .finally(() => setBusy(false))
      }}>
        <label htmlFor="share-task">Task to share</label>
        <select id="share-task" value={taskId} onChange={event => {
          setTaskId(event.target.value)
          setCount(null)
          setError(false)
        }}>
          <option value="">Select a Task</option>
          {tasks.filter(item => item.archivedAt === undefined).map(item =>
            <option key={item.id} value={item.id}>{item.title}</option>
          )}
        </select>
        {fields.map(field => (
          <label key={field}>
            <input type="checkbox" checked={selected.includes(field)}
              onChange={event => toggle(field, event.target.checked)} />
            {field === 'title' ? 'Share title' : field === 'status' ? 'Share status' : 'Share priority'}
          </label>
        ))}
        <button type="submit" disabled={!canStage}>Stage encrypted changes</button>
      </form>
      {error ? <p role="alert">Could not stage encrypted changes.</p> : null}
      {count !== null ? <p role="status">{count} encrypted {count === 1 ? 'change' : 'changes'} staged locally.</p> : null}
    </section>
  )
}
