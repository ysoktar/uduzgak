/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { createTask } from './domain/task'
import { ManualRoomTaskStaging } from './ManualRoomTaskStaging'

const room = 'a'.repeat(64)
const secret = 'b'.repeat(64)
const task = createTask({ id: 'task-1', projectId: 'project-1', title: 'Example', now: '2026-11-02T00:00:00.000Z' })
const stageButton = () => screen.getByRole('button', { name: 'Stage encrypted changes' }) as HTMLButtonElement

function configure() {
  fireEvent.change(screen.getByLabelText('Local staging room ID'), { target: { value: room } })
  fireEvent.change(screen.getByLabelText('Local staging encryption key'), { target: { value: secret } })
  fireEvent.change(screen.getByLabelText('Task to share'), { target: { value: task.id } })
}

it('TDD 892: rendering a staging section never queues or uploads data', () => {
  const onStage = vi.fn(async () => ['id'])
  render(<ManualRoomTaskStaging tasks={[task]} onStage={onStage} />)
  expect(stageButton().disabled).toBe(true)
  expect(onStage).not.toHaveBeenCalled()
  expect(screen.getByText(/Staging does not upload changes/)).toBeTruthy()
})

it('TDD 893: a valid room and key allow explicit encrypted staging only', async () => {
  const onStage = vi.fn(async () => ['packet-id'])
  render(<ManualRoomTaskStaging tasks={[task]} onStage={onStage} />)
  configure()
  expect(stageButton().disabled).toBe(false)
  fireEvent.click(stageButton())
  await waitFor(() => expect(onStage).toHaveBeenCalledTimes(1))
  expect(onStage).toHaveBeenCalledWith({ room, secret }, task, ['title'])
})

it('TDD 894: malformed room or key cannot trigger staging', () => {
  const onStage = vi.fn(async () => [])
  render(<ManualRoomTaskStaging tasks={[task]} onStage={onStage} />)
  configure()
  fireEvent.change(screen.getByLabelText('Local staging room ID'), { target: { value: 'invalid' } })
  expect(stageButton().disabled).toBe(true)
  fireEvent.click(stageButton())
  expect(onStage).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('Local staging room ID'), { target: { value: room } })
  fireEvent.change(screen.getByLabelText('Local staging encryption key'), { target: { value: 'invalid' } })
  expect(stageButton().disabled).toBe(true)
  expect(onStage).not.toHaveBeenCalled()
})

it('TDD 895: switching the room clears prior staging success feedback', async () => {
  const onStage = vi.fn(async () => ['packet-id'])
  render(<ManualRoomTaskStaging tasks={[task]} onStage={onStage} />)
  configure()
  fireEvent.click(stageButton())
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('1 encrypted change'))
  fireEvent.change(screen.getByLabelText('Local staging room ID'), { target: { value: 'c'.repeat(64) } })
  expect(screen.queryByRole('status')).toBeNull()
  expect(onStage).toHaveBeenCalledTimes(1)
})

it('TDD 896: rejected staging does not show a success message or expose the encryption key', async () => {
  const onStage = vi.fn(async () => { throw new Error('secret diagnostic') })
  render(<ManualRoomTaskStaging tasks={[task]} onStage={onStage} />)
  configure()
  fireEvent.click(stageButton())
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not stage encrypted changes'))
  expect(screen.queryByRole('status')).toBeNull()
  expect(screen.getByLabelText('Local staging encryption key').getAttribute('type')).toBe('password')
  expect(screen.getByRole('alert').textContent).not.toContain(secret)
})
