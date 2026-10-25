import { setTaskDueDate, setTaskStartDate, type Task } from './task'
import type { TaskRelationship } from './task-relationship'

export interface TaskGanttItem {
  task: Task
  startDate: string | null
  dueDate: string | null
  isScheduled: boolean
}

export function createTaskGanttItems(tasks: Task[]): TaskGanttItem[] {
  return tasks.map((task) => ({
    task,
    startDate: task.startDate ?? null,
    dueDate: task.dueDate ?? null,
    isScheduled: task.startDate !== undefined && task.dueDate !== undefined,
  }))
}

export type TaskGanttBaselineStatus = 'none' | 'unchanged' | 'changed' | 'unscheduled'

export function createTaskGanttBaselineComparison(task: Task): TaskGanttBaselineStatus {
  const baseline = task.ganttBaseline
  if (!baseline) return 'none'
  if (task.startDate === undefined || task.dueDate === undefined) return 'unscheduled'
  return task.startDate === baseline.startDate && task.dueDate === baseline.dueDate
    ? 'unchanged'
    : 'changed'
}

export interface TaskGanttDependencyEdge {
  relationshipId: string
  sourceTaskId: string
  targetTaskId: string
  sourceTitle: string
  targetTitle: string
  directionLabel: string
}

export function createTaskGanttDependencyEdges(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
): TaskGanttDependencyEdge[] {
  const taskById = new Map(tasks.map((task) => [task.id, task]))
  const edges: TaskGanttDependencyEdge[] = []

  for (const relationship of relationships) {
    if (relationship.type !== 'blocks') {
      continue
    }

    const sourceTask = taskById.get(relationship.sourceTaskId)
    const targetTask = taskById.get(relationship.targetTaskId)

    if (!sourceTask || !targetTask) {
      continue
    }

    edges.push({
      relationshipId: relationship.id,
      sourceTaskId: relationship.sourceTaskId,
      targetTaskId: relationship.targetTaskId,
      sourceTitle: sourceTask.title,
      targetTitle: targetTask.title,
      directionLabel: `${sourceTask.title} blocks ${targetTask.title}`,
    })
  }

  return edges
}

export interface TaskGanttScheduleChange {
  startDate: string
  dueDate: string
}

export function createTaskGanttScheduleChange(
  task: Task,
  startDate: string,
  dueDate: string,
): TaskGanttScheduleChange {
  const unscheduled = { ...task }
  delete unscheduled.startDate
  delete unscheduled.dueDate

  const withStart = setTaskStartDate(unscheduled, startDate)
  const scheduled = setTaskDueDate(withStart, dueDate)

  return {
    startDate: scheduled.startDate!,
    dueDate: scheduled.dueDate!,
  }
}

/** Inclusive UTC calendar duration; milestones are zero-duration events. */
export function getTaskGanttDurationDays(task: Task): number | null {
  if (task.startDate === undefined || task.dueDate === undefined) return null
  if (task.isMilestone === true) return 0
  const start = Date.parse(`${task.startDate}T00:00:00.000Z`)
  const end = Date.parse(`${task.dueDate}T00:00:00.000Z`)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    throw new Error('Invalid Gantt Task date range')
  }
  return (end - start) / 86_400_000 + 1
}

export interface TaskGanttCriticalNode {
  taskId: string
  durationDays: number
  isMilestone: boolean
}

export interface TaskGanttCriticalGraph {
  nodes: TaskGanttCriticalNode[]
  edges: Array<{ sourceTaskId: string; targetTaskId: string }>
}

/** Projected graph includes only scheduled input Tasks and their `blocks` edges. */
export function createTaskGanttCriticalGraph(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
): TaskGanttCriticalGraph {
  const nodes: TaskGanttCriticalNode[] = []
  const ids = new Set<string>()
  for (const task of tasks) {
    if (ids.has(task.id)) throw new Error('Duplicate Gantt Task ID')
    ids.add(task.id)
    const durationDays = getTaskGanttDurationDays(task)
    if (durationDays !== null) {
      nodes.push({ taskId: task.id, durationDays, isMilestone: task.isMilestone === true })
    }
  }
  const scheduled = new Set(nodes.map((node) => node.taskId))
  const seenEdges = new Set<string>()
  const edges: TaskGanttCriticalGraph['edges'] = []
  for (const edge of relationships) {
    if (edge.type !== 'blocks' || !scheduled.has(edge.sourceTaskId) || !scheduled.has(edge.targetTaskId)) {
      continue
    }
    const key = `${edge.sourceTaskId}\u0000${edge.targetTaskId}`
    if (seenEdges.has(key)) continue
    seenEdges.add(key)
    edges.push({ sourceTaskId: edge.sourceTaskId, targetTaskId: edge.targetTaskId })
  }
  return { nodes, edges }
}

