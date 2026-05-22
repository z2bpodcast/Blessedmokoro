var fs = require('fs');
var c = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');

// Find and replace the problematic WhatsApp anchor with a clean version
var OLD = `              {/* WhatsApp */}
              
                href={\`https://wa.me/?text=\${encodeURIComponent(
                  '👑 *4 Income Rivers — Zero2Billionaires*\\n\\n' +
                  'Just as 4 rivers flowed from the Garden of Eden, Z2B gives you 4 income rivers flowing simultaneously:\\n\\n' +
                  '🌊 River 1 — 4M Machine: Build & Sell Digital Products\\n' +
                  '🌊 River 2 — Affiliate Marketing: 3 Referral Links\\n' +
                  '🌊 River 3 — Compensation Plan: 9 Income Streams\\n' +
                  '🌊 River 4 — Builder PWA Store: Your Digital Economy\\n\\n' +
                  'See the full breakdown here:\\n' +
                  (typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za') +
                  '/income-rivers' + (refCode ? \`?ref=\${refCode}\` : '')
                )}\`}
                target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:10, background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.3)', color:'#25D166', textDecoration:'none', fontSize:13, fontWeight:700, fontFamily:'Cinzel,Georgia,serif' }}>
                {'💬'} WhatsApp
              </a>`;

var NEW = `              {/* WhatsApp */}
              
                href={'https://wa.me/?text=' + encodeURIComponent('4 Income Rivers — Zero2Billionaires\\n\\nRiver 1: 4M Machine\\nRiver 2: Affiliate Marketing\\nRiver 3: Compensation Plan\\nRiver 4: Builder PWA Store\\n\\nhttps://app.z2blegacybuilders.co.za/income-rivers' + (refCode ? '?ref=' + refCode : ''))}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:10, background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.3)', color:'#25D166', textDecoration:'none', fontSize:13, fontWeight:700, fontFamily:'Cinzel,Georgia,serif' }}>
                {'💬 WhatsApp'}
              </a>`;

if (c.includes('https://wa.me/?text=')) {
  c = c.replace(OLD, NEW);
  console.log('Replaced');
} else {
  console.log('Pattern not found');
}

fs.writeFileSync('app/income-rivers/page.tsx', c);
