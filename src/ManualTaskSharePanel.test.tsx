/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { createTask } from './domain/task'
import { ManualTaskSharePanel } from './ManualTaskSharePanel'

const task = createTask({ id: 'task-1', projectId: 'project-1', title: 'Example', now: '2026-11-02T00:00:00.000Z' })
const another = createTask({ id: 'task-2', projectId: 'project-1', title: 'Second', now: '2026-11-02T00:00:00.000Z' })
const button = () => screen.getByRole('button', { name: 'Stage encrypted changes' }) as HTMLButtonElement

it('TDD 887: rendering never stages or transmits a Task', () => {
  const onStage = vi.fn(async () => ['packet-1'])
  render(<ManualTaskSharePanel tasks={[task]} onStage={onStage} />)
  expect(onStage).not.toHaveBeenCalled()
  expect(button().disabled).toBe(true)
})

it('TDD 888: staging selected fields uses only the selected Task', async () => {
  const onStage = vi.fn(async () => ['packet-1'])
  render(<ManualTaskSharePanel tasks={[task, another]} onStage={onStage} />)
  fireEvent.change(screen.getByLabelText('Task to share'), { target: { value: another.id } })
  fireEvent.click(screen.getByLabelText('Share status'))
  fireEvent.click(screen.getByLabelText('Share priority'))
  fireEvent.click(button())
  await waitFor(() => expect(onStage).toHaveBeenCalledTimes(1))
  expect(onStage).toHaveBeenCalledWith(another, ['status', 'priority'])
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('1 encrypted change'))
})

it('TDD 889: no Task or no selected fields keeps the action disabled', () => {
  const onStage = vi.fn(async () => [])
  render(<ManualTaskSharePanel tasks={[task]} onStage={onStage} />)
  fireEvent.click(screen.getByLabelText('Share title'))
  expect(button().disabled).toBe(true)
  fireEvent.change(screen.getByLabelText('Task to share'), { target: { value: task.id } })
  expect(button().disabled).toBe(false)
  fireEvent.click(screen.getByLabelText('Share title'))
  expect(button().disabled).toBe(true)
  expect(onStage).not.toHaveBeenCalled()
})

it('TDD 890: a pending stage operation blocks repeated clicks', async () => {
  let finish: ((value: string[]) => void) | undefined
  const onStage = vi.fn(() => new Promise<string[]>(resolve => { finish = resolve }))
  render(<ManualTaskSharePanel tasks={[task]} onStage={onStage} />)
  fireEvent.change(screen.getByLabelText('Task to share'), { target: { value: task.id } })
  fireEvent.click(button())
  expect(button().disabled).toBe(true)
  expect(onStage).toHaveBeenCalledTimes(1)
  finish?.(['packet-1'])
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('1 encrypted change'))
})

it('TDD 891: failed staging reports an error without claiming encrypted changes', async () => {
  const onStage = vi.fn(async () => { throw new Error('quota exceeded') })
  render(<ManualTaskSharePanel tasks={[task]} onStage={onStage} />)
  fireEvent.change(screen.getByLabelText('Task to share'), { target: { value: task.id } })
  fireEvent.click(button())
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Could not stage encrypted changes'))
  expect(screen.queryByRole('status')).toBeNull()
})
