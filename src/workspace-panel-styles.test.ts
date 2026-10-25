import {readFileSync} from 'node:fs'
import {expect,it} from 'vitest'
it('renders accessible responsive Workspace disclosure buttons',()=>{
 const css=readFileSync('src/styles.css','utf8')
 expect(css).toContain('.workspace-disclosure-button')
 expect(css).toContain('min-height: 44px')
 expect(css).toContain('max-width: 100%')
})
