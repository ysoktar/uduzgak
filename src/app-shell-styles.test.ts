import {readFileSync} from 'node:fs'
import {expect,it} from 'vitest'
const css=readFileSync('src/styles.css','utf8')
it('styles a distinct responsive application header',()=>{
 expect(css).toContain('.workspace-app-header')
 expect(css).toContain('max-width: 1120px')
 expect(css).toContain('padding-inline:')
})

it('wraps long Task table content without horizontal page overflow',()=>{
 expect(css).toContain('.task-table-summary')
 expect(css).toContain('table-layout: fixed')
 expect(css).toContain('overflow-wrap: anywhere')
})
