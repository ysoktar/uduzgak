/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { createWorkspaceCommands } from './application/workspace-commands'
import { createWorkspaceStore } from './application/workspace-store'
import type { KeyValueStore } from './persistence/workspace-storage'
import { WorkspaceRoot } from './WorkspaceRoot'
class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string,string>()
  getItem(key:string) { return this.data.get(key) ?? null }
  setItem(key:string,value:string) { this.data.set(key,value) }
}
async function fixture() {
  const user=userEvent.setup()
  const store=createWorkspaceStore(new MemoryStore())
  let i=0
  const commands=createWorkspaceCommands(store,{nextId:()=>`id-${++i}`,now:()=> '2026-10-26T00:00:00.000Z'})
  const project=commands.addProject('Ordering')
  const alpha=commands.addTask(project.id,'Alpha')
  const beta=commands.addTask(project.id,'Beta')
  const gamma=commands.addTask(project.id,'Gamma')
  render(<WorkspaceRoot store={store} commands={commands}/>)
  await user.selectOptions(screen.getByLabelText('Sort tasks'),'manual')
  return { user, store, alpha, beta, gamma }
}
it('moves a Task after a sibling through a touch-friendly button',async()=>{
  const {user,store,alpha,beta,gamma}=await fixture()
  await user.click(screen.getByRole('button',{name:'Move task Alpha after Gamma'}))
  expect(store.getState().tasks.map(t=>t.id)).toEqual([beta.id,gamma.id,alpha.id])
})

it('moves a Task before a sibling through a touch-friendly button',async()=>{
  const {user,store,alpha,beta,gamma}=await fixture()
  await user.click(screen.getByRole('button',{name:'Move task Gamma before Alpha'}))
  expect(store.getState().tasks.map(t=>t.id)).toEqual([gamma.id,alpha.id,beta.id])
})
