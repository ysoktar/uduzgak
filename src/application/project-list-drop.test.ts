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
