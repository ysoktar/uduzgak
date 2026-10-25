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
