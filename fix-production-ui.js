var fs = require('fs');
var c = fs.readFileSync('app/production/page.tsx', 'utf8');

// Add Listed Products section after the existing projects section header
c = c.replace(
  "⚙️ My Products ({projects.length})",
  "🏪 My Listed Products ({listedProducts.length})"
);

// Add the products display — find the right insertion point
c = c.replace(
  "      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'28px 20px' }}>",
  `      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'28px 20px' }}>

        {/* ── LISTED MARKETPLACE PRODUCTS ── */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:15, fontWeight:900, color:W, marginBottom:14 }}>
            🏪 My Listed Products ({listedProducts.length})
          </div>
          {listedProducts.length === 0 ? (
            <div style={{ padding:'24px', borderRadius:12, background:SURF, border:'1px solid rgba(255,255,255,0.06)', textAlign:'center', color:MUTED, fontSize:13 }}>
              No products listed yet. Complete Gear 6 or 7 to list your first product.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {listedProducts.map((p: any) => (
                <div key={p.id} style={{ padding:'16px 20px', borderRadius:12, background:SURF, border:'1px solid rgba(212,175,55,0.2)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, fontWeight:900, color:W, marginBottom:4 }}>{p.title}</div>
                    <div style={{ fontSize:11, color:MUTED, display:'flex', gap:12, flexWrap:'wrap' }}>
                      <span>{p.format ?? 'ebook'}</span>
                      <span>R{p.retail_price}</span>
                      <span style={{ color:'#10B981' }}>✓ {p.status}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <a href={'/marketplace'} style={{ padding:'7px 14px', borderRadius:8, background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.3)', color:GOLD, fontSize:11, fontWeight:700, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>`
);

fs.writeFileSync('app/production/page.tsx', c);
console.log('Done');
