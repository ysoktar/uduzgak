/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { WorkspaceDataToolbar } from './WorkspaceDataToolbar'

it('TDD 707: export and import belong to the named workspace data toolbar', () => {
  render(<WorkspaceDataToolbar onExport={vi.fn()} onImport={vi.fn()} error={null} />)
  const toolbar = screen.getByRole('region', { name: 'Workspace data' })
  expect(toolbar).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Export backup' })).toBeTruthy()
  expect(screen.getByLabelText('Import backup')).toBeTruthy()
})

it('TDD 708: backup export delegates to the owner', () => {
  const onExport = vi.fn()
  render(<WorkspaceDataToolbar onExport={onExport} onImport={vi.fn()} error={null} />)
  fireEvent.click(screen.getByRole('button', { name: 'Export backup' }))
  expect(onExport).toHaveBeenCalledOnce()
})

it('TDD 709: import is restricted to JSON files', () => {
  render(<WorkspaceDataToolbar onExport={vi.fn()} onImport={vi.fn()} error={null} />)
  const input = screen.getByLabelText('Import backup') as HTMLInputElement
  expect(input.type).toBe('file')
  expect(input.accept).toContain('.json')
})

it('TDD 710: selecting a file forwards it without consuming its contents', () => {
  const onImport = vi.fn()
  render(<WorkspaceDataToolbar onExport={vi.fn()} onImport={onImport} error={null} />)
  const file = new File(['{}'], 'snapshot.json', { type: 'application/json' })
  fireEvent.change(screen.getByLabelText('Import backup'), { target: { files: [file] } })
  expect(onImport).toHaveBeenCalledWith(file)
})

it('TDD 711: failed imports retain an accessible error message', () => {
  render(<WorkspaceDataToolbar onExport={vi.fn()} onImport={vi.fn()} error="Backup could not be imported." />)
  expect(screen.getByRole('alert').textContent).toContain('Backup could not be imported.')
})
