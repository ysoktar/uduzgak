import type { Task, TaskPriority, TaskStatus } from '../domain/task'
import type { PreviewedTaskChange } from './task-change-preview'

interface ReviewedTaskCommands {
  renameTask(taskId: string, title: string): void
  changeTaskStatus(taskId: string, status: TaskStatus): void
  changeTaskPriority(taskId: string, priority: TaskPriority): void
}

/** Validate the full approved batch against current Tasks before issuing any commands. */
export function applyReviewedTaskChanges(
  tasks: readonly Task[],
  changes: readonly PreviewedTaskChange[],
  commands: ReviewedTaskCommands,
): void {
  const taskById = new Map(tasks.map(task => [task.id, task]))
  const seen = new Set<string>()
  for (const change of changes) {
    const task = taskById.get(change.taskId)
    if (!task || task.archivedAt !== undefined)
      throw new Error('Unknown or archived reviewed Task')
    if (change.field !== 'title' && change.field !== 'status' && change.field !== 'priority')
      throw new Error('Invalid reviewed Task change')
    const key = change.taskId + ':' + change.field
    if (seen.has(key)) throw new Error('Duplicate reviewed Task field')
    seen.add(key)
    if (task[change.field] !== change.before)
      throw new Error('Stale reviewed Task change')
    if (typeof change.after !== 'string' ||
      (change.field === 'title' && !change.after.trim()) ||
      (change.field === 'status' && !['todo', 'doing', 'done'].includes(change.after)) ||
      (change.field === 'priority' && !['low', 'normal', 'high'].includes(change.after)))
      throw new Error('Invalid reviewed Task change')
  }
  for (const change of changes) {
    if (change.field === 'title')
      commands.renameTask(change.taskId, change.after)
    else if (change.field === 'status')
      commands.changeTaskStatus(change.taskId, change.after as TaskStatus)
    else
      commands.changeTaskPriority(change.taskId, change.after as TaskPriority)
  }
}
