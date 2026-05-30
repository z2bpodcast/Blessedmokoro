var fs = require('fs');
var c = fs.readFileSync('app/production/page.tsx', 'utf8');

c = c.replace(
  "                      <button onClick={() => setShowLinkForm(showLinkForm === proj.session_id ? null : proj.session_id)}\n                        style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid rgba(16,185,129,0.4)', background:'rgba(16,185,129,0.08)', color:GREEN, fontSize:'12px', cursor:'pointer', fontWeight:700 }}>\n                        🔗 Generate Link\n                      </button>",
  `                      <button onClick={() => setShowLinkForm(showLinkForm === proj.session_id ? null : proj.session_id)}
                        style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid rgba(16,185,129,0.4)', background:'rgba(16,185,129,0.08)', color:GREEN, fontSize:'12px', cursor:'pointer', fontWeight:700 }}>
                        🔗 Generate Link
                      </button>
                      {marketingKit[proj.session_id] && (
                        <button onClick={() => setShowMarketing(showMarketing === proj.session_id ? null : proj.session_id)}
                          style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid rgba(139,92,246,0.4)', background:'rgba(139,92,246,0.08)', color:'#8B5CF6', fontSize:'12px', cursor:'pointer', fontWeight:700 }}>
                          📣 Marketing Kit
                        </button>
                      )}`
);

// Add marketing kit display after link form
c = c.replace(
  "                  </div>\n                </div>\n              )\n            })}\n          </div>",
  `                  {showMarketing === proj.session_id && marketingKit[proj.session_id] && (
                      <div style={{ marginTop:12, padding:16, borderRadius:10, background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.2)' }}>
                        <div style={{ fontSize:11, color:'#8B5CF6', letterSpacing:2, textTransform:'uppercase', marginBottom:12, fontWeight:700 }}>📣 Marketing Kit</div>
                        {marketingKit[proj.session_id]?.listing?.description && (
                          <div style={{ marginBottom:12 }}>
                            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Product Description</div>
                            <div style={{ fontSize:12, color:W, lineHeight:1.7, background:'rgba(255,255,255,0.04)', padding:12, borderRadius:8 }}>
                              {marketingKit[proj.session_id].listing.description}
                            </div>
                            <button onClick={() => navigator.clipboard.writeText(marketingKit[proj.session_id].listing.description)}
                              style={{ marginTop:6, padding:'4px 10px', borderRadius:6, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', color:'#8B5CF6', fontSize:10, cursor:'pointer', fontWeight:700 }}>
                              📋 Copy
                            </button>
                          </div>
                        )}
                        {(marketingKit[proj.session_id]?.socialPosts ?? []).map((post: any, pi: number) => (
                          <div key={pi} style={{ marginBottom:10, padding:12, borderRadius:8, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize:10, color:GOLD, letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>{post.platform ?? 'Social Post'}</div>
                            <div style={{ fontSize:12, color:W, lineHeight:1.7 }}>{post.content ?? post}</div>
                            <button onClick={() => navigator.clipboard.writeText(post.content ?? post)}
                              style={{ marginTop:6, padding:'4px 10px', borderRadius:6, background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', color:GOLD, fontSize:10, cursor:'pointer', fontWeight:700 }}>
                              📋 Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>`
);

fs.writeFileSync('app/production/page.tsx', c);
console.log('Done');
