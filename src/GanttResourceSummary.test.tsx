/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { GanttResourceSummary } from './GanttResourceSummary'
import type { TaskGanttResourcePlan } from './domain/task-gantt-resource-plan'

const plan: TaskGanttResourcePlan = {
  rows: [], durationDays: 4, waitingTaskIds: ['second'],
}
const forecast = {
  rows: [], completionDate: '2026-10-22',
  calendarWindow: { startDate: '2026-10-19', finishDate: '2026-10-22', calendarDays: 4 },
}

it('TDD 652: displays logical resource duration', () => {
  render(<GanttResourceSummary projectName="Demo" plan={plan} forecast={forecast} />)
  expect(screen.getByLabelText('Gantt resource plan for Demo').textContent).toContain('4 working days')
})

it('TDD 653: displays derived forecast without promising rescheduling', () => {
  render(<GanttResourceSummary projectName="Demo" plan={plan} forecast={forecast} />)
  expect(screen.getByLabelText('Gantt resource forecast for Demo').textContent).toContain('non-persistent estimate')
})

it('TDD 654: displays singular waiting task correctly', () => {
  render(<GanttResourceSummary projectName="Demo" plan={plan} forecast={forecast} />)
  expect(screen.getByLabelText('Gantt resource waiting summary for Demo').textContent).toContain('1 task waiting')
})

it('TDD 655: excludes forecast label if dates are absent', () => {
  render(<GanttResourceSummary projectName="Demo" plan={plan} forecast={null} />)
  expect(screen.queryByLabelText('Gantt resource forecast for Demo')).toBeNull()
})

it('TDD 656: zero waiting tasks have plural wording', () => {
  render(<GanttResourceSummary projectName="Demo" plan={{ ...plan, waitingTaskIds: [] }} forecast={null} />)
  expect(screen.getByLabelText('Gantt resource waiting summary for Demo').textContent).toContain('0 tasks waiting')
})
