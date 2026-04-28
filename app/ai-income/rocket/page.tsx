'use client'
// FILE: app/ai-income/rocket/page.tsx
// 🚀 4M Rocket Mode — AI creates everything. Builder just publishes.

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG     = '#0D0820'
const GOLD   = '#D4AF37'
const W      = '#F0EEF8'
const ROCKET = '#FF6B35'
const PURP   = '#4C1D95'

const TIER_RANK: Record<string,number> = {
  guest:0,free:0,starter:1,bronze:2,copper:3,silver:4,gold:5,platinum:6
}

const TIER_LIMITS: Record<string,number> = { silver:12, gold:30, platinum:999 }

const CAT_COLORS: Record<string,string> = {
  Education:'#A78BFA',Income:'#6EE7B7',Career:'#38BDF8',Health:'#F472B6',
  Sports:'#FF6B35',Business:GOLD,Faith:'#FCD34D',Finance:'#34D399',
  Legal:'#FB923C',Relationships:'#F9A8D4',Recreation:'#4ADE80',All:'#94A3B8',
}

const CATEGORIES = ['All','Education','Income','Health','Career','Sports','Business','Faith','Finance','Legal','Relationships','Recreation']

const GEOGRAPHIES = [
  'Global','Africa','South Africa','Nigeria','Kenya','Ghana','Europe','United Kingdom',
  'United States','India','Brazil','Asia','Middle East','Australia',
]
const DEMOGRAPHICS = [
  'Anyone','Students','Parents','Employees','Small business owners',
  'Entrepreneurs','Professionals','Young adults (18-30)','Women','Men','Seniors (60+)',
]

const PREVIEW_PAIN_POINTS = [
  { rank:1,  category:'Education',     title:'Grade 12 Maths Exam Prep',          target_market:'South Africa', searches_monthly:'427K/mo', recommended_price:'R199',   competition_gap:'HIGH', income_estimate_30days:'R800–R4,000',   why_people_pay:'Parents want their kids to pass and qualify for university', best_format:'guide', language:'en' },
  { rank:2,  category:'Income',        title:'Side Income Starter Kit (Lagos)',     target_market:'Nigeria',      searches_monthly:'312K/mo', recommended_price:'₦5,000', competition_gap:'HIGH', income_estimate_30days:'₦12K–₦60K',    why_people_pay:'Desperate for extra cash beyond their salary', best_format:'toolkit', language:'en' },
  { rank:3,  category:'Career',        title:'UK Visa Application Guide 2025',     target_market:'Global',       searches_monthly:'289K/mo', recommended_price:'£12',    competition_gap:'HIGH', income_estimate_30days:'£200–£800',     why_people_pay:'Fear of rejection and wasting thousands in fees', best_format:'guide', language:'en' },
  { rank:4,  category:'Health',        title:'30-Day Budget Meal Plan SA',         target_market:'South Africa', searches_monthly:'198K/mo', recommended_price:'R149',   competition_gap:'MEDIUM', income_estimate_30days:'R500–R2,000', why_people_pay:'Want to eat healthy without going broke', best_format:'planner', language:'en' },
  { rank:5,  category:'Sports',        title:'Youth Football Coaching Manual',     target_market:'Africa',       searches_monthly:'176K/mo', recommended_price:'$15',    competition_gap:'HIGH', income_estimate_30days:'$200–$900',     why_people_pay:'Want to develop talent properly and win matches', best_format:'guide', language:'en' },
  { rank:6,  category:'Business',      title:'Spaza Shop Profit System',           target_market:'South Africa', searches_monthly:'165K/mo', recommended_price:'R299',   competition_gap:'HIGH', income_estimate_30days:'R1,000–R5,000', why_people_pay:'Struggling to make consistent profit from their shop', best_format:'toolkit', language:'en' },
  { rank:7,  category:'Faith',         title:'30-Day Prayer Journal',              target_market:'Global',       searches_monthly:'154K/mo', recommended_price:'$9',     competition_gap:'MEDIUM', income_estimate_30days:'$150–$600',   why_people_pay:'Want a structured daily prayer practice', best_format:'workbook', language:'en' },
  { rank:8,  category:'Relationships', title:'Teen Communication Guide for Parents', target_market:'Global',     searches_monthly:'143K/mo', recommended_price:'$12',    competition_gap:'HIGH', income_estimate_30days:'$180–$700',     why_people_pay:'Struggling to connect with their teenager', best_format:'guide', language:'en' },
  { rank:9,  category:'Finance',       title:'Stokvel Setup and Rules Kit',        target_market:'South Africa', searches_monthly:'132K/mo', recommended_price:'R179',   competition_gap:'HIGH', income_estimate_30days:'R600–R2,500',   why_people_pay:'Want to save together but need structure', best_format:'template', language:'en' },
  { rank:10, category:'Sports',        title:'Fantasy EPL Strategy Guide',         target_market:'Global',       searches_monthly:'121K/mo', recommended_price:'£8',     competition_gap:'MEDIUM', income_estimate_30days:'£120–£500',  why_people_pay:'Want to win their fantasy league and prove it', best_format:'guide', language:'en' },
  { rank:11, category:'Legal',         title:'NSFAS Application Step-by-Step',     target_market:'South Africa', searches_monthly:'118K/mo', recommended_price:'R99',    competition_gap:'HIGH', income_estimate_30days:'R400–R1,800',   why_people_pay:'Confused by the process and afraid of rejection', best_format:'guide', language:'en' },
  { rank:12, category:'Health',        title:'Diabetes Meal Plan (African Diet)',   target_market:'Africa',       searches_monthly:'109K/mo', recommended_price:'$18',    competition_gap:'HIGH', income_estimate_30days:'$250–$1,000',   why_people_pay:'Need culturally relevant health guidance', best_format:'planner', language:'en' },
  { rank:13, category:'Income',        title:'AI Side Hustle Starter Kit',         target_market:'Global',       searches_monthly:'98K/mo',  recommended_price:'$24',    competition_gap:'HIGH', income_estimate_30days:'$350–$1,500',   why_people_pay:'Want to use AI to make money but dont know how', best_format:'toolkit', language:'en' },
  { rank:14, category:'Career',        title:'LinkedIn Profile That Gets Hired',   target_market:'Global',       searches_monthly:'94K/mo',  recommended_price:'$19',    competition_gap:'MEDIUM', income_estimate_30days:'$250–$1,000', why_people_pay:'Job searching for months with no response', best_format:'guide', language:'en' },
  { rank:15, category:'Sports',        title:'Home Workout 90-Day Transformation', target_market:'Global',       searches_monthly:'89K/mo',  recommended_price:'$14',    competition_gap:'MEDIUM', income_estimate_30days:'$180–$750',   why_people_pay:'Want results without gym fees', best_format:'workbook', language:'en' },
  { rank:16, category:'Business',      title:'Hair Salon Starter Kit Kenya',        target_market:'Kenya',        searches_monthly:'84K/mo',  recommended_price:'KSh 800',competition_gap:'HIGH', income_estimate_30days:'KSh 8K–40K',   why_people_pay:'Want to start but dont know the business side', best_format:'toolkit', language:'en' },
  { rank:17, category:'Education',     title:'IELTS Exam Preparation 30-Day Plan', target_market:'Global',       searches_monthly:'81K/mo',  recommended_price:'$22',    competition_gap:'MEDIUM', income_estimate_30days:'$300–$1,200', why_people_pay:'Need band 7+ for visa or university entry', best_format:'workbook', language:'en' },
  { rank:18, category:'Relationships', title:'Communication in Marriage Guide',    target_market:'Global',       searches_monthly:'76K/mo',  recommended_price:'$16',    competition_gap:'MEDIUM', income_estimate_30days:'$200–$800',   why_people_pay:'Fighting too much and feeling disconnected', best_format:'guide', language:'en' },
  { rank:19, category:'Recreation',    title:'Camping Beginners Guide SA',         target_market:'South Africa', searches_monthly:'71K/mo',  recommended_price:'R159',   competition_gap:'HIGH', income_estimate_30days:'R500–R2,000',   why_people_pay:'Want to camp but dont know where to start safely', best_format:'guide', language:'en' },
  { rank:20, category:'Income',        title:'Debt-Free in 12 Months Action Plan', target_market:'Global',       searches_monthly:'68K/mo',  recommended_price:'$21',    competition_gap:'MEDIUM', income_estimate_30days:'$280–$1,100', why_people_pay:'Drowning in debt and need a clear path out', best_format:'action_plan', language:'en' },
]

