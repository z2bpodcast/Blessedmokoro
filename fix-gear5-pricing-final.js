const fs = require('fs')
let c = fs.readFileSync('app/ai-income/gear/5/page.tsx', 'utf8')

// Add pricing block before the confirm button
const target = '<button onClick={handleConfirm}'
const firstIdx = c.indexOf(target)

if (firstIdx === -1) {
  console.log('Target not found')
  process.exit(1)
}

const pricingBlock = `{/* ── PRICING CONFIRMATION ─────────────────────────── */}
          <div style={{ padding:'16px', borderRadius:'12px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', marginBottom:'10px' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#D4AF37', marginBottom:'8px' }}>
              💰 Confirm your price
            </div>
            <div style={{ fontSize:'11px', color:'#64748B', marginBottom:'12px', lineHeight:1.7 }}>
              4M suggested this based on your market and format. You have full control — adjust to suit your audience.
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px' }}>
              <input
                id="z2b-currency"
                type="text"
                defaultValue={intent?.currency ?? 'R'}
                style={{ width:'64px', padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'#F0F9FF', fontSize:'15px', fontFamily:'Georgia,serif', outline:'none', textAlign:'center' }}
              />
              <input
                id="z2b-price"
                type="number"
                min={1}
                defaultValue={intent?.priceRecommended ?? intent?.suggestedPrice ?? 299}
                style={{ flex:1, padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:'#F0F9FF', fontSize:'16px', fontFamily:'Cinzel,Georgia,serif', fontWeight:900, outline:'none' }}
              />
            </div>
            <div style={{ fontSize:'10px', color:'#64748B' }}>
              4M suggested: {intent?.currency ?? 'R'}{intent?.priceRecommended ?? intent?.suggestedPrice ?? 299}
            </div>
          </div>
          `

c = c.slice(0, firstIdx) + pricingBlock + c.slice(firstIdx)

// Also update handleConfirm to read the builder's chosen price and currency
c = c.replace(
  "async function handleConfirm() {",
  `async function handleConfirm() {
    // Read builder's chosen price and currency
    const chosenCurrency = (document.getElementById('z2b-currency') as HTMLInputElement)?.value ?? intent?.currency ?? 'R'
    const chosenPrice    = Number((document.getElementById('z2b-price') as HTMLInputElement)?.value) || intent?.priceRecommended || 299
    if (intent) {
      intent.currency         = chosenCurrency
      intent.priceRecommended = chosenPrice
      intent.suggestedPrice   = chosenPrice
    }`
)

fs.writeFileSync('app/ai-income/gear/5/page.tsx', c)
console.log('done - pricing screen added')
console.log('z2b-price present:', c.includes('z2b-price'))
console.log('chosenPrice present:', c.includes('chosenPrice'))