/** Stable Kahn order: equal-priority roots retain input Task order. */
export function createTaskGanttCriticalOrder(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
): string[] {
  const graph = createTaskGanttCriticalGraph(tasks, relationships)
  const indegree = new Map(graph.nodes.map((node) => [node.taskId, 0]))
  for (const edge of graph.edges) {
    indegree.set(edge.targetTaskId, indegree.get(edge.targetTaskId)! + 1)
  }
  const processed = new Set<string>()
  const ordered: string[] = []
  while (ordered.length < graph.nodes.length) {
    const next = graph.nodes.find((node) => !processed.has(node.taskId) && indegree.get(node.taskId) === 0)
    if (!next) throw new Error('Gantt dependency cycle')
    processed.add(next.taskId)
    ordered.push(next.taskId)
    for (const edge of graph.edges) {
      if (edge.sourceTaskId === next.taskId) {
        indegree.set(edge.targetTaskId, indegree.get(edge.targetTaskId)! - 1)
      }
    }
  }
  return ordered
}

export interface TaskGanttEarliestOffset {
  taskId: string
  earliestStart: number
  earliestFinish: number
}

/** Offsets measure logical finish-to-start dependencies, not wall-clock dates. */
export function createTaskGanttEarliestOffsets(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
): TaskGanttEarliestOffset[] {
  const graph = createTaskGanttCriticalGraph(tasks, relationships)
  const order = createTaskGanttCriticalOrder(tasks, relationships)
  const nodeById = new Map(graph.nodes.map((node) => [node.taskId, node]))
  const offsets = new Map<string, TaskGanttEarliestOffset>()
  for (const taskId of order) {
    const predecessors = graph.edges.filter((edge) => edge.targetTaskId === taskId)
    const earliestStart = predecessors.reduce(
      (maximum, edge) => Math.max(maximum, offsets.get(edge.sourceTaskId)!.earliestFinish),
      0,
    )
    offsets.set(taskId, {
      taskId,
      earliestStart,
      earliestFinish: earliestStart + nodeById.get(taskId)!.durationDays,
    })
  }
  return graph.nodes.map((node) => offsets.get(node.taskId)!)
}

export interface TaskGanttCriticalPathRow extends TaskGanttEarliestOffset {
  durationDays: number
  latestStart: number
  latestFinish: number
  slackDays: number
  isCritical: boolean
  isMilestone: boolean
}

export interface TaskGanttCriticalPath {
  durationDays: number
  rows: TaskGanttCriticalPathRow[]
  criticalTaskIds: string[]
}

/** Pure dependency-duration analysis; deliberately ignores resource limits and calendar gaps. */
export function createTaskGanttCriticalPath(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
): TaskGanttCriticalPath {
  const graph = createTaskGanttCriticalGraph(tasks, relationships)
  const earliest = createTaskGanttEarliestOffsets(tasks, relationships)
  const durationDays = earliest.reduce((maximum, row) => Math.max(maximum, row.earliestFinish), 0)
  const earliestById = new Map(earliest.map((row) => [row.taskId, row]))
  const latestById = new Map<string, { start: number; finish: number }>()
  const durations = new Map(graph.nodes.map((node) => [node.taskId, node.durationDays]))
  const order = createTaskGanttCriticalOrder(tasks, relationships)
  for (const taskId of [...order].reverse()) {
    const successors = graph.edges.filter((edge) => edge.sourceTaskId === taskId)
    const latestFinish = successors.length === 0
      ? durationDays
      : Math.min(...successors.map((edge) => latestById.get(edge.targetTaskId)!.start))
    latestById.set(taskId, { start: latestFinish - durations.get(taskId)!, finish: latestFinish })
  }
  const rows = graph.nodes.map((node): TaskGanttCriticalPathRow => {
    const early = earliestById.get(node.taskId)!
    const late = latestById.get(node.taskId)!
    const slackDays = late.start - early.earliestStart
    return {
      ...early,
      durationDays: node.durationDays,
      latestStart: late.start,
      latestFinish: late.finish,
      slackDays,
      isCritical: slackDays === 0,
      isMilestone: node.isMilestone,
    }
  })
  return { durationDays, rows, criticalTaskIds: rows.filter((row) => row.isCritical).map((row) => row.taskId) }
}

