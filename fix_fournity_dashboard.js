const fs = require('fs')
let dashboard = fs.readFileSync('app/dashboard/page.tsx', 'utf8')

// 1. Update function signature to accept refCode
dashboard = dashboard.replace(
  `function FournityCard() {`,
  `function FournityCard({ refCode }: { refCode: string }) {
  const [copied, setCopied] = useState(false)
  const fournityLink = \`https://app.z2blegacybuilders.co.za/marketplace/fournity?ref=\${refCode}\`
  function copyLink() { navigator.clipboard.writeText(fournityLink); setCopied(true); setTimeout(()=>setCopied(false),2000) }`
)

// 2. Add referral box after "First 100 copies only" line
dashboard = dashboard.replace(
  `        <p style={{ fontSize:'11px', color:'#8A8A9A', marginTop:'6px' }}>First 100 copies only — then R500</p>
      </div>
    </div>
  )
}

// ── Z2B BOOK ECOSYSTEM CARD`,
  `        <p style={{ fontSize:'11px', color:'#8A8A9A', marginTop:'6px' }}>First 100 copies only — then R500</p>
        {refCode && (
          <div style={{ marginTop:'12px', background:'rgba(46,204,113,0.06)', border:'1px solid rgba(46,204,113,0.2)', borderRadius:'8px', padding:'12px' }}>
            <p style={{ fontSize:'11px', fontWeight:700, color:'#2ECC71', marginBottom:'6px' }}>💰 Your FOURNITY Referral Link — Earn R70 per sale</p>
            <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'6px' }}>
              <span style={{ fontSize:'10px', color:'#EDE6D6', background:'rgba(0,0,0,0.3)', padding:'6px 10px', borderRadius:'4px', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fournityLink}</span>
              <button onClick={copyLink} style={{ background:'#2ECC71', border:'none', color:'#0A0A0F', fontSize:'11px', fontWeight:700, padding:'6px 12px', borderRadius:'4px', cursor:'pointer', whiteSpace:'nowrap' }}>{copied ? '✓ Copied' : 'Copy'}</button>
            </div>
            <p style={{ fontSize:'10px', color:'#8A8A9A' }}>Share this link. When someone buys FOURNITY through your link, R70 is credited to your Z2B account automatically.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Z2B BOOK ECOSYSTEM CARD`
)

// 3. Find where FournityCard is used and pass refCode
// Search for <FournityCard /> or <FournityCard/>
if (dashboard.includes('<FournityCard />')) {
  dashboard = dashboard.replace('<FournityCard />', '<FournityCard refCode={refCode} />')
  console.log('✅ Updated <FournityCard /> usage')
} else if (dashboard.includes('<FournityCard/>')) {
  dashboard = dashboard.replace('<FournityCard/>', '<FournityCard refCode={refCode} />')
  console.log('✅ Updated <FournityCard/> usage')
} else {
  console.log('⚠️  FournityCard usage not found — searching...')
  const lines = dashboard.split('\n')
  lines.forEach((l,i) => { if (l.includes('FournityCard')) console.log(`Line ${i+1}: ${l.trim()}`) })
}

fs.writeFileSync('app/dashboard/page.tsx', dashboard)
console.log('✅ FournityCard updated with referral link')
console.log('Checks:')
console.log('- refCode prop:', dashboard.includes('FournityCard({ refCode }') ? '✅' : '❌')
console.log('- copyLink fn:', dashboard.includes('function copyLink') ? '✅' : '❌')
console.log('- Referral box:', dashboard.includes('FOURNITY Referral Link') ? '✅' : '❌')
