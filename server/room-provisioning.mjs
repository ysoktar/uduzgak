import { randomBytes } from 'node:crypto'

/** Provision a room without a central account or shared master credential. */
export function createRoomProvisioning() {
  const roomId = randomBytes(32).toString('hex')
  const readerToken = randomBytes(32).toString('hex')
  const writerToken = randomBytes(32).toString('hex')
  const encryptionSecret = randomBytes(32).toString('hex')
  return {
    roomId,
    readerToken,
    writerToken,
    encryptionSecret,
    serverConfig: {
      [roomId]: { readers: [readerToken], writers: [writerToken] },
    },
  }
}
