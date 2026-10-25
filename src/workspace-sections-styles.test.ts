import {readFileSync} from 'node:fs'
import {expect,it} from 'vitest'
it('wraps Workspace section links with accessible keyboard focus styling',()=>{
 const css=readFileSync('src/styles.css','utf8')
 expect(css).toContain('.workspace-section-nav')
 expect(css).toContain('flex-wrap: wrap')
 expect(css).toContain('.workspace-section-nav a:focus-visible')
})
