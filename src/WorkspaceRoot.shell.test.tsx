/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect,it } from 'vitest'
import { App } from './App'

it('exposes a top-level application banner and a separate main content landmark',()=>{
 render(<App />)
 const header=screen.getByRole('banner')
 expect(header.querySelector('h1')?.textContent).toBe('uduzgak')
 expect(screen.getByRole('main').id).toBe('workspace-content')
 expect(header.contains(screen.getByRole('main'))).toBe(false)
})
