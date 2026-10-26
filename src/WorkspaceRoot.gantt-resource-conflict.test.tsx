/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { createWorkspaceCommands } from './application/workspace-commands'
import { createWorkspaceStore } from './application/workspace-store'
import { createDefaultViewPreferences, updateViewPreferences } from './domain/view-preferences'
import type { KeyValueStore } from './persistence/workspace-storage'
import { WorkspaceRoot } from './WorkspaceRoot'

class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string,string>()
  getItem(key:string) { return this.data.get(key) ?? null }
  setItem(key:string,value:string) { this.data.set(key,value) }
}
function fixture(sharedPerson = true, viewMode: 'gantt' | 'list' = 'gantt') {
  const store = createWorkspaceStore(new MemoryStore())
  let n=0
  const commands = createWorkspaceCommands(store,{
    nextId: () => `gantt-${++n}`,
    now: () => '2026-10-19T08:00:00.000Z',
  })
  const project=commands.addProject('Resource Demo')
  const a=commands.addTask(project.id,'Alpha')
  const b=commands.addTask(project.id,'Beta')
  for(const task of [a,b]){
    commands.changeTaskStartDate(task.id,'2026-10-19')
    commands.changeTaskDueDate(task.id,'2026-10-20')
  }
  const first=commands.addPerson('First')
  commands.assignTaskAssignee(a.id,first.id)
  if(sharedPerson) commands.assignTaskAssignee(b.id,first.id)
  else commands.assignTaskAssignee(b.id,commands.addPerson('Second').id)
  render(<WorkspaceRoot store={store} commands={commands}
    initialViewPreferences={updateViewPreferences(createDefaultViewPreferences(),{projectView:project.id,viewMode})}/>)
  return {store,a,b}
}

it('TDD 612: Gantt summary reports one resource-waiting Task', () => {
  fixture()
  expect(screen.getByLabelText('Gantt resource waiting summary for Resource Demo').textContent).toContain('1 task waiting for a person')
})

it('TDD 613: waiting Task shows its resource delay', () => {
  fixture()
  expect(screen.getByLabelText('Gantt resource wait for Beta').textContent).toContain('2 working days')
})

it('TDD 614: first Task never reports a resource wait', () => {
  fixture()
  expect(screen.queryByLabelText('Gantt resource wait for Alpha')).toBeNull()
})
