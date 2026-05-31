'use client'
// File: app/production/page.tsx — 4M Project Manager (Sprint 23)

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG   = '#050A18'
const SURF = '#0D1629'
const GOLD = '#D4AF37'
const CYAN = '#06B6D4'
const W    = '#F0F9FF'
const MUTED= '#64748B'
const GREEN= '#10B981'

const GEAR_LABELS: Record<number,string> = {
  1:'Intent', 2:'Blueprint', 3:'Content',
  4:'Quality', 5:'Enhancement', 6:'Distribution', 7:'Video'
}

function Footer() {
  return (
    <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'20px 24px', textAlign:'center', marginTop:'48px' }}>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'12px', color:GOLD, fontStyle:'italic', marginBottom:'6px' }}>
        "If they underpay you or don't want to employ you — Deploy Yourself."
      </div>
      <div style={{ fontSize:'11px', color:MUTED }}>
        <a href="mailto:support@z2blegacybuilders.co.za" style={{ color:GOLD, textDecoration:'none' }}>support@z2blegacybuilders.co.za</a>
      </div>
    </footer>
  )
}

function ProductionInner() {
  const [projects,  setProjects]  = useState<any[]>([])
  const [personas,  setPersonas]  = useState<any[]>([])
  const [savedIdeas,setSavedIdeas]= useState<any[]>([])
  const [listedProducts,setListedProducts]= useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [dlLoading, setDlLoading] = useState<string|null>(null)
  const [genLink, setGenLink] = useState<Record<string,string>>({})
  const [genLoading, setGenLoading] = useState<string|null>(null)
  const [showLinkForm, setShowLinkForm] = useState<string|null>(null)
  const [buyerEmail, setBuyerEmail] = useState("")
  const [buyerName, setBuyerName] = useState("")
  const [marketingKit, setMarketingKit] = useState<Record<string,any>>({})
  const [showMarketing, setShowMarketing] = useState<string|null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return }
      const sb = supabase as any
      const [projRes, mktRes, personasRes, ideasRes, productsRes] = await Promise.all([
        sb.from('saved_projects').select('*').eq('builder_id', user.id).order('updated_at', { ascending: false }),
        sb.from('gear_sessions').select('id, distribution_data').eq('builder_id', user.id).not('distribution_data', 'is', null),
        sb.from('builder_personas').select('*').eq('builder_id', user.id).order('created_at', { ascending: false }),
        sb.from('saved_ideas').select('*').eq('builder_id', user.id).order('created_at', { ascending: false }),
        sb.from('marketplace_products').select('*').eq('seller_id', user.id).eq('status', 'listed').order('created_at', { ascending: false }),
      ])
      setProjects(projRes.data ?? [])
      // Build marketing kit map by session_id
      const kitMap: Record<string,any> = {}
      ;(mktRes.data ?? []).forEach((row: any) => {
        if (row.distribution_data) {
          try { kitMap[row.id] = typeof row.distribution_data === 'string' ? JSON.parse(row.distribution_data) : row.distribution_data } catch(e) {}
        }
      })
      setMarketingKit(kitMap)
      setPersonas(personasRes.data ?? [])
      setSavedIdeas(ideasRes.data ?? [])
      setListedProducts(productsRes.data ?? [])
      setLoading(false)
    })
  }, [])

  async function generateLink(sessionId: string, productTitle: string) {
    setGenLoading(sessionId)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (session?.access_token ?? '') },
      body: JSON.stringify({ sessionId, buyerEmail, buyerName, productTitle }),
    })
    const data = await res.json()
    if (data.link) {
      setGenLink(prev => ({ ...prev, [sessionId]: data.link }))
      navigator.clipboard.writeText(data.link)
    }
    setGenLoading(null)
    setBuyerEmail('')
    setBuyerName('')
  }

  async function downloadHTML(sessionId: string, title: string) {
    setDlLoading(sessionId + '-html')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/generate-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
      body: JSON.stringify({ sessionId }),
    })
    if (res.ok) {
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '.html'
      a.click()
      URL.revokeObjectURL(url)
    }
    setDlLoading(null)
  }

  async function downloadTXT(sessionId: string, title: string) {
    setDlLoading(sessionId + '-txt')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/download-package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
      body: JSON.stringify({ sessionId }),
    })
    if (res.ok) {
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) + '.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
    setDlLoading(null)
  }

  async function deletePersona(id: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch('/api/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
      body: JSON.stringify({ action: 'delete', personaId: id }),
    })
    setPersonas(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:GOLD, fontFamily:'Georgia,serif' }}>Loading your products...</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      {/* Nav */}
      <nav style={{ padding:'12px 20px', background:SURF, borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/dashboard" style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:GOLD, textDecoration:'none' }}>← Dashboard</Link>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'13px', color:W }}>My Products</div>
        <Link href="/ai-income/ignition" style={{ padding:'7px 16px', borderRadius:'8px', background:GOLD, color:'#050A18', fontSize:'12px', fontWeight:900, textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
          + New Product
        </Link>
      </nav>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'28px 20px' }}>

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
<button onClick={() => downloadTXT(p.session_id, p.title ?? "product")}
                      style={{ padding:'7px 14px', borderRadius:8, background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.3)', color:GOLD, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                      📦 Package
                    </button>
                    <button onClick={() => downloadHTML(p.session_id, p.title)}
                      style={{ padding:'7px 14px', borderRadius:8, background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#06B6D4', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                      📖 HTML Reader
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:W, marginBottom:'14px' }}>
          🏪 My Listed Products ({listedProducts.length})
        </div>

        {projects.length === 0 ? (
          <div style={{ padding:'40px', borderRadius:'14px', border:'1px dashed rgba(255,255,255,0.1)', textAlign:'center', marginBottom:'32px' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🌱</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', color:W, marginBottom:'8px' }}>No products yet</div>
            <Link href="/ai-income/ignition" style={{ display:'inline-block', padding:'12px 28px', borderRadius:'10px', background:GOLD, color:'#050A18', fontWeight:900, fontSize:'14px', textDecoration:'none', marginTop:'12px', fontFamily:'Cinzel,Georgia,serif' }}>
              Build Your First Product →
            </Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'32px' }}>
            {projects.map(proj => {
              const gear = proj.current_gear ?? 1
              const pct  = Math.round((gear / 7) * 100)
              return (
                <div key={proj.id} style={{ borderRadius:'14px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', overflow:'hidden' }}>
                  <div style={{ height:'3px', background:'rgba(255,255,255,0.06)' }}>
                    <div style={{ width:pct+'%', height:'100%', background:GREEN }} />
                  </div>
                  <div style={{ padding:'16px' }}>
                    <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:W, marginBottom:'6px' }}>
                      {proj.title ?? 'Untitled Product'}
                    </div>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'12px', flexWrap:'wrap' }}>
                      <div style={{ fontSize:'11px', color:GREEN }}>✅ Live · Gear {gear} — {GEAR_LABELS[gear]}</div>
                      <div style={{ fontSize:'10px', color:MUTED }}>{new Date(proj.updated_at).toLocaleDateString('en-ZA')}</div>
                    </div>
                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                      <button onClick={() => downloadHTML(proj.session_id, proj.title ?? 'product')}
                        disabled={dlLoading === proj.session_id + '-html'}
                        style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid rgba(212,175,55,0.4)', background:'rgba(212,175,55,0.08)', color:GOLD, fontSize:'12px', cursor:'pointer', fontWeight:700 }}>
                        {dlLoading === proj.session_id + '-html' ? '...' : '⬇️ HTML'}
                      </button>

                      <Link href={`/marketplace`}
                        style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.06)', color:GREEN, fontSize:'12px', textDecoration:'none', fontWeight:700 }}>
                        🏪 Marketplace
                      </Link>
                      <button onClick={() => setShowLinkForm(showLinkForm === proj.session_id ? null : proj.session_id)}
                        style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid rgba(16,185,129,0.4)', background:'rgba(16,185,129,0.08)', color:GREEN, fontSize:'12px', cursor:'pointer', fontWeight:700 }}>
                        🔗 Generate Link
                      </button>
                      {marketingKit[proj.session_id] && (
                        <button onClick={() => setShowMarketing(showMarketing === proj.session_id ? null : proj.session_id)}
                          style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid rgba(139,92,246,0.4)', background:'rgba(139,92,246,0.08)', color:'#8B5CF6', fontSize:'12px', cursor:'pointer', fontWeight:700 }}>
                          📣 Marketing Kit
                        </button>
                      )}
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
                    )}
                  {showMarketing === proj.session_id && marketingKit[proj.session_id] && (
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
          </div>
        )}

        {/* Saved Personas */}
        {personas.length > 0 && (
          <div style={{ marginBottom:'32px' }}>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:W, marginBottom:'14px' }}>
              👤 Saved Buyer Personas ({personas.length}/5)
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {personas.map(p => (
                <div key={p.id} style={{ padding:'14px 16px', borderRadius:'12px', border:'1px solid rgba(212,175,55,0.2)', background:'rgba(212,175,55,0.04)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:GOLD, fontSize:'13px', marginBottom:'4px' }}>{p.persona_name}</div>
                    <div style={{ fontSize:'11px', color:MUTED, lineHeight:1.6 }}>{p.summary?.slice(0, 120)}</div>
                  </div>
                  <button onClick={() => deletePersona(p.id)} style={{ background:'transparent', border:'none', color:MUTED, cursor:'pointer', fontSize:'16px' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Ideas */}
        {savedIdeas.length > 0 && (
          <div style={{ marginBottom:'32px' }}>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:W, marginBottom:'14px' }}>
              💡 Saved Ideas ({savedIdeas.length})
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {savedIdeas.map(idea => (
                <div key={idea.id} style={{ padding:'14px 16px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.02)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:W, marginBottom:'4px' }}>{idea.title ?? 'Saved Idea'}</div>
                    <div style={{ fontSize:'11px', color:MUTED }}>{idea.idea_data?.format ?? ''}</div>
                  </div>
                  <button onClick={() => {
                    sessionStorage.setItem('v3_selected_opportunity', JSON.stringify(idea.idea_data))
                    window.location.href = '/ai-income/gear/1'
                  }} style={{ padding:'6px 14px', borderRadius:'8px', border:'none', cursor:'pointer', background:GOLD, color:'#050A18', fontSize:'11px', fontWeight:700, fontFamily:'Cinzel,Georgia,serif', flexShrink:0 }}>
                    Build →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default function ProductionPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading...</div>}>
      <ProductionInner />
    </Suspense>
  )
}
