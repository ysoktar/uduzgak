/** @vitest-environment jsdom */
import { render,screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
function fixture(){
 const user=userEvent.setup(),store=createWorkspaceStore(new MemoryStore())
 let i=0
 const commands=createWorkspaceCommands(store,{nextId:()=>`r-${++i}`,now:()=> '2026-10-26T00:00:00.000Z'})
 return {user,store,commands}
}
it('moves a Project before another from accessible on-screen controls',async()=>{
 const {user,store,commands}=fixture()
 const a=commands.addProject('Alpha'),b=commands.addProject('Beta'),c=commands.addProject('Gamma')
 render(<WorkspaceRoot store={store} commands={commands}/>)
 await user.click(screen.getByRole('button',{name:'Move project Alpha before Gamma'}))
 expect(store.getState().projects.map(p=>p.id)).toEqual([b.id,a.id,c.id])
})
