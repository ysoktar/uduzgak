import type { Task } from './task'
import type { TaskRelationship } from './task-relationship'
import {
  createTaskGanttCriticalOrder,
  createTaskGanttWorkingGraph,
  normalizeTaskGanttNonWorkingDates,
  normalizeTaskGanttWorkingWeekdays,
  shiftTaskGanttWorkingDate,
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

export interface TaskGanttResourceDateRow {
  taskId: string
  startDate: string
  finishDate: string
  isMilestone: boolean
}

/** Non-persistent forecast: convert logical resource slots to working-date labels. */
export function createTaskGanttResourceDateProjection(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
  anchor: string,
  nonWorkingDates: readonly string[] = [],
  workingWeekdays: readonly number[] = [1, 2, 3, 4, 5],
): { rows: TaskGanttResourceDateRow[]; completionDate: string | null; calendarWindow: { startDate: string; finishDate: string; calendarDays: number } | null } {
  const firstWorkingDate = shiftTaskGanttWorkingDate(anchor, 0, nonWorkingDates, workingWeekdays)
  // Preserve Task working-day effort; excluded calendar dates shift the forecast rather than erase effort.
  const plan = createTaskGanttResourcePlan(tasks, relationships, [], workingWeekdays)
  const byId = new Map(tasks.map(task => [task.id, task] as const))
  const rows = plan.rows.map(row => {
    const startDate = shiftTaskGanttWorkingDate(firstWorkingDate, row.earliestStart, nonWorkingDates, workingWeekdays)
    const finishDate = row.durationDays === 0
      ? startDate
      : shiftTaskGanttWorkingDate(firstWorkingDate, row.earliestFinish - 1, nonWorkingDates, workingWeekdays)
    return {
      taskId: row.taskId,
      startDate,
      finishDate,
      isMilestone: byId.get(row.taskId)!.isMilestone === true,
    }
  })
  const completionDate = rows.length === 0 ? null : rows.reduce(
    (latest, row) => row.finishDate > latest ? row.finishDate : latest,
    rows[0].finishDate,
  )
  const startDate = rows.length === 0 ? null : rows.reduce(
    (earliest, row) => row.startDate < earliest ? row.startDate : earliest,
    rows[0].startDate,
  )
  return {
    rows,
    completionDate,
    calendarWindow: startDate === null || completionDate === null ? null : {
      startDate,
      finishDate: completionDate,
      calendarDays: (Date.parse(`${completionDate}T00:00:00.000Z`) - Date.parse(`${startDate}T00:00:00.000Z`)) / 86_400_000 + 1,
    },
  }
}
