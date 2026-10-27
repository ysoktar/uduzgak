/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { GanttResourceDates } from './GanttResourceDates'

const dates = { taskId: 'a', startDate: '2026-10-19', finishDate: '2026-10-21', isMilestone: false }

it('TDD 657: renders estimated Task start and finish dates', () => {
  render(<GanttResourceDates taskTitle="Alpha" dates={dates} />)
  expect(screen.getByLabelText('Gantt resource dates for Alpha').textContent)
    .toContain('2026-10-19 to 2026-10-21')
})

it('TDD 658: indicates that the projection is only estimated', () => {
  render(<GanttResourceDates taskTitle="Alpha" dates={dates} />)
  expect(screen.getByLabelText('Gantt resource dates for Alpha').textContent)
    .toContain('estimated')
})

it('TDD 659: renders nothing when a date projection is missing', () => {
  render(<GanttResourceDates taskTitle="Alpha" dates={null} />)
  expect(screen.queryByLabelText('Gantt resource dates for Alpha')).toBeNull()
})

it('TDD 660: preserves the exact milestone date', () => {
  render(<GanttResourceDates taskTitle="Launch" dates={{
    taskId: 'm', startDate: '2026-10-19', finishDate: '2026-10-19', isMilestone: true,
  }} />)
  expect(screen.getByLabelText('Gantt resource dates for Launch').textContent)
    .toContain('2026-10-19 to 2026-10-19')
})

it('TDD 661: accessible label uses the current Task title', () => {
  render(<GanttResourceDates taskTitle="Beta" dates={dates} />)
  expect(screen.getByLabelText('Gantt resource dates for Beta')).toBeTruthy()
  expect(screen.queryByLabelText('Gantt resource dates for Alpha')).toBeNull()
})
