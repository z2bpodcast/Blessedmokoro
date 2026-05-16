// Fixes all 6 gear pages — removes the broken injection
// Run from repo root: node fix-gear-autosave.js

const fs = require('fs')

const BAD_BLOCK = `// CHECK SAVED STATE FIRST — never regenerate if we already have output
      const _sid = sessionStorage.getItem('v3_current_session_id') ?? ''
      if (_sid) {
        const saved = await loadGearOutput(_sid, `

for (let g = 1; g <= 6; g++) {
  const path = `app/ai-income/gear/${g}/page.tsx`
  if (!fs.existsSync(path)) { console.log(`SKIP: ${path}`); continue }

  let c = fs.readFileSync(path, 'utf8')

  // Find the broken pattern: "= await // CHECK SAVED..."
  // The patch inserted: await // CHECK... const _sid... fetch('/api/gear/N'
  // We need to: 1) remove the broken block, 2) remove bad import
  
  // Fix 1: Remove broken await + injected block
  const brokenAwait = new RegExp(
    `= await // CHECK SAVED STATE FIRST[^]*?fetch\\(['"]/api/gear/${g}['"]`,
    's'
  )
  if (brokenAwait.test(c)) {
    c = c.replace(brokenAwait, `= await fetch('/api/gear/${g}'`)
    console.log(`  ✅ Gear ${g}: removed broken injection`)
  } else {
    // Try alternate pattern (Gear 1 has different structure)
    const altPattern = new RegExp(
      `await // CHECK SAVED STATE FIRST[^]*?fetch\\(['"]/api/gear/${g}['"]`,
      's'
    )
    if (altPattern.test(c)) {
      c = c.replace(altPattern, `await fetch('/api/gear/${g}'`)
      console.log(`  ✅ Gear ${g}: removed broken injection (alt pattern)`)
    } else {
      console.log(`  -- Gear ${g}: pattern not found, checking manually`)
      // Show the problematic area
      const idx = c.indexOf('CHECK SAVED STATE FIRST')
      if (idx > -1) {
        console.log(`     Found at char ${idx}: ${c.slice(idx-20, idx+100)}`)
      }
    }
  }

  // Fix 2: Remove bad import that was added
  c = c.replace(
    `import { loadGearOutput, saveGearOutput } from '@/lib/v3/gear-state-manager'\n`,
    ''
  )

  // Fix 3: Remove broken sessionId state if added incorrectly
  c = c.replace(
    "const [sessionId, setSessionId] = useState<string>('')\n  const [loading,",
    "const [loading,"
  )

  fs.writeFileSync(path, c, 'utf8')
}

console.log('\nAll gear pages cleaned. Now verifying...')
for (let g = 1; g <= 6; g++) {
  const path = `app/ai-income/gear/${g}/page.tsx`
  if (!fs.existsSync(path)) continue
  const c = fs.readFileSync(path, 'utf8')
  const hasBroken = c.includes('CHECK SAVED STATE FIRST')
  console.log(`  Gear ${g}: ${hasBroken ? '❌ STILL BROKEN' : '✅ Clean'}`)
}
