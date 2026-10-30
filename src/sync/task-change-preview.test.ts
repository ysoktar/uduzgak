import { expect, it } from 'vitest'
import { createTask } from '../domain/task'
import { previewTaskRegisterChanges } from './task-change-preview'
const task = createTask({ id: 'task-1', projectId: 'project', title: 'Original', now: '2026-10-30T10:00:00.000Z' })
it('TDD 847: a changed title is presented without mutating the existing Task', () => {
  const preview=previewTaskRegisterChanges([task], { 'task-1': {title:'Updated'} })
  expect(preview).toEqual([{ taskId:'task-1', field:'title', before:'Original', after:'Updated' }])
  expect(task.title).toBe('Original')
})
it('TDD 848: valid status and priority updates are supported', () => {
  const preview=previewTaskRegisterChanges([task], { 'task-1': {status:'doing',priority:'high'} })
  expect(preview.map(change=>change.field)).toEqual(['priority','status'])
})
it('TDD 849: unknown Tasks are rejected rather than silently creating records', () => {
  expect(()=>previewTaskRegisterChanges([task], {'unknown':{title:'Remote'}}))
    .toThrow('Unknown Task in remote preview')
})
it('TDD 850: unsupported and invalid fields are rejected', () => {
  expect(()=>previewTaskRegisterChanges([task], {'task-1':{customFieldValues:'surprise'}}))
    .toThrow('Unsupported remote Task field')
  expect(()=>previewTaskRegisterChanges([task], {'task-1':{status:'not-a-status'}}))
    .toThrow('Invalid remote Task value')
})
it('TDD 851: unchanged fields are omitted and original Tasks stay immutable', () => {
  const before=JSON.stringify(task)
  expect(previewTaskRegisterChanges([task], {'task-1':{title:'Original'}})).toEqual([])
  expect(JSON.stringify(task)).toBe(before)
})
