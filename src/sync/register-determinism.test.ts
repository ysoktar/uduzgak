import { expect, it } from 'vitest'
import { mergeRegisterChanges, materializeRegisters, type RegisterChange } from './convergent-registers'
const edit = (id: string, actor: string, clock: number, value: string): RegisterChange =>
  ({ id, actor, clock, entity: 'task', field: 'title', value })
it('TDD 837: non-ASCII actor ties use locale-independent code-point ordering', () => {
  const a = edit('umlaut', 'ä', 5, 'umlaut')
  const z = edit('zed', 'z', 5, 'zed')
  expect(materializeRegisters(mergeRegisterChanges([a], [z])).task.title).toBe('umlaut')
  expect(materializeRegisters(mergeRegisterChanges([z], [a])).task.title).toBe('umlaut')
})
it('TDD 838: greater logical clock overrides actor-name ordering', () => {
  expect(materializeRegisters(mergeRegisterChanges([edit('one','z',1,'old')], [edit('two','a',2,'new')])).task.title).toBe('new')
})
it('TDD 839: same actor and logical clock use change identity as deterministic tie-break', () => {
  const left=edit('a:1','a',4,'first'),right=edit('a:2','a',4,'second')
  expect(materializeRegisters(mergeRegisterChanges([left],[right])).task.title).toBe('second')
})
it('TDD 840: equivalent replay records are idempotent regardless of property insertion order', () => {
  const first=edit('a:1','a',1,'alpha')
  const equivalent={ value:'alpha', field:'title', entity:'task', clock:1, actor:'a', id:'a:1' } as RegisterChange
  expect(mergeRegisterChanges([first],[equivalent])).toHaveLength(1)
})
it('TDD 841: distinct payloads under the same ID still raise a conflict', () => {
  expect(() => mergeRegisterChanges([edit('a:1','a',1,'first')],[edit('a:1','a',1,'tampered')]))
    .toThrow('Conflicting change identity')
})
