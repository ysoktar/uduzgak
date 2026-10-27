export interface GanttCriticalSummaryProps {
  projectName: string
  durationDays: number
  scheduledCount: number
}

/** Dependency-only summary, separate from resource allocation forecasts. */
export function GanttCriticalSummary({
  projectName, durationDays, scheduledCount,
}: GanttCriticalSummaryProps) {
  return (
    <p aria-label={`Gantt critical path for ${projectName}`}>
      {scheduledCount === 0
        ? 'No scheduled tasks for critical-path analysis'
        : `Logical critical path: ${durationDays} days (visible scheduled tasks; blocks dependencies only)`}
    </p>
  )
}
