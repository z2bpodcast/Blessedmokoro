'use client'
// File: app/store/[slug]/brand/page.tsx
// PWA 3 — Personal Brand Site (Silver+)
// Builder's own: Bio · Links · Testimonials · Lead Capture · Contact

import { useState, useEffect, Suspense } from 'react'
import { useParams }     from 'next/navigation'
import { createClient }  from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── TYPES ─────────────────────────────────────────────────────
interface BrandProfile {
  id:            string
  pwa_id:        string
  builder_id:    string
  display_name:  string
  tagline:       string
  bio:           string
  photo_url:     string
  banner_url:    string
  accent_color:  string
  location:      string
  email:         string
  phone:         string
}

interface BrandLink {
  id:       string
  pwa_id:   string
  label:    string
  url:      string
  icon:     string
  order:    number
  active:   boolean
}

interface Testimonial {
  id:          string
  pwa_id:      string
  author_name: string
  author_role: string
  content:     string
  rating:      number
  approved:    boolean
}

interface Lead {
  name:  string
  email: string
  message: string
}

function BrandInner() {
  const params   = useParams()
  const slug     = params.slug as string

  const [pwa,          setPwa]          = useState<any>(null)
  const [brand,        setBrand]        = useState<BrandProfile | null>(null)
  const [links,        setLinks]        = useState<BrandLink[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [user,         setUser]         = useState<any>(null)
  const [isBuilder,    setIsBuilder]    = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [notFound,     setNotFound]     = useState(false)
  const [section,      setSection]      = useState<'brand'|'links'|'testimonials'|'contact'|'admin'>('brand')

  // Lead capture form
  const [leadName,    setLeadName]    = useState('')
  const [leadEmail,   setLeadEmail]   = useState('')
  const [leadMsg,     setLeadMsg]     = useState('')
  const [leadSent,    setLeadSent]    = useState(false)
  const [leadLoading, setLeadLoading] = useState(false)

  // Admin states
  const [adminSection, setAdminSection] = useState<'profile'|'links'|'testimonials'|'leads'>('profile')
  const [leads,        setLeads]        = useState<any[]>([])
  const [editBrand,    setEditBrand]    = useState<Partial<BrandProfile>>({})
  const [newLink,      setNewLink]      = useState({ label:'', url:'', icon:'🔗' })
  const [saveMsg,      setSaveMsg]      = useState('')

  const accent = pwa?.accent_color ?? '#D4AF37'
  const BG     = '#050A18'
  const SURF   = '#0D1629'
  const W      = '#F0F9FF'
  const MUTED  = '#64748B'

  useEffect(() => { loadAll() }, [slug])

  async function loadAll() {
    setLoading(true)
    const sb = supabase as any

    // Load PWA
    const { data: pwaData } = await sb.from('builder_pwas')
      .select('*').eq('slug', slug).eq('is_live', true).maybeSingle()
    if (!pwaData) { setNotFound(true); setLoading(false); return }
    setPwa(pwaData)

    // Load brand profile
    const { data: brandData } = await sb.from('brand_profiles')
      .select('*').eq('pwa_id', pwaData.id).maybeSingle()
    setBrand(brandData)
    setEditBrand(brandData ?? {})

    // Load links
    const { data: linksData } = await sb.from('brand_links')
      .select('*').eq('pwa_id', pwaData.id).eq('active', true)
      .order('order', { ascending: true })
    setLinks(linksData ?? [])

    // Load approved testimonials
    const { data: testiData } = await sb.from('brand_testimonials')
      .select('*').eq('pwa_id', pwaData.id).eq('approved', true)
      .order('created_at', { ascending: false })
    setTestimonials(testiData ?? [])

    // Check auth
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      setUser(u)
      setIsBuilder(u.id === pwaData.builder_id)
      // Load leads if builder
      if (u.id === pwaData.builder_id) {
        const { data: leadsData } = await sb.from('brand_leads')
          .select('*').eq('pwa_id', pwaData.id)
          .order('created_at', { ascending: false })
        setLeads(leadsData ?? [])
      }
    }

    setLoading(false)
  }

  async function submitLead() {
    if (!leadName || !leadEmail) return
    setLeadLoading(true)
    const sb = supabase as any
    await sb.from('brand_leads').insert({
      pwa_id:    pwa.id,
      name:      leadName,
      email:     leadEmail,
      message:   leadMsg,
      created_at: new Date().toISOString(),
    })
    setLeadSent(true)
    setLeadLoading(false)
  }

  async function saveBrand() {
    const sb = supabase as any
    if (brand?.id) {
      await sb.from('brand_profiles').update(editBrand).eq('id', brand.id)
    } else {
      await sb.from('brand_profiles').insert({ ...editBrand, pwa_id: pwa.id, builder_id: pwa.builder_id })
    }
    setSaveMsg('✓ Saved!')
    setTimeout(() => setSaveMsg(''), 2500)
    loadAll()
  }

  async function addLink() {
    if (!newLink.label || !newLink.url) return
    const sb = supabase as any
    await sb.from('brand_links').insert({
      pwa_id: pwa.id,
      label:  newLink.label,
      url:    newLink.url.startsWith('http') ? newLink.url : 'https://' + newLink.url,
      icon:   newLink.icon,
      order:  links.length + 1,
      active: true,
    })
    setNewLink({ label:'', url:'', icon:'🔗' })
    loadAll()
  }

  async function deleteLink(id: string) {
    const sb = supabase as any
    await sb.from('brand_links').delete().eq('id', id)
    loadAll()
  }

  async function approveTestimonial(id: string, approved: boolean) {
    const sb = supabase as any
    await sb.from('brand_testimonials').update({ approved }).eq('id', id)
    loadAll()
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:accent, fontFamily:'Georgia,serif', fontSize:13 }}>Loading...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:W, fontFamily:'Georgia,serif', textAlign:'center', padding:20 }}>
      <div>
        <div style={{ fontSize:48, marginBottom:16 }}>🌟</div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:22, fontWeight:900, marginBottom:8 }}>Brand Not Found</div>
        <div style={{ color:MUTED, fontSize:14 }}>This personal brand page may not be live yet.</div>
      </div>
    </div>
  )

  const inp = {
    width:'100%', padding:'10px 14px', borderRadius:8,
    background:'rgba(255,255,255,0.04)',
    border:`1px solid ${accent}20`, color:W,
    fontFamily:'Georgia,serif', fontSize:13, outline:'none',
    marginBottom:10, boxSizing:'border-box' as const,
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', paddingBottom:80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; }
        .link-card:hover { transform:translateY(-2px); border-color:${accent}60 !important; }
        .testi-card:hover { border-color:${accent}30 !important; }
        .tab-btn-brand { transition:all 0.15s; }
      `}</style>

      {/* ── HERO BANNER ── */}
      <div style={{
        minHeight:280,
        background: brand?.banner_url
          ? `url(${brand.banner_url}) center/cover`
          : `linear-gradient(135deg,${accent}22,#1a0d35,#050A18)`,
        position:'relative', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'flex-end',
        paddingBottom:60,
      }}>
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)' }} />

        {/* Builder photo */}
        {brand?.photo_url && (
          <div style={{ position:'relative', zIndex:2, marginBottom:12 }}>
            <img src={brand.photo_url} alt={brand?.display_name}
              style={{ width:100, height:100, borderRadius:'50%', objectFit:'cover', border:`3px solid ${accent}`, boxShadow:`0 8px 24px ${accent}30` }} />
          </div>
        )}

        {/* Name + tagline */}
        <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:'0 20px' }}>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(22px,5vw,36px)', fontWeight:900, color:W, marginBottom:6 }}>
            {brand?.display_name ?? pwa?.display_name}
          </h1>
          {brand?.tagline && (
            <p style={{ fontSize:14, color:`${W}80`, fontStyle:'italic', maxWidth:480, margin:'0 auto' }}>
              {brand.tagline}
            </p>
          )}
          {brand?.location && (
            <div style={{ fontSize:12, color:`${W}60`, marginTop:6 }}>📍 {brand.location}</div>
          )}
        </div>

        {/* Store link */}
        <div style={{ position:'relative', zIndex:2, marginTop:16 }}>
          <a href={`/store/${slug}`}
            style={{ padding:'8px 20px', borderRadius:8, background:`${accent}20`, border:`1px solid ${accent}40`, color:accent, textDecoration:'none', fontSize:12, fontWeight:700, fontFamily:'Cinzel,Georgia,serif' }}>
            🛍️ Visit My Store →
          </a>
        </div>
      </div>

      {/* ── NAV TABS ── */}
      <div style={{ background:SURF, borderBottom:`1px solid ${accent}20`, position:'sticky', top:0, zIndex:50, overflowX:'auto' }}>
        <div style={{ display:'flex', maxWidth:680, margin:'0 auto', padding:'0 16px' }}>
          {[
            { id:'brand',        label:'About'        },
            { id:'links',        label:'Links'        },
            { id:'testimonials', label:'Reviews'      },
            { id:'contact',      label:'Contact'      },
            ...(isBuilder ? [{ id:'admin', label:'⚙️ Admin' }] : []),
          ].map((t: any) => (
            <button key={t.id} className="tab-btn-brand"
              onClick={() => setSection(t.id)}
              style={{ padding:'13px 16px', border:'none', cursor:'pointer', background:'transparent', color: section===t.id ? accent : MUTED, borderBottom: section===t.id ? `2px solid ${accent}` : '2px solid transparent', fontSize:13, fontWeight: section===t.id ? 700 : 400, whiteSpace:'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:680, margin:'0 auto', padding:'28px 16px' }}>

        {/* ══ ABOUT ══ */}
        {section === 'brand' && (
          <div>
            {brand?.bio ? (
              <div style={{ fontSize:15, color:`${W}cc`, lineHeight:1.9, marginBottom:28, whiteSpace:'pre-wrap' }}>
                {brand.bio}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'40px 20px', color:MUTED }}>
                <div style={{ fontSize:40, marginBottom:12 }}>✍️</div>
                <div style={{ fontSize:15, color:W, marginBottom:6 }}>No bio yet</div>
                {isBuilder && <div style={{ fontSize:13 }}>Add your story in the Admin panel</div>}
              </div>
            )}

            {/* Stats row */}
            {(links.length > 0 || testimonials.length > 0) && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:10, marginBottom:28 }}>
                {[
                  { label:'Links',    value:links.length        },
                  { label:'Reviews',  value:testimonials.length },
                ].map(s => (
                  <div key={s.label} style={{ padding:'16px', borderRadius:12, background:SURF, border:`1px solid ${accent}15`, textAlign:'center' }}>
                    <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:24, fontWeight:900, color:accent }}>{s.value}</div>
                    <div style={{ fontSize:11, color:MUTED, marginTop:4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ LINKS ══ */}
        {section === 'links' && (
          <div>
            {links.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color:MUTED }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🔗</div>
                <div style={{ fontSize:15, color:W, marginBottom:6 }}>No links yet</div>
                {isBuilder && <div style={{ fontSize:13 }}>Add your links in the Admin panel</div>}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {links.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="link-card"
                    style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderRadius:12, background:SURF, border:`1px solid ${accent}20`, textDecoration:'none', transition:'all 0.2s' }}>
                    <span style={{ fontSize:24, flexShrink:0 }}>{link.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, fontWeight:700, color:W }}>{link.label}</div>
                      <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{link.url}</div>
                    </div>
                    <span style={{ color:accent, fontSize:16 }}>→</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ TESTIMONIALS ══ */}
        {section === 'testimonials' && (
          <div>
            {testimonials.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', color:MUTED }}>
                <div style={{ fontSize:40, marginBottom:12 }}>⭐</div>
                <div style={{ fontSize:15, color:W, marginBottom:6 }}>No reviews yet</div>
                <div style={{ fontSize:13 }}>Be the first to leave a review</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {testimonials.map(t => (
                  <div key={t.id} className="testi-card"
                    style={{ padding:'20px', borderRadius:14, background:SURF, border:`1px solid ${accent}15`, transition:'border-color 0.2s' }}>
                    <div style={{ display:'flex', gap:4, marginBottom:10 }}>
                      {Array.from({length:5}).map((_,i) => (
                        <span key={i} style={{ color: i < t.rating ? accent : MUTED, fontSize:14 }}>★</span>
                      ))}
                    </div>
                    <div style={{ fontSize:14, color:`${W}cc`, lineHeight:1.8, marginBottom:12, fontStyle:'italic' }}>
                      "{t.content}"
                    </div>
                    <div style={{ fontSize:12, fontWeight:700, color:W }}>{t.author_name}</div>
                    {t.author_role && <div style={{ fontSize:11, color:MUTED }}>{t.author_role}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Submit testimonial form */}
            <div style={{ marginTop:28, padding:20, borderRadius:14, background:SURF, border:`1px solid ${accent}15` }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, fontWeight:900, color:accent, marginBottom:16 }}>
                Leave a Review
              </div>
              <SubmitTestimonial pwaId={pwa.id} accent={accent} onSubmit={loadAll} />
            </div>
          </div>
        )}

        {/* ══ CONTACT / LEAD CAPTURE ══ */}
        {section === 'contact' && (
          <div>
            {leadSent ? (
              <div style={{ textAlign:'center', padding:'40px 20px' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>👑</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:20, fontWeight:900, color:W, marginBottom:8 }}>Message Sent!</div>
                <div style={{ fontSize:13, color:MUTED }}>
                  {brand?.display_name ?? pwa?.display_name} will be in touch soon.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:6 }}>
                  Get in Touch
                </div>
                <div style={{ fontSize:13, color:MUTED, marginBottom:24, lineHeight:1.7 }}>
                  Leave your details and {brand?.display_name ?? 'the builder'} will reach out to you directly.
                </div>

                <input style={inp} placeholder="Your name *" value={leadName} onChange={e => setLeadName(e.target.value)} />
                <input style={inp} type="email" placeholder="Email address *" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} />
                <textarea
                  value={leadMsg}
                  onChange={e => setLeadMsg(e.target.value)}
                  placeholder="Your message (optional)"
                  rows={4}
                  style={{ ...inp, resize:'vertical' }}
                />

                <button onClick={submitLead} disabled={!leadName || !leadEmail || leadLoading}
                  style={{ width:'100%', padding:14, borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor: (!leadName||!leadEmail||leadLoading) ? 'not-allowed' : 'pointer', fontFamily:'Cinzel,Georgia,serif', opacity: (!leadName||!leadEmail) ? 0.5 : 1 }}>
                  {leadLoading ? 'Sending...' : 'Send Message →'}
                </button>

                {/* Direct contact info */}
                {(brand?.email || brand?.phone) && (
                  <div style={{ marginTop:20, padding:16, borderRadius:12, background:`${accent}06`, border:`1px solid ${accent}15` }}>
                    <div style={{ fontSize:11, color:accent, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Direct Contact</div>
                    {brand?.email && <div style={{ fontSize:13, color:`${W}cc`, marginBottom:6 }}>✉️ {brand.email}</div>}
                    {brand?.phone && <div style={{ fontSize:13, color:`${W}cc` }}>📱 {brand.phone}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ ADMIN ══ */}
        {section === 'admin' && isBuilder && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:20 }}>
              Brand Admin
            </div>

            {/* Admin sub-tabs */}
            <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:20 }}>
              {[
                { id:'profile',      label:'👤 Profile'      },
                { id:'links',        label:'🔗 Links'        },
                { id:'testimonials', label:'⭐ Reviews'      },
                { id:'leads',        label:'📧 Leads'        },
              ].map(t => (
                <button key={t.id} onClick={() => setAdminSection(t.id as any)}
                  style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${adminSection===t.id ? accent : accent+'30'}`, background: adminSection===t.id ? `${accent}18` : 'transparent', color: adminSection===t.id ? accent : MUTED, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'Georgia,serif' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Profile editor */}
            {adminSection === 'profile' && (
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {[
                  { label:'Display Name',  key:'display_name', type:'text',   ph:'Your name'              },
                  { label:'Tagline',       key:'tagline',      type:'text',   ph:'Your one-liner'         },
                  { label:'Location',      key:'location',     type:'text',   ph:'City, Country'          },
                  { label:'Email',         key:'email',        type:'email',  ph:'your@email.com'         },
                  { label:'Phone',         key:'phone',        type:'text',   ph:'+27...'                 },
                  { label:'Photo URL',     key:'photo_url',    type:'url',    ph:'https://...'            },
                  { label:'Banner URL',    key:'banner_url',   type:'url',    ph:'https://...'            },
                  { label:'Accent Color',  key:'accent_color', type:'color',  ph:'#D4AF37'                },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>{f.label}</div>
                    <input type={f.type} placeholder={f.ph}
                      value={(editBrand as any)[f.key] ?? ''}
                      onChange={e => setEditBrand({ ...editBrand, [f.key]: e.target.value })}
                      style={inp} />
                  </div>
                ))}
                <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Bio</div>
                <textarea rows={6} placeholder="Tell your story..."
                  value={(editBrand as any).bio ?? ''}
                  onChange={e => setEditBrand({ ...editBrand, bio: e.target.value })}
                  style={{ ...inp, resize:'vertical' }} />
                <button onClick={saveBrand}
                  style={{ padding:'13px', borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                  Save Profile
                </button>
                {saveMsg && <div style={{ textAlign:'center', color:'#10B981', fontSize:13, marginTop:8 }}>{saveMsg}</div>}
              </div>
            )}

            {/* Links manager */}
            {adminSection === 'links' && (
              <div>
                {/* Add new link */}
                <div style={{ padding:16, borderRadius:12, background:SURF, border:`1px solid ${accent}20`, marginBottom:16 }}>
                  <div style={{ fontSize:11, color:accent, letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Add New Link</div>
                  <input style={inp} placeholder="Label (e.g. My YouTube)" value={newLink.label} onChange={e => setNewLink({...newLink, label:e.target.value})} />
                  <input style={inp} placeholder="URL (e.g. youtube.com/...)" value={newLink.url} onChange={e => setNewLink({...newLink, url:e.target.value})} />
                  <input style={inp} placeholder="Icon emoji (e.g. 🎥)" value={newLink.icon} onChange={e => setNewLink({...newLink, icon:e.target.value})} />
                  <button onClick={addLink} disabled={!newLink.label||!newLink.url}
                    style={{ width:'100%', padding:11, borderRadius:8, background:accent, color:BG, fontWeight:900, fontSize:12, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                    Add Link →
                  </button>
                </div>

                {/* Existing links */}
                {links.map(link => (
                  <div key={link.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:10, background:SURF, border:`1px solid ${accent}15`, marginBottom:8 }}>
                    <span style={{ fontSize:20 }}>{link.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:W }}>{link.label}</div>
                      <div style={{ fontSize:11, color:MUTED }}>{link.url}</div>
                    </div>
                    <button onClick={() => deleteLink(link.id)}
                      style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#FCA5A5', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontSize:11 }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Testimonials manager */}
            {adminSection === 'testimonials' && (
              <div>
                <div style={{ fontSize:12, color:MUTED, marginBottom:14 }}>Approve or reject reviews from your community</div>
                {[...(testimonials ?? [])].map(t => (
                  <div key={t.id} style={{ padding:'14px 16px', borderRadius:10, background:SURF, border:`1px solid ${accent}15`, marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:W }}>{t.author_name}</div>
                        <div style={{ fontSize:11, color:MUTED }}>{t.author_role}</div>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => approveTestimonial(t.id, true)}
                          style={{ padding:'4px 10px', borderRadius:6, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'#6EE7B7', cursor:'pointer', fontSize:11 }}>
                          ✓ Approve
                        </button>
                        <button onClick={() => approveTestimonial(t.id, false)}
                          style={{ padding:'4px 10px', borderRadius:6, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#FCA5A5', cursor:'pointer', fontSize:11 }}>
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:`${W}80`, fontStyle:'italic' }}>"{t.content}"</div>
                  </div>
                ))}
              </div>
            )}

            {/* Leads list */}
            {adminSection === 'leads' && (
              <div>
                <div style={{ fontSize:12, color:MUTED, marginBottom:14 }}>{leads.length} leads captured</div>
                {leads.map(l => (
                  <div key={l.id} style={{ padding:'14px 16px', borderRadius:10, background:SURF, border:`1px solid ${accent}15`, marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:W }}>{l.name}</div>
                      <div style={{ fontSize:10, color:MUTED }}>{new Date(l.created_at).toLocaleDateString('en-ZA')}</div>
                    </div>
                    <div style={{ fontSize:12, color:accent }}>{l.email}</div>
                    {l.message && <div style={{ fontSize:12, color:MUTED, marginTop:6, fontStyle:'italic' }}>"{l.message}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Powered by Z2B */}
      <div style={{ textAlign:'center', padding:'20px', fontSize:10, color:`${MUTED}60` }}>
        Powered by <a href="https://app.z2blegacybuilders.co.za/ai-income" style={{ color:accent, textDecoration:'none' }}>Z2B 4M Machine</a>
      </div>
    </div>
  )
}

// ── SUBMIT TESTIMONIAL COMPONENT ──────────────────────────────
function SubmitTestimonial({ pwaId, accent, onSubmit }: { pwaId: string; accent: string; onSubmit: () => void }) {
  const [name,    setName]    = useState('')
  const [role,    setRole]    = useState('')
  const [content, setContent] = useState('')
  const [rating,  setRating]  = useState(5)
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  const BG   = '#050A18'
  const W    = '#F0F9FF'
  const MUTED= '#64748B'

  async function submit() {
    if (!name || !content) return
    setLoading(true)
    const sb = supabase as any
    await sb.from('brand_testimonials').insert({
      pwa_id:      pwaId,
      author_name: name,
      author_role: role,
      content,
      rating,
      approved:    false, // builder must approve
      created_at:  new Date().toISOString(),
    })
    setSent(true)
    setLoading(false)
    onSubmit()
  }

  if (sent) return (
    <div style={{ textAlign:'center', padding:'20px 0', color:W, fontSize:13 }}>
      ✓ Review submitted! The builder will review and approve it shortly.
    </div>
  )

  const inp = { width:'100%', padding:'10px 14px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}20`, color:W, fontFamily:'Georgia,serif', fontSize:13, outline:'none', marginBottom:10, boxSizing:'border-box' as const }

  return (
    <div>
      <input style={inp} placeholder="Your name *" value={name} onChange={e => setName(e.target.value)} />
      <input style={inp} placeholder="Your role/title (optional)" value={role} onChange={e => setRole(e.target.value)} />
      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
        {[1,2,3,4,5].map(r => (
          <button key={r} onClick={() => setRating(r)}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color: r <= rating ? accent : MUTED }}>
            ★
          </button>
        ))}
      </div>
      <textarea rows={4} placeholder="Your review *" value={content} onChange={e => setContent(e.target.value)}
        style={{ ...inp, resize:'vertical' }} />
      <button onClick={submit} disabled={!name||!content||loading}
        style={{ width:'100%', padding:12, borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:13, border:'none', cursor:(!name||!content||loading)?'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', opacity:(!name||!content)?0.5:1 }}>
        {loading ? 'Submitting...' : 'Submit Review →'}
      </button>
    </div>
  )
}

export default function BrandPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>
        Loading brand...
      </div>
    }>
      <BrandInner />
    </Suspense>
  )
}
