import { expect, it } from 'vitest'
import * as order from './manual-order'

type Item = { id: string; group: string }
const peers = (a: Item, b: Item) => a.group === b.group

it('moves a dragged item before a later peer without disturbing interleaved groups', () => {
  const items: Item[] = [
    { id: 'a', group: 'one' }, { id: 'x', group: 'two' },
    { id: 'b', group: 'one' }, { id: 'c', group: 'one' },
  ]
  const move = (order as typeof order & {
    moveItemBeforePeer?: (items: Item[], source: string, target: string, isPeer: typeof peers) => Item[]
  }).moveItemBeforePeer
  expect(typeof move).toBe('function')
  expect(move!(items, 'a', 'c', peers).map((item) => item.id)).toEqual(['b', 'x', 'a', 'c'])
  expect(items.map((item) => item.id)).toEqual(['a', 'x', 'b', 'c'])
})
