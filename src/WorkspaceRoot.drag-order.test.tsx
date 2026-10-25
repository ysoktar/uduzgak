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
it('drags one Task before a sibling in manual mode while keeping keyboard buttons', async () => {
  const user = userEvent.setup()
  const store = createWorkspaceStore(new MemoryStore())
  let id=0
  const commands = createWorkspaceCommands(store,{nextId:()=>`d-${++id}`,now:()=> '2026-10-26T00:00:00.000Z'})
  const project=commands.addProject('Task ordering')
  const alpha=commands.addTask(project.id,'Alpha')
  const beta=commands.addTask(project.id,'Beta')
  const gamma=commands.addTask(project.id,'Gamma')
  render(<WorkspaceRoot store={store} commands={commands}/>)
  await user.selectOptions(screen.getByLabelText('Sort tasks'),'manual')
  const source=screen.getByLabelText('Drag task Alpha')
  const target=screen.getByLabelText('Drop before task Gamma')
  const transfer={setData: (_type:string,_value:string)=>{},getData:(_type:string)=>alpha.id,effectAllowed:'move',dropEffect:'move'}
  fireEvent.dragStart(source,{dataTransfer:transfer})
  fireEvent.dragOver(target,{dataTransfer:transfer})
  fireEvent.drop(target,{dataTransfer:transfer})
  expect(store.getState().tasks.map(t=>t.id)).toEqual([beta.id,alpha.id,gamma.id])
  expect(screen.getByRole('button',{name:'Move task Alpha up'})).toBeTruthy()
})
