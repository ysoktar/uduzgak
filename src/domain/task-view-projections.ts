import type { Task } from './task'
import type { TaskList } from './task-list'
import { createTaskBoardColumns } from './task-board'
import { createTaskCalendarSections } from './task-calendar'
import { groupTasks, type TaskGroup } from './task-group'
import { createTaskTableRows } from './task-table'
import { createTaskTimelineItems } from './task-timeline'

/** One projection interface for the core task views, sharing identical filtered inputs. */
export function createTaskViewProjections(
  tasks: Task[],
  lists: TaskList[],
  group: TaskGroup,
) {
  return {
    groups: groupTasks(tasks, group, lists),
    board: createTaskBoardColumns(tasks),
    calendar: createTaskCalendarSections(tasks),
    table: createTaskTableRows(tasks, lists),
    timeline: createTaskTimelineItems(tasks),
  }
}
