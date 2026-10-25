import { expect, it } from 'vitest'
import { createTask } from './task'
import { emptyWorkspace, workspaceReducer } from './workspace'

it('rejects invalid cross-project and self Task drops without mutating Workspace', () => {
  const a=createTask({id:'a',projectId:'project-a',title:'A',now:'2026-10-26T00:00:00.000Z'})
  const b=createTask({id:'b',projectId:'project-b',title:'B',now:'2026-10-26T00:00:00.000Z'})
  const state={...emptyWorkspace,tasks:[a,b]}
  const before=JSON.stringify(state)
  expect(()=>workspaceReducer(state,{type:'task/reordered',taskId:'a',targetTaskId:'b',placement:'before'})).toThrow('Cannot reorder Tasks outside the same sibling group')
  expect(()=>workspaceReducer(state,{type:'task/reordered',taskId:'a',targetTaskId:'a',placement:'after'})).toThrow('Cannot reorder a Task onto itself')
  expect(JSON.stringify(state)).toBe(before)
})
