import type { WorkspaceStore } from '../application/workspace-store'
import { type ActivityTrackableWorkspaceAction } from '../domain/workspace'
import { executeAutomationTransaction } from '../application/automation-execution'
import type { TaskPriority, TaskStatus } from '../domain/task'
import { applyReviewedTaskChanges } from './apply-reviewed-task-changes'
import type { PreviewedTaskChange } from './task-change-preview'

/** Simulate all approved edits before a single persisted Workspace commit. */
export function commitReviewedTaskChanges(
  store: WorkspaceStore,
  changes: readonly PreviewedTaskChange[],
  occurredAt: string,
  options: { maxAutomationActionApplications?: number } = {},
): number {
  if (changes.length === 0) return 0
  const actions: ActivityTrackableWorkspaceAction[] = []
  applyReviewedTaskChanges(store.getState().tasks, changes, {
    renameTask: (taskId, title) => actions.push({ type: 'task/titleChanged', taskId, title }),
    changeTaskStatus: (taskId, status: TaskStatus) =>
      actions.push({ type: 'task/statusChanged', taskId, status }),
    changeTaskPriority: (taskId, priority: TaskPriority) =>
      actions.push({ type: 'task/priorityChanged', taskId, priority }),
  })
  let candidate = store.getState()
  for (const action of actions) {
    candidate = executeAutomationTransaction(candidate, {
      action,
      occurredAt,
      maxActionApplications: options.maxAutomationActionApplications ?? 100,
    }).workspace
  }
  store.dispatch({ type: 'workspace/automationTransactionCommitted', workspace: candidate })
  return actions.length
}
