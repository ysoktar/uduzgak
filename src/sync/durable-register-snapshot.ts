import type { ChangeOutboxBackend } from '../persistence/durable-change-outbox'
import { mergeRegisterChanges, materializeRegisters, type RegisterChange } from './convergent-registers'

const roomPattern = /^[a-f0-9]{64}$/
/** Read-only validated register projection. Never mutates the saved Workspace. */
export async function loadDurableRegisters(
  backend: Pick<ChangeOutboxBackend, 'get' | 'keys'>,
  room: string,
): Promise<Record<string, Record<string, string | number | boolean | null>>> {
  if (!roomPattern.test(room)) throw new Error('Invalid change identity')
  const prefix = `register-change:${room}:`
  const keys = (await backend.keys()).filter(key => key.startsWith(prefix)).sort()
  const changes: RegisterChange[] = []
  for (const key of keys) {
    const stored = await backend.get(key)
    if (stored === undefined) throw new Error('Missing register record')
    const checked = mergeRegisterChanges([stored as RegisterChange], [])[0]
    if (key.slice(prefix.length) !== checked.id) throw new Error('Stored register identity mismatch')
    changes.push(checked)
  }
  return materializeRegisters(mergeRegisterChanges(changes, []))
}
