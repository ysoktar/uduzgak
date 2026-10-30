import type { Task } from '../domain/task'

export interface PreviewedTaskChange {
  taskId: string
  field: 'title' | 'status' | 'priority'
  before: string
  after: string
}
const status = new Set(['todo','doing','done'])
const priority = new Set(['low','normal','high'])
/** An explicit review-only projection. Never applies remote changes to Workspace state. */
export function previewTaskRegisterChanges(
  tasks: readonly Task[],
  snapshot: Record<string,Record<string,string | number | boolean | null>>,
): PreviewedTaskChange[] {
  const byId = new Map(tasks.map(task => [task.id, task]))
  const preview: PreviewedTaskChange[] = []
  for (const [taskId, fields] of Object.entries(snapshot).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0)) {
    const task = byId.get(taskId)
    if (!task) throw new Error('Unknown Task in remote preview')
    for (const [field, after] of Object.entries(fields).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0)) {
      if (field !== 'title' && field !== 'status' && field !== 'priority')
        throw new Error('Unsupported remote Task field')
      if (typeof after !== 'string' || (field === 'title' && !after.trim()) ||
        (field === 'status' && !status.has(after)) ||
        (field === 'priority' && !priority.has(after)))
        throw new Error('Invalid remote Task value')
      const before = task[field]
      if (before !== after) preview.push({ taskId, field, before, after })
    }
  }
  return preview
}
