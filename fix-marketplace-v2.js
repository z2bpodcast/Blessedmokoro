var fs = require('fs');
var c = fs.readFileSync('app/marketplace/page.tsx', 'utf8');

// Fix 1: Full description popup on hover
c = c.replace(
  '<div style={{ fontSize:\'12px\', color:MUTED, lineHeight:1.7, marginBottom:\'10px\' }}>\n                        {(product.description ?? \'\').slice(0, 120)}{(product.description?.length ?? 0) > 120 ? \'...\' : \'\'}\n                      </div>',
  `<div style={{ fontSize:'12px', color:MUTED, lineHeight:1.7, marginBottom:'10px', position:'relative' }}
                        onMouseEnter={e => { const t = e.currentTarget.querySelector('.full-desc') as HTMLElement; if(t) t.style.display='block' }}
                        onMouseLeave={e => { const t = e.currentTarget.querySelector('.full-desc') as HTMLElement; if(t) t.style.display='none' }}>
                        {(product.description ?? '').slice(0, 120)}{(product.description?.length ?? 0) > 120 ? '...' : ''}
                        <div className="full-desc" style={{ display:'none', position:'absolute', top:'100%', left:0, right:0, zIndex:50, background:'#0D1629', border:'1px solid rgba(212,175,55,0.3)', borderRadius:10, padding:'14px', fontSize:12, color:'rgba(240,249,255,0.85)', lineHeight:1.8, maxHeight:200, overflowY:'auto', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
                          {product.description ?? ''}
                        </div>
                      </div>`
);

// Fix 2: Affiliate text + registration button
c = c.replace(
  '💰 Recommend this & earn <strong style={{ color:GREEN }}>R{affiliateAmt}</strong> per sale — 20% affiliate commission',
  `💰 Buy and/or Recommend this & earn <strong style={{ color:GREEN }}>R{affiliateAmt}</strong> per sale — 20% affiliate commission
                    <a href="/ai-income/choose-plan" style={{ marginLeft:8, fontSize:9, padding:'2px 8px', borderRadius:6, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#10B981', textDecoration:'none', fontWeight:700, whiteSpace:'nowrap' }}>Join Free →</a>`
);

fs.writeFileSync('app/marketplace/page.tsx', c);
console.log('Done');
