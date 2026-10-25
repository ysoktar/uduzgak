/** @vitest-environment jsdom */
import {render,screen} from '@testing-library/react'
import {expect,it} from 'vitest'
import {createWorkspaceCommands} from './application/workspace-commands'
import {createWorkspaceStore} from './application/workspace-store'
import type {KeyValueStore} from './persistence/workspace-storage'
import {WorkspaceRoot} from './WorkspaceRoot'
class MemoryStore implements KeyValueStore {
 private data=new Map<string,string>()
 getItem(k:string){return this.data.get(k)??null}
 setItem(k:string,v:string){this.data.set(k,v)}
}
function renderRoot(){
 const store=createWorkspaceStore(new MemoryStore())
 let id=0
 const commands=createWorkspaceCommands(store,{nextId:()=>`id-${++id}`,now:()=> '2026-10-26T00:00:00.000Z'})
 render(<WorkspaceRoot store={store} commands={commands}/>)
}
it('navigates from the section index to the Dashboard region',()=>{
 renderRoot()
 const nav=screen.getByRole('navigation',{name:'Workspace sections'})
 expect(nav.querySelector('a[href="#workspace-dashboard"]')?.textContent).toBe('Dashboard')
 expect(document.getElementById('workspace-dashboard')).toBeTruthy()
})

it('navigates to Notes, Docs and Wiki without changing Workspace data',()=>{
 renderRoot()
 const nav=screen.getByRole('navigation',{name:'Workspace sections'})
 expect(nav.querySelector('a[href="#workspace-knowledge"]')?.textContent).toBe('Knowledge')
 expect(document.getElementById('workspace-knowledge')).toBeTruthy()
})

it('navigates to the Goals region',()=>{
 renderRoot()
 const nav=screen.getByRole('navigation',{name:'Workspace sections'})
 expect(nav.querySelector('a[href="#workspace-goals"]')?.textContent).toBe('Goals')
 expect(document.getElementById('workspace-goals')).toBeTruthy()
})

it('navigates to Workspace Automations',()=>{
 renderRoot()
 const nav=screen.getByRole('navigation',{name:'Workspace sections'})
 expect(nav.querySelector('a[href="#workspace-automations"]')?.textContent).toBe('Automations')
 expect(document.getElementById('workspace-automations')).toBeTruthy()
})
