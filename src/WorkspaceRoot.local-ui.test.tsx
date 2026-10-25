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
})
