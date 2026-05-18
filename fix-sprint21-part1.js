const fs = require('fs')

// FIX 1: Other ignition pages — same field mismatch as self-discovery
const ignitionPages = [
  'app/ai-income/ignition/market/page.tsx',
  'app/ai-income/ignition/topical/page.tsx',
  'app/ai-income/ignition/script/page.tsx',
]

ignitionPages.forEach(path => {
  try {
    let c = fs.readFileSync(path, 'utf8')
    const before = c

    // Fix audience → targetAudience and transformation → problemSolved
    c = c.replace(/audience:\s*opp\.audience,/g, 'targetAudience: opp.audience,')
    c = c.replace(/transformation:\s*opp\.transformation,/g, 'problemSolved: opp.transformation,')
    c = c.replace(/audience:\s*opp\.targetAudience,/g, 'targetAudience: opp.targetAudience,')

    // Also fix sessionStorage saves that use wrong field names
    c = c.replace(
      /sessionStorage\.setItem\('v3_selected_opportunity'[^}]+audience:[^,}]+,/g,
      m => m.replace('audience:', 'targetAudience:')
    )

    if (c !== before) {
      fs.writeFileSync(path, c)
      console.log('Fixed:', path)
    } else {
      console.log('No changes needed:', path)
    }
  } catch (e) {
    console.log('Skip:', path, '-', e.message)
  }
})

console.log('Fix 1 done')
