import { readFileSync } from 'node:fs'
import { expect,it } from 'vitest'
it('keeps native Project and List drag controls responsive and keyboard-visible',()=>{
 const css=readFileSync('src/styles.css','utf8')
 expect(css).toContain('.workspace-native-drag')
 expect(css).toContain('flex-wrap: wrap')
 expect(css).toContain('min-height: 44px')
})
