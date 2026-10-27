import type { TaskGanttResourceDateRow } from './domain/task-gantt-resource-plan'

export interface GanttResourceDatesProps {
  taskTitle: string
  dates: TaskGanttResourceDateRow | null | undefined
}

/** Read-only projection; does not modify stored Task dates. */
export function GanttResourceDates({ taskTitle, dates }: GanttResourceDatesProps) {
  if (!dates) return null
  return (
    <span aria-label={`Gantt resource dates for ${taskTitle}`}>
      {dates.startDate} to {dates.finishDate} (estimated)
    </span>
  )
}