export interface TaskGanttScheduleConflict {
  sourceTaskId: string
  targetTaskId: string
  sourceFinishDate: string
  targetStartDate: string
}

/** A Finish-to-Start link requires the successor to begin after an ordinary Task finishes.
 * A zero-day milestone may hand off to its successor on the same calendar date. */
export function createTaskGanttScheduleConflicts(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
): TaskGanttScheduleConflict[] {
  const scheduled = new Map(
    tasks.filter((task) => task.startDate !== undefined && task.dueDate !== undefined)
      .map((task) => [task.id, task] as const),
  )
  const seen = new Set<string>()
  const conflicts: TaskGanttScheduleConflict[] = []
  for (const relationship of relationships) {
    if (relationship.type !== 'blocks') continue
    const source = scheduled.get(relationship.sourceTaskId)
    const target = scheduled.get(relationship.targetTaskId)
    if (!source || !target) continue
    const key = `${source.id}\u0000${target.id}`
    if (seen.has(key)) continue
    seen.add(key)
    const sourceFinishDate = source.dueDate!
    const targetStartDate = target.startDate!
    if (sourceFinishDate < targetStartDate || (source.isMilestone && sourceFinishDate === targetStartDate)) {
      continue
    }
    conflicts.push({ sourceTaskId: source.id, targetTaskId: target.id, sourceFinishDate, targetStartDate })
  }
  return conflicts
}

/** Inclusive Monday-Friday UTC duration; milestones remain zero-day events. */
export function countTaskGanttWorkingDays(
  task: Task,
  nonWorkingDates: readonly string[] = [],
  workingWeekdays: readonly number[] = [1, 2, 3, 4, 5],
): number | null {
  const exceptions = new Set(normalizeTaskGanttNonWorkingDates(nonWorkingDates))
  const workingDays = new Set(normalizeTaskGanttWorkingWeekdays(workingWeekdays))
  if (task.startDate === undefined || task.dueDate === undefined) return null
  if (task.isMilestone === true) return 0
  const start = Date.parse(`${task.startDate}T00:00:00.000Z`)
  const end = Date.parse(`${task.dueDate}T00:00:00.000Z`)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    throw new Error('Invalid Gantt Task date range')
  }
  let days = 0
  for (let instant = start; instant <= end; instant += 86_400_000) {
    const date = new Date(instant)
    const weekday = date.getUTCDay()
    if (workingDays.has(weekday) &&
      !exceptions.has(date.toISOString().slice(0, 10))) days++
  }
  return days
}

/** Scheduled `blocks` graph with logical durations measured in working days. */
export function createTaskGanttWorkingGraph(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
  nonWorkingDates: readonly string[] = [],
  workingWeekdays: readonly number[] = [1, 2, 3, 4, 5],
): TaskGanttCriticalGraph {
  const projected = createTaskGanttCriticalGraph(tasks, relationships)
  const byId = new Map(tasks.map((task) => [task.id, task] as const))
  return {
    edges: projected.edges,
    nodes: projected.nodes.map((node) => ({
      ...node,
      durationDays: countTaskGanttWorkingDays(byId.get(node.taskId)!, nonWorkingDates, workingWeekdays)!,
    })),
  }
}

/** Logical critical path using Monday-Friday Task durations, optionally excluding dates. */
export function createTaskGanttWorkingCriticalPath(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
  nonWorkingDates: readonly string[] = [],
  workingWeekdays: readonly number[] = [1, 2, 3, 4, 5],
): TaskGanttCriticalPath {
  const graph = createTaskGanttWorkingGraph(tasks, relationships, nonWorkingDates, workingWeekdays)
  const order = createTaskGanttCriticalOrder(tasks, relationships)
  const durations = new Map(graph.nodes.map((node) => [node.taskId, node.durationDays]))
  const offsets = new Map<string, TaskGanttEarliestOffset>()
  for (const taskId of order) {
    const predecessors = graph.edges.filter((edge) => edge.targetTaskId === taskId)
    const earliestStart = predecessors.reduce(
      (maximum, edge) => Math.max(maximum, offsets.get(edge.sourceTaskId)!.earliestFinish), 0,
    )
    offsets.set(taskId, { taskId, earliestStart, earliestFinish: earliestStart + durations.get(taskId)! })
  }
  const durationDays = [...offsets.values()].reduce((maximum, row) => Math.max(maximum, row.earliestFinish), 0)
  const latestById = new Map<string, { start: number; finish: number }>()
  for (const taskId of [...order].reverse()) {
    const successors = graph.edges.filter((edge) => edge.sourceTaskId === taskId)
    const latestFinish = successors.length === 0
      ? durationDays
      : Math.min(...successors.map((edge) => latestById.get(edge.targetTaskId)!.start))
    latestById.set(taskId, { start: latestFinish - durations.get(taskId)!, finish: latestFinish })
  }
  const rows: TaskGanttCriticalPathRow[] = graph.nodes.map((node) => {
    const early = offsets.get(node.taskId)!
    const late = latestById.get(node.taskId)!
    const slackDays = late.start - early.earliestStart
    return {
      ...early, durationDays: node.durationDays,
      latestStart: late.start, latestFinish: late.finish, slackDays,
      isCritical: slackDays === 0, isMilestone: node.isMilestone,
    }
  })
  return { durationDays, rows, criticalTaskIds: rows.filter((row) => row.isCritical).map((row) => row.taskId) }
}


