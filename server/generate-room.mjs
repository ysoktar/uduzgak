import { createRoomProvisioning } from './room-provisioning.mjs'

const { roomId, readerToken, writerToken, encryptionSecret, serverConfig } = createRoomProvisioning()
process.stdout.write(JSON.stringify({
  roomId,
  readerToken,
  writerToken,
  encryptionSecret,
  serverConfig,
}, null, 2) + '\n')
