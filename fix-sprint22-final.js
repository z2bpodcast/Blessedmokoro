const fs = require('fs')

// FIX 1: Gear 1 page — read market from sessionStorage and pass to API
let g1 = fs.readFileSync('app/ai-income/gear/1/page.tsx', 'utf8')

// Find where opportunity is read from sessionStorage and add market extraction
g1 = g1.replace(
  "const opp = JSON.parse(sessionStorage.getItem('v3_selected_opportunity') ?? '{}')",
  `const oppRaw = JSON.parse(sessionStorage.getItem('v3_selected_opportunity') ?? '{}')
      const opp = oppRaw
      // Extract market and currency from opportunity
      const market = oppRaw.market ? (typeof oppRaw.market === 'string' ? JSON.parse(oppRaw.market) : oppRaw.market) : {}
      const currency = market.currency?.split(' ')[0] ?? 'R'`
)

// Pass market to the API call in Gear 1
g1 = g1.replace(
  "body: JSON.stringify({ action: 'run', opportunity: opp,",
  "body: JSON.stringify({ action: 'run', opportunity: { ...opp, currency }, market, currency,"
)

fs.writeFileSync('app/ai-income/gear/1/page.tsx', g1)
console.log('✅ Fix 1: Gear 1 market/currency extraction')

// FIX 2: Complete page — remove auto redirect, add permanent buttons
let complete = fs.readFileSync('app/ai-income/complete/page.tsx', 'utf8')

// Remove any setTimeout redirect
complete = complete.replace(
  /setTimeout\([^)]+router\.push[^)]+\)[^)]*\)/g,
  '// Auto-redirect removed — builder chooses when to leave'
)

// Check if buttons exist, add if missing
if (!complete.includes('Go to Dashboard')) {
  complete = complete.replace(
    '</div>\n  )\n}',
    `      <div style={{ display:'flex', gap:'12px', marginTop:'24px', flexWrap:'wrap' }}>
        <a href="/dashboard" style={{ flex:1, padding:'13px', borderRadius:'12px', background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:'14px', textDecoration:'none', textAlign:'center', fontFamily:'Cinzel,Georgia,serif' }}>
          Go to Dashboard →
        </a>
        <a href="/marketplace" style={{ flex:1, padding:'13px', borderRadius:'12px', border:'1px solid rgba(212,175,55,0.3)', color:'#D4AF37', fontSize:'14px', textDecoration:'none', textAlign:'center', fontFamily:'Georgia,serif' }}>
          View Marketplace
        </a>
        <a href="/ai-income/ignition" style={{ flex:1, padding:'13px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', color:'#64748B', fontSize:'14px', textDecoration:'none', textAlign:'center', fontFamily:'Georgia,serif' }}>
          Build Another Product
        </a>
      </div>
    </div>
  )
}`
  )
}

fs.writeFileSync('app/ai-income/complete/page.tsx', complete)
console.log('✅ Fix 2: Complete page — no auto-redirect, permanent buttons')

// FIX 3: Gear API — pass market/currency to runGear1
let api = fs.readFileSync('app/api/gear/[gear]/route.ts', 'utf8')

api = api.replace(
  'const result = await runGear1({\n      opportunity,\n      tierId,\n    })',
  `const market = body.market ?? {}
    const result = await runGear1({
      opportunity,
      market,
      tierId,
    })`
)

fs.writeFileSync('app/api/gear/[gear]/route.ts', api)
console.log('✅ Fix 3: Gear API passes market to runGear1')

// Verify
console.log('\nVerification:')
const g1Final = fs.readFileSync('app/ai-income/gear/1/page.tsx', 'utf8')
const apiF    = fs.readFileSync('app/api/gear/[gear]/route.ts', 'utf8')
console.log('  Gear 1 reads market:', g1Final.includes('oppRaw.market'))
console.log('  API passes market:', apiF.includes('body.market'))
