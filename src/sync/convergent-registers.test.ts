import { expect, it } from 'vitest'
import { mergeRegisterChanges, materializeRegisters, type RegisterChange } from './convergent-registers'

const a: RegisterChange = { id: 'a:1', actor: 'a', clock: 1, entity: 'task-1', field: 'title', value: 'Alpha' }
const b: RegisterChange = { id: 'b:1', actor: 'b', clock: 1, entity: 'task-1', field: 'status', value: 'doing' }
it('TDD 822: offline edits to independent fields converge without loss', () => {
 const merged = mergeRegisterChanges([a], [b])
 expect(materializeRegisters(merged)['task-1']).toEqual({ title: 'Alpha', status: 'doing' })
})
it('TDD 823: concurrent edits to one field resolve deterministically', () => {
 const conflict: RegisterChange = { ...a, id: 'b:2', actor: 'b', value: 'Beta' }
 expect(materializeRegisters(mergeRegisterChanges([a],[conflict]))['task-1'].title).toBe('Beta')
 expect(materializeRegisters(mergeRegisterChanges([conflict],[a]))['task-1'].title).toBe('Beta')
})
it('TDD 824: repeated and reordered messages are idempotent', () => {
 const left = mergeRegisterChanges([a,b],[b,a])
 const right = mergeRegisterChanges([b],[a])
 expect(left).toEqual(right)
 expect(left).toHaveLength(2)
})
it('TDD 825: two different changes using one ID cannot silently overwrite each other', () => {
 expect(() => mergeRegisterChanges([a],[{...a,value:'malicious'}]))
   .toThrow('Conflicting change identity')
})
it('TDD 826: a concurrent deletion prevents older values from resurrecting', () => {
 const deletion: RegisterChange = { id: 'b:3', actor: 'b', clock: 2, entity: 'task-1', field: '$deleted', value: true }
 const result = materializeRegisters(mergeRegisterChanges([a,b],[deletion]))
 expect(result['task-1']).toBeUndefined()
})
