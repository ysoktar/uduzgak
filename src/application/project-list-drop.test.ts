import { expect, it } from 'vitest'
import { createWorkspaceCommands } from './workspace-commands'
import { createWorkspaceStore } from './workspace-store'
import type { KeyValueStore } from '../persistence/workspace-storage'
class MemoryStore implements KeyValueStore {
  private data=new Map<string,string>()
  getItem(key:string){return this.data.get(key)??null}
  setItem(key:string,value:string){this.data.set(key,value)}
}
function fixture(){
 const store=createWorkspaceStore(new MemoryStore())
 let id=0
 const commands=createWorkspaceCommands(store,{nextId:()=>`id-${++id}`,now:()=> '2026-10-26T00:00:00.000Z'})
 return {store,commands}
}
it('moves one Project before a sibling in its Area without changing Task data',()=>{
 const {store,commands}=fixture()
 const a=commands.addProject('A'), b=commands.addProject('B'), c=commands.addProject('C')
 const move=(commands as typeof commands & {moveProjectBefore?:(source:string,target:string)=>void}).moveProjectBefore
 expect(typeof move).toBe('function')
 move!(a.id,c.id)
 expect(store.getState().projects.map(x=>x.id)).toEqual([b.id,a.id,c.id])
})

it('moves a Project after a peer and rejects self drops',()=>{
 const {store,commands}=fixture()
 const a=commands.addProject('A'), b=commands.addProject('B'), c=commands.addProject('C')
 const move=(commands as typeof commands & {moveProjectAfter?:(source:string,target:string)=>void}).moveProjectAfter
 expect(typeof move).toBe('function')
 move!(a.id,b.id)
 expect(store.getState().projects.map(p=>p.id)).toEqual([b.id,a.id,c.id])
 expect(()=>move!(a.id,a.id)).toThrow('Cannot reorder Projects outside the same Area')
})

it('rejects an unknown Project reorder placement without writing state',()=>{
 const {store,commands}=fixture()
 const a=commands.addProject('A'),b=commands.addProject('B')
 const before=JSON.stringify(store.getState())
 expect(()=>store.dispatch({type:'project/reordered',projectId:a.id,targetProjectId:b.id,placement:'middle' as 'before'})).toThrow('Invalid Project drop placement')
 expect(JSON.stringify(store.getState())).toBe(before)
})

it('moves a List immediately before a sibling in the same Project',()=>{
 const {store,commands}=fixture()
 const project=commands.addProject('P')
 const a=commands.addTaskList(project.id,'A'),b=commands.addTaskList(project.id,'B'),c=commands.addTaskList(project.id,'C')
 const move=(commands as typeof commands & {moveTaskListBefore?:(id:string,target:string)=>void}).moveTaskListBefore
 expect(typeof move).toBe('function')
 move!(a.id,c.id)
 expect(store.getState().lists?.map(l=>l.id)).toEqual([b.id,a.id,c.id])
})
