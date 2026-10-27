import { loadViewPreferences } from './view-preferences-storage'
import { createWorkspaceBackupDocument, serializeWorkspaceBackup } from './workspace-backup'
import { loadWorkspace, type KeyValueStore } from './workspace-storage'

/**
 * Non-destructive first-stage seed for a future local-first document repository.
 * The destination owns persistence. Existing Workspace keys remain unchanged.
 */
export async function seedLocalFirstReplica(
  source: KeyValueStore,
  exportedAt: string,
  writeReplica: (serializedBackup: string) => Promise<void>,
): Promise<void> {
  const workspace = loadWorkspace(source)
  const preferences = loadViewPreferences(source)
  const backup = createWorkspaceBackupDocument(workspace, preferences, exportedAt)
  await writeReplica(serializeWorkspaceBackup(backup))
}
