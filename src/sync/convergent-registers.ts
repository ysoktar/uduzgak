export interface RegisterChange {
  id: string
  actor: string
  clock: number
  entity: string
  field: string
  value: string | number | boolean | null
}
function valid(change: RegisterChange): void {
  if (!change || typeof change.id !== 'string' || !change.id ||
      typeof change.actor !== 'string' || !change.actor ||
      typeof change.entity !== 'string' || !change.entity ||
      typeof change.field !== 'string' || !change.field ||
      !Number.isSafeInteger(change.clock) || change.clock < 0 ||
      (change.value !== null && !['string','number','boolean'].includes(typeof change.value)) ||
      (typeof change.value === 'number' && !Number.isFinite(change.value)))
    throw new Error('Invalid register change')
}
function ordinal(a: string, b: string): number {
  return a === b ? 0 : a < b ? -1 : 1
}
function equivalent(a: RegisterChange, b: RegisterChange): boolean {
  return a.id === b.id && a.actor === b.actor && a.clock === b.clock &&
    a.entity === b.entity && a.field === b.field && a.value === b.value
}
function compare(a: RegisterChange, b: RegisterChange): number {
  return a.clock - b.clock || ordinal(a.actor, b.actor) || ordinal(a.id, b.id)
}
/** Immutable set-union of uniquely identified register operations. */
export function mergeRegisterChanges(
  left: readonly RegisterChange[], right: readonly RegisterChange[],
): RegisterChange[] {
  const seen = new Map<string, RegisterChange>()
  for (const change of [...left, ...right]) {
    valid(change)
    const previous = seen.get(change.id)
    if (previous && !equivalent(previous, change))
      throw new Error('Conflicting change identity')
    seen.set(change.id, { ...change })
  }
  return [...seen.values()].sort((a,b) => ordinal(a.id, b.id))
}
/** Experimental scalar-register CRDT: nested values and Workspace replay are not yet supported. */
export function materializeRegisters(
  changes: readonly RegisterChange[],
): Record<string, Record<string, string | number | boolean | null>> {
  const byEntity = new Map<string, Map<string, RegisterChange>>()
  for (const change of mergeRegisterChanges(changes, [])) {
    const fields = byEntity.get(change.entity) ?? new Map<string, RegisterChange>()
    const prior = fields.get(change.field)
    if (!prior || compare(change, prior) > 0) fields.set(change.field, change)
    byEntity.set(change.entity, fields)
  }
  const output: Record<string, Record<string, string | number | boolean | null>> = Object.create(null)
  for (const [entity, fields] of byEntity) {
    const deletion = fields.get('$deleted')
    const latestEdit = [...fields.values()].filter(change => change.field !== '$deleted')
      .sort(compare).at(-1)
    if (deletion?.value === true && (!latestEdit || compare(deletion, latestEdit) >= 0)) continue
    const result: Record<string, string | number | boolean | null> = Object.create(null)
    for (const [field, change] of fields) {
      if (field !== '$deleted') result[field] = change.value
    }
    output[entity] = result
  }
  return output
}
