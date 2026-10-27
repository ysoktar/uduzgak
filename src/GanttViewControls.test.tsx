/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { GanttViewControls, type GanttViewControlsProps } from './GanttViewControls'

function props(overrides: Partial<GanttViewControlsProps> = {}): GanttViewControlsProps {
  return {
    criticalOnly: false, showLogicalOffsets: false, showWorkingDays: false,
    showProjectedDates: false, sundayThursday: false, workingCriticalOnly: false,
    nonWorkingDateDraft: '', nonWorkingDates: [],
    onToggleCritical: vi.fn(), onToggleLogicalOffsets: vi.fn(),
    onToggleWorkingDays: vi.fn(), onToggleProjectedDates: vi.fn(),
    onToggleWorkweek: vi.fn(), onDraftChange: vi.fn(),
    onAddNonWorkingDate: vi.fn(), onRemoveNonWorkingDate: vi.fn(),
    onToggleWorkingCritical: vi.fn(), onSelectVisibleWorkingCritical: vi.fn(),
    onSelectVisibleCritical: vi.fn(),
    ...overrides,
  }
}

it('TDD 697: primary Gantt controls are visible', () => {
  render(<GanttViewControls {...props()} />)
  expect(screen.getByRole('button', { name: 'Show Gantt working-day analysis' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Critical tasks only in Gantt overview' })).toBeTruthy()
})

it('TDD 698: extended working-day controls remain hidden until enabled', () => {
  render(<GanttViewControls {...props()} />)
  expect(screen.queryByRole('button', { name: 'Show Gantt projected working dates' })).toBeNull()
})

it('TDD 699: critical-only action delegates to its callback', () => {
  const onToggleCritical = vi.fn()
  render(<GanttViewControls {...props({ criticalOnly: true, onToggleCritical })} />)
  const button = screen.getByRole('button', { name: 'Critical tasks only in Gantt overview' })
  expect(button.getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(button)
  expect(onToggleCritical).toHaveBeenCalledOnce()
})

it('TDD 700: duplicate non-working date cannot be added', () => {
  render(<GanttViewControls {...props({
    showWorkingDays: true, nonWorkingDateDraft: '2026-10-20', nonWorkingDates: ['2026-10-20'],
  })} />)
  expect((screen.getByRole('button', { name: 'Add Gantt non-working date' }) as HTMLButtonElement).disabled).toBe(true)
})

it('TDD 701: removal preserves the selected date identifier', () => {
  const onRemoveNonWorkingDate = vi.fn()
  render(<GanttViewControls {...props({
    showWorkingDays: true, nonWorkingDates: ['2026-10-20'], onRemoveNonWorkingDate,
  })} />)
  fireEvent.click(screen.getByRole('button', { name: 'Remove Gantt non-working date 2026-10-20' }))
  expect(onRemoveNonWorkingDate).toHaveBeenCalledWith('2026-10-20')
})
