import { expect, it } from 'vitest'
import { guardWorkspaceCommands } from './guarded-workspace-commands'

it('TDD 687: successful command returns its value and clears prior error', () => {
  const events: Array<string | null> = []
  const guarded = guardWorkspaceCommands({ add: (n: number) => n + 1 }, msg => events.push(msg))
  expect(guarded.add(2)).toBe(3)
  expect(events).toEqual([null])
})

it('TDD 688: failed command reports an Error message and returns undefined', () => {
  const events: Array<string | null> = []
  const guarded = guardWorkspaceCommands({ fail: () => { throw new Error('Invalid task') } }, msg => events.push(msg))
  expect(guarded.fail()).toBeUndefined()
  expect(events).toEqual(['Invalid task'])
})

it('TDD 689: non-Error exceptions use a stable fallback', () => {
  const events: Array<string | null> = []
  const guarded = guardWorkspaceCommands({ fail: () => { throw 'nope' } }, msg => events.push(msg))
  expect(guarded.fail()).toBeUndefined()
  expect(events).toEqual(['Workspace command failed'])
})

it('TDD 690: arguments pass through unchanged', () => {
  const args: unknown[][] = []
  const guarded = guardWorkspaceCommands({ save: (...input: unknown[]) => args.push(input) }, () => {})
  guarded.save('task', 42, false)
  expect(args).toEqual([['task', 42, false]])
})

it('TDD 691: reading a non-function property does not trigger an error callback', () => {
  const events: Array<string | null> = []
  const guarded = guardWorkspaceCommands({ version: 1 }, msg => events.push(msg))
  expect(guarded.version).toBe(1)
  expect(events).toEqual([])
})
