var fs = require('fs');
var c = fs.readFileSync('app/marketplace/page.tsx', 'utf8');

var oldCard = `              {filtered.map(product => {
                const price = getPrice(product)
                return (
                  <div key={product.id} style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 16px 10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', color: GOLD, background: 'rgba(212,175,55,0.1)', padding: '3px 8px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {product.format ?? 'ebook'}
                        </span>
                        {(product.sales_count ?? 0) > 0 && (
                          <span style={{ fontSize: '10px', color: GREEN, marginLeft: '8px' }}>🔥 {product.sales_count} sold</span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W, marginBottom: '6px', lineHeight: 1.3 }}>
                        {product.title ?? product.name}
                      </div>
                      <div style={{ fontSize: '11px', color: MUTED, lineHeight: 1.7, marginBottom: '10px' }}>
                        {(product.description ?? '').slice(0, 100)}{product.description?.length > 100 ? '...' : ''}
                      </div>
                      {product.seller_name && (
                        <div style={{ fontSize: '10px', color: MUTED }}>by {product.seller_name}</div>
                      )}
                    </div>
                    <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: GOLD }}>
                        R{price.toLocaleString()}
                      </div>
                      {userId ? (
                        <button onClick={() => setPayment({ product })}
                          style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '12px', fontFamily: 'Cinzel,Georgia,serif' }}>
                          Get This →
                        </button>
                      ) : (
                        <Link href={\`/login?redirect=/marketplace\`}
                          style={{ padding: '8px 18px', borderRadius: '10px', background: 'rgba(212,175,55,0.1)', color: GOLD, fontSize: '12px', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(212,175,55,0.3)' }}>
                          Login to Buy
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}`;

var newCard = `              {filtered.map(product => {
                const price = getPrice(product)
                const is4M  = product.product_type === 'z2b_product' || !product.product_type
                const affiliateAmt = Math.round(price * 0.20)
                const features = Array.isArray(product.features) ? product.features : []
                return (
                  <div key={product.id} style={{ borderRadius:'16px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', overflow:'hidden', display:'flex', flexDirection:'column', transition:'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.border='1px solid rgba(212,175,55,0.35)')}
                    onMouseLeave={e => (e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)')}>

                    {/* Cover Image */}
                    {product.cover_url ? (
                      <div style={{ width:'100%', height:180, overflow:'hidden', position:'relative' }}>
                        <img src={product.cover_url} alt={product.title ?? product.name}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 50%, rgba(5,10,24,0.95) 100%)' }} />
                        {is4M && (
                          <div style={{ position:'absolute', top:10, left:10, background:'rgba(212,175,55,0.9)', color:'#050A18', fontSize:9, fontWeight:900, padding:'3px 8px', borderRadius:6, letterSpacing:1, textTransform:'uppercase', fontFamily:'Cinzel,Georgia,serif' }}>
                            4M Digital Product
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ width:'100%', height:140, background:'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(139,92,246,0.08))', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize:40, marginBottom:8 }}>{product.icon ?? '📦'}</div>
                        <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:GOLD, opacity:0.7 }}>{product.format ?? 'digital product'}</div>
                        {is4M && (
                          <div style={{ position:'absolute', top:10, left:10, background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.3)', color:GOLD, fontSize:9, fontWeight:900, padding:'3px 8px', borderRadius:6, letterSpacing:1, textTransform:'uppercase', fontFamily:'Cinzel,Georgia,serif' }}>
                            4M Digital Product
                          </div>
                        )}
                        {(product.sales_count ?? 0) > 0 && (
                          <div style={{ position:'absolute', top:10, right:10, fontSize:10, color:GREEN, background:'rgba(16,185,129,0.1)', padding:'3px 8px', borderRadius:6 }}>🔥 {product.sales_count} sold</div>
                        )}
                      </div>
                    )}

                    <div style={{ padding:'16px 16px 10px', flex:1 }}>

                      {/* Format badge */}
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                        <span style={{ fontSize:9, color:GOLD, background:'rgba(212,175,55,0.1)', padding:'3px 8px', borderRadius:8, textTransform:'uppercase', letterSpacing:1 }}>
                          {product.format ?? 'ebook'}
                        </span>
                        {is4M && (
                          <>
                            <span style={{ fontSize:9, color:'#06B6D4', background:'rgba(6,182,212,0.1)', padding:'3px 8px', borderRadius:8 }}>🎧 Audio Reader</span>
                            <span style={{ fontSize:9, color:'#8B5CF6', background:'rgba(139,92,246,0.1)', padding:'3px 8px', borderRadius:8 }}>✍️ Workbook</span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:W, marginBottom:'8px', lineHeight:1.3 }}>
                        {product.title ?? product.name}
                      </div>

                      {/* Description */}
                      <div style={{ fontSize:'12px', color:MUTED, lineHeight:1.7, marginBottom:'10px' }}>
                        {(product.description ?? '').slice(0, 120)}{(product.description?.length ?? 0) > 120 ? '...' : ''}
                      </div>

                      {/* Value enhancements */}
                      {is4M && (
                        <div style={{ marginBottom:10 }}>
                          <div style={{ fontSize:9, color:GOLD, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>What's included</div>
                          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                            {['📖 Interactive Reader','🎧 Audio Player','✍️ Workbook','📋 Checklist','📊 Templates'].map((v,i) => (
                              <span key={i} style={{ fontSize:9, color:'rgba(240,249,255,0.6)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', padding:'2px 7px', borderRadius:6 }}>{v}</span>
                            ))}
                            {features.slice(0,2).map((f: string, i: number) => (
                              <span key={'f'+i} style={{ fontSize:9, color:'rgba(240,249,255,0.6)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', padding:'2px 7px', borderRadius:6 }}>✅ {f.slice(0,20)}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Seller */}
                      {product.seller_name && (
                        <div style={{ fontSize:'10px', color:MUTED, marginBottom:4 }}>by {product.seller_name}</div>
                      )}
                    </div>

                    {/* Affiliate invite */}
                    <div style={{ padding:'8px 16px', background:'rgba(16,185,129,0.05)', borderTop:'1px solid rgba(16,185,129,0.1)', fontSize:10, color:'rgba(16,185,129,0.8)' }}>
                      💰 Recommend this & earn <strong style={{ color:GREEN }}>R{affiliateAmt}</strong> per sale — 20% affiliate commission
                    </div>

                    {/* Price & CTA */}
                    <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:GOLD }}>
                        R{price.toLocaleString()}
                      </div>
                      {userId ? (
                        <button onClick={() => setPayment({ product })}
                          style={{ padding:'8px 18px', borderRadius:'10px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:'12px', fontFamily:'Cinzel,Georgia,serif' }}>
                          Get This →
                        </button>
                      ) : (
                        <Link href={\`/login?redirect=/marketplace\`}
                          style={{ padding:'8px 18px', borderRadius:'10px', background:'rgba(212,175,55,0.1)', color:GOLD, fontSize:'12px', fontWeight:700, textDecoration:'none', border:'1px solid rgba(212,175,55,0.3)' }}>
                          Login to Buy
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}`;

if (c.includes(oldCard)) {
  c = c.replace(oldCard, newCard);
  console.log('Card replaced');
} else {
  console.log('Pattern not found');
}

fs.writeFileSync('app/marketplace/page.tsx', c);
