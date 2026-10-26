import {readFileSync} from 'node:fs'
import {expect,it} from 'vitest'
it('gives Board drop columns responsive touch-sized targets',()=>{
 const css=readFileSync('src/styles.css','utf8')
 expect(css).toContain('.task-board-heading[aria-label]')
 expect(css).toContain('min-height: 44px')
 expect(css).toContain('cursor: move')
})
