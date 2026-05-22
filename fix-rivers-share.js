var fs = require('fs');
var c = fs.readFileSync('app/income-rivers/page.tsx', 'utf8');

// 1. Add useSearchParams import
c = c.replace(
  "import { useState } from 'react'",
  "import { useState, useEffect } from 'react'\nimport { useSearchParams } from 'next/navigation'"
);

// 2. Add refCode state inside component
c = c.replace(
  "  const [openRiver, setOpenRiver] = useState<number | null>(null)",
  "  const searchParams = useSearchParams()\n  const refCode = searchParams.get('ref') ?? ''\n  const [copied, setCopied] = useState(false)\n  const [openRiver, setOpenRiver] = useState<number | null>(null)"
);

// 3. Add share section before closing div of final CTA
c = c.replace(
  "        {/* ── FINAL CTA ── */}",
  `        {/* ── SHARE SECTION ── */}
        <div style={{ borderRadius:16, border:\`1px solid \${GOLD}25\`, background:SURF, overflow:'hidden', marginBottom:32 }}>
          <div style={{ height:3, background:\`linear-gradient(90deg,\${R1},\${R2},\${R3},\${R4})\` }} />
          <div style={{ padding:'28px' }}>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:8 }}>
              🔗 Share This Page
            </div>
            <div style={{ fontSize:13, color:MUTED, marginBottom:20, lineHeight:1.7 }}>
              Share the 4 Income Rivers with your prospects. Your referral code is automatically embedded — anyone who joins through your link credits you.
            </div>
            {/* Link display */}
            <div style={{ padding:'10px 14px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:\`1px solid \${GOLD}20\`, fontSize:12, color:MUTED, marginBottom:14, wordBreak:'break-all' }}>
              {typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za'}/income-rivers{refCode ? \`?ref=\${refCode}\` : ''}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {/* WhatsApp */}
              
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
                💬 WhatsApp
              </a>
              {/* Copy Link */}
              <button
                onClick={() => {
                  const link = (typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za') + '/income-rivers' + (refCode ? \`?ref=\${refCode}\` : '')
                  navigator.clipboard.writeText(link)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2500)
                }}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:10, background:\`\${GOLD}10\`, border:\`1px solid \${GOLD}30\`, color: copied ? '#10B981' : GOLD, fontSize:13, fontWeight:700, fontFamily:'Cinzel,Georgia,serif', cursor:'pointer' }}>
                {copied ? '✓ Copied!' : '📋 Copy Link'}
              </button>
            </div>
            {!refCode && (
              <div style={{ marginTop:12, fontSize:11, color:MUTED, textAlign:'center', fontStyle:'italic' }}>
                Log in to embed your referral code and earn commissions from this page →{' '}
                <a href="/login" style={{ color:GOLD, textDecoration:'none' }}>Sign in</a>
              </div>
            )}
          </div>
        </div>

        {/* ── FINAL CTA ── */}`
);

fs.writeFileSync('app/income-rivers/page.tsx', c);
console.log('Done');
