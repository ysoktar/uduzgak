/** @vitest-environment jsdom */
import {fireEvent,render,screen} from '@testing-library/react'
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
async function fixture(){
 const user=userEvent.setup()
 const store=createWorkspaceStore(new MemoryStore())
 let i=0
 const commands=createWorkspaceCommands(store,{nextId:()=>`b-${++i}`,now:()=> '2026-10-26T00:00:00.000Z'})
 const project=commands.addProject('Board P')
 const alpha=commands.addTask(project.id,'Alpha')
 render(<WorkspaceRoot store={store} commands={commands}/>)
 await user.selectOptions(screen.getByLabelText('Task view'),'board')
 return {user,store,commands,project,alpha}
}
const transfer=(id:string)=>({setData:(_kind:string,_id:string)=>{},getData:(_kind:string)=>id,effectAllowed:'move',dropEffect:'move'})
it('drags a To-do Task into Doing without copying the Task',async()=>{
 const {store,alpha}=await fixture()
 const dataTransfer=transfer(alpha.id)
 fireEvent.dragStart(screen.getByLabelText('To do board task Alpha'),{dataTransfer})
 const doing=screen.getByLabelText('Drop task into Doing')
 fireEvent.dragOver(doing,{dataTransfer})
 fireEvent.drop(doing,{dataTransfer})
 expect(store.getState().tasks.find(t=>t.id===alpha.id)?.status).toBe('doing')
 expect(store.getState().tasks).toHaveLength(1)
})

it('drags a Doing Task into Done using the Board heading',async()=>{
 const {user,store,alpha}=await fixture()
 await user.selectOptions(screen.getByLabelText('Status for Alpha'),'doing')
 const dataTransfer=transfer(alpha.id)
 fireEvent.dragStart(screen.getByLabelText('Doing board task Alpha'),{dataTransfer})
 const done=screen.getByLabelText('Drop task into Done')
 fireEvent.dragOver(done,{dataTransfer})
 fireEvent.drop(done,{dataTransfer})
 expect(store.getState().tasks.find(t=>t.id===alpha.id)?.status).toBe('done')
})

it('drags a Doing Task back into To do',async()=>{
 const {user,store,alpha}=await fixture()
 await user.selectOptions(screen.getByLabelText('Status for Alpha'),'doing')
 const dataTransfer=transfer(alpha.id)
 fireEvent.dragStart(screen.getByLabelText('Doing board task Alpha'),{dataTransfer})
 const todo=screen.getByLabelText('Drop task into To do')
 fireEvent.dragOver(todo,{dataTransfer})
 fireEvent.drop(todo,{dataTransfer})
 expect(store.getState().tasks.find(t=>t.id===alpha.id)?.status).toBe('todo')
})
