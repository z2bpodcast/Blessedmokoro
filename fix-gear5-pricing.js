const fs = require('fs')
let c = fs.readFileSync('app/ai-income/gear/5/page.tsx', 'utf8')

const insertBefore = '<button onClick={handleConfirm}'

const pricingBlock = `{/* Pricing confirmation */}
          <div style={{ padding:'16px', borderRadius:'12px', background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', marginBottom:'10px' }}>
            <div style={{ fontSize:'12px', color:MUTED, marginBottom:'10px' }}>
              💰 Set your price — 4M suggests based on your market and format
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <input
                type="text"
                id="product-currency"
                defaultValue={intent?.currency ?? 'R'}
                style={{ width:'60px', padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:W, fontSize:'14px', fontFamily:'Georgia,serif', outline:'none', textAlign:'center' }}
              />
              <input
                type="number"
                id="product-price"
                defaultValue={intent?.priceRecommended ?? intent?.suggestedPrice ?? 299}
                min={1}
                style={{ flex:1, padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', color:W, fontSize:'16px', fontFamily:'Cinzel,Georgia,serif', fontWeight:900, outline:'none' }}
              />
            </div>
            <div style={{ fontSize:'10px', color:MUTED, marginTop:'6px' }}>
              4M suggested: {intent?.currency ?? 'R'}{intent?.priceRecommended ?? intent?.suggestedPrice ?? 299} · You have full control over your final price
            </div>
          </div>
          `

if (c.includes(insertBefore)) {
  c = c.replace(insertBefore, pricingBlock + insertBefore)
  fs.writeFileSync('app/ai-income/gear/5/page.tsx', c)
  console.log('done')
} else {
  console.log('Pattern not found')
}
