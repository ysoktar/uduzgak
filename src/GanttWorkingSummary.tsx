export interface GanttWorkingSummaryProps {
  projectName: string
  durationDays: number
  scheduledCount: number
  sundayThursday: boolean
  excludedDateCount: number
}

/** Render derived working-day analysis without mutating the Task calendar. */
export function GanttWorkingSummary({
  projectName, durationDays, scheduledCount, sundayThursday, excludedDateCount,
}: GanttWorkingSummaryProps) {
  const workweek = sundayThursday ? 'Sunday-Thursday' : 'Monday-Friday'
  const holidays = excludedDateCount === 0
    ? 'holidays not configured'
    : `${excludedDateCount} excluded date${excludedDateCount === 1 ? '' : 's'}`
  return (
    <p aria-label={`Gantt working-day critical path for ${projectName}`}>
      {scheduledCount === 0
        ? 'No scheduled tasks for working-day analysis'
        : `Working-day critical path: ${durationDays} working days (${workweek}; ${holidays})`}
    </p>
  )
}
