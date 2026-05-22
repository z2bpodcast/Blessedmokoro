'use client'
// File: app/store/[slug]/affiliates/page.tsx
// PWA 5 — Affiliate Network (Gold+)
// Builder's own affiliate program — 100% theirs

import { useState, useEffect, Suspense } from 'react'
import { useParams }    from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AffiliateProgram {
  id:              string
  pwa_id:          string
  builder_id:      string
  commission_rate: number
  cookie_days:     number
  auto_approve:    boolean
  payout_method:   string
  payout_details:  string
  terms:           string
  is_active:       boolean
}

interface Affiliate {
  id:           string
  pwa_id:       string
  name:         string
  email:        string
  ref_code:     string
  status:       string
  total_clicks: number
  total_sales:  number
  total_earned: number
  paid_out:     number
  joined_at:    string
}

function AffiliatesInner() {
  const params = useParams()
  const slug   = params.slug as string

  const [pwa,       setPwa]       = useState<any>(null)
  const [program,   setProgram]   = useState<AffiliateProgram | null>(null)
  const [affiliates,setAffiliates]= useState<Affiliate[]>([])
  const [myAffiliate,setMyAffiliate] = useState<Affiliate | null>(null)
  const [user,      setUser]      = useState<any>(null)
  const [isBuilder, setIsBuilder] = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [notFound,  setNotFound]  = useState(false)
  const [tab,       setTab]       = useState<'overview'|'apply'|'dashboard'|'admin'>('overview')
  const [copied,    setCopied]    = useState(false)

  // Apply form
  const [appName,    setAppName]    = useState('')
  const [appEmail,   setAppEmail]   = useState('')
  const [appWhy,     setAppWhy]     = useState('')
  const [appSent,    setAppSent]    = useState(false)
  const [appLoading, setAppLoading] = useState(false)

  // Admin
  const [adminTab,   setAdminTab]   = useState<'affiliates'|'payouts'|'settings'>('affiliates')
  const [editProgram,setEditProgram]= useState<Partial<AffiliateProgram>>({})
  const [saveMsg,    setSaveMsg]    = useState('')
  const [payoutNote, setPayoutNote] = useState<Record<string,string>>({})

  const accent = pwa?.accent_color ?? '#D4AF37'
  const BG     = '#050A18'
  const SURF   = '#0D1629'
  const W      = '#F0F9FF'
  const MUTED  = '#64748B'
  const GREEN  = '#10B981'

  useEffect(() => { loadAll() }, [slug])

  async function loadAll() {
    setLoading(true)
    const sb = supabase as any

    const { data: pwaData } = await sb.from('builder_pwas')
      .select('*').eq('slug', slug).eq('is_live', true).maybeSingle()
    if (!pwaData) { setNotFound(true); setLoading(false); return }
    setPwa(pwaData)

    // Load affiliate program settings
    const { data: prog } = await sb.from('affiliate_programs')
      .select('*').eq('pwa_id', pwaData.id).maybeSingle()
    setProgram(prog)
    setEditProgram(prog ?? { commission_rate:20, cookie_days:30, auto_approve:false, payout_method:'bank_transfer', is_active:true })

    // Check auth
    const { data: { user: u } } = await supabase.auth.getUser()
    if (u) {
      setUser(u)
      const isB = u.id === pwaData.builder_id
      setIsBuilder(isB)
      setAppName(u.user_metadata?.full_name ?? '')
      setAppEmail(u.email ?? '')

      // Check if already an affiliate
      const { data: myAff } = await sb.from('store_affiliates')
        .select('*').eq('pwa_id', pwaData.id).eq('user_id', u.id).maybeSingle()
      setMyAffiliate(myAff)

      // Load all affiliates if builder
      if (isB) {
        const { data: affs } = await sb.from('store_affiliates')
          .select('*').eq('pwa_id', pwaData.id)
          .order('total_earned', { ascending: false })
        setAffiliates(affs ?? [])
      }
    }

    setLoading(false)
  }

  async function applyAsAffiliate() {
    if (!appName || !appEmail) return
    setAppLoading(true)
    const sb = supabase as any

    // Generate unique ref code
    const refCode = appName.slice(0,3).toUpperCase().replace(/\s/g,'') +
      Math.random().toString(36).slice(2,6).toUpperCase()

    await sb.from('store_affiliates').insert({
      pwa_id:       pwa.id,
      user_id:      user?.id ?? null,
      name:         appName,
      email:        appEmail,
      why:          appWhy,
      ref_code:     refCode,
      status:       program?.auto_approve ? 'active' : 'pending',
      commission_rate: program?.commission_rate ?? 20,
      total_clicks: 0,
      total_sales:  0,
      total_earned: 0,
      paid_out:     0,
      joined_at:    new Date().toISOString(),
    })

    setAppSent(true)
    setAppLoading(false)
    loadAll()
  }

  async function approveAffiliate(id: string, status: 'active'|'rejected') {
    const sb = supabase as any
    await sb.from('store_affiliates').update({ status }).eq('id', id)
    loadAll()
  }

  async function markPaid(affiliateId: string, amount: number) {
    const sb = supabase as any
    await sb.from('store_affiliates').update({
      paid_out: amount,
    }).eq('id', affiliateId)
    await sb.from('affiliate_payouts').insert({
      pwa_id:       pwa.id,
      affiliate_id: affiliateId,
      amount,
      method:       program?.payout_method ?? 'bank_transfer',
      note:         payoutNote[affiliateId] ?? '',
      paid_at:      new Date().toISOString(),
    })
    loadAll()
  }

  async function saveProgram() {
    const sb = supabase as any
    if (program?.id) {
      await sb.from('affiliate_programs').update(editProgram).eq('id', program.id)
    } else {
      await sb.from('affiliate_programs').insert({ ...editProgram, pwa_id: pwa.id, builder_id: pwa.builder_id })
    }
    setSaveMsg('✓ Settings saved!')
    setTimeout(() => setSaveMsg(''), 2500)
    loadAll()
  }

  function copyLink() {
    const link = `${window.location.origin}/store/${slug}?aff=${myAffiliate?.ref_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function getUnpaid(aff: Affiliate): number {
    return Math.max(0, (aff.total_earned ?? 0) - (aff.paid_out ?? 0))
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:accent, fontFamily:'Georgia,serif', fontSize:13 }}>Loading...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:W, fontFamily:'Georgia,serif', textAlign:'center' }}>
      <div>
        <div style={{ fontSize:48, marginBottom:16 }}>🔗</div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:22, fontWeight:900 }}>Affiliate Program Not Found</div>
      </div>
    </div>
  )

  const inp = { width:'100%', padding:'10px 14px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}20`, color:W, fontFamily:'Georgia,serif', fontSize:13, outline:'none', marginBottom:10, boxSizing:'border-box' as const }

  const totalPending  = affiliates.filter(a => a.status === 'pending').length
  const totalActive   = affiliates.filter(a => a.status === 'active').length
  const totalEarned   = affiliates.reduce((s, a) => s + (a.total_earned ?? 0), 0)
  const totalUnpaid   = affiliates.reduce((s, a) => s + getUnpaid(a), 0)

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', paddingBottom:80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing:border-box; }
        .aff-row:hover { background:rgba(255,255,255,0.04) !important; }
      `}</style>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${accent}18,#1a0d35,${BG})`, padding:'32px 20px 24px', textAlign:'center', borderBottom:`1px solid ${accent}20` }}>
        <div style={{ fontSize:10, color:accent, letterSpacing:4, textTransform:'uppercase', marginBottom:8 }}>Affiliate Program</div>
        <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'clamp(20px,4vw,32px)', fontWeight:900, color:W, marginBottom:6 }}>
          {pwa?.display_name} Affiliates
        </h1>
        <p style={{ fontSize:13, color:MUTED, maxWidth:480, margin:'0 auto' }}>
          Earn {program?.commission_rate ?? 20}% commission promoting {pwa?.display_name}'s products
        </p>
      </div>

      {/* Nav */}
      <div style={{ background:SURF, borderBottom:`1px solid ${accent}20`, overflowX:'auto' }}>
        <div style={{ display:'flex', maxWidth:780, margin:'0 auto', padding:'0 16px' }}>
          {[
            { id:'overview',   label:'🌟 Overview'   },
            { id:'apply',      label:'✋ Apply'       },
            ...(myAffiliate ? [{ id:'dashboard', label:'📊 My Dashboard' }] : []),
            ...(isBuilder ? [{ id:'admin', label:'⚙️ Admin' }] : []),
          ].map((t: any) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:'13px 16px', border:'none', cursor:'pointer', background:'transparent', color: tab===t.id ? accent : MUTED, borderBottom: tab===t.id ? `2px solid ${accent}` : '2px solid transparent', fontSize:13, fontWeight: tab===t.id ? 700 : 400, whiteSpace:'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:780, margin:'0 auto', padding:'28px 16px' }}>

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div>
            {/* Program stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:32 }}>
              {[
                { label:'Commission Rate', value:`${program?.commission_rate ?? 20}%`,        color:accent },
                { label:'Cookie Duration', value:`${program?.cookie_days ?? 30} days`,        color:accent },
                { label:'Active Affiliates',value:`${totalActive}`,                           color:GREEN  },
                { label:'Payout Method',    value:program?.payout_method?.replace('_',' ') ?? 'Bank Transfer', color:MUTED },
              ].map(s => (
                <div key={s.label} style={{ padding:'16px', borderRadius:12, background:SURF, border:`1px solid ${accent}15`, textAlign:'center' }}>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:20, fontWeight:900, color:s.color, marginBottom:4 }}>{s.value}</div>
                  <div style={{ fontSize:11, color:MUTED }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div style={{ marginBottom:32 }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:20 }}>How It Works</div>
              {[
                { num:'1', title:'Apply',          desc:`Fill in the application form. ${program?.auto_approve ? 'Applications are auto-approved.' : 'The builder reviews and approves your application.'}` },
                { num:'2', title:'Get Your Link',  desc:'Once approved you receive your unique affiliate link to share everywhere.' },
                { num:'3', title:'Promote',        desc:`Share your link on WhatsApp, social media, email — anywhere your audience is.` },
                { num:'4', title:'Earn',           desc:`Earn ${program?.commission_rate ?? 20}% commission on every sale through your link. Tracked for ${program?.cookie_days ?? 30} days.` },
                { num:'5', title:'Get Paid',       desc:`The builder pays you directly via ${program?.payout_method?.replace('_',' ') ?? 'bank transfer'} once your earnings are confirmed.` },
              ].map(step => (
                <div key={step.num} style={{ display:'flex', gap:16, padding:'16px', borderRadius:12, background:SURF, border:`1px solid ${accent}12`, marginBottom:10 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:`${accent}18`, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cinzel,Georgia,serif', fontWeight:900, color:accent, flexShrink:0, fontSize:14 }}>
                    {step.num}
                  </div>
                  <div>
                    <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, fontWeight:900, color:W, marginBottom:4 }}>{step.title}</div>
                    <div style={{ fontSize:13, color:MUTED, lineHeight:1.7 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Terms */}
            {program?.terms && (
              <div style={{ padding:20, borderRadius:12, background:`${accent}06`, border:`1px solid ${accent}15` }}>
                <div style={{ fontSize:11, color:accent, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Program Terms</div>
                <div style={{ fontSize:13, color:MUTED, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{program.terms}</div>
              </div>
            )}

            <button onClick={() => setTab('apply')}
              style={{ width:'100%', marginTop:24, padding:14, borderRadius:12, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:15, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
              Apply to Become an Affiliate →
            </button>
          </div>
        )}

        {/* ══ APPLY ══ */}
        {tab === 'apply' && (
          <div>
            {myAffiliate ? (
              <div style={{ textAlign:'center', padding:'40px 20px' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:20, fontWeight:900, color:W, marginBottom:8 }}>
                  You're Already an Affiliate!
                </div>
                <div style={{ fontSize:13, color:MUTED, marginBottom:20 }}>
                  Status: <strong style={{ color: myAffiliate.status === 'active' ? GREEN : accent }}>{myAffiliate.status.toUpperCase()}</strong>
                </div>
                {myAffiliate.status === 'active' && (
                  <button onClick={() => setTab('dashboard')}
                    style={{ padding:'12px 28px', borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                    View My Dashboard →
                  </button>
                )}
              </div>
            ) : appSent ? (
              <div style={{ textAlign:'center', padding:'40px 20px' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:20, fontWeight:900, color:W, marginBottom:8 }}>Application Submitted!</div>
                <div style={{ fontSize:13, color:MUTED }}>
                  {program?.auto_approve
                    ? 'You have been approved! Check your dashboard.'
                    : `${pwa?.display_name} will review your application and get back to you.`}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:6 }}>Apply to Join</div>
                <div style={{ fontSize:13, color:MUTED, marginBottom:24, lineHeight:1.7 }}>
                  Apply to become an affiliate for {pwa?.display_name}. Earn {program?.commission_rate ?? 20}% on every sale you refer.
                </div>

                <label style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', display:'block', marginBottom:5 }}>Your Name *</label>
                <input style={inp} placeholder="Full name" value={appName} onChange={e => setAppName(e.target.value)} />

                <label style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', display:'block', marginBottom:5 }}>Email Address *</label>
                <input style={inp} type="email" placeholder="email@example.com" value={appEmail} onChange={e => setAppEmail(e.target.value)} />

                <label style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', display:'block', marginBottom:5 }}>Why do you want to promote {pwa?.display_name}?</label>
                <textarea rows={4} style={{ ...inp, resize:'vertical' }}
                  placeholder="Tell us about your audience and how you plan to promote..."
                  value={appWhy} onChange={e => setAppWhy(e.target.value)} />

                <button onClick={applyAsAffiliate} disabled={!appName || !appEmail || appLoading}
                  style={{ width:'100%', padding:14, borderRadius:12, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:15, border:'none', cursor:(!appName||!appEmail||appLoading)?'not-allowed':'pointer', fontFamily:'Cinzel,Georgia,serif', opacity:(!appName||!appEmail)?0.5:1 }}>
                  {appLoading ? 'Submitting...' : 'Submit Application →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ AFFILIATE DASHBOARD ══ */}
        {tab === 'dashboard' && myAffiliate && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:20 }}>My Affiliate Dashboard</div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginBottom:28 }}>
              {[
                { label:'Total Clicks',  value:myAffiliate.total_clicks ?? 0,                          color:accent },
                { label:'Total Sales',   value:myAffiliate.total_sales ?? 0,                           color:accent },
                { label:'Total Earned',  value:`R${(myAffiliate.total_earned ?? 0).toFixed(2)}`,        color:GREEN  },
                { label:'Awaiting Payout',value:`R${getUnpaid(myAffiliate).toFixed(2)}`,               color:accent },
              ].map(s => (
                <div key={s.label} style={{ padding:'16px', borderRadius:12, background:SURF, border:`1px solid ${accent}15`, textAlign:'center' }}>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:11, color:MUTED, marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Status badge */}
            <div style={{ padding:'10px 16px', borderRadius:10, background: myAffiliate.status==='active' ? 'rgba(16,185,129,0.1)' : `${accent}10`, border:`1px solid ${myAffiliate.status==='active' ? 'rgba(16,185,129,0.3)' : accent+'30'}`, marginBottom:20, display:'inline-flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color: myAffiliate.status==='active' ? GREEN : accent }}>
                {myAffiliate.status === 'active' ? '✓ Active Affiliate' : `Status: ${myAffiliate.status}`}
              </span>
            </div>

            {/* Affiliate link */}
            {myAffiliate.status === 'active' && (
              <div style={{ padding:20, borderRadius:14, background:SURF, border:`1px solid ${accent}20`, marginBottom:20 }}>
                <div style={{ fontSize:11, color:accent, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>Your Affiliate Link</div>
                <div style={{ fontSize:12, color:MUTED, wordBreak:'break-all', marginBottom:12, padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.04)' }}>
                  {typeof window !== 'undefined' ? window.location.origin : 'https://app.z2blegacybuilders.co.za'}/store/{slug}?aff={myAffiliate.ref_code}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <button onClick={copyLink}
                    style={{ padding:'10px', borderRadius:8, background: copied ? 'rgba(16,185,129,0.15)' : `${accent}15`, border:`1px solid ${copied ? 'rgba(16,185,129,0.3)' : accent+'30'}`, color: copied ? GREEN : accent, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                    {copied ? '✓ Copied!' : '📋 Copy Link'}
                  </button>
                  <a href={`https://wa.me/?text=${encodeURIComponent('Check out ' + (pwa?.display_name ?? 'this store') + '! ' + (typeof window !== 'undefined' ? window.location.origin : '') + '/store/' + slug + '?aff=' + myAffiliate.ref_code)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ padding:'10px', borderRadius:8, background:'rgba(37,211,102,0.1)', border:'1px solid rgba(37,211,102,0.3)', color:'#25D166', fontWeight:700, fontSize:12, textDecoration:'none', textAlign:'center', fontFamily:'Cinzel,Georgia,serif' }}>
                    💬 Share on WhatsApp
                  </a>
                </div>
              </div>
            )}

            {/* Commission info */}
            <div style={{ padding:16, borderRadius:12, background:`${accent}06`, border:`1px solid ${accent}15` }}>
              <div style={{ fontSize:11, color:accent, letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>Payout Information</div>
              <div style={{ fontSize:13, color:MUTED, lineHeight:1.8 }}>
                Commission rate: <strong style={{ color:W }}>{myAffiliate.commission_rate ?? program?.commission_rate ?? 20}%</strong><br/>
                Payout method: <strong style={{ color:W }}>{program?.payout_method?.replace('_',' ') ?? 'Bank Transfer'}</strong><br/>
                {program?.payout_details && <span>Details: <strong style={{ color:W }}>{program.payout_details}</strong></span>}
              </div>
            </div>
          </div>
        )}

        {/* ══ ADMIN ══ */}
        {tab === 'admin' && isBuilder && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:W, marginBottom:20 }}>Affiliate Program Admin</div>

            {/* Admin stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginBottom:24 }}>
              {[
                { label:'Total Affiliates',  value:affiliates.length,              color:accent },
                { label:'Active',            value:totalActive,                    color:GREEN  },
                { label:'Pending Approval',  value:totalPending,                   color:'#F59E0B' },
                { label:'Total Earned',      value:`R${totalEarned.toFixed(2)}`,   color:GREEN  },
                { label:'Unpaid',            value:`R${totalUnpaid.toFixed(2)}`,   color:'#EF4444' },
              ].map(s => (
                <div key={s.label} style={{ padding:'14px', borderRadius:12, background:SURF, border:`1px solid ${accent}15`, textAlign:'center' }}>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:10, color:MUTED, marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Admin sub-tabs */}
            <div style={{ display:'flex', gap:6, marginBottom:20 }}>
              {[
                { id:'affiliates', label:'🔗 Affiliates' },
                { id:'payouts',    label:'💰 Payouts'    },
                { id:'settings',   label:'⚙️ Settings'   },
              ].map(t => (
                <button key={t.id} onClick={() => setAdminTab(t.id as any)}
                  style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${adminTab===t.id ? accent : accent+'30'}`, background: adminTab===t.id ? `${accent}18` : 'transparent', color: adminTab===t.id ? accent : MUTED, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Georgia,serif' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Affiliates list */}
            {adminTab === 'affiliates' && (
              <div>
                {affiliates.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px 20px', color:MUTED }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>🔗</div>
                    <div style={{ fontSize:15, color:W, marginBottom:6 }}>No affiliates yet</div>
                    <div style={{ fontSize:13 }}>Share your affiliate program page to recruit promoters</div>
                  </div>
                ) : affiliates.map(aff => (
                  <div key={aff.id} className="aff-row"
                    style={{ padding:'16px', borderRadius:12, background:SURF, border:`1px solid ${accent}12`, marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, flexWrap:'wrap', gap:8 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:W, marginBottom:2 }}>{aff.name}</div>
                        <div style={{ fontSize:12, color:MUTED }}>{aff.email}</div>
                        <div style={{ fontSize:11, color:accent, marginTop:4 }}>Ref: {aff.ref_code}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:10, padding:'3px 10px', borderRadius:10, display:'inline-block', background: aff.status==='active' ? 'rgba(16,185,129,0.12)' : aff.status==='pending' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)', color: aff.status==='active' ? GREEN : aff.status==='pending' ? '#F59E0B' : '#EF4444', fontWeight:700, marginBottom:6 }}>
                          {aff.status.toUpperCase()}
                        </div>
                        <div style={{ fontSize:12, color:GREEN, fontWeight:700 }}>R{(aff.total_earned ?? 0).toFixed(2)} earned</div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display:'flex', gap:16, fontSize:11, color:MUTED, marginBottom:10 }}>
                      <span>{aff.total_clicks ?? 0} clicks</span>
                      <span>{aff.total_sales ?? 0} sales</span>
                      <span>R{getUnpaid(aff).toFixed(2)} unpaid</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {aff.status === 'pending' && (
                        <>
                          <button onClick={() => approveAffiliate(aff.id, 'active')}
                            style={{ padding:'6px 14px', borderRadius:8, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:GREEN, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                            ✓ Approve
                          </button>
                          <button onClick={() => approveAffiliate(aff.id, 'rejected')}
                            style={{ padding:'6px 14px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#FCA5A5', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                            ✗ Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payouts */}
            {adminTab === 'payouts' && (
              <div>
                <div style={{ fontSize:12, color:MUTED, marginBottom:16 }}>
                  Mark affiliates as paid after you have transferred their earnings directly.
                </div>
                {affiliates.filter(a => getUnpaid(a) > 0).map(aff => (
                  <div key={aff.id} style={{ padding:'16px', borderRadius:12, background:SURF, border:`1px solid ${accent}15`, marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:W }}>{aff.name}</div>
                        <div style={{ fontSize:12, color:MUTED }}>{aff.email}</div>
                      </div>
                      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:18, fontWeight:900, color:'#EF4444' }}>
                        R{getUnpaid(aff).toFixed(2)} due
                      </div>
                    </div>
                    <input placeholder="Payment note (optional)" value={payoutNote[aff.id] ?? ''}
                      onChange={e => setPayoutNote({...payoutNote, [aff.id]: e.target.value})}
                      style={{ ...inp, marginBottom:10 }} />
                    <button onClick={() => markPaid(aff.id, aff.total_earned)}
                      style={{ width:'100%', padding:11, borderRadius:8, background:`linear-gradient(135deg,${GREEN},#059669)`, color:W, fontWeight:900, fontSize:13, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                      ✓ Mark as Paid — R{getUnpaid(aff).toFixed(2)}
                    </button>
                  </div>
                ))}
                {affiliates.filter(a => getUnpaid(a) > 0).length === 0 && (
                  <div style={{ textAlign:'center', padding:'40px 20px', color:MUTED }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                    <div style={{ fontSize:15, color:W }}>All affiliates are paid up!</div>
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            {adminTab === 'settings' && (
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Commission Rate (%)</div>
                <input type="number" style={inp} placeholder="20" value={(editProgram as any).commission_rate ?? 20}
                  onChange={e => setEditProgram({...editProgram, commission_rate:Number(e.target.value)})} />

                <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Cookie Duration (days)</div>
                <input type="number" style={inp} placeholder="30" value={(editProgram as any).cookie_days ?? 30}
                  onChange={e => setEditProgram({...editProgram, cookie_days:Number(e.target.value)})} />

                <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Payout Method</div>
                <select value={(editProgram as any).payout_method ?? 'bank_transfer'}
                  onChange={e => setEditProgram({...editProgram, payout_method:e.target.value})}
                  style={{ ...inp, cursor:'pointer' }}>
                  <option value="bank_transfer">Bank Transfer (EFT)</option>
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="paypal">PayPal</option>
                </select>

                <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Payout Details (account number etc)</div>
                <input style={inp} placeholder="Your bank account details for affiliates to reference"
                  value={(editProgram as any).payout_details ?? ''}
                  onChange={e => setEditProgram({...editProgram, payout_details:e.target.value})} />

                <div style={{ fontSize:10, color:MUTED, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Program Terms</div>
                <textarea rows={5} style={{ ...inp, resize:'vertical' }}
                  placeholder="Terms and conditions for your affiliate program..."
                  value={(editProgram as any).terms ?? ''}
                  onChange={e => setEditProgram({...editProgram, terms:e.target.value})} />

                <label style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, cursor:'pointer' }}>
                  <input type="checkbox" checked={(editProgram as any).auto_approve ?? false}
                    onChange={e => setEditProgram({...editProgram, auto_approve:e.target.checked})} />
                  <span style={{ fontSize:13, color:W }}>Auto-approve affiliate applications</span>
                </label>

                <label style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, cursor:'pointer' }}>
                  <input type="checkbox" checked={(editProgram as any).is_active ?? true}
                    onChange={e => setEditProgram({...editProgram, is_active:e.target.checked})} />
                  <span style={{ fontSize:13, color:W }}>Program is active (accepting applications)</span>
                </label>

                <button onClick={saveProgram}
                  style={{ padding:'13px', borderRadius:10, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:BG, fontWeight:900, fontSize:14, border:'none', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                  Save Settings
                </button>
                {saveMsg && <div style={{ textAlign:'center', color:GREEN, fontSize:13, marginTop:8 }}>{saveMsg}</div>}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ textAlign:'center', padding:'20px', fontSize:10, color:`${MUTED}60` }}>
        Powered by <a href="https://app.z2blegacybuilders.co.za/ai-income" style={{ color:accent, textDecoration:'none' }}>Z2B 4M Machine</a>
      </div>
    </div>
  )
}

export default function AffiliatesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>
        Loading...
      </div>
    }>
      <AffiliatesInner />
    </Suspense>
  )
}
