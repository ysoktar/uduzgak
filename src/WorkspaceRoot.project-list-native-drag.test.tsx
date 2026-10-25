/** @vitest-environment jsdom */
import { fireEvent,render,screen } from '@testing-library/react'
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
 const store=createWorkspaceStore(new MemoryStore())
 let i=0
 const commands=createWorkspaceCommands(store,{nextId:()=>`drag-${++i}`,now:()=> '2026-10-26T00:00:00.000Z'})
 return {store,commands}
}
const transfer=(id:string)=>({setData:(_type:string,_value:string)=>{},getData:(_type:string)=>id,effectAllowed:'move',dropEffect:'move'})
it('drags a Project before a sibling without moving unrelated data',()=>{
 const {store,commands}=fixture()
 const a=commands.addProject('Alpha'),b=commands.addProject('Beta'),c=commands.addProject('Gamma')
 render(<WorkspaceRoot store={store} commands={commands}/>)
 const dataTransfer=transfer(a.id)
 fireEvent.dragStart(screen.getByLabelText('Drag project Alpha'),{dataTransfer})
 fireEvent.dragOver(screen.getByLabelText('Drop before project Gamma'),{dataTransfer})
 fireEvent.drop(screen.getByLabelText('Drop before project Gamma'),{dataTransfer})
 expect(store.getState().projects.map(p=>p.id)).toEqual([b.id,a.id,c.id])
})
