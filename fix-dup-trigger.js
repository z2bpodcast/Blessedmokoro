const fs = require('fs')
let c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8')
const lines = c.split('\n')
let found = false
const fixed = lines.filter(l => {
  if (l.includes('primaryTrigger?:') && found) return false
  if (l.includes('primaryTrigger?:')) { found = true; return true }
  return true
})
fs.writeFileSync('lib/v3/gear1-engine.ts', fixed.join('\n'))
console.log('done - removed duplicate')
