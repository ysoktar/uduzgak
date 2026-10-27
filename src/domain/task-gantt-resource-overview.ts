import type { Task } from './task'
import type { TaskRelationship } from './task-relationship'
import {
  createTaskGanttResourceDateProjection,
  createTaskGanttResourcePlan,
} from './task-gantt-resource-plan'

/** Single derived resource view model; never changes persisted Task schedules. */
export function createTaskGanttResourceOverview(
  tasks: readonly Task[],
  relationships: readonly TaskRelationship[],
  nonWorkingDates: readonly string[] = [],
  workingWeekdays: readonly number[] = [1, 2, 3, 4, 5],
) {
  const plan = createTaskGanttResourcePlan(tasks, relationships, nonWorkingDates, workingWeekdays)
  const anchor = tasks
    .filter(task => task.startDate !== undefined && task.dueDate !== undefined)
    .map(task => task.startDate!)
    .sort()[0]
  const forecast = anchor === undefined
    ? null
    : createTaskGanttResourceDateProjection(tasks, relationships, anchor, nonWorkingDates, workingWeekdays)
  return { plan, forecast }
}
