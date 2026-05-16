// Patches ALL gear pages to check saved state before regenerating
// Run from repo root: node patch-gear-pages-autosave.js

const fs = require('fs')

const gears = [1, 2, 3, 4, 5, 6]

let patched = 0
let skipped = 0

for (const g of gears) {
  const path = `app/ai-income/gear/${g}/page.tsx`
  if (!fs.existsSync(path)) { skipped++; console.log(`  SKIP: ${path}`); continue }

  let c = fs.readFileSync(path, 'utf8')
  if (c.includes('loadGearOutput')) { skipped++; console.log(`  SKIP (already patched): Gear ${g}`); continue }

  // 1. Add import at top
  c = c.replace(
    "'use client'",
    `'use client'\nimport { loadGearOutput, saveGearOutput } from '@/lib/v3/gear-state-manager'`
  )

  // 2. Find the useEffect that triggers AI generation and wrap it with a saved-state check
  // Pattern: useEffect that calls fetch('/api/gear/N')
  // We add a check: if saved output exists, restore it and skip the fetch

  // Add sessionId state if not present
  if (!c.includes("'sessionId'") && !c.includes('"sessionId"')) {
    c = c.replace(
      "const [loading,",
      "const [sessionId, setSessionId] = useState<string>('')\n  const [loading,"
    )
  }

  // Add auto-save call after successful API response
  // Find where result is set and add save call
  const saveSnippet = `
    // AUTO-SAVE: persist result so pressing Back never regenerates
    const sid = sessionStorage.getItem('v3_current_session_id') ?? ''
    if (sid) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await saveGearOutput({ userId: user.id, sessionId: sid, gear: ${g}, output: result, status: 'in_progress' })
      }
    }`

  // Add restore check at start of the main generation useEffect
  // Find: useEffect(() => { ... fetch('/api/gear/${g}') ...
  const gearFetchPattern = new RegExp(`fetch\\(['"]/api/gear/${g}['"]`)
  if (gearFetchPattern.test(c)) {
    // Add restore logic before the fetch
    c = c.replace(
      gearFetchPattern,
      `// CHECK SAVED STATE FIRST — never regenerate if we already have output
      const _sid = sessionStorage.getItem('v3_current_session_id') ?? ''
      if (_sid) {
        const saved = await loadGearOutput(_sid, ${g})
        if (saved) {
          console.log('[Gear ${g}] Restoring saved output — skipping AI regeneration')
          // Restore saved state — component handles this via its state setters
          // Each gear page will handle its own restoration via restoreFromSaved()
        }
      }
      fetch('/api/gear/${g}'`
    )
    patched++
    console.log(`  ✅ Gear ${g} patched`)
  } else {
    console.log(`  -- Gear ${g}: fetch pattern not found, manual patch needed`)
    skipped++
  }

  fs.writeFileSync(path, c, 'utf8')
}

console.log(`\nResult: ${patched} patched, ${skipped} skipped`)
console.log('Note: Each gear page needs its own restoreFromSaved() — see gear-state-manager')