type Stage = 'radar'|'creating'|'product'|'kit'|'website'|'promo'|'vault'
type PainPoint = typeof PREVIEW_PAIN_POINTS[0]

function RocketInner() {
  const router = useRouter()
  const [user,         setUser]         = useState<any>(null)
  const [builderTier,  setBuilderTier]  = useState('guest')
  const [loading,      setLoading]      = useState(true)
  const [stage,        setStage]        = useState<Stage>('radar')

  // Market radar state
  const [geography,    setGeography]    = useState('South Africa')
  const [demographic,  setDemographic]  = useState('Anyone')
  const [category,     setCategory]     = useState('All')
  const [scanning,     setScanning]     = useState(false)
  const [painPoints,   setPainPoints]   = useState<PainPoint[]>([])
  const [selected,     setSelected]     = useState<PainPoint|null>(null)

  // Creation state
  const [creating,     setCreating]     = useState(false)
  const [createStage,  setCreateStage]  = useState('')
  const [product,      setProduct]      = useState<any>(null)
  const [launchKit,    setLaunchKit]    = useState<any>(null)
  const [error,        setError]        = useState('')
  const [website,      setWebsite]      = useState<any>(null)
  const [promotion,    setPromotion]    = useState<any>(null)
  const [buildingWeb,  setBuildingWeb]  = useState(false)
  const [webStage,     setWebStage]     = useState('')
  const [domain,       setDomain]       = useState('')
  const [publishing,   setPublishing]   = useState(false)

  // Vault state
  const [vault,        setVault]        = useState<any[]>([])
  const [activeTab,    setActiveTab]    = useState<'radar'|'vault'>('radar')

  // Email waitlist
  const [email,        setEmail]        = useState('')
  const [waitlisted,   setWaitlisted]   = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (u) {
        setUser(u)
        const { data: prof } = await supabase.from('profiles').select('paid_tier').eq('id', u.id).single()
        setBuilderTier(prof?.paid_tier || 'free')
        // Load vault
        const { data: products } = await supabase.from('rocket_products')
          .select('*').eq('builder_id', u.id).order('created_at', { ascending: false })
        setVault(products || [])
      }
      setLoading(false)
    })
  }, [])

  const tierRank   = TIER_RANK[builderTier] || 0
  const isCreator  = tierRank >= 4  // Silver+
  const limit      = TIER_LIMITS[builderTier] || 0
  const previewCount = builderTier === 'free' ? 3 : builderTier === 'starter' ? 8 : builderTier === 'bronze' ? 12 : 20

  // ── Market Scan ──────────────────────────────────────────────────────────
  const runMarketScan = async () => {
    setScanning(true)
    setError('')
    try {
      if (isCreator) {
        // Real AI market scan
        const res = await fetch('/api/rocket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'market_scan',
            userId: user?.id,
            builderTier,
            geography,
            demographic,
            category,
            count: 20,
          }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setPainPoints(data.painPoints || [])
      } else {
        // Preview mode — filter sample data
        await new Promise(r => setTimeout(r, 1200)) // simulate scan
        const filtered = PREVIEW_PAIN_POINTS
          .filter(p => category === 'All' || p.category === category)
          .slice(0, previewCount)
        setPainPoints(filtered)
      }
    } catch (e: any) {
      setError(e.message)
      // Fall back to preview data
      setPainPoints(PREVIEW_PAIN_POINTS.slice(0, previewCount))
    }
    setScanning(false)
  }

  // ── Create Product ───────────────────────────────────────────────────────
  const createProductFromPain = async (pain: PainPoint) => {
    if (!isCreator) return
    setSelected(pain)
    setStage('creating')
    setCreating(true)
    setError('')

    const stages = [
      'Scanning global market data...',
      'Identifying expert knowledge sources...',
      'Drafting product structure...',
      'Writing expert content...',
      'Building launch kit...',
      'Finalising your product...',
    ]

    let stageIdx = 0
    const interval = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, stages.length - 1)
      setCreateStage(stages[stageIdx])
    }, 4000)

    try {
      setCreateStage(stages[0])
      const res = await fetch('/api/rocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:      'create_product',
          userId:      user?.id,
          builderTier,
          painPoint:   pain.title,
          painDesc:    pain.why_people_pay,
          format:      pain.best_format,
          targetMarket: pain.target_market,
          demographic,
          language:    pain.language || 'en',
          price:       pain.recommended_price,
          category:    pain.category,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      clearInterval(interval)
      setProduct(data.product)
      setLaunchKit(data.launchKit)
      setVault(prev => [data.product, ...prev])
      setStage('product')
    } catch (e: any) {
      clearInterval(interval)
      setError(e.message)
      setStage('radar')
    }
    setCreating(false)
  }

  // ── Build Website (Gold/Platinum) ───────────────────────────────────────────
  const buildWebsite = async (prod: any) => {
    if ((TIER_RANK[builderTier] || 0) < 5) return
    setStage('website')
    setBuildingWeb(true)
    setWebStage('Analysing product and market...')
    const stages = ['Analysing product and market...','Building website strategy...','Writing conversion copy...','Designing your website...','Building promotion campaigns...','Finalising everything...']
    let idx = 0
    const interval = setInterval(() => { idx = Math.min(idx+1, stages.length-1); setWebStage(stages[idx]) }, 6000)
    try {
      const res = await fetch('/api/rocket-website', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'build_website', userId:user?.id, builderTier, productId:prod.id }),
      })
      const data = await res.json()
      clearInterval(interval)
      if (data.error) throw new Error(data.error)
      setWebsite(data); setPromotion(data.promotion); setWebStage('Complete!')
    } catch(e:any) { clearInterval(interval); setError(e.message); setStage('product') }
    setBuildingWeb(false)
  }

  const publishWebsite = async () => {
    if (!domain.trim() || !website?.websiteId) return
    setPublishing(true)
    await fetch('/api/rocket-website', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'publish', userId:user?.id, builderTier, websiteId:website.websiteId, domain }),
    })
    setPublishing(false)
    alert('🎉 Website published! Live at https://' + domain)
  }

  // ── List product ─────────────────────────────────────────────────────────
  const listProduct = async (productId: string, price: number) => {
    const res = await fetch('/api/rocket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action:'list_product', userId:user?.id, builderTier, productId, retailPrice:price }),
    })
    const data = await res.json()
    if (data.ok) {
      setVault(prev => prev.map(p => p.id === productId ? { ...p, status:'listed' } : p))
      if (product?.id === productId) setProduct((p: any) => ({ ...p, status:'listed' }))
    }
  }

  const card = (border = 'rgba(255,255,255,0.08)') => ({
    background:'rgba(255,255,255,0.03)',
    border:`1px solid ${border}`,
    borderRadius:'14px',
    padding:'16px',
  })

  const btn = (bg: string, color = '#fff') => ({
    padding:'12px 20px', borderRadius:'10px', border:'none',
    background:bg, color, fontWeight:700 as const, fontSize:'13px',
    cursor:'pointer' as const, fontFamily:'Georgia,serif', width:'100%' as const,
  })

  if (loading) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:ROCKET, fontFamily:'Georgia,serif', fontSize:'18px' }}>
      🚀 Loading Rocket Mode...
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>

      {/* Nav */}
      <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/ai-income" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← 4M Machine</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontSize:'13px', color:ROCKET, fontWeight:700 }}>🚀 Rocket Mode</span>
        {isCreator && (
          <div style={{ marginLeft:'auto', display:'flex', gap:'6px' }}>
            {(['radar','vault'] as const).map(t => (
              <button key={t} onClick={() => { setActiveTab(t); setStage(t === 'vault' ? 'vault' : 'radar') }}
                style={{ padding:'4px 12px', borderRadius:'16px', border:`1px solid ${activeTab===t ? ROCKET : 'rgba(255,255,255,0.15)'}`, background: activeTab===t ? `${ROCKET}20` : 'transparent', color: activeTab===t ? ROCKET : 'rgba(255,255,255,0.5)', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                {t === 'radar' ? '🌍 Market Radar' : `📦 Vault (${vault.length})`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth:'560px', margin:'0 auto', padding:'20px 16px 60px' }}>

        {/* ── HERO ── */}
        {stage === 'radar' && (
          <>
            <div style={{ textAlign:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'44px', marginBottom:'8px' }}>🚀</div>
              <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:W, margin:'0 0 6px' }}>
                4M Rocket Mode
              </h1>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', lineHeight:1.8, margin:0 }}>
                {isCreator
                  ? 'Choose your market. AI scans the world. You create and publish.'
                  : 'Preview the global market intelligence. Upgrade to Silver to start publishing.'
                }
              </p>
            </div>

            {/* Tier badge */}
            <div style={{ textAlign:'center', marginBottom:'20px' }}>
              <span style={{ padding:'5px 16px', background: isCreator ? `${ROCKET}20` : 'rgba(255,255,255,0.06)', border:`1px solid ${isCreator ? ROCKET : 'rgba(255,255,255,0.1)'}`, borderRadius:'20px', fontSize:'12px', fontWeight:700, color: isCreator ? ROCKET : 'rgba(255,255,255,0.4)' }}>
                {isCreator
                  ? `✅ ${builderTier.charAt(0).toUpperCase()+builderTier.slice(1)} — ${limit === 999 ? 'Unlimited' : limit} products/month`
                  : `🔒 ${builderTier.charAt(0).toUpperCase()+builderTier.slice(1)} — Preview ${previewCount} pain points`
                }
              </span>
            </div>

            {/* ── Market Radar Controls (Silver+ only) ── */}
            {isCreator && (
              <div style={{ ...card(`${ROCKET}30`), marginBottom:'16px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:ROCKET, letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px' }}>
                  🌍 Market Radar — Set Your Target
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'12px' }}>
                  <div>
                    <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Geography</label>
                    <select value={geography} onChange={e => setGeography(e.target.value)}
                      style={{ width:'100%', padding:'9px 12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:W, fontSize:'13px', fontFamily:'Georgia,serif' }}>
                      {GEOGRAPHIES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Target Demographic</label>
                    <select value={demographic} onChange={e => setDemographic(e.target.value)}
                      style={{ width:'100%', padding:'9px 12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:W, fontSize:'13px', fontFamily:'Georgia,serif' }}>
                      {DEMOGRAPHICS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'4px' }}>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      style={{ width:'100%', padding:'9px 12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:W, fontSize:'13px', fontFamily:'Georgia,serif' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={runMarketScan} disabled={scanning}
                  style={{ ...btn(`linear-gradient(135deg,${ROCKET},#E55A2B)`), opacity: scanning ? 0.7 : 1 }}>
                  {scanning ? '🔍 Scanning global market...' : '🌍 Scan Market — Find Best Opportunities →'}
                </button>
              </div>
            )}

            {/* ── Pain Points ── */}
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                <div style={{ fontSize:'14px', fontWeight:700, color:W }}>
                  🔥 {isCreator && painPoints.length > 0 ? `Top ${painPoints.length} Opportunities` : `Top ${previewCount} Pain Points This Week`}
                </div>
                {!isCreator && (
                  <span style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>Curated weekly</span>
                )}
              </div>

              {error && (
                <div style={{ padding:'10px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', fontSize:'12px', color:'#FCA5A5', marginBottom:'10px' }}>
                  {error}
                </div>
              )}

              {/* Show preview or scanned pain points */}
              {(painPoints.length > 0 ? painPoints : PREVIEW_PAIN_POINTS.slice(0, previewCount)).map((p, idx) => {
                const catColor = CAT_COLORS[p.category] || GOLD
                return (
                  <div key={idx} style={{ ...card(`${catColor}20`), marginBottom:'10px' }}>
                    <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                      <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:`${catColor}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:900, color:catColor, flexShrink:0 }}>
                        {p.rank}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
                          <div style={{ fontSize:'13px', fontWeight:700, color:W, lineHeight:1.4, flex:1 }}>{p.title}</div>
                          <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', background:`${catColor}15`, borderRadius:'10px', color:catColor, flexShrink:0, marginLeft:'8px' }}>
                            {p.category}
                          </span>
                        </div>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'6px' }}>📍 {p.target_market}</div>
                        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', fontStyle:'italic', marginBottom:'8px', lineHeight:1.6 }}>
                          "{p.why_people_pay}"
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'5px', marginBottom: isCreator ? '10px' : '0' }}>
                          {[
                            { l:'Searches',  v:p.searches_monthly },
                            { l:'Price',     v:p.recommended_price },
                            { l:'Gap',       v:p.competition_gap, hi: p.competition_gap === 'HIGH' },
                            { l:'Est. Income', v:p.income_estimate_30days },
                          ].map(s => (
                            <div key={s.l} style={{ textAlign:'center', background:'rgba(255,255,255,0.04)', borderRadius:'6px', padding:'4px 2px' }}>
                              <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)', marginBottom:'1px' }}>{s.l}</div>
                              <div style={{ fontSize:'10px', fontWeight:700, color: s.hi ? '#6EE7B7' : 'rgba(255,255,255,0.7)' }}>{s.v}</div>
                            </div>
                          ))}
                        </div>
                        {isCreator && (
                          <button onClick={() => createProductFromPain(p)}
                            style={{ ...btn(`linear-gradient(135deg,${ROCKET},#E55A2B)`), fontSize:'12px', padding:'10px' }}>
                            🚀 Create This Product — AI Does Everything →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Locked upgrade prompt */}
              {!isCreator && (
                <div style={{ textAlign:'center', padding:'20px', background:`${ROCKET}08`, border:`1px solid ${ROCKET}20`, borderRadius:'14px', marginTop:'8px' }}>
                  <div style={{ fontSize:'24px', marginBottom:'8px' }}>🚀</div>
                  <div style={{ fontSize:'14px', fontWeight:700, color:W, marginBottom:'6px' }}>
                    Upgrade to Silver — Start Publishing
                  </div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'14px', lineHeight:1.7 }}>
                    Silver builders create 12 AI-powered products/month.<br/>
                    AI writes everything. You publish. You earn 95%.
                  </div>
                  <Link href="/ai-income/choose-plan"
                    style={{ display:'inline-block', padding:'12px 28px', background:`linear-gradient(135deg,${ROCKET},#E55A2B)`, borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
                    🚀 Upgrade to Silver →
                  </Link>

                  {/* Waitlist */}
                  {!waitlisted ? (
                    <div style={{ marginTop:'16px' }}>
                      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>Or join the waitlist for early access:</div>
                      <div style={{ display:'flex', gap:'8px' }}>
                        <input value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="Your email"
                          style={{ flex:1, padding:'9px 12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', color:W, fontSize:'12px', outline:'none', fontFamily:'Georgia,serif' }} />
                        <button onClick={async () => {
                            if (!email.includes('@')) return
                            await supabase.from('rocket_waitlist').insert({ email, tier:builderTier, created_at:new Date().toISOString() })
                            setWaitlisted(true)
                          }}
                          style={{ padding:'9px 14px', background:ROCKET, border:'none', borderRadius:'8px', color:'#fff', fontWeight:700, fontSize:'12px', cursor:'pointer', whiteSpace:'nowrap' }}>
                          Notify Me
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop:'12px', fontSize:'12px', color:'#6EE7B7' }}>✅ You're on the waitlist!</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── CREATING STAGE ── */}
        {stage === 'creating' && (
          <div style={{ textAlign:'center', padding:'48px 20px' }}>
            <div style={{ fontSize:'56px', marginBottom:'16px' }}>🚀</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, marginBottom:'8px' }}>
              Creating Your Product
            </div>
            <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', marginBottom:'8px' }}>{selected?.title}</div>
            <div style={{ fontSize:'13px', color:ROCKET, marginBottom:'24px' }}>{createStage}</div>
            <div style={{ display:'flex', justifyContent:'center', gap:'6px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:'8px', height:'8px', borderRadius:'50%', background:ROCKET, animation:`pulse 1.2s ${i*0.3}s infinite` }} />
              ))}
            </div>
            <div style={{ marginTop:'20px', fontSize:'12px', color:'rgba(255,255,255,0.3)', lineHeight:1.8 }}>
              AI is researching · writing · structuring · packaging<br/>
              This takes 30–90 seconds. Please wait.
            </div>
          </div>
        )}

        {/* ── PRODUCT STAGE ── */}
        {stage === 'product' && product && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <button onClick={() => setStage('radar')}
                style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'13px', padding:0 }}>
                ← Back to Market
              </button>
            </div>

            {/* Product header */}
            <div style={{ ...card(`${ROCKET}40`), marginBottom:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'11px', color:ROCKET, fontWeight:700, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'1px' }}>
                    ✅ Product Created — {product.product_type?.replace('_',' ')}
                  </div>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'4px' }}>
                    {product.title}
                  </div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)' }}>{product.subtitle}</div>
                </div>
                <div style={{ fontSize:'22px', fontWeight:900, color:GOLD, flexShrink:0, marginLeft:'12px' }}>
                  R{product.retail_price?.toLocaleString() || '199'}
                </div>
              </div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:'12px' }}>
                {product.description?.slice(0, 200)}...
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={() => setStage('kit')}
                  style={{ ...btn(`${ROCKET}20`, ROCKET), border:`1px solid ${ROCKET}40`, flex:1, padding:'10px' }}>
                  📦 View Launch Kit →
                </button>
                {product.status !== 'listed' && (
                  <button onClick={() => listProduct(product.id, product.retail_price)}
                    style={{ ...btn(`linear-gradient(135deg,${GOLD},#B8860B)`, '#1E1245'), flex:1, padding:'10px', fontFamily:'Cinzel,Georgia,serif' }}>
                    🏪 List on Marketplace →
                  </button>
                )}
                {product.status === 'listed' && (
                  <div style={{ flex:1, padding:'10px', textAlign:'center', color:'#6EE7B7', fontSize:'12px', fontWeight:700, border:'1px solid #6EE7B760', borderRadius:'10px' }}>
                    ✅ Listed on Marketplace
                  </div>
                )}
              </div>
            </div>

            {/* Table of Contents */}
            {product.tableOfContents?.length > 0 && (
              <div style={{ ...card(), marginBottom:'12px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:GOLD, marginBottom:'10px' }}>📋 Table of Contents</div>
                {product.tableOfContents.map((item: string, i: number) => (
                  <div key={i} style={{ display:'flex', gap:'8px', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:'12px', color:'rgba(255,255,255,0.7)' }}>
                    <span style={{ color:'rgba(255,255,255,0.3)', flexShrink:0 }}>{i+1}.</span>
                    {item}
                  </div>
                ))}
              </div>
            )}

            {/* Full content preview */}
            {product.content && (
              <div style={{ ...card(), marginBottom:'12px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:GOLD, marginBottom:'10px' }}>📄 Product Content Preview</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)', lineHeight:1.9, maxHeight:'300px', overflowY:'auto', whiteSpace:'pre-wrap' }}>
                  {product.content.slice(0, 1000)}
                  {product.content.length > 1000 && (
                    <span style={{ color:'rgba(255,255,255,0.3)' }}> ... [{product.content.length - 1000} more characters]</span>
                  )}
                </div>
              </div>
            )}

            {/* Website Builder — Gold/Platinum */}
            {(TIER_RANK[builderTier] || 0) >= 5 && (
              <div style={{ background:`linear-gradient(135deg,rgba(76,29,149,0.2),rgba(212,175,55,0.08))`, border:`1px solid ${GOLD}30`, borderRadius:'14px', padding:'16px', marginBottom:'8px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:GOLD, marginBottom:'4px' }}>
                  🌐 {builderTier === 'platinum' ? 'Platinum' : 'Gold'} Feature — Website Builder
                </div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:'10px' }}>
                  AI builds a complete sales website for this product. {builderTier === 'platinum' ? 'Includes full promotion strategy — SEO, Google Ads, Facebook Ads, TikTok, email sequences + 4-week content calendar.' : 'Includes launch promotion strategy and launch week plan.'} You pay for domain. Press Publish.
                </div>
                <button onClick={() => buildWebsite(product)}
                  style={{ ...btn(`linear-gradient(135deg,${PURP},#7C3AED)`), fontFamily:'Cinzel,Georgia,serif' }}>
                  🌐 Build My Product Website →
                </button>
              </div>
            )}

            <button onClick={() => setStage('kit')}
              style={{ ...btn(`linear-gradient(135deg,${ROCKET},#E55A2B)`) }}>
              📢 View Your Full Launch Kit →
            </button>
          </div>
        )}

        {/* ── LAUNCH KIT STAGE ── */}
        {stage === 'kit' && launchKit && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <button onClick={() => setStage('product')}
                style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'13px', padding:0 }}>
                ← Back to Product
              </button>
            </div>

            <div style={{ textAlign:'center', marginBottom:'16px' }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'4px' }}>
                📢 Your Launch Kit
              </div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>Everything you need to start selling. Copy, paste, earn.</div>
            </div>

            {/* WhatsApp */}
            {launchKit.whatsappBroadcast && (
              <div style={{ ...card('#6EE7B730'), marginBottom:'10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'#6EE7B7' }}>📱 WhatsApp Broadcast</div>
                  <button onClick={() => navigator.clipboard.writeText(launchKit.whatsappBroadcast)}
                    style={{ padding:'4px 10px', background:'rgba(110,231,183,0.2)', border:'1px solid rgba(110,231,183,0.3)', borderRadius:'8px', color:'#6EE7B7', fontSize:'10px', cursor:'pointer', fontWeight:700 }}>
                    Copy
                  </button>
                </div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.8, whiteSpace:'pre-wrap', background:'rgba(0,0,0,0.2)', borderRadius:'8px', padding:'10px' }}>
                  {launchKit.whatsappBroadcast}
                </div>
              </div>
            )}

            {/* Facebook */}
            {launchKit.facebookPost && (
              <div style={{ ...card('#38BDF830'), marginBottom:'10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'#38BDF8' }}>👥 Facebook Post</div>
                  <button onClick={() => navigator.clipboard.writeText(launchKit.facebookPost)}
                    style={{ padding:'4px 10px', background:'rgba(56,189,248,0.2)', border:'1px solid rgba(56,189,248,0.3)', borderRadius:'8px', color:'#38BDF8', fontSize:'10px', cursor:'pointer', fontWeight:700 }}>
                    Copy
                  </button>
                </div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.8, whiteSpace:'pre-wrap', background:'rgba(0,0,0,0.2)', borderRadius:'8px', padding:'10px' }}>
                  {launchKit.facebookPost}
                </div>
              </div>
            )}

            {/* TikTok */}
            {launchKit.tiktokScript && (
              <div style={{ ...card('#F472B630'), marginBottom:'10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'#F472B6' }}>🎵 TikTok Script (60s)</div>
                  <button onClick={() => navigator.clipboard.writeText(launchKit.tiktokScript)}
                    style={{ padding:'4px 10px', background:'rgba(244,114,182,0.2)', border:'1px solid rgba(244,114,182,0.3)', borderRadius:'8px', color:'#F472B6', fontSize:'10px', cursor:'pointer', fontWeight:700 }}>
                    Copy
                  </button>
                </div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.8, whiteSpace:'pre-wrap', background:'rgba(0,0,0,0.2)', borderRadius:'8px', padding:'10px' }}>
                  {launchKit.tiktokScript}
                </div>
              </div>
            )}

            {/* Objection Handlers */}
            {launchKit.objectionHandlers && Object.keys(launchKit.objectionHandlers).length > 0 && (
              <div style={{ ...card(`${GOLD}30`), marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:GOLD, marginBottom:'10px' }}>💬 Objection Handlers</div>
                {Object.entries(launchKit.objectionHandlers).map(([key, val]: [string, any]) => (
                  <div key={key} style={{ marginBottom:'10px' }}>
                    <div style={{ fontSize:'11px', fontWeight:700, color:GOLD, marginBottom:'3px', textTransform:'capitalize' }}>
                      When they say: "{key.replace(/_/g,' ')}"
                    </div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.7, background:'rgba(0,0,0,0.15)', borderRadius:'8px', padding:'8px' }}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Where to post */}
            {launchKit.whereToPost?.length > 0 && (
              <div style={{ ...card(), marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.7)', marginBottom:'8px' }}>
                  📍 Where to Find Your Buyers
                </div>
                {launchKit.whereToPost.map((place: string, i: number) => (
                  <div key={i} style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:'6px' }}>
                    <span style={{ color:ROCKET }}>→</span> {place}
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => { setStage('radar'); setProduct(null); setLaunchKit(null); setSelected(null) }}
              style={{ ...btn(`linear-gradient(135deg,${ROCKET},#E55A2B)`) }}>
              🚀 Create Another Product →
            </button>
          </div>
        )}

        {/* ── WEBSITE BUILDING STAGE ── */}
        {stage === 'website' && (
          <div>
            {buildingWeb ? (
              <div style={{ textAlign:'center', padding:'48px 20px' }}>
                <div style={{ fontSize:'56px', marginBottom:'16px' }}>🌐</div>
                <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, marginBottom:'8px' }}>
                  Building Your Website
                </div>
                <div style={{ fontSize:'13px', color:PURP === '#4C1D95' ? '#A78BFA' : GOLD, marginBottom:'24px' }}>{webStage}</div>
                <div style={{ display:'flex', justifyContent:'center', gap:'6px' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:'8px', height:'8px', borderRadius:'50%', background:PURP, animation:`pulse 1.2s ${i*0.3}s infinite` }} />
                  ))}
                </div>
                <div style={{ marginTop:'20px', fontSize:'12px', color:'rgba(255,255,255,0.3)', lineHeight:1.8 }}>
                  AI is researching · writing copy · designing · building promotion strategy<br/>
                  This takes 1–2 minutes. Please wait.
                </div>
              </div>
            ) : website && (
              <div>
                {/* Success */}
                <div style={{ textAlign:'center', marginBottom:'20px' }}>
                  <div style={{ fontSize:'40px', marginBottom:'8px' }}>✅</div>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, marginBottom:'4px' }}>
                    Website Ready
                  </div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>AI built everything. Now choose your domain.</div>
                </div>

                {/* Domain suggestions */}
                {website.domainSuggestions?.length > 0 && (
                  <div style={{ marginBottom:'16px' }}>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'8px' }}>💡 AI Suggested Domains:</div>
                    {website.domainSuggestions.map((d: string, i: number) => (
                      <button key={i} onClick={() => setDomain(d)}
                        style={{ display:'block', width:'100%', padding:'10px 14px', marginBottom:'6px', background: domain===d ? `${GOLD}20` : 'rgba(255,255,255,0.04)', border:`1px solid ${domain===d ? GOLD : 'rgba(255,255,255,0.1)'}`, borderRadius:'10px', color: domain===d ? GOLD : 'rgba(255,255,255,0.7)', fontSize:'13px', fontWeight:700, cursor:'pointer', textAlign:'left' as const }}>
                        🌐 {d}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom domain input */}
                <div style={{ marginBottom:'16px' }}>
                  <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'6px' }}>
                    Or enter your own domain:
                  </label>
                  <input value={domain} onChange={e => setDomain(e.target.value)}
                    placeholder="mydomain.com"
                    style={{ width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', color:W, fontSize:'14px', outline:'none', fontFamily:'Georgia,serif', boxSizing:'border-box' as const }}
                  />
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:'6px', lineHeight:1.7 }}>
                    Register your domain at: <strong style={{color:GOLD}}>domains.co.za</strong> (SA) or <strong style={{color:GOLD}}>namecheap.com</strong> (Global)<br/>
                    Hosting: <strong style={{color:GOLD}}>Netlify (free)</strong> or <strong style={{color:GOLD}}>Vercel (free)</strong> · Point DNS to our server.
                  </div>
                </div>

                {/* Website preview */}
                <div style={{ marginBottom:'16px' }}>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.6)', marginBottom:'8px' }}>📄 Website Preview:</div>
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', overflow:'hidden' }}>
                    <div style={{ background:'rgba(255,255,255,0.06)', padding:'8px 12px', fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'flex', gap:'6px' }}>
                      <span style={{color:'#FF5F57'}}>●</span><span style={{color:'#FFBD2E'}}>●</span><span style={{color:'#28C940'}}>●</span>
                      <span style={{marginLeft:'8px'}}>{domain || 'yourproduct.com'}</span>
                    </div>
                    <iframe
                      srcDoc={website.html}
                      style={{ width:'100%', height:'400px', border:'none' }}
                      title="Website Preview"
                    />
                  </div>
                </div>

                {/* Download HTML */}
                <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
                  <button
                    onClick={() => {
                      const blob = new Blob([website.html], {type:'text/html'})
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url; a.download = 'product-website.html'; a.click()
                    }}
                    style={{ ...btn('rgba(255,255,255,0.08)', 'rgba(255,255,255,0.7)'), border:'1px solid rgba(255,255,255,0.15)', flex:1, padding:'10px' }}>
                    ⬇️ Download HTML
                  </button>
                  {promotion && (
                    <button onClick={() => setStage('promo')}
                      style={{ ...btn('rgba(167,139,250,0.15)', '#A78BFA'), border:'1px solid rgba(167,139,250,0.3)', flex:1, padding:'10px' }}>
                      📢 View Promotion Strategy
                    </button>
                  )}
                </div>

                {/* Publish button */}
                <button onClick={publishWebsite} disabled={!domain.trim() || publishing}
                  style={{ ...btn(`linear-gradient(135deg,${GOLD},#B8860B)`, '#1E1245'), fontFamily:'Cinzel,Georgia,serif', opacity: (!domain.trim() || publishing) ? 0.6 : 1 }}>
                  {publishing ? 'Publishing...' : '🚀 Publish Website →'}
                </button>

                <button onClick={() => setStage('product')}
                  style={{ ...btn('transparent', 'rgba(255,255,255,0.4)'), border:'1px solid rgba(255,255,255,0.1)', marginTop:'8px' }}>
                  ← Back to Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PROMO STAGE (Platinum) ── */}
        {stage === 'promo' && promotion && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <button onClick={() => setStage('website')}
                style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'13px', padding:0 }}>
                ← Back to Website
              </button>
            </div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'4px' }}>📢 Promotion Strategy</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>Platinum — Complete marketing blueprint</div>

            {/* Google Ads */}
            {promotion.google_ads && (
              <div style={{ background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.2)', borderRadius:'12px', padding:'14px', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#38BDF8', marginBottom:'10px' }}>🔍 Google Ads Copy</div>
                {['headline_1','headline_2','headline_3'].map(k => (
                  <div key={k} style={{ marginBottom:'4px' }}>
                    <span style={{fontSize:'10px',color:'rgba(255,255,255,0.35)'}}>{k.replace('_',' ').toUpperCase()}: </span>
                    <span style={{fontSize:'12px',color:W,fontWeight:700}}>{promotion.google_ads[k]}</span>
                  </div>
                ))}
                <div style={{ marginTop:'8px', fontSize:'12px', color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>
                  {promotion.google_ads.description_1}<br/>{promotion.google_ads.description_2}
                </div>
                <div style={{ marginTop:'6px', fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>
                  Budget: {promotion.google_ads.budget_suggestion}
                </div>
              </div>
            )}

            {/* Facebook Ads */}
            {promotion.facebook_ads && (
              <div style={{ background:'rgba(167,139,250,0.06)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:'12px', padding:'14px', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#A78BFA', marginBottom:'8px' }}>📘 Facebook Ad</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:1.7, marginBottom:'6px' }}>{promotion.facebook_ads.primary_text}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>Image: {promotion.facebook_ads.ad_image_description}</div>
              </div>
            )}

            {/* WhatsApp Campaign */}
            {promotion.whatsapp_campaign && (
              <div style={{ background:'rgba(110,231,183,0.06)', border:'1px solid rgba(110,231,183,0.2)', borderRadius:'12px', padding:'14px', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#6EE7B7', marginBottom:'8px' }}>📱 WhatsApp Campaign</div>
                {Object.entries(promotion.whatsapp_campaign).filter(([k]) => k.startsWith('broadcast')).map(([k,v]:any) => (
                  <div key={k} style={{ marginBottom:'10px' }}>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',marginBottom:'3px'}}>{k.replace('_',' ').toUpperCase()}</div>
                    <div style={{ fontSize:'12px', color:W, lineHeight:1.7, background:'rgba(0,0,0,0.2)', borderRadius:'8px', padding:'8px' }}>{v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 4-Week Content Calendar */}
            {promotion.content_calendar && (
              <div style={{ background:'rgba(212,175,55,0.06)', border:`1px solid ${GOLD}30`, borderRadius:'12px', padding:'14px', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:GOLD, marginBottom:'8px' }}>📅 4-Week Content Calendar</div>
                {promotion.content_calendar.map((week: any) => (
                  <div key={week.week} style={{ marginBottom:'10px' }}>
                    <div style={{ fontSize:'11px', fontWeight:700, color:GOLD }}>Week {week.week} — {week.focus}</div>
                    {week.content_ideas?.map((idea: string, i: number) => (
                      <div key={i} style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)', padding:'3px 0' }}>→ {idea}</div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Launch Week Plan */}
            {promotion.launch_week_plan && (
              <div style={{ background:'rgba(255,107,53,0.06)', border:`1px solid ${ROCKET}30`, borderRadius:'12px', padding:'14px', marginBottom:'10px' }}>
                <div style={{ fontSize:'12px', fontWeight:700, color:ROCKET, marginBottom:'8px' }}>🚀 7-Day Launch Plan</div>
                {Object.entries(promotion.launch_week_plan).map(([day, action]:any) => (
                  <div key={day} style={{ display:'flex', gap:'8px', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:'12px' }}>
                    <span style={{color:ROCKET,flexShrink:0,textTransform:'capitalize',width:'40px'}}>{day}</span>
                    <span style={{color:'rgba(255,255,255,0.7)'}}>{action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── VAULT STAGE ── */}
        {stage === 'vault' && (
          <div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'18px', fontWeight:900, color:W, marginBottom:'4px' }}>
              📦 Your Product Vault
            </div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>
              {vault.length} product{vault.length !== 1 ? 's' : ''} created · {vault.filter(p => p.status === 'listed').length} listed on marketplace
            </div>

            {vault.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.4)' }}>
                <div style={{ fontSize:'32px', marginBottom:'10px' }}>📦</div>
                <div>No products yet. Go to Market Radar to create your first product.</div>
              </div>
            ) : (
              vault.map(p => (
                <div key={p.id} style={{ ...card(`${CAT_COLORS[p.category] || GOLD}20`), marginBottom:'10px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'13px', fontWeight:700, color:W }}>{p.title}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>
                        {p.product_type?.replace('_',' ')} · {p.target_market} · {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0, marginLeft:'10px' }}>
                      <div style={{ fontSize:'16px', fontWeight:900, color:GOLD }}>R{p.retail_price?.toLocaleString()}</div>
                      <div style={{ fontSize:'10px', color: p.status === 'listed' ? '#6EE7B7' : 'rgba(255,255,255,0.3)' }}>
                        {p.status === 'listed' ? '✅ Listed' : '📋 Draft'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'6px' }}>
                    {p.sales_count > 0 && (
                      <span style={{ fontSize:'11px', color:'#6EE7B7' }}>⭐ {p.sales_count} sold · R{(p.total_earned || 0).toLocaleString()} earned</span>
                    )}
                  </div>
                  {p.status !== 'listed' && (
                    <button onClick={() => listProduct(p.id, p.retail_price)} style={{ ...btn(`${GOLD}20`, GOLD), border:`1px solid ${GOLD}40`, marginTop:'8px', padding:'8px', fontSize:'12px' }}>
                      🏪 List on Marketplace
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
      `}</style>
    </div>
  )
}

export default function RocketModePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#FF6B35', fontFamily:'Georgia,serif', fontSize:'18px' }}>
        🚀 Loading Rocket Mode...
      </div>
    }>
      <RocketInner />
    </Suspense>
  )
}
