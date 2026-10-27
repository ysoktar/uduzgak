import type { TaskGanttResourcePlan } from './domain/task-gantt-resource-plan'

export interface GanttResourceSummaryProps {
  projectName: string
  plan: TaskGanttResourcePlan
  forecast: {
    calendarWindow: { startDate: string; finishDate: string; calendarDays: number } | null
  } | null
}

/** Read-only summary of resource allocation; dates are forecasts, not stored changes. */
export function GanttResourceSummary({ projectName, plan, forecast }: GanttResourceSummaryProps) {
  const window = forecast?.calendarWindow
  return (
    <>
      <p aria-label={`Gantt resource plan for ${projectName}`}>
        Resource-constrained logical plan: {plan.durationDays} working days
      </p>
      {window ? (
        <p aria-label={`Gantt resource forecast for ${projectName}`}>
          Resource forecast: {window.startDate} to {window.finishDate} ({window.calendarDays} calendar days; non-persistent estimate)
        </p>
      ) : null}
      <p aria-label={`Gantt resource waiting summary for ${projectName}`}>
        {plan.waitingTaskIds.length} {plan.waitingTaskIds.length === 1 ? 'task' : 'tasks'} waiting for a person
      </p>
    </>
  )
}
