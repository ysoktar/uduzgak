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

it('provides a named task-filter region with the existing search input',()=>{
 render(<App />)
 const region=screen.getByRole('region',{name:'Task filters and sorting'})
 expect(region.id).toBe('workspace-filters')
 expect(region.contains(screen.getByLabelText('Search tasks'))).toBe(true)
})

it('labels the Projects and Tasks region separately from Task filters',()=>{
 render(<App />)
 const region=screen.getByRole('region',{name:'Projects and tasks'})
 expect(region.id).toBe('workspace-projects')
 expect(region.contains(screen.getByRole('region',{name:'Task filters and sorting'}))).toBe(false)
})
