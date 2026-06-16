var fs = require('fs');
var c = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// Add FourMCard component after EcosystemCard closing
var fourMCard = `
// ── 4M MACHINE EBOOK CARD ─────────────────────────────────────
function FourMCard({ tier, ebookChoice }: { tier: string; ebookChoice: string | null }) {
  const PAID_TIERS = ['starter','bronze','copper','silver','gold','platinum']
  const isPaid = PAID_TIERS.includes(tier)
  const hasBoth = ebookChoice === 'both' || ['bronze','copper','silver','gold','platinum'].includes(tier)
  const has4M   = hasBoth || ebookChoice === '4m_machine'
  const GOLD = '#D4AF37'
  const MUTED = '#64748B'
  const W = '#F0F9FF'
  const CYAN = '#06B6D4'

  const ITEMS = [
    { icon:'📖', label:'eBook Reader',  desc:'Read all 18 chapters',     href:'/4m_machine_ebook.html'    },
    { icon:'🎧', label:'Audio Reader',  desc:'Listen while you work',     href:'/4m_machine_ebook.html'    },
    { icon:'🔄', label:'Flipbook',      desc:'Preview edition — share it',href:'/4m_machine_flipbook.html' },
    { icon:'⬇️', label:'Download',      desc:'Save to your device',       href:'/4m_machine_ebook.html'    },
  ]

  return (
    <div style={{ background:'linear-gradient(135deg,#0a0a1a,#1a0a2e)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:16, overflow:'hidden', marginBottom:16 }}>
      <div style={{ padding:'20px 20px 0' }}>
        <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
          <div style={{ flexShrink:0, width:60, background:'linear-gradient(135deg,#1a0a2e,#2d1054)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', height:80, border:'1px solid rgba(212,175,55,0.3)' }}>
            <span style={{ fontSize:32 }}>⚙️</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, letterSpacing:4, textTransform:'uppercase', color:GOLD, marginBottom:4 }}>
              {has4M ? 'Your eBook — Included' : 'Upgrade to Unlock'}
            </div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:4 }}>
              The 4M Machine
            </div>
            <div style={{ fontSize:11, fontStyle:'italic', color:GOLD, marginBottom:6 }}>
              How Christian Employees Are Building Digital Income Streams
            </div>
            <div style={{ fontSize:11, color:MUTED, lineHeight:1.7 }}>
              {has4M
                ? hasBoth
                  ? 'Both ebooks unlocked — enjoy the full Z2B library.'
                  : '18 chapters · Audio reader · Flipbook · Download included.'
                : isPaid
                  ? 'You have the Zero2Billionaires ebook. Upgrade to Bronze+ to unlock both.'
                  : 'Unlock with any paid tier from R700.'}
            </div>
          </div>
        </div>

        {has4M ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:8, marginBottom:16 }}>
            {ITEMS.map(item => (
              <a key={item.label} href={item.href}
                style={{ padding:'11px 12px', borderRadius:10, background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', textDecoration:'none', display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:20 }}>{item.icon}</span>
                <div style={{ fontSize:11, fontWeight:700, color:GOLD, fontFamily:'Cinzel,Georgia,serif' }}>{item.label}</div>
                <div style={{ fontSize:10, color:MUTED, lineHeight:1.5 }}>{item.desc}</div>
              </a>
            ))}
          </div>
        ) : isPaid && ebookChoice === 'zero2billionaires' ? (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>
              🔒 Upgrade to Bronze to unlock The 4M Machine
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:8, opacity:0.35 }}>
              {ITEMS.map(item => (
                <div key={item.label} style={{ padding:'11px 12px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:18 }}>{item.icon}</span>
                  <div style={{ fontSize:11, fontWeight:700, color:MUTED }}>{item.label}</div>
                </div>
              ))}
            </div>
            <a href="/pricing" style={{ display:'block', marginTop:10, padding:'11px', borderRadius:10, background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.3)', textAlign:'center', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', fontSize:12, fontWeight:700, color:GOLD }}>
              Upgrade to Bronze — R2,500 →
            </a>
          </div>
        ) : (
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:8, opacity:0.35, marginBottom:12 }}>
              {ITEMS.map(item => (
                <div key={item.label} style={{ padding:'11px 12px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:18 }}>{item.icon}</span>
                  <div style={{ fontSize:11, fontWeight:700, color:MUTED }}>{item.label}</div>
                </div>
              ))}
            </div>
            <a href="/pricing" style={{ display:'block', padding:'11px', borderRadius:10, background:'linear-gradient(135deg,rgba(212,175,55,0.15),rgba(212,175,55,0.05))', border:'1px solid rgba(212,175,55,0.4)', textAlign:'center', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', fontSize:12, fontWeight:700, color:GOLD }}>
              Get Starter Pack — R700 →
            </a>
          </div>
        )}
      </div>

      {/* Flipbook always free */}
      <div style={{ borderTop:'1px solid rgba(212,175,55,0.1)', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:11, color:MUTED }}>📱 Flipbook Preview — Always Free</div>
        <a href="/4m_machine_flipbook.html" style={{ fontSize:11, color:GOLD, textDecoration:'none', fontWeight:700 }}>Read Free →</a>
      </div>
    </div>
  )
}
`;

// Insert FourMCard before ShareWidget
c = c.replace('// ── SHARE WIDGET', fourMCard + '// ── SHARE WIDGET');

// Add FourMCard to dashboard render — after EcosystemCard
c = c.replace(
  '<EcosystemCard tier={tier} />',
  `<EcosystemCard tier={tier} />
        <FourMCard tier={tier} ebookChoice={profile?.ebook_choice ?? null} />`
);

fs.writeFileSync('app/dashboard/page.tsx', c);
console.log('Done — lines: ' + c.split('\n').length);
