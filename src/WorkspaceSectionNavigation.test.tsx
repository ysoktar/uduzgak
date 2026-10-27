/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { WorkspaceSectionNavigation } from './WorkspaceSectionNavigation'

it('TDD 692: navigation uses a named landmark', () => {
  render(<WorkspaceSectionNavigation />)
  expect(screen.getByRole('navigation', { name: 'Workspace sections' })).toBeTruthy()
})

it('TDD 693: Dashboard link targets local dashboard section', () => {
  render(<WorkspaceSectionNavigation />)
  expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('#workspace-dashboard')
})

it('TDD 694: Knowledge link targets local knowledge section', () => {
  render(<WorkspaceSectionNavigation />)
  expect(screen.getByRole('link', { name: 'Knowledge' }).getAttribute('href')).toBe('#workspace-knowledge')
})

it('TDD 695: Goals link targets local goals section', () => {
  render(<WorkspaceSectionNavigation />)
  expect(screen.getByRole('link', { name: 'Goals' }).getAttribute('href')).toBe('#workspace-goals')
})

it('TDD 696: Automations link targets local automation section', () => {
  render(<WorkspaceSectionNavigation />)
  expect(screen.getByRole('link', { name: 'Automations' }).getAttribute('href')).toBe('#workspace-automations')
})