/** Normalize user-provided non-working dates without modifying their input order. */
export function normalizeTaskGanttNonWorkingDates(dates: readonly string[]): string[] {
  const unique = new Set<string>()
  for (const day of dates) {
    const parsed = Date.parse(`${day}T00:00:00.000Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(parsed) ||
      new Date(parsed).toISOString().slice(0, 10) !== day) {
      throw new Error('Invalid Gantt non-working date')
    }
    unique.add(day)
  }
  return [...unique].sort()
}


/** UTC weekday numbers: Sunday=0 through Saturday=6. At least one working day is required. */
export function normalizeTaskGanttWorkingWeekdays(weekdays: readonly number[]): number[] {
  if (weekdays.length === 0 || weekdays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
    throw new Error('Invalid Gantt working weekdays')
  }
  return [...new Set(weekdays)].sort((a, b) => a - b)
}

/** Map a nonnegative logical working-day offset to an inclusive UTC calendar date.
 * Offset zero is the first available working day on or after the anchor. */
export function shiftTaskGanttWorkingDate(
  anchor: string,
  workingOffset: number,
  nonWorkingDates: readonly string[] = [],
  workingWeekdays: readonly number[] = [1, 2, 3, 4, 5],
): string {
  const instant = Date.parse(`${anchor}T00:00:00.000Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(anchor) || !Number.isFinite(instant) ||
      new Date(instant).toISOString().slice(0, 10) !== anchor) {
    throw new Error('Invalid Gantt anchor date')
  }
  if (!Number.isSafeInteger(workingOffset) || workingOffset < 0) {
    throw new Error('Invalid Gantt working offset')
  }
  const excluded = new Set(normalizeTaskGanttNonWorkingDates(nonWorkingDates))
  const weekdays = new Set(normalizeTaskGanttWorkingWeekdays(workingWeekdays))
  const date = new Date(instant)
  const anchorIsWorking = weekdays.has(date.getUTCDay()) && !excluded.has(anchor)
  let remaining = anchorIsWorking ? workingOffset : Math.max(0, workingOffset - 1)
  while (true) {
    const day = date.toISOString().slice(0, 10)
    if (weekdays.has(date.getUTCDay()) && !excluded.has(day)) {
      if (remaining === 0) return day
      remaining--
    }
    date.setUTCDate(date.getUTCDate() + 1)
    if (!Number.isFinite(date.getTime())) throw new Error('Gantt working date out of range')
  }
}

export interface TaskGanttWorkingDateRow {
  taskId: string
  isMilestone: boolean
  earliestStartDate: string
  earliestFinishDate: string
  latestStartDate: string
  latestFinishDate: string
}

/** Derived logical working-day dates, anchored independently from stored schedules. */
export function createTaskGanttWorkingDateProjection(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
  anchor: string,
  nonWorkingDates: readonly string[] = [],
  workingWeekdays: readonly number[] = [1, 2, 3, 4, 5],
): { rows: TaskGanttWorkingDateRow[] } {
  const path = createTaskGanttWorkingCriticalPath(tasks, relationships, nonWorkingDates, workingWeekdays)
  const projectDate = (offset: number) =>
    shiftTaskGanttWorkingDate(anchor, offset, nonWorkingDates, workingWeekdays)
  return {
    rows: path.rows.map((row) => ({
      taskId: row.taskId,
      isMilestone: row.isMilestone,
      earliestStartDate: projectDate(row.earliestStart),
      earliestFinishDate: projectDate(Math.max(row.earliestStart, row.earliestFinish - 1)),
      latestStartDate: projectDate(row.latestStart),
      latestFinishDate: projectDate(Math.max(row.latestStart, row.latestFinish - 1)),
    })),
  }
}
