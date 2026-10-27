/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { GanttWorkingSummary } from './GanttWorkingSummary'

it('TDD 667: displays calculated working days', () => {
  render(<GanttWorkingSummary projectName="Demo" durationDays={7} scheduledCount={2} sundayThursday={false} excludedDateCount={0} />)
  expect(screen.getByLabelText('Gantt working-day critical path for Demo').textContent).toContain('7 working days')
})

it('TDD 668: empty schedule shows explicit guidance', () => {
  render(<GanttWorkingSummary projectName="Demo" durationDays={0} scheduledCount={0} sundayThursday={false} excludedDateCount={0} />)
  expect(screen.getByLabelText('Gantt working-day critical path for Demo').textContent).toContain('No scheduled tasks for working-day analysis')
})

it('TDD 669: reports the configured Sunday-Thursday calendar', () => {
  render(<GanttWorkingSummary projectName="Demo" durationDays={2} scheduledCount={1} sundayThursday excludedDateCount={0} />)
  expect(screen.getByLabelText('Gantt working-day critical path for Demo').textContent).toContain('Sunday-Thursday')
})

it('TDD 670: reports configured holiday exception count', () => {
  render(<GanttWorkingSummary projectName="Demo" durationDays={2} scheduledCount={1} sundayThursday={false} excludedDateCount={2} />)
  expect(screen.getByLabelText('Gantt working-day critical path for Demo').textContent).toContain('2 excluded dates')
})

it('TDD 671: reports holidays not configured for an empty exclusion list', () => {
  render(<GanttWorkingSummary projectName="Demo" durationDays={2} scheduledCount={1} sundayThursday={false} excludedDateCount={0} />)
  expect(screen.getByLabelText('Gantt working-day critical path for Demo').textContent).toContain('holidays not configured')
})
