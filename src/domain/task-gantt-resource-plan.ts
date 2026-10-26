import type { Task } from './task'
import type { TaskRelationship } from './task-relationship'
import {
  createTaskGanttCriticalOrder,
  createTaskGanttWorkingGraph,
  normalizeTaskGanttNonWorkingDates,
  normalizeTaskGanttWorkingWeekdays,
} from './task-gantt'

export interface TaskGanttResourceRow {
  taskId: string
  earliestStart: number
  earliestFinish: number
  durationDays: number
  resourceWaitDays: number
  assigneeIds: string[]
}

export interface TaskGanttResourcePlan {
  rows: TaskGanttResourceRow[]
  durationDays: number
  waitingTaskIds: string[]
}

/**
 * Deterministic logical working-day projection.
 * Each assigned person can participate in one task at a time.
 * Multi-person tasks reserve all assignees for their entire duration.
 * This is not a persisted schedule or an optimal resource-leveling algorithm.
 */
export function createTaskGanttResourcePlan(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
  nonWorkingDates: readonly string[] = [],
  workingWeekdays: readonly number[] = [1, 2, 3, 4, 5],
): TaskGanttResourcePlan {
  normalizeTaskGanttNonWorkingDates(nonWorkingDates)
  normalizeTaskGanttWorkingWeekdays(workingWeekdays)
  const graph = createTaskGanttWorkingGraph(tasks, relationships, nonWorkingDates, workingWeekdays)
  const order = createTaskGanttCriticalOrder(tasks, relationships)
  const byId = new Map(tasks.map(task => [task.id, task] as const))
  const durations = new Map(graph.nodes.map(node => [node.taskId, node.durationDays]))
  const endByTask = new Map<string, number>()
  const availableByPerson = new Map<string, number>()
  const rows: TaskGanttResourceRow[] = []
  for (const taskId of order) {
    const task = byId.get(taskId)!
    const predecessors = graph.edges.filter(edge => edge.targetTaskId === taskId)
    const precedingFinish = predecessors.reduce(
      (latest, edge) => Math.max(latest, endByTask.get(edge.sourceTaskId)!), 0,
    )
    const assigneeIds = [...new Set(task.assigneeIds ?? [])]
    const nextFree = assigneeIds.reduce(
      (latest, id) => Math.max(latest, availableByPerson.get(id) ?? 0), precedingFinish,
    )
    const durationDays = durations.get(taskId)!
    const earliestFinish = nextFree + durationDays
    rows.push({ taskId, earliestStart: nextFree, earliestFinish, durationDays, resourceWaitDays: nextFree - precedingFinish, assigneeIds })
    endByTask.set(taskId, earliestFinish)
    for (const id of assigneeIds) availableByPerson.set(id, earliestFinish)
  }
  return {
    rows,
    waitingTaskIds: rows.filter(row => row.resourceWaitDays > 0).map(row => row.taskId),
    durationDays: rows.reduce((latest, row) => Math.max(latest, row.earliestFinish), 0),
  }
}
