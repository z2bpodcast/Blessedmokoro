const fs = require('fs')
const content = fs.readFileSync('lib/v3/gear2-engine.ts', 'utf8')
const lines = content.split('\n')

// Find and fix line with keyProblems
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('keyProblems') && lines[i].includes('join')) {
    lines[i] = 'Key problems solved: ${(intent.keyProblems ?? []).join(" · ")}'
    console.log('Fixed line', i + 1, ':', lines[i])
    break
  }
}

fs.writeFileSync('lib/v3/gear2-engine.ts', lines.join('\n'))
console.log('done')
