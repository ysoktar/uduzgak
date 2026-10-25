export type MoveDirection = 'up' | 'down'

export function moveItemWithinGroup<T extends { id: string }>(
  items: T[],
  itemId: string,
  direction: MoveDirection,
  isPeer: (candidate: T, target: T) => boolean,
): T[] {
  const next = [...items]
  const targetIndex = items.findIndex((item) => item.id === itemId)

  if (targetIndex < 0) {
    return next
  }

  const target = items[targetIndex]
  const peerIndexes = items.flatMap((item, index) =>
    isPeer(item, target) ? [index] : [],
  )
  const peerPosition = peerIndexes.indexOf(targetIndex)
  const destinationPeerPosition =
    direction === 'up' ? peerPosition - 1 : peerPosition + 1
  const destinationIndex = peerIndexes[destinationPeerPosition]

  if (destinationIndex === undefined) {
    return next
  }

  ;[next[targetIndex], next[destinationIndex]] = [
    next[destinationIndex],
    next[targetIndex],
  ]

  return next
}

/** Reorder only the matching peer slots, leaving other groups untouched. */
export function moveItemBeforePeer<T extends { id: string }>(
  items: T[],
  sourceId: string,
  targetId: string,
  isPeer: (candidate: T, target: T) => boolean,
): T[] {
  const source = items.find((item) => item.id === sourceId)
  const target = items.find((item) => item.id === targetId)
  if (!source || !target || sourceId === targetId || !isPeer(source, target)) return [...items]
  const slots = items.flatMap((item, index) => isPeer(item, source) ? [index] : [])
  const peers = slots.map((index) => items[index])
  const sourceIndex = peers.findIndex((item) => item.id === sourceId)
  const targetIndex = peers.findIndex((item) => item.id === targetId)
  if (sourceIndex < 0 || targetIndex < 0) return [...items]
  const [moved] = peers.splice(sourceIndex, 1)
  peers.splice(peers.findIndex((item) => item.id === targetId), 0, moved)
  const next = [...items]
  slots.forEach((index, position) => { next[index] = peers[position] })
  return next
}
