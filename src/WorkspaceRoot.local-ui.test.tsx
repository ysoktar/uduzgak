/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('local workspace accessibility', () => {
  it('provides a keyboard skip link to the main workspace content', () => {
    render(<App />)
    const skip = screen.getByRole('link', { name: 'Skip to workspace content' })
    expect(skip.getAttribute('href')).toBe('#workspace-content')
    expect(document.querySelector('main#workspace-content')).not.toBeNull()
  })
  it('provides distinct task filters and projects landmarks for fast navigation', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: 'Workspace navigation' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Task filters' }).getAttribute('href')).toBe('#workspace-filters')
    expect(screen.getByRole('link', { name: 'Projects' }).getAttribute('href')).toBe('#workspace-projects')
    expect(document.getElementById('workspace-filters')).toBeTruthy()
    expect(document.getElementById('workspace-projects')).toBeTruthy()
  })
  it('offers an explicit empty workspace starting point', () => {
    render(<App />)
    const empty = screen.getByRole('status', { name: 'Empty workspace guidance' })
    expect(empty.textContent).toContain('Create your first project')
    expect(screen.getByRole('link', { name: 'Go to project creation' }).getAttribute('href')).toBe('#project-create')
    expect(document.getElementById('project-create')).toBeTruthy()
  })

})
