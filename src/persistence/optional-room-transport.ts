import { createEncryptedChangeClient } from './encrypted-change-client'
import { createEphemeralRelayChangeClient } from './ephemeral-relay-client'

export type OptionalRoomTransport = 'durable' | 'temporary'
/** Choose an opt-in transport. Neither option initiates a network request. */
export function createOptionalRoomTransport(
  mode:OptionalRoomTransport,url:string,token:string,fetchImpl:typeof fetch=fetch,
) {
  if(mode==='durable')return createEncryptedChangeClient(url,token,fetchImpl)
  if(mode==='temporary')return createEphemeralRelayChangeClient(url,token,fetchImpl)
  throw new Error('Unsupported remote transport')
}
