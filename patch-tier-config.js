// Patch: tier config — engine types + correct ISP rates + remove rocket tiers
// node patch-tier-config.js from repo root

const fs = require('fs')
const path = 'lib/v3/tier-config.ts'
let c = fs.readFileSync(path, 'utf8')
const orig = c

// 1. Remove rocket tier aliases (rocket_gold, rocket_platinum, silver_rocket etc)
c = c.replace(/rocket_gold[^}]+},?/gs, '')
c = c.replace(/rocket_platinum[^}]+},?/gs, '')
c = c.replace(/silver_rocket[^}]+},?/gs, '')
c = c.replace(/gold_rocket[^}]+},?/gs, '')
c = c.replace(/platinum_rocket[^}]+},?/gs, '')

// 2. Add engineType field — find each tier block and inject
const tierEngines = {
  fam:      'manual',
  free:     'manual',
  starter:  'manual',
  bronze:   'manual',
  copper:   'automatic',
  silver:   'electric',
  gold:     'rocket',
  platinum: 'rocket',
}
for (const [tier, engine] of Object.entries(tierEngines)) {
  // Find the tier block and add engineType if not present
  const re = new RegExp(`(${tier}:\\s*\\{[^}]*)`, 's')
  if (c.match(re) && !c.match(new RegExp(`${tier}:[^}]*engineType`))) {
    c = c.replace(re, `$1  engineType: '${engine}' as const,\n  `)
  }
}

// 3. Update ISP rates to correct values
const ispRates = {
  starter: 0.10, bronze: 0.18, copper: 0.22,
  silver: 0.25, gold: 0.28, platinum: 0.30,
  fam: 0, free: 0,
}
for (const [tier, rate] of Object.entries(ispRates)) {
  // Replace ispRate: X.XX with correct value in tier block
  const re = new RegExp(`(${tier}:\\s*\\{[^}]*ispRate:\\s*)([\\d.]+)`, 's')
  if (c.match(re)) {
    c = c.replace(re, `$1${rate}`)
  }
}

// 4. Fix normaliseTier to remove rocket aliases
c = c.replace(/'silver.?rocket'[^:]*:/g, "// removed: 'silver_rocket':")
c = c.replace(/'gold.?rocket'[^:]*:/g, "// removed: 'gold_rocket':")
c = c.replace(/'platinum.?rocket'[^:]*:/g, "// removed: 'platinum_rocket':")

if (c !== orig) {
  fs.writeFileSync(path, c, 'utf8')
  console.log('✅ tier-config.ts updated')
} else {
  console.log('-- No changes (may need manual check)')
}
