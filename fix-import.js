const fs = require('fs')
let c = fs.readFileSync('lib/v3/gear1-engine.ts', 'utf8')
if (c.includes('coach-manlaw-prompt')) {
  console.log('import already present')
} else {
  c = "import { COACH_MANLAW_SYSTEM_PROMPT } from '@/lib/v3/coach-manlaw-prompt'\n" + c
  fs.writeFileSync('lib/v3/gear1-engine.ts', c)
  console.log('import restored')
}
