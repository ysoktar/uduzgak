/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { createTask } from './domain/task'
import { ManualRoomTaskStaging } from './ManualRoomTaskStaging'

const room = 'a'.repeat(64)
const other = 'b'.repeat(64)
const task = createTask({ id:'task-1', projectId:'project-1', title:'Private', now:'2026-11-02T00:00:00.000Z' })
const check = () => screen.getByRole('button', { name:'Check local encrypted queue' })
function mount(onInspect = vi.fn(async () => ({ pending: 0 }))) {
  render(<ManualRoomTaskStaging tasks={[task]} onStage={vi.fn(async () => ['packet'])} onInspect={onInspect} />)
  return onInspect
}
function setRoom(value:string) { fireEvent.change(screen.getByLabelText('Local staging room ID'), { target:{value} }) }

it('TDD 927: zero pending packets is reported explicitly rather than hidden', async () => {
  mount()
  setRoom(room)
  fireEvent.click(check())
  await waitFor(() => expect(screen.getByText('0 encrypted changes pending locally.')).toBeTruthy())
})

it('TDD 928: changing rooms hides the previous room count', async () => {
  mount(vi.fn(async () => ({ pending: 2 })))
  setRoom(room)
  fireEvent.click(check())
  await waitFor(() => expect(screen.getByText('2 encrypted changes pending locally.')).toBeTruthy())
  setRoom(other)
  expect(screen.queryByText('2 encrypted changes pending locally.')).toBeNull()
})

it('TDD 929: entering an invalid room hides old counts without querying the backend', async () => {
  const inspect = mount(vi.fn(async () => ({ pending: 1 })))
  setRoom(room)
  fireEvent.click(check())
  await waitFor(() => expect(screen.getByText('1 encrypted changes pending locally.')).toBeTruthy())
  setRoom('invalid')
  expect(screen.queryByText('1 encrypted changes pending locally.')).toBeNull()
  expect(inspect).toHaveBeenCalledTimes(1)
})

it('TDD 930: clearing encryption key does not disclose it or trigger an outbox read', () => {
  const inspect = mount()
  setRoom(room)
  const key = screen.getByLabelText('Local staging encryption key') as HTMLInputElement
  fireEvent.change(key, { target:{value:'b'.repeat(64)} })
  fireEvent.change(key, { target:{value:''} })
  expect(key.type).toBe('password')
  expect(inspect).not.toHaveBeenCalled()
})

it('TDD 931: inspection is explicitly optional and staging stays usable without it', () => {
  render(<ManualRoomTaskStaging tasks={[task]} onStage={vi.fn(async () => ['packet'])} />)
  expect(screen.queryByRole('button', { name:'Check local encrypted queue' })).toBeNull()
  setRoom(room)
  fireEvent.change(screen.getByLabelText('Local staging encryption key'), { target:{value:'b'.repeat(64)} })
  fireEvent.change(screen.getByLabelText('Task to share'), { target:{value:task.id} })
  expect((screen.getByRole('button', { name:'Stage encrypted changes' }) as HTMLButtonElement).disabled).toBe(false)
})
