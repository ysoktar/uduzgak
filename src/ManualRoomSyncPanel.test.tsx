/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ManualRoomSyncPanel } from './ManualRoomSyncPanel'

it('TDD 852: manual sync does not run on mount', () => {
  const onPreview = vi.fn(async () => [])
  render(<ManualRoomSyncPanel onPreview={onPreview} />)
  expect(onPreview).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Preview encrypted changes' })).toBeTruthy()
})
it('TDD 853: keys and bearer tokens use masked inputs', () => {
  render(<ManualRoomSyncPanel onPreview={vi.fn(async () => [])} />)
  expect((screen.getByLabelText('Room encryption key') as HTMLInputElement).type).toBe('password')
  expect((screen.getByLabelText('Room access token') as HTMLInputElement).type).toBe('password')
})
it('TDD 854: manual preview forwards credentials only after explicit action', () => {
  const onPreview=vi.fn(async()=>[])
  render(<ManualRoomSyncPanel onPreview={onPreview} />)
  fireEvent.change(screen.getByLabelText('Server URL'),{target:{value:'https://sync.example.org'}})
  fireEvent.change(screen.getByLabelText('Room ID'),{target:{value:'a'.repeat(64)}})
  fireEvent.change(screen.getByLabelText('Room encryption key'),{target:{value:'b'.repeat(64)}})
  fireEvent.change(screen.getByLabelText('Room access token'),{target:{value:'writer-token'}})
  fireEvent.click(screen.getByRole('button',{name:'Preview encrypted changes'}))
  expect(onPreview).toHaveBeenCalledWith({
    serverUrl:'https://sync.example.org',room:'a'.repeat(64),
    secret:'b'.repeat(64),token:'writer-token',
  })
})
it('TDD 855: credentials are not printed in the read-only panel', () => {
  const { container }=render(<ManualRoomSyncPanel onPreview={vi.fn(async()=>[])} />)
  fireEvent.change(screen.getByLabelText('Room access token'),{target:{value:'top-secret'}})
  expect(container.textContent).not.toContain('top-secret')
})
it('TDD 856: incomplete configuration prevents accidental network requests', () => {
  const onPreview=vi.fn(async()=>[])
  render(<ManualRoomSyncPanel onPreview={onPreview} />)
  expect((screen.getByRole('button',{name:'Preview encrypted changes'}) as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(screen.getByRole('button',{name:'Preview encrypted changes'}))
  expect(onPreview).not.toHaveBeenCalled()
})
