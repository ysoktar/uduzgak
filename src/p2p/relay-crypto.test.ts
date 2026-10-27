import { expect, it } from 'vitest'
import { createRelayInvitation, openRelayChange, sealRelayChange } from './relay-crypto'

const bytes = new TextEncoder()
it('TDD 722: invitation creates independent high-entropy room and key identifiers', () => {
  const first = createRelayInvitation()
  const second = createRelayInvitation()
  expect(first.roomId).toMatch(/^[a-f0-9]{64}$/)
  expect(first.secret).toMatch(/^[a-f0-9]{64}$/)
  expect(first.roomId).not.toBe(first.secret)
  expect(first.roomId).not.toBe(second.roomId)
})
it('TDD 723: an encrypted change is recoverable only by a holder of the key', async () => {
  const invitation = createRelayInvitation()
  const plain = bytes.encode('private Workspace change')
  const sealed = await sealRelayChange(invitation.secret, plain)
  expect([...sealed]).not.toEqual([...plain])
  expect(new TextDecoder().decode(await openRelayChange(invitation.secret, sealed)))
    .toBe('private Workspace change')
})
it('TDD 724: the wrong key cannot read the change', async () => {
  const first = createRelayInvitation()
  const second = createRelayInvitation()
  const sealed = await sealRelayChange(first.secret, bytes.encode('secret'))
  await expect(openRelayChange(second.secret, sealed)).rejects.toThrow('Invalid sealed relay change')
})
it('TDD 725: tampering with ciphertext or nonce is rejected', async () => {
  const invitation = createRelayInvitation()
  const tampered = await sealRelayChange(invitation.secret, bytes.encode('private'))
  tampered[14] ^= 1
  await expect(openRelayChange(invitation.secret, tampered)).rejects.toThrow('Invalid sealed relay change')
})
it('TDD 726: malformed keys and unsupported sealed envelopes are rejected', async () => {
  await expect(sealRelayChange('not-a-key', bytes.encode('data'))).rejects.toThrow('Invalid relay secret')
  await expect(openRelayChange(createRelayInvitation().secret, new Uint8Array([2]))).rejects.toThrow('Invalid sealed relay change')
})
