const fs = require('fs')

let marketplace = fs.readFileSync('app/marketplace/page.tsx', 'utf8')

// Find the standard featured card section and add isFournity check before it
const oldStandardCard = `                // ── STANDARD FEATURED CARD ─────────────────────
                return (
                  <div key={feat.id} style={{ borderRadius: '18px', border: '1px solid ' + feat.border, background: feat.bg, padding: '22px', position: 'relative', overflow: 'hidden' }}>`

const newFournityCard = `                // ── FOURNITY CARD ─────────────────────────────
                if ((feat as any).isFournity) return (
                  <div key={feat.id} style={{ borderRadius:18, border:'1px solid '+feat.border, background:feat.bg, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                    <div style={{ height:3, background:'linear-gradient(90deg,#C9A84C,#E8C97A,#C9A84C)' }} />
                    <div style={{ padding:'22px', display:'flex', gap:'20px', alignItems:'center', flexWrap:'wrap' }}>
                      <div style={{ flexShrink:0, width:100, filter:'drop-shadow(0 16px 32px rgba(201,168,76,0.3))', animation:'ftFloat 6s ease-in-out infinite' }}>
                        <img src="/fournity-cover.png" alt="FOURNITY" style={{ width:'100%', borderRadius:4, display:'block' }} />
                      </div>
                      <div style={{ flex:1, minWidth:180 }}>
                        <div style={{ display:'inline-block', fontSize:9, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(201,168,76,0.15)', color:'#C9A84C', border:'1px solid rgba(201,168,76,0.3)', marginBottom:10 }}>
                          📖 NEW BOOK
                        </div>
                        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:22, fontWeight:900, color:'#fff', marginBottom:2 }}>FOURNITY</div>
                        <div style={{ fontSize:13, color:'#C9A84C', marginBottom:10, fontStyle:'italic' }}>Trinity and I Are Four-nity</div>
                        <div style={{ fontSize:12, color:'#8A8A9A', lineHeight:1.8, marginBottom:14 }}>{feat.desc}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:12 }}>
                          <span style={{ background:'rgba(231,76,60,0.15)', border:'1px solid rgba(231,76,60,0.3)', color:'#E74C3C', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20 }}>🔥 LAUNCH PRICE</span>
                          <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:24, fontWeight:900, color:'#C9A84C' }}>R350</span>
                          <span style={{ fontSize:13, color:'#8A8A9A', textDecoration:'line-through' }}>R500</span>
                        </div>
                        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                          <a href="https://fournity.vercel.app" target="_blank" rel="noopener noreferrer" style={{ padding:'10px 18px', borderRadius:10, border:'1px solid rgba(201,168,76,0.4)', color:'#C9A84C', fontWeight:700, fontSize:13, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>📖 Free Preview</a>
                          <Link href="/marketplace/fournity" style={{ padding:'10px 18px', borderRadius:10, background:'linear-gradient(135deg,#C9A84C,#8B6914)', color:'#050A18', fontWeight:900, fontSize:13, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>Pre-Order R350 →</Link>
                        </div>
                        <div style={{ marginTop:10, fontSize:10, color:'#8A8A9A' }}>
                          💰 Affiliates earn 20% (R70) per sale · First 100 copies only
                        </div>
                      </div>
                    </div>
                  </div>
                )

                // ── STANDARD FEATURED CARD ─────────────────────
                return (
                  <div key={feat.id} style={{ borderRadius: '18px', border: '1px solid ' + feat.border, background: feat.bg, padding: '22px', position: 'relative', overflow: 'hidden' }}>`

marketplace = marketplace.replace(oldStandardCard, newFournityCard)

fs.writeFileSync('app/marketplace/page.tsx', marketplace)
console.log('✅ FOURNITY card with book cover added to marketplace')
console.log('Verify:', marketplace.includes('isFournity') ? 'isFournity found' : 'NOT FOUND')
