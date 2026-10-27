import type { Task } from './task'
import type { CustomFieldDefinition } from './custom-field'
import { filterTasks, type TaskFilter } from './task-filter'
import { sortTasks, type CustomFieldTaskSort, type TaskSort } from './task-sort'

/** Apply Task visibility rules once, before ordering, without changing source data. */
export function selectVisibleTasks(
  tasks: Task[],
  filter: TaskFilter,
  sort: TaskSort,
  customFields: CustomFieldDefinition[] = [],
  customFieldSort?: CustomFieldTaskSort,
): Task[] {
  return sortTasks(filterTasks(tasks, filter, customFields), sort, customFields, customFieldSort)
}
