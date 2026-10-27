export interface GanttViewControlsProps {
  criticalOnly: boolean
  showLogicalOffsets: boolean
  showWorkingDays: boolean
  showProjectedDates: boolean
  sundayThursday: boolean
  workingCriticalOnly: boolean
  nonWorkingDateDraft: string
  nonWorkingDates: readonly string[]
  onToggleCritical: () => void
  onToggleLogicalOffsets: () => void
  onToggleWorkingDays: () => void
  onToggleProjectedDates: () => void
  onToggleWorkweek: () => void
  onDraftChange: (date: string) => void
  onAddNonWorkingDate: () => void
  onRemoveNonWorkingDate: (date: string) => void
  onToggleWorkingCritical: () => void
  onSelectVisibleWorkingCritical: () => void
  onSelectVisibleCritical: () => void
}

/** Controlled Gantt view controls. Scheduling decisions remain in the parent. */
export function GanttViewControls({
  criticalOnly, showLogicalOffsets, showWorkingDays, showProjectedDates,
  sundayThursday, workingCriticalOnly, nonWorkingDateDraft, nonWorkingDates,
  onToggleCritical, onToggleLogicalOffsets, onToggleWorkingDays,
  onToggleProjectedDates, onToggleWorkweek, onDraftChange,
  onAddNonWorkingDate, onRemoveNonWorkingDate, onToggleWorkingCritical,
  onSelectVisibleWorkingCritical, onSelectVisibleCritical,
}: GanttViewControlsProps) {
  return (
    <>
      <button type="button" aria-pressed={criticalOnly} onClick={onToggleCritical}>
        Critical tasks only in Gantt overview
      </button>
      <button type="button" aria-pressed={showLogicalOffsets} onClick={onToggleLogicalOffsets}>
        Show Gantt logical offsets
      </button>
      <button type="button" aria-pressed={showWorkingDays} onClick={onToggleWorkingDays}>
        Show Gantt working-day analysis
      </button>
      {showWorkingDays ? (
        <>
          <button type="button" aria-pressed={showProjectedDates} onClick={onToggleProjectedDates}>
            Show Gantt projected working dates
          </button>
          <button type="button" aria-pressed={sundayThursday} onClick={onToggleWorkweek}>
            Use Sunday-Thursday Gantt workweek
          </button>
          <div>
            <label>
              Gantt non-working date
              <input type="date" value={nonWorkingDateDraft}
                onChange={event => onDraftChange(event.target.value)} />
            </label>
            <button type="button"
              disabled={!nonWorkingDateDraft || nonWorkingDates.includes(nonWorkingDateDraft)}
              onClick={onAddNonWorkingDate}>
              Add Gantt non-working date
            </button>
            {nonWorkingDates.length > 0 ? (
              <ul aria-label="Gantt non-working dates">
                {nonWorkingDates.map(date => (
                  <li key={date}>
                    {date}
                    <button type="button" onClick={() => onRemoveNonWorkingDate(date)}>
                      Remove Gantt non-working date {date}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <button type="button" aria-pressed={workingCriticalOnly} onClick={onToggleWorkingCritical}>
            Working-day critical tasks only in Gantt overview
          </button>
          <button type="button" onClick={onSelectVisibleWorkingCritical}>
            Select visible working-day critical Gantt tasks
          </button>
        </>
      ) : null}
      <button type="button" onClick={onSelectVisibleCritical}>
        Select visible critical Gantt tasks
      </button>
    </>
  )
}
