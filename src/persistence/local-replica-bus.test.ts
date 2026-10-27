import { expect, it, vi } from 'vitest'
import { LocalReplicaBus } from './local-replica-bus'

type Handler = (event: { data: unknown }) => void

function channel() {
  const handlers = new Set<Handler>()
  const posted: unknown[] = []
  const close = vi.fn()
  const transport = {
    postMessage: (message: unknown) => { posted.push(message) },
    addEventListener: (_type: 'message', handler: Handler) => { handlers.add(handler) },
    removeEventListener: (_type: 'message', handler: Handler) => { handlers.delete(handler) },
    close,
  }
  const emit = (data: unknown) => { for (const handler of handlers) handler({ data }) }
  return { transport, posted, close, emit }
}

const valid = { version: 1, workspaceId: 'w1', changeId: 'c1', payload: 'encrypted-change' }

it('TDD 727: publishes a versioned change on the local channel', () => {
  const c = channel()
  const bus = new LocalReplicaBus('w1', c.transport)
  bus.publish('c1', 'encrypted-change')
  expect(c.posted).toEqual([valid])
})

it('TDD 728: delivers received changes in the same workspace', () => {
  const c = channel()
  const bus = new LocalReplicaBus('w1', c.transport)
  const receive = vi.fn()
  bus.subscribe(receive)
  c.emit(valid)
  expect(receive).toHaveBeenCalledWith(valid)
})

it('TDD 729: ignores duplicate change identifiers', () => {
  const c = channel()
  const bus = new LocalReplicaBus('w1', c.transport)
  const receive = vi.fn()
  bus.subscribe(receive)
  c.emit(valid)
  c.emit(valid)
  expect(receive).toHaveBeenCalledOnce()
})

it('TDD 730: ignores messages from another workspace or malformed payloads', () => {
  const c = channel()
  const bus = new LocalReplicaBus('w1', c.transport)
  const receive = vi.fn()
  bus.subscribe(receive)
  c.emit({ ...valid, workspaceId: 'other' })
  c.emit({ ...valid, payload: 42 })
  expect(receive).not.toHaveBeenCalled()
})

it('TDD 731: closing detaches listeners and closes the underlying channel', () => {
  const c = channel()
  const bus = new LocalReplicaBus('w1', c.transport)
  const receive = vi.fn()
  bus.subscribe(receive)
  bus.close()
  c.emit(valid)
  expect(receive).not.toHaveBeenCalled()
  expect(c.close).toHaveBeenCalledOnce()
})
