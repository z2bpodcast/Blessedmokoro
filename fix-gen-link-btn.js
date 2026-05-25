var fs = require('fs');
var c = fs.readFileSync('app/production/page.tsx', 'utf8');

c = c.replace(
  "                      <Link href={`/marketplace`}\n                        style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.06)', color:GREEN, fontSize:'12px', textDecoration:'none', fontWeight:700 }}>\n                        🏪 Marketplace\n                      </Link>\n                    </div>",
  `                      <Link href={\`/marketplace\`}
                        style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.06)', color:GREEN, fontSize:'12px', textDecoration:'none', fontWeight:700 }}>
                        🏪 Marketplace
                      </Link>
                      <button onClick={() => setShowLinkForm(showLinkForm === proj.session_id ? null : proj.session_id)}
                        style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid rgba(16,185,129,0.4)', background:'rgba(16,185,129,0.08)', color:GREEN, fontSize:'12px', cursor:'pointer', fontWeight:700 }}>
                        🔗 Generate Link
                      </button>
                    </div>
                    {showLinkForm === proj.session_id && (
                      <div style={{ marginTop:12, padding:14, borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(16,185,129,0.2)' }}>
                        <input placeholder="Buyer name" value={buyerName} onChange={e => setBuyerName(e.target.value)}
                          style={{ width:'100%', padding:'8px 12px', borderRadius:7, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:W, fontSize:12, marginBottom:8, outline:'none', boxSizing:'border-box' as const }} />
                        <input placeholder="Buyer email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)}
                          style={{ width:'100%', padding:'8px 12px', borderRadius:7, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:W, fontSize:12, marginBottom:10, outline:'none', boxSizing:'border-box' as const }} />
                        <button onClick={() => generateLink(proj.session_id, proj.title ?? 'product')} disabled={!!genLoading}
                          style={{ width:'100%', padding:'9px', borderRadius:7, background:GREEN, color:'#050A18', fontWeight:900, fontSize:12, border:'none', cursor:'pointer' }}>
                          {genLoading === proj.session_id ? 'Generating...' : 'Create Secure Link →'}
                        </button>
                        {genLink[proj.session_id] && (
                          <div style={{ marginTop:10, padding:'8px 12px', borderRadius:7, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', fontSize:11, color:GREEN, wordBreak:'break-all' as const }}>
                            ✓ Copied! {genLink[proj.session_id]}
                          </div>
                        )}
                      </div>
                    )}`
);

fs.writeFileSync('app/production/page.tsx', c);
console.log('Done');
