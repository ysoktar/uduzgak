/** @vitest-environment jsdom */
import {render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {expect,it} from 'vitest'
import {App} from './App'
it('toggles Task filters with an expanded-state disclosure button',async()=>{
 const user=userEvent.setup()
 render(<App/>)
 const filters=document.getElementById('workspace-filters')
 expect(filters?.hidden).toBe(false)
 const toggle=screen.getByRole('button',{name:'Hide task filters'})
 expect(toggle.getAttribute('aria-expanded')).toBe('true')
 await user.click(toggle)
 expect(filters?.hidden).toBe(true)
 const open=screen.getByRole('button',{name:'Show task filters'})
 expect(open.getAttribute('aria-expanded')).toBe('false')
 await user.click(open)
 expect(filters?.hidden).toBe(false)
})

it('toggles Projects and Tasks without deleting any data',async()=>{
 const user=userEvent.setup()
 render(<App/>)
 const projects=document.getElementById('workspace-projects')
 expect(projects?.hidden).toBe(false)
 await user.click(screen.getByRole('button',{name:'Hide projects and tasks'}))
 expect(projects?.hidden).toBe(true)
 await user.click(screen.getByRole('button',{name:'Show projects and tasks'}))
 expect(projects?.hidden).toBe(false)
})

it('reopens hidden Task filters when navigating to Task filters',async()=>{
 const user=userEvent.setup()
 render(<App/>)
 await user.click(screen.getByRole('button',{name:'Hide task filters'}))
 expect(document.getElementById('workspace-filters')?.hidden).toBe(true)
 await user.click(screen.getByRole('link',{name:'Task filters'}))
 expect(document.getElementById('workspace-filters')?.hidden).toBe(false)
})

it('reopens hidden Projects when navigating from the Workspace header',async()=>{
 const user=userEvent.setup()
 render(<App/>)
 await user.click(screen.getByRole('button',{name:'Hide projects and tasks'}))
 expect(document.getElementById('workspace-projects')?.hidden).toBe(true)
 await user.click(screen.getByRole('link',{name:'Projects'}))
 expect(document.getElementById('workspace-projects')?.hidden).toBe(false)
})
