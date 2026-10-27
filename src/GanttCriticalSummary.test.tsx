/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { GanttCriticalSummary } from './GanttCriticalSummary'

it('TDD 662: shows dependency-only critical-path duration', () => {
  render(<GanttCriticalSummary projectName="Demo" durationDays={5} scheduledCount={2} />)
  expect(screen.getByLabelText('Gantt critical path for Demo').textContent).toContain('5 days')
})

it('TDD 663: empty graph explains that no Tasks are scheduled', () => {
  render(<GanttCriticalSummary projectName="Demo" durationDays={0} scheduledCount={0} />)
  expect(screen.getByLabelText('Gantt critical path for Demo').textContent)
    .toContain('No scheduled tasks for critical-path analysis')
})

it('TDD 664: dependency-only caveat is visible', () => {
  render(<GanttCriticalSummary projectName="Demo" durationDays={1} scheduledCount={1} />)
  expect(screen.getByLabelText('Gantt critical path for Demo').textContent)
    .toContain('blocks dependencies only')
})

it('TDD 665: title changes update the accessible project label', () => {
  render(<GanttCriticalSummary projectName="Other" durationDays={3} scheduledCount={1} />)
  expect(screen.getByLabelText('Gantt critical path for Other')).toBeTruthy()
  expect(screen.queryByLabelText('Gantt critical path for Demo')).toBeNull()
})

it('TDD 666: critical-path duration is distinct from resource working days', () => {
  render(<GanttCriticalSummary projectName="Demo" durationDays={3} scheduledCount={1} />)
  const text = screen.getByLabelText('Gantt critical path for Demo').textContent ?? ''
  expect(text).toContain('Logical critical path: 3 days')
  expect(text).not.toContain('Resource-constrained')
})
