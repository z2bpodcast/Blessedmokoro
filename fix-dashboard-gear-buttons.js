var fs = require('fs');
var c = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

c = c.replace(
  `                  <Link href={\`/production?session=\${proj.session_id}\`}
                  style={{ padding:'14px 16px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)', textDecoration:'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:W, marginBottom:'2px' }}>{proj.title}</div>
                    <div style={{ fontSize:'11px', color:MUTED }}>{new Date(proj.created_at).toLocaleDateString('en-ZA')}</div>
                  </div>
                  <div style={{ fontSize:'11px', color:GREEN, background:'rgba(16,185,129,0.1)', padding:'3px 10px', borderRadius:'10px' }}>
                    ✅ Live
                  </div>
                </Link>`,
  `                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:700, color:W, marginBottom:'2px' }}>{proj.title}</div>
                      <div style={{ fontSize:'11px', color:MUTED }}>{new Date(proj.created_at).toLocaleDateString('en-ZA')}</div>
                    </div>
                    <div style={{ fontSize:'11px', color:GREEN, background:'rgba(16,185,129,0.1)', padding:'3px 10px', borderRadius:'10px' }}>✅ Live</div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <a href={'/ai-income/gear/5?session='+proj.session_id} style={{ padding:'6px 12px', borderRadius:7, background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#06B6D4', fontSize:11, fontWeight:700, textDecoration:'none' }}>⚙️ Gear 5</a>
                    <a href={'/ai-income/gear/6?session='+proj.session_id} style={{ padding:'6px 12px', borderRadius:7, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', color:'#8B5CF6', fontSize:11, fontWeight:700, textDecoration:'none' }}>📣 Gear 6</a>
                    <a href={'/ai-income/gear/7?session='+proj.session_id} style={{ padding:'6px 12px', borderRadius:7, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#10B981', fontSize:11, fontWeight:700, textDecoration:'none' }}>🌐 Gear 7</a>
                    <a href={'/production?session='+proj.session_id} style={{ padding:'6px 12px', borderRadius:7, background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', color:'#D4AF37', fontSize:11, fontWeight:700, textDecoration:'none' }}>📦 Package</a>
                  </div>`
);

fs.writeFileSync('app/dashboard/page.tsx', c);
console.log('Done');
