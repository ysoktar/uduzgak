import type { Task } from '../domain/task'
import type { ChangeOutboxBackend } from '../persistence/durable-change-outbox'
import type { createEncryptedInbox } from '../persistence/encrypted-inbox'
import { pullEncryptedChanges } from '../persistence/pull-encrypted-changes'
import { consumeRegisterInbox } from './consume-register-inbox'
import { loadDurableRegisters } from './durable-register-snapshot'
import { previewTaskRegisterChanges, type PreviewedTaskChange } from './task-change-preview'
type Inbox=ReturnType<typeof createEncryptedInbox>
type Downloader={download(room:string):Promise<Array<{id:string;ciphertext:Uint8Array}>>}
/** Explicit read-only remote preview. Never uploads or applies to Workspace state. */
export async function previewRemoteRoom(
  inbox:Inbox,backend:ChangeOutboxBackend,client:Downloader,
  room:string,secret:string,tasks:readonly Task[],
):Promise<PreviewedTaskChange[]>{
  await pullEncryptedChanges(inbox,client,room)
  await consumeRegisterInbox(inbox,backend,room,secret)
  const snapshot=await loadDurableRegisters(backend,room)
  return previewTaskRegisterChanges(tasks,snapshot)
}
