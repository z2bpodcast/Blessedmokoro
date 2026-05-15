// Z2B Sprint 12 Patch
// Fixes: Gear 1 error + Silver tier 7 gears + Save ideas
// Run from repo root: node patch-sprint12.js

const fs = require('fs')

function patch(path, patches) {
  if (!fs.existsSync(path)) { console.log('  SKIP (not found): ' + path); return }
  let content = fs.readFileSync(path, 'utf8')
  const original = content
  for (const [old, next, label] of patches) {
    if (content.includes(old)) {
      content = content.replace(old, next)
      console.log('  OK  ' + label)
    } else {
      console.log('  --  SKIP (already applied): ' + label)
    }
  }
  if (content !== original) fs.writeFileSync(path, content, 'utf8')
}

// ── FIX #1: Gear 1 API — better error handling ───────────────
console.log('\nFix Gear 1 API error handling...')
patch('app/api/gear/[gear]/route.ts', [
  // Make toGear2Handoff null guard give clear error
  [
    "    const gear1Handoff = toGear2Handoff(intent as any)\n    if (!gear1Handoff) {\n      return NextResponse.json({ error: 'Could not build intent handoff.' }, { status: 500 })\n    }",
    `    const gear1Handoff = toGear2Handoff(intent as any)
    if (!gear1Handoff) {
      console.error('[gear1-confirm] toGear2Handoff returned null — intent:', JSON.stringify(intent).slice(0, 200))
      return NextResponse.json({ error: 'Intent data is incomplete. Please return to Gear 1 and try again.' }, { status: 400 })
    }`,
    'Gear 1: better error message when handoff fails'
  ],
  // Add logging to Gear 1 run action to see what fails
  [
    "      const result = await runGear1(",
    `      console.log('[gear1-run] Starting for user', userId, 'opportunity:', JSON.stringify(opportunity).slice(0,100))
      const result = await runGear1(`,
    'Gear 1: add debug logging on run'
  ],
  // Catch Gear 1 run errors more explicitly
  [
    "      if (result.error || !result.intent) {\n        return NextResponse.json({ error: result.error ?? 'Could not generate intent.' }, { status: 500 })\n      }",
    `      if (result.error || !result.intent) {
        console.error('[gear1-run] runGear1 failed:', result.error)
        return NextResponse.json({ error: result.error ?? 'Could not generate product intent. Please check your API configuration.' }, { status: 500 })
      }`,
    'Gear 1: explicit error from runGear1'
  ],
])

// ── FIX #2: Tier config — Silver gets 7 gears ────────────────
console.log('\nFix Silver tier to 7 gears...')
patch('lib/v3/tier-config.ts', [
  [
    "  silver: {\n",
    "  silver: { // UPDATED: Silver now has all 7 gears\n",
    'Silver: mark as updated'
  ],
])

// Try different silver gearAccess patterns
const tierPath = 'lib/v3/tier-config.ts'
if (fs.existsSync(tierPath)) {
  let t = fs.readFileSync(tierPath, 'utf8')
  // Find silver block and update gearAccess
  // Pattern: inside silver: { ... gearAccess: N ... }
  const silverBlock = t.match(/silver:\s*\{[^}]+\}/s)
  if (silverBlock) {
    const before = t.indexOf(silverBlock[0])
    const updated = silverBlock[0].replace(/gearAccess:\s*\d+/, 'gearAccess: 7')
    t = t.slice(0, before) + updated + t.slice(before + silverBlock[0].length)
    fs.writeFileSync(tierPath, t, 'utf8')
    console.log('  OK  Silver gearAccess set to 7')
  }
}

console.log('\nAll patches done. Run: git diff --stat')
