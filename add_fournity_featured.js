const fs = require('fs')

const fournityEntry = `  {
    id:          'fournity',
    category:    'ebook',
    isEbook:     false,
    isFournity:  true,
    icon:        '📖',
    badge:       'NEW BOOK',
    title:       'FOURNITY',
    subtitle:    'Trinity and I Are Four-nity',
    desc:        'A 40-chapter illumination of your God-given identity in Christ — before the foundation of the world. Pre-publication bundle: Digital edition + Signed copy + Workbook + Surprise Gift.',
    price:       350,
    cta:         'Pre-Order — R350 →',
    href:        '/marketplace/fournity',
    color:       '#C9A84C',
    bg:          'rgba(201,168,76,0.08)',
    border:      'rgba(201,168,76,0.3)',
  },`

// ── UPDATE MARKETPLACE PAGE ──────────────────────────────────
let marketplace = fs.readFileSync('app/marketplace/page.tsx', 'utf8')
if (marketplace.includes("id:          'fournity'")) {
  console.log('FOURNITY already in marketplace')
} else {
  marketplace = marketplace.replace(
    "const Z2B_FEATURED = [",
    "const Z2B_FEATURED = [\n" + fournityEntry
  )
  fs.writeFileSync('app/marketplace/page.tsx', marketplace)
  console.log('✅ FOURNITY added to marketplace Z2B_FEATURED')
}

// ── UPDATE DASHBOARD PAGE ────────────────────────────────────
let dashboard = fs.readFileSync('app/dashboard/page.tsx', 'utf8')
if (dashboard.includes("id:          'fournity'")) {
  console.log('FOURNITY already in dashboard')
} else {
  // Find where to add — look for FOURNITY section or add after BOOK_COVER constant
  // Add a FOURNITY card section after the EcosystemCard function
  const fournityDashCard = `
// ── FOURNITY BOOK CARD ────────────────────────────────────────
function FournityCard() {
  return (
    <div style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:'12px', overflow:'hidden', marginBottom:'16px' }}>
      <div style={{ position:'relative' }}>
        <img src="/fournity-cover.png" alt="FOURNITY" style={{ width:'100%', maxHeight:'280px', objectFit:'cover', objectPosition:'top', display:'block' }}/>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'60%', background:'linear-gradient(to bottom, transparent, #050A18)' }}/>
        <div style={{ position:'absolute', top:'12px', left:'12px', background:'linear-gradient(135deg,#C9A84C,#8B6914)', color:'#0A0A0F', fontSize:'10px', fontWeight:700, padding:'4px 10px', borderRadius:'2px', letterSpacing:'1.5px' }}>NEW BOOK</div>
      </div>
      <div style={{ padding:'16px' }}>
        <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'20px', fontWeight:900, background:'linear-gradient(135deg,#E8C97A,#C9A84C)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'4px' }}>FOURNITY</h3>
        <p style={{ fontSize:'12px', color:'#C9A84C', marginBottom:'8px', fontStyle:'italic' }}>Trinity and I Are Four-nity — Rev Mokoro Manana</p>
        <p style={{ fontSize:'13px', color:'#EDE6D6', lineHeight:1.6, marginBottom:'12px' }}>A 40-chapter illumination of your God-given identity in Christ — before the foundation of the world.</p>
        <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
          <a href="https://fournity.vercel.app" target="_blank" rel="noopener noreferrer" style={{ flex:1, background:'transparent', border:'1px solid rgba(201,168,76,0.4)', color:'#C9A84C', padding:'10px', fontSize:'12px', fontWeight:600, borderRadius:'6px', textAlign:'center', textDecoration:'none', display:'block' }}>📖 Free Preview</a>
          <a href="/marketplace/fournity" style={{ flex:1, background:'linear-gradient(135deg,#C9A84C,#8B6914)', color:'#0A0A0F', padding:'10px', fontSize:'12px', fontWeight:700, borderRadius:'6px', textAlign:'center', textDecoration:'none', display:'block' }}>Pre-Order R350</a>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ background:'rgba(231,76,60,0.15)', border:'1px solid rgba(231,76,60,0.3)', color:'#E74C3C', fontSize:'10px', fontWeight:700, padding:'3px 8px', borderRadius:'2px' }}>🔥 LAUNCH PRICE</span>
          <span style={{ fontFamily:'Playfair Display,serif', fontSize:'22px', fontWeight:900, color:'#fff' }}>R350</span>
          <span style={{ fontSize:'13px', color:'#8A8A9A', textDecoration:'line-through' }}>R500</span>
        </div>
        <p style={{ fontSize:'11px', color:'#8A8A9A', marginTop:'6px' }}>First 100 copies only — then R500</p>
      </div>
    </div>
  )
}
`
  // Insert FournityCard function after EcosystemCard function
  dashboard = dashboard.replace(
    "// ── Z2B BOOK ECOSYSTEM CARD ───────────────────────────────",
    fournityDashCard + "\n// ── Z2B BOOK ECOSYSTEM CARD ───────────────────────────────"
  )
  fs.writeFileSync('app/dashboard/page.tsx', dashboard)
  console.log('✅ FournityCard function added to dashboard')
}

console.log('Done!')
