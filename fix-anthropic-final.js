const fs = require('fs')
let c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8')
const lines = c.split('\n')
const result = []
let skip = false

for (let i = 0; i < lines.length; i++) {
  const l = lines[i]
  if (l.includes('api.anthropic.com')) { skip = true }
  if (skip) {
    if (l.includes("content?.[0]?.text")) { skip = false }
    continue
  }
  result.push(l)
}

fs.writeFileSync('lib/v3/gear1-engine.ts', result.join('\n'))
console.log('Anthropic lines removed')
console.log('Remaining anthropic refs:', result.filter(l => l.includes('anthropic')).length)
