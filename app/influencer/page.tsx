'use client'
// FILE: app/influencer/page.tsx
// Influencer Partnership Engine — Copper+ builders

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG   = '#0D0820'
const GOLD = '#D4AF37'
const W    = '#F0EEF8'
const PINK = '#EC4899'

const TIER_LIMITS: Record<string,number> = { copper:3, silver:5, silver_rocket:5, gold:10, gold_rocket:10, platinum:999, platinum_rocket:999 }
const PLATFORMS = ['Instagram','TikTok','YouTube','X (Twitter)','LinkedIn','Facebook','Pinterest']

function RevenueTable({ price }: { price: number }) {
  const z2b = Math.round(price * 0.10)
  const rem  = price - z2b
  const bld  = Math.round(rem * 0.30)
  const inf  = Math.round(rem * 0.70)
  const aff  = Math.round(price * 0.20)
  const rows = [
    { label:'Direct sale (no affiliate)', z2b, builder:bld, influencer:inf, affiliate:0 },
    { label:'Via affiliate link',          z2b, builder:bld - Math.round(price*0.10), influencer:inf - Math.round(price*0.10), affiliate:aff },
    { label:'Influencer uses own link',    z2b, builder:bld - Math.round(price*0.10), influencer:inf - Math.round(price*0.10) + aff, affiliate:aff },
  ]
  return (
    <div style={{ overflowX:'auto', marginBottom:'14px' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'11px' }}>
        <thead>
          <tr>{['Scenario','Z2B','Builder','Influencer','Affiliate'].map(h=>(
            <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:GOLD, fontWeight:700 }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.label} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding:'6px 8px', color:'rgba(255,255,255,0.6)', fontSize:'10px' }}>{r.label}</td>
              <td style={{ padding:'6px 8px', color:'rgba(255,255,255,0.4)' }}>R{r.z2b}</td>
              <td style={{ padding:'6px 8px', color:'#A78BFA', fontWeight:700 }}>R{r.builder}</td>
              <td style={{ padding:'6px 8px', color:PINK, fontWeight:700 }}>R{r.influencer}</td>
              <td style={{ padding:'6px 8px', color:'#6EE7B7' }}>R{r.affiliate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [c, setC] = useState(false)
  return (
    <button onClick={()=>{ navigator.clipboard.writeText(text); setC(true); setTimeout(()=>setC(false),2000) }}
      style={{ padding:'4px 10px', background:`${GOLD}20`, border:`1px solid ${GOLD}40`, borderRadius:'8px', color:GOLD, fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
      {c ? '✅' : '📋 Copy'}
    </button>
  )
}

function ResultBox({ content, color, label }: { content:string; color:string; label:string }) {
  if (!content) return null
  return (
    <div style={{ background:`${color}08`, border:`1px solid ${color}25`, borderRadius:'14px', padding:'16px', marginBottom:'12px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
        <div style={{ fontSize:'12px', fontWeight:700, color }}>{label}</div>
        <CopyBtn text={content} />
      </div>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.8)', lineHeight:1.85, whiteSpace:'pre-wrap', maxHeight:'400px', overflowY:'auto' }}>{content}</div>
    </div>
  )
}

const inp: React.CSSProperties = {
  width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.07)',
  border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px',
  color:W, fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box',
}
const btn = (bg:string, col='#fff', disabled=false): React.CSSProperties => ({
  width:'100%', padding:'13px', borderRadius:'12px', border:'none', fontFamily:'Cinzel,Georgia,serif',
  fontWeight:900, fontSize:'13px', cursor:disabled?'not-allowed':'pointer', marginBottom:'10px',
  background:disabled?'rgba(255,255,255,0.08)':bg, color:disabled?'rgba(255,255,255,0.3)':col,
})

function InfluencerInner() {
  const [builderTier, setBuilderTier] = useState('free')
  const [builderId,   setBuilderId]   = useState('')
  const [builderName, setBuilderName] = useState('')
  const [step,        setStep]        = useState(0)
  const [loading,     setLoading]     = useState(false)
  const [partnerships,setPartnerships]= useState<any[]>([])

  // Form fields
  const [handle,    setHandle]    = useState('')
  const [platform,  setPlatform]  = useState('Instagram')
  const [niche,     setNiche]     = useState('')
  const [followers, setFollowers] = useState('')
  const [formData,  setFormData]  = useState('')
  const [price,     setPrice]     = useState(199)

  // Results
  const [researchForm, setResearchForm] = useState('')
  const [analysis,     setAnalysis]     = useState('')
  const [products,     setProducts]     = useState('')
  const [proposal,     setProposal]     = useState('')
  const [dmScripts,    setDmScripts]    = useState('')
  const [agreement,    setAgreement]    = useState('')

  const TIER_RANK: Record<string,number> = { free:0,starter:1,bronze:2,copper:3,silver:4,gold:5,platinum:6,silver_rocket:4,gold_rocket:5,platinum_rocket:6 }
  const rank = TIER_RANK[builderTier] || 0
  const limit = TIER_LIMITS[builderTier] || 0

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setBuilderId(user.id)
        const { data: prof } = await supabase.from('profiles').select('paid_tier,full_name').eq('id', user.id).single()
        setBuilderTier(prof?.paid_tier || 'free')
        setBuilderName(prof?.full_name || '')
        const { data: parts } = await supabase.from('influencer_partnerships').select('*').eq('builder_id', user.id).order('created_at', { ascending: false })
        setPartnerships(parts || [])
      }
    })
  }, [])

  const callAPI = async (action: string, extra: Record<string,unknown> = {}) => {
    const res = await fetch('/api/influencer', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action, builderId, builderTier, builderName, ...extra })
    })
    return res.json()
  }

  const STEPS = ['Research Form','Analyze','Products','Revenue','Proposal','DM Scripts']

  if (rank < 3) return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ textAlign:'center', maxWidth:'400px' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>🤝</div>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, marginBottom:'8px' }}>Influencer Partnership Engine</div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:1.8, marginBottom:'20px' }}>
          Available from Copper tier. Analyze any influencer, generate products for their audience, calculate revenue splits and send a professional partnership proposal.
        </div>
        <Link href="/ai-income/choose-plan" style={{ display:'inline-block', padding:'12px 28px', background:`linear-gradient(135deg,${PINK},#BE185D)`, borderRadius:'12px', color:'#fff', fontWeight:900, fontSize:'14px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
          Upgrade to Copper →
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      {/* Nav */}
      <div style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/ai-income" style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← 4M</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:700, color:PINK }}>🤝 Influencer Partnerships</span>
        <div style={{ marginLeft:'auto', fontSize:'11px', color:'rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.05)', padding:'3px 8px', borderRadius:'10px' }}>
          {limit === 999 ? 'Unlimited' : `${limit}/month`} analyses
        </div>
      </div>

      <div style={{ maxWidth:'580px', margin:'0 auto', padding:'20px 16px 60px' }}>

        {/* Step tabs */}
        <div style={{ display:'flex', gap:'4px', marginBottom:'20px', overflowX:'auto' }}>
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => step > i && setStep(i)}
              style={{ padding:'6px 10px', borderRadius:'8px', fontSize:'10px', fontWeight:700, flexShrink:0, whiteSpace:'nowrap', cursor: step > i ? 'pointer' : 'default',
                background: step===i ? `${PINK}20` : step>i ? 'rgba(110,231,183,0.1)' : 'rgba(255,255,255,0.04)',
                border:`1px solid ${step===i ? `${PINK}60` : step>i ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.08)'}`,
                color: step===i ? '#F9A8D4' : step>i ? '#6EE7B7' : 'rgba(255,255,255,0.3)' }}>
              {step > i ? '✓ ' : ''}{s}
            </button>
          ))}
        </div>

        {/* STEP 0: Research Form */}
        {step === 0 && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'4px' }}>Step 1 — Research Form</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:1.7, marginBottom:'16px' }}>
              AI cannot visit social media on your behalf. You must visit the influencer's profile and fill in this research form. The more detailed you are, the better the analysis and products.
            </div>
            <div style={{ background:'rgba(236,72,153,0.08)', border:`1px solid ${PINK}30`, borderRadius:'12px', padding:'14px', marginBottom:'16px', fontSize:'12px', color:'rgba(255,255,255,0.65)', lineHeight:1.8 }}>
              🔍 <strong style={{color:PINK}}>How it works:</strong> Download the research form → Visit the influencer's profile → Fill in everything you observe → Upload back → AI creates your analysis
            </div>
            {!researchForm ? (
              <button onClick={async () => {
                setLoading(true)
                const data = await callAPI('generate_research_form')
                setResearchForm(data.form || '')
                setLoading(false)
              }} disabled={loading} style={btn(`linear-gradient(135deg,${PINK},#BE185D)`,'#fff',loading)}>
                {loading ? '📋 Generating research form...' : '📋 Generate Research Form →'}
              </button>
            ) : (
              <div>
                <div style={{ background:`${PINK}08`, border:`1px solid ${PINK}25`, borderRadius:'14px', padding:'16px', marginBottom:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                    <div style={{ fontSize:'12px', fontWeight:700, color:PINK }}>📋 Influencer Research Form</div>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <CopyBtn text={researchForm} />
                      <button onClick={() => { const b=new Blob([researchForm],{type:'text/plain'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='influencer-research-form.txt'; a.click() }}
                        style={{ padding:'4px 10px', background:'rgba(236,72,153,0.2)', border:`1px solid ${PINK}40`, borderRadius:'8px', color:PINK, fontSize:'11px', cursor:'pointer', fontWeight:700 }}>
                        ⬇️ Download
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', lineHeight:1.8, whiteSpace:'pre-wrap', maxHeight:'300px', overflowY:'auto' }}>{researchForm}</div>
                </div>
                <div style={{ fontSize:'12px', fontWeight:700, color:W, marginBottom:'10px' }}>Upload your completed form:</div>
                <textarea value={formData} onChange={e=>setFormData(e.target.value)} rows={8}
                  placeholder="Paste your completed research form here after filling it in..." style={{ ...inp, resize:'none', marginBottom:'10px' }} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                  <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Influencer handle (no @)</label>
                    <input value={handle} onChange={e=>setHandle(e.target.value)} placeholder="e.g. fitness_mama_sa" style={inp} /></div>
                  <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Platform</label>
                    <select value={platform} onChange={e=>setPlatform(e.target.value)} style={inp}>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
                  <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Their niche (from form)</label>
                    <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="e.g. SA natural hair care" style={inp} /></div>
                  <div><label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Followers (approx)</label>
                    <input value={followers} onChange={e=>setFollowers(e.target.value)} placeholder="e.g. 47K" style={inp} /></div>
                </div>
                <button onClick={async () => {
                  if (!formData.trim() || !handle.trim()) return
                  setLoading(true)
                  const data = await callAPI('analyze', { formData, influencerHandle:handle, platform, niche, followers })
                  setAnalysis(data.analysis || '')
                  if (data.analysis) setStep(1)
                  setLoading(false)
                }} disabled={!formData.trim() || !handle.trim() || loading} style={btn(`linear-gradient(135deg,${PINK},#BE185D)`,'#fff',!formData.trim()||!handle.trim()||loading)}>
                  {loading ? '🔍 Analyzing...' : '🔍 Analyze This Influencer →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Analysis */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'16px' }}>Step 2 — Audience Analysis</div>
            <ResultBox content={analysis} color={PINK} label={`Analysis: @${handle} on ${platform}`} />
            <button onClick={async () => {
              setLoading(true)
              const data = await callAPI('generate_products', { analysis, influencerHandle:handle, platform, niche, followers, tierLimit: TIER_LIMITS[builderTier] || 5 })
              setProducts(data.products || '')
              if (data.products) setStep(2)
              setLoading(false)
            }} disabled={loading} style={btn(`linear-gradient(135deg,${PINK},#BE185D)`,'#fff',loading)}>
              {loading ? '📦 Generating products...' : '📦 Generate Products for Their Audience →'}
            </button>
          </div>
        )}

        {/* STEP 2: Products */}
        {step === 2 && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'16px' }}>Step 3 — Digital Products</div>
            <ResultBox content={products} color={PINK} label="Products for This Audience" />
            <button onClick={() => setStep(3)} style={btn(`linear-gradient(135deg,${PINK},#BE185D)`)}>
              💰 See Revenue Breakdown →
            </button>
          </div>
        )}

        {/* STEP 3: Revenue Calculator */}
        {step === 3 && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'4px' }}>Step 4 — Revenue Calculator</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'16px' }}>See exactly what everyone earns before you send the proposal</div>
            <div style={{ marginBottom:'14px' }}>
              <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px' }}>Product price (ZAR)</label>
              <div style={{ display:'flex', gap:'8px' }}>
                {[99,199,299,499,799].map(p=>(
                  <button key={p} onClick={()=>setPrice(p)}
                    style={{ flex:1, padding:'8px', borderRadius:'8px', border:`1px solid ${price===p?PINK:'rgba(255,255,255,0.1)'}`, background:price===p?`${PINK}20`:'transparent', color:price===p?'#F9A8D4':'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'12px', fontWeight:700 }}>
                    R{p}
                  </button>
                ))}
              </div>
              <input type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} style={{ ...inp, marginTop:'8px' }} placeholder="Or type custom price" />
            </div>
            <RevenueTable price={price} />
            <div style={{ background:`${PINK}08`, border:`1px solid ${PINK}25`, borderRadius:'12px', padding:'14px', marginBottom:'14px', fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.8 }}>
              <strong style={{color:PINK}}>Important:</strong> Marketplace product sales do NOT cascade to your upline. You keep your 30% only. Upline only earns on membership and BFM payments.
            </div>
            <div style={{ background:'rgba(212,175,55,0.08)', border:`1px solid ${GOLD}25`, borderRadius:'12px', padding:'14px', marginBottom:'14px', fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.8 }}>
              <strong style={{color:GOLD}}>Affiliate motivation:</strong> When the influencer promotes using their own affiliate link, they earn R{Math.round((price-Math.round(price*0.1))*0.70 - Math.round(price*0.1) + Math.round(price*0.2))} instead of R{Math.round((price-Math.round(price*0.1))*0.70)} — so they are naturally incentivised to actively promote your product.
            </div>
            <button onClick={async () => {
              setLoading(true)
              const data = await callAPI('write_proposal', { influencerHandle:handle, platform, niche, followers, products, productPrice: price })
              setProposal(data.proposal || '')
              if (data.proposal) setStep(4)
              setLoading(false)
            }} disabled={loading} style={btn(`linear-gradient(135deg,${PINK},#BE185D)`,'#fff',loading)}>
              {loading ? '✍️ Writing proposal...' : '✍️ Write Partnership Proposal →'}
            </button>
          </div>
        )}

        {/* STEP 4: Proposal */}
        {step === 4 && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'16px' }}>Step 5 — Partnership Proposal</div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'12px', marginBottom:'12px', fontSize:'11px', color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
              ⚠️ <strong style={{color:'rgba(255,255,255,0.7)'}}>Before sending:</strong> Personalise the opening line. Add your own name. Review the numbers match your chosen product price. The influencer must sign the digital agreement before any photos or their name appear on our platform.
            </div>
            <ResultBox content={proposal} color={PINK} label="Partnership Proposal — Review before sending" />
            <button onClick={async () => {
              setLoading(true)
              const data = await callAPI('generate_agreement', { influencerHandle:handle, platform, productCategory:niche })
              setAgreement(data.agreement || '')
              setLoading(false)
            }} disabled={loading} style={{ ...btn('rgba(212,175,55,0.15)',GOLD,loading), border:`1px solid ${GOLD}40` }}>
              {loading ? '📄 Generating agreement...' : '📄 Generate Digital Agreement →'}
            </button>
            {agreement && <ResultBox content={agreement} color={GOLD} label="Digital Agreement — Send for signature" />}
            <button onClick={async () => {
              setLoading(true)
              const data = await callAPI('write_dm_scripts', { influencerHandle:handle, platform, niche, followers })
              setDmScripts(data.scripts || '')
              if (data.scripts) setStep(5)
              setLoading(false)
            }} disabled={loading} style={btn(`linear-gradient(135deg,${PINK},#BE185D)`,'#fff',loading)}>
              {loading ? '💬 Writing DM scripts...' : '💬 Generate DM Outreach Scripts →'}
            </button>
          </div>
        )}

        {/* STEP 5: DM Scripts */}
        {step === 5 && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'16px' }}>Step 6 — DM Scripts</div>
            <ResultBox content={dmScripts} color={PINK} label="DM Outreach Scripts — 10 ready-to-send messages" />
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={()=>{ setStep(0); setHandle(''); setNiche(''); setFollowers(''); setFormData(''); setAnalysis(''); setProducts(''); setProposal(''); setDmScripts(''); setAgreement(''); setResearchForm('') }}
                style={{ flex:1, padding:'12px', borderRadius:'10px', border:`1px solid ${PINK}40`, background:`${PINK}10`, color:PINK, fontWeight:700, cursor:'pointer', fontSize:'13px' }}>
                🤝 New Partnership
              </button>
              <Link href="/marketplace" style={{ flex:1, padding:'12px', borderRadius:'10px', border:'none', background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:'#1E1245', fontWeight:900, fontSize:'13px', textAlign:'center', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
                🏪 View Marketplace →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InfluencerPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#EC4899', fontFamily:'Georgia,serif' }}>Loading Influencer Engine...</div>}>
      <InfluencerInner />
    </Suspense>
  )
}
