import type { TaskGanttDependencyEdge, TaskGanttItem } from './task-gantt'

/** Keep Gantt Task visibility and dependency edges consistent in one pure operation. */
export function createTaskGanttOverviewSelection(
  items: readonly TaskGanttItem[],
  edges: readonly TaskGanttDependencyEdge[],
  dependencyCriticalIds: ReadonlySet<string>,
  workingCriticalIds: ReadonlySet<string>,
  criticalOnly: boolean,
  workingCriticalOnly: boolean,
) {
  const selected = workingCriticalOnly
    ? items.filter(item => workingCriticalIds.has(item.task.id))
    : criticalOnly
      ? items.filter(item => dependencyCriticalIds.has(item.task.id))
      : [...items]
  if (!workingCriticalOnly && !criticalOnly) return { items: selected, edges: [...edges] }
  const ids = new Set(selected.map(item => item.task.id))
  return {
    items: selected,
    edges: edges.filter(edge => ids.has(edge.sourceTaskId) && ids.has(edge.targetTaskId)),
  }
}
