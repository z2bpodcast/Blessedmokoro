var fs = require('fs');
var c = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

var fourMCard = `
// -- 4M MACHINE EBOOK CARD
function FourMCard({ tier, ebookChoice }) {
  const PAID_TIERS = ['starter','bronze','copper','silver','gold','platinum']
  const isPaid = PAID_TIERS.includes(tier)
  const hasBoth = ebookChoice === 'both' || ['bronze','copper','silver','gold','platinum'].includes(tier)
  const has4M   = hasBoth || ebookChoice === '4m_machine'
  const GOLD = '#D4AF37'; const MUTED = '#64748B'; const W = '#F0F9FF';
  const ITEMS = [
    { icon:'📖', label:'eBook Reader',  href:'/4m_machine_ebook.html'    },
    { icon:'🎧', label:'Audio Reader',  href:'/4m_machine_ebook.html'    },
    { icon:'🔄', label:'Flipbook',      href:'/4m_machine_flipbook.html' },
    { icon:'⬇️', label:'Download',      href:'/4m_machine_ebook.html'    },
  ]
  return (
    <div style={{ background:'linear-gradient(135deg,#0a0a1a,#1a0a2e)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:16, overflow:'hidden', marginBottom:16 }}>
      <div style={{ padding:'20px 20px 4px' }}>
        <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:16 }}>
          <div style={{ width:60, height:80, background:'rgba(212,175,55,0.1)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(212,175,55,0.3)', flexShrink:0 }}>
            <span style={{ fontSize:32 }}>⚙️</span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, letterSpacing:4, textTransform:'uppercase', color:GOLD, marginBottom:4 }}>{has4M ? 'Your eBook — Included' : 'Upgrade to Unlock'}</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:4 }}>The 4M Machine</div>
            <div style={{ fontSize:11, fontStyle:'italic', color:GOLD, marginBottom:4 }}>How Christian Employees Are Building Digital Income Streams</div>
            <div style={{ fontSize:11, color:MUTED, lineHeight:1.6 }}>{has4M ? (hasBoth ? 'Both ebooks unlocked.' : '18 chapters · Audio · Flipbook · Download') : isPaid ? 'Upgrade to Bronze+ to unlock both ebooks.' : 'Unlock from R700.'}</div>
          </div>
        </div>
        {has4M ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
            {ITEMS.map(item => (
              <a key={item.label} href={item.href} style={{ padding:'10px 8px', borderRadius:10, background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', textDecoration:'none', textAlign:'center' }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{item.icon}</div>
                <div style={{ fontSize:10, fontWeight:700, color:GOLD }}>{item.label}</div>
              </a>
            ))}
          </div>
        ) : (
          <a href="/pricing" style={{ display:'block', marginBottom:12, padding:'11px', borderRadius:10, background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.3)', textAlign:'center', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', fontSize:12, fontWeight:700, color:GOLD }}>
            {isPaid ? 'Upgrade to Bronze — R2,500 →' : 'Get Starter Pack — R700 →'}
          </a>
        )}
      </div>
      <div style={{ borderTop:'1px solid rgba(212,175,55,0.1)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:11, color:MUTED }}>📱 Flipbook Preview — Always Free</div>
        <a href="/4m_machine_flipbook.html" style={{ fontSize:11, color:GOLD, textDecoration:'none', fontWeight:700 }}>Read Free →</a>
      </div>
    </div>
  )
}
`;

c = c.replace('// -- SHARE WIDGET', fourMCard + '// -- SHARE WIDGET');
c = c.replace('// ── SHARE WIDGET', fourMCard + '// ── SHARE WIDGET');
c = c.replace(
  '<EcosystemCard tier={tier} />',
  '<EcosystemCard tier={tier} />\n        <FourMCard tier={tier} ebookChoice={profile?.ebook_choice ?? null} />'
);

fs.writeFileSync('app/dashboard/page.tsx', c);
console.log('Done — lines: ' + c.split('\n').length);
