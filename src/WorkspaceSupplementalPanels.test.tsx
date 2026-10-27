/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { WorkspaceSupplementalPanels } from './WorkspaceSupplementalPanels'
import type { WorkspaceCommands } from './application/workspace-commands'
import { deriveDashboardViewModel } from './domain/dashboard'
import { deriveWorkspaceReportingSnapshot } from './domain/reporting'
import { emptyWorkspace } from './domain/workspace'

function mount() {
  const dashboard = deriveDashboardViewModel(
    deriveWorkspaceReportingSnapshot(emptyWorkspace, '2026-10-19'),
  )
  render(<WorkspaceSupplementalPanels
    state={emptyWorkspace}
    dashboard={dashboard}
    commands={{} as WorkspaceCommands}
  />)
}

it('TDD 702: auxiliary composition renders the dashboard section', () => {
  mount()
  expect(screen.getByRole('region', { name: 'Dashboard' })).toBeTruthy()
})
it('TDD 703: auxiliary composition preserves the Knowledge landmark', () => {
  mount()
  expect(screen.getByRole('region', { name: 'Knowledge' })).toBeTruthy()
})
it('TDD 704: auxiliary composition includes Goals', () => {
  mount()
  expect(screen.getByRole('region', { name: 'Goals' })).toBeTruthy()
})
it('TDD 705: auxiliary composition includes Automations', () => {
  mount()
  expect(screen.getByRole('region', { name: 'Automations' })).toBeTruthy()
})
it('TDD 706: auxiliary panels do not duplicate the primary Task workspace', () => {
  mount()
  expect(screen.queryByRole('main', { name: 'Workspace main' })).toBeNull()
})
