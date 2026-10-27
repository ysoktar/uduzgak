import { createRoomProvisioning } from './room-provisioning.mjs'

const { roomId, readerToken, writerToken, serverConfig } = createRoomProvisioning()
process.stdout.write(JSON.stringify({
  roomId,
  readerToken,
  writerToken,
  serverConfig,
}, null, 2) + '\n')
