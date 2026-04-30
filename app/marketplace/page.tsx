'use client'
// FILE: app/marketplace/page.tsx
// Z2B Marketplace — AI Era design, inspirational colors

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ── AI Era Color System ───────────────────────────────────────────
const BG    = '#050A18'   // Deep space navy
const SURF  = '#0D1629'   // Card surface
const SURF2 = '#111D35'   // Elevated surface
const GOLD  = '#F59E0B'   // Warm AI gold
const GOLD2 = '#FCD34D'   // Highlight gold
const BLUE  = '#3B82F6'   // Electric blue
const CYAN  = '#06B6D4'   // Neon cyan
const VIO   = '#8B5CF6'   // AI violet
const VIO2  = '#A78BFA'   // Bright violet
const W     = '#F0F9FF'   // Crisp white-blue
const MUTED = '#94A3B8'   // Blue-grey
const GREEN = '#10B981'   // Emerald
const PINK  = '#EC4899'   // Partnership pink
const BORDER= '#1E3A5F'   // Blue border

const CATEGORIES = ['All','Education','Health & Wellness','Business & Finance','Relationships','Career','Parenting','Faith','Sports & Fitness','Food & Cooking','Technology','Legal','Beauty & Fashion','Recreation']
const FORMATS    = ['All','ebook','guide','course','template','checklist','toolkit','masterclass','swipe_file','planner','workbook','software']

const FORMAT_META: Record<string,{icon:string,label:string,color:string}> = {
  ebook:       { icon:'📖', label:'eBook',        color: BLUE },
  guide:       { icon:'🗺️', label:'Guide',         color: CYAN },
  course:      { icon:'🎓', label:'Course',        color: VIO },
  template:    { icon:'📋', label:'Template',      color: GOLD },
  checklist:   { icon:'✅', label:'Checklist',     color: GREEN },
  toolkit:     { icon:'🧰', label:'Toolkit',       color: '#F97316' },
  masterclass: { icon:'🏆', label:'Masterclass',   color: GOLD },
  swipe_file:  { icon:'📂', label:'Swipe File',    color: CYAN },
  planner:     { icon:'📅', label:'Planner',       color: VIO2 },
  workbook:    { icon:'📓', label:'Workbook',      color: BLUE },
  software:    { icon:'💻', label:'Tool',           color: GREEN },
  mini_course: { icon:'⚡', label:'Mini-Course',   color: GOLD },
}

type Product = {
  id: string; title: string; name: string; subtitle: string; tagline: string
  description: string; category: string; format: string; product_type: string
  retail_price: number; price_once: number; currency: string
  slug: string; target_market: string; seller_id: string; builder_id: string
  placeholder_used: boolean; approved_photos: string[]
  sales_count: number; is_proven_seller: boolean
  partnership_id: string | null; builder_name: string; seller_name: string
  influencer_handle?: string
}

function ParticleGrid() {
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.06, pointerEvents:'none' }} viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
      {Array.from({length:24}).map((_,i) => Array.from({length:8}).map((_,j) => (
        <circle key={`${i}-${j}`} cx={i*52+26} cy={j*52+26} r="1.5" fill={CYAN} />
      )))}
      {Array.from({length:24}).map((_,i) => Array.from({length:8}).map((_,j) => (
        <line key={`l${i}-${j}`} x1={i*52+26} y1={j*52+26} x2={(i+1)*52+26} y2={j*52+26} stroke={BLUE} strokeWidth="0.5" opacity="0.4" />
      )))}
    </svg>
  )
}

function HeroStats({ count }: { count: number }) {
  return (
    <div style={{ display:'flex', gap:'24px', justifyContent:'center', flexWrap:'wrap', marginTop:'20px' }}>
      {[
        { icon:'⚡', label:'AI-Powered',    val:'100%' },
        { icon:'🌐', label:'Products Live', val:`${count}+` },
        { icon:'✦',  label:'Affiliate Rate',val:'20%' },
        { icon:'◈',  label:'Builder Share', val:'90%' },
      ].map(s => (
        <div key={s.label} style={{ textAlign:'center' }}>
          <div style={{ fontSize:'11px', color:CYAN, marginBottom:'2px' }}>{s.icon}</div>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:GOLD }}>{s.val}</div>
          <div style={{ fontSize:'10px', color:MUTED, letterSpacing:'1px', textTransform:'uppercase' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function ProductCard({ p, refCode }: { p: Product; refCode: string }) {
  const fmt    = FORMAT_META[p.format || p.product_type] || { icon:'📦', label:'Digital', color:BLUE }
  const price  = Math.round((p.retail_price || p.price_once || 0) / 100)
  const curr   = p.currency === 'USD' ? '$' : p.currency === 'GBP' ? '£' : p.currency === 'NGN' ? '₦' : 'R'
  const title  = p.title || p.name || 'Digital Product'
  const sub    = p.subtitle || p.tagline || ''
  const isNew  = !p.sales_count || p.sales_count === 0
  const slug   = p.slug || p.id
  const href   = `/marketplace/product/${slug}${refCode ? `?ref=${refCode}` : ''}`

  return (
    <Link href={href} style={{ textDecoration:'none', display:'block' }}>
      <div style={{ background:`linear-gradient(145deg,${SURF},${SURF2})`, border:`1px solid ${BORDER}`,
        borderRadius:'20px', overflow:'hidden', transition:'all 0.25s', cursor:'pointer',
        boxShadow:`0 4px 24px rgba(0,0,0,0.4)` }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.border = `1px solid ${fmt.color}60`
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${fmt.color}15`
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.border = `1px solid ${BORDER}`
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px rgba(0,0,0,0.4)`
        }}>

        {/* Image / Hero */}
        <div style={{ height:'160px', background:`linear-gradient(135deg,${fmt.color}18,${BG})`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>

          {/* Grid pattern */}
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.07 }} viewBox="0 0 300 160">
            {Array.from({length:10}).map((_,i) => <line key={`v${i}`} x1={i*33} y1="0" x2={i*33} y2="160" stroke={fmt.color} strokeWidth="0.8"/>)}
            {Array.from({length:6}).map((_,j) => <line key={`h${j}`} x1="0" y1={j*28} x2="300" y2={j*28} stroke={fmt.color} strokeWidth="0.8"/>)}
          </svg>

          {p.approved_photos?.length && !p.placeholder_used ? (
            <img src={p.approved_photos[0]} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} />
          ) : (
            <div style={{ textAlign:'center', zIndex:1 }}>
              <div style={{ fontSize:'44px', marginBottom:'4px', filter:`drop-shadow(0 0 12px ${fmt.color}80)` }}>{fmt.icon}</div>
              <div style={{ fontSize:'10px', color:fmt.color, fontWeight:700, letterSpacing:'2px', textTransform:'uppercase' }}>{fmt.label}</div>
            </div>
          )}

          {/* Badges */}
          <div style={{ position:'absolute', top:'10px', left:'10px', display:'flex', gap:'4px', flexDirection:'column' }}>
            <span style={{ fontSize:'9px', fontWeight:700, padding:'3px 8px', background:`${fmt.color}25`, border:`1px solid ${fmt.color}50`, borderRadius:'20px', color:fmt.color }}>
              {fmt.icon} {fmt.label}
            </span>
            {p.partnership_id && (
              <span style={{ fontSize:'9px', fontWeight:700, padding:'3px 8px', background:'rgba(236,72,153,0.2)', border:'1px solid rgba(236,72,153,0.4)', borderRadius:'20px', color:PINK }}>
                🤝 Partnership
              </span>
            )}
          </div>

          {p.is_proven_seller && (
            <div style={{ position:'absolute', top:'10px', right:'10px', fontSize:'9px', fontWeight:700, padding:'3px 8px', background:`${GOLD}25`, border:`1px solid ${GOLD}50`, borderRadius:'20px', color:GOLD }}>
              ✦ Proven
            </div>
          )}
          {isNew && (
            <div style={{ position:'absolute', top:'10px', right:'10px', fontSize:'9px', fontWeight:700, padding:'3px 8px', background:`${CYAN}20`, border:`1px solid ${CYAN}40`, borderRadius:'20px', color:CYAN }}>
              ✨ New
            </div>
          )}

          {/* Glow line at bottom */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,transparent,${fmt.color},transparent)` }} />
        </div>

        {/* Info */}
        <div style={{ padding:'14px 16px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:W, lineHeight:1.4, marginBottom:'4px' }}>
            {title.length > 55 ? title.slice(0,55) + '...' : title}
          </div>
          {sub && <div style={{ fontSize:'11px', color:MUTED, marginBottom:'8px', lineHeight:1.4 }}>{sub.slice(0,70)}</div>}

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'10px' }}>
            <div>
              <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900,
                background:`linear-gradient(135deg,${GOLD},${GOLD2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {curr}{price}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              {p.sales_count > 0 && <span style={{ fontSize:'10px', color:GREEN }}>✅ {p.sales_count}</span>}
              <span style={{ fontSize:'10px', color:MUTED }}>{p.target_market || 'Global'}</span>
            </div>
          </div>

          <div style={{ marginTop:'8px', fontSize:'10px', color:MUTED }}>
            by {p.seller_name || p.builder_name || 'Z2B Builder'}
          </div>
        </div>
      </div>
    </Link>
  )
}

function MarketplaceInner() {
  const searchParams = useSearchParams()
  const refCode  = searchParams.get('ref') || ''
  const [products,  setProducts]  = useState<Product[]>([])
  const [filtered,  setFiltered]  = useState<Product[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [category,  setCategory]  = useState('All')
  const [format,    setFormat]    = useState('All')
  const [sortBy,    setSortBy]    = useState('newest')
  const [affBanner, setAffBanner] = useState('')
  const [user,      setUser]      = useState<any>(null)
  const [tier,      setTier]      = useState('free')

  const TIER_RANK: Record<string,number> = { free:0,starter:1,bronze:2,copper:3,silver:4,gold:5,platinum:6,silver_rocket:4,gold_rocket:5,platinum_rocket:6 }

  useEffect(() => {
    if (refCode) {
      localStorage.setItem('z2b_affiliate_ref', refCode.toUpperCase())
      fetch(`/api/affiliate?code=${refCode}`)
        .then(r=>r.json())
        .then(d=>{ if(d.affiliate?.full_name) setAffBanner(`Referred by ${d.affiliate.full_name}`) })
    }

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('paid_tier').eq('id', user.id).single()
        setTier(prof?.paid_tier || 'free')
      }
    })

    supabase.from('marketplace_products')
      .select('*')
      .or('status.eq.listed,is_active.eq.true')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts(data || [])
        setFiltered(data || [])
        setLoading(false)
      })
  }, [refCode])

  useEffect(() => {
    let r = [...products]
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(p => (p.title||p.name||'').toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q))
    }
    if (category !== 'All') r = r.filter(p => p.category === category)
    if (format   !== 'All') r = r.filter(p => (p.format||p.product_type) === format)
    if (sortBy === 'price_asc')  r.sort((a,b) => (a.retail_price||a.price_once||0) - (b.retail_price||b.price_once||0))
    if (sortBy === 'price_desc') r.sort((a,b) => (b.retail_price||b.price_once||0) - (a.retail_price||a.price_once||0))
    if (sortBy === 'popular')    r.sort((a,b) => (b.sales_count||0) - (a.sales_count||0))
    setFiltered(r)
  }, [search, category, format, sortBy, products])

  const canList = (TIER_RANK[tier] || 0) >= 1  // Starter and above

  const selStyle: React.CSSProperties = {
    padding:'9px 12px', background:SURF2, border:`1px solid ${BORDER}`,
    borderRadius:'10px', color:W, fontSize:'12px', fontFamily:'Georgia,serif', outline:'none',
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      <style>{`
        @keyframes pulse-glow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div style={{ position:'relative', overflow:'hidden', borderBottom:`1px solid ${BORDER}`,
        background:`linear-gradient(180deg,${SURF} 0%,${BG} 100%)` }}>
        <ParticleGrid />

        {/* Glow orbs */}
        <div style={{ position:'absolute', top:'-60px', left:'10%', width:'300px', height:'300px', background:`radial-gradient(circle,${BLUE}15 0%,transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'-40px', right:'15%', width:'250px', height:'250px', background:`radial-gradient(circle,${VIO}12 0%,transparent 70%)`, pointerEvents:'none' }} />

        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'32px 20px 28px', position:'relative', zIndex:1 }}>

          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px', flexWrap:'wrap' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
                <span style={{ fontSize:'28px', animation:'float 3s ease-in-out infinite' }}>🏪</span>
                <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'26px', fontWeight:900,
                  background:`linear-gradient(135deg,${GOLD},${CYAN})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  Z2B Marketplace
                </span>
              </div>
              <div style={{ fontSize:'12px', color:MUTED, letterSpacing:'1px' }}>
                ⚡ AI-Powered Digital Products · Built by Z2B Builders · Sold Globally
              </div>
            </div>

            <div style={{ marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
              {canList ? (
                <>
                  <Link href="/marketplace/list"
                    style={{ padding:'9px 20px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'10px', color:'#050A18', fontWeight:900, fontSize:'12px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif', boxShadow:`0 0 20px ${GOLD}40` }}>
                    + List My Product
                  </Link>
                  <Link href="/marketplace/my-products"
                    style={{ padding:'9px 14px', border:`1px solid ${BORDER}`, borderRadius:'10px', color:MUTED, fontSize:'12px', textDecoration:'none', fontWeight:700 }}>
                    My Products
                  </Link>
                </>
              ) : user ? (
                <Link href="/ai-income/choose-plan"
                  style={{ padding:'9px 20px', background:`linear-gradient(135deg,${BLUE},${VIO})`, borderRadius:'10px', color:'#fff', fontWeight:900, fontSize:'12px', textDecoration:'none' }}>
                  Upgrade to List Products →
                </Link>
              ) : (
                <Link href="/login?redirect=/marketplace"
                  style={{ padding:'9px 20px', background:`linear-gradient(135deg,${GOLD},#D97706)`, borderRadius:'10px', color:'#050A18', fontWeight:900, fontSize:'12px', textDecoration:'none' }}>
                  Sign In to Sell
                </Link>
              )}
            </div>
          </div>

          <HeroStats count={filtered.length || products.length} />
        </div>
      </div>

      {/* Affiliate banner */}
      {affBanner && (
        <div style={{ background:`linear-gradient(90deg,${GOLD}15,${CYAN}10)`, borderBottom:`1px solid ${GOLD}30`, padding:'8px 20px', textAlign:'center', fontSize:'12px', color:GOLD }}>
          🔗 {affBanner} — shopping via their affiliate link · they earn 20% if you buy
        </div>
      )}

      {/* Become affiliate strip */}
      <div style={{ background:`linear-gradient(90deg,${VIO}12,${BLUE}08)`, borderBottom:`1px solid ${BORDER}`, padding:'10px 20px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
          <span style={{ fontSize:'14px' }}>💰</span>
          <span style={{ fontSize:'12px', color:W, fontWeight:700 }}>Earn 20% on every sale</span>
          <span style={{ fontSize:'12px', color:MUTED }}>Share any product with your unique affiliate link. No membership required.</span>
          <Link href="/marketplace/become-affiliate"
            style={{ marginLeft:'auto', fontSize:'12px', fontWeight:700, color:CYAN, textDecoration:'none', border:`1px solid ${CYAN}40`, padding:'4px 12px', borderRadius:'20px' }}>
            Get my affiliate link →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'24px 16px' }}>

        {/* ── SEARCH + FILTERS ── */}
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'20px' }}>
          <div style={{ flex:'2 1 220px', position:'relative' }}>
            <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:MUTED, fontSize:'14px' }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search products..."
              style={{ width:'100%', padding:'10px 12px 10px 36px', background:SURF2, border:`1px solid ${BORDER}`, borderRadius:'10px', color:W, fontSize:'13px', fontFamily:'Georgia,serif', outline:'none' }} />
          </div>
          <select value={category} onChange={e=>setCategory(e.target.value)} style={{ ...selStyle, flex:'1 1 140px' }}>
            {CATEGORIES.map(c=><option key={c} style={{background:SURF}}>{c}</option>)}
          </select>
          <select value={format} onChange={e=>setFormat(e.target.value)} style={{ ...selStyle, flex:'1 1 130px' }}>
            {FORMATS.map(f=><option key={f} style={{background:SURF}}>{f==='All'?'All formats':f.replace(/_/g,' ')}</option>)}
          </select>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ ...selStyle, flex:'1 1 130px' }}>
            <option value="newest" style={{background:SURF}}>Newest first</option>
            <option value="popular" style={{background:SURF}}>Most popular</option>
            <option value="price_asc" style={{background:SURF}}>Price: Low → High</option>
            <option value="price_desc" style={{background:SURF}}>Price: High → Low</option>
          </select>
        </div>

        {/* Result count */}
        <div style={{ fontSize:'12px', color:MUTED, marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
          <span>{loading ? 'Loading...' : `${filtered.length} products`}</span>
          {refCode && <span style={{ color:GOLD, padding:'2px 10px', background:`${GOLD}12`, border:`1px solid ${GOLD}30`, borderRadius:'20px' }}>Affiliate: {refCode.toUpperCase()}</span>}
          {!loading && !canList && user && (
            <span style={{ color:CYAN, padding:'2px 10px', background:`${CYAN}10`, border:`1px solid ${CYAN}30`, borderRadius:'20px' }}>
              ⬆️ Upgrade to Starter to list your products
            </span>
          )}
        </div>

        {/* ── PRODUCT GRID ── */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'80px', color:MUTED }}>
            <div style={{ fontSize:'48px', marginBottom:'16px', animation:'float 2s ease-in-out infinite' }}>⚡</div>
            <div style={{ fontSize:'14px' }}>Loading marketplace...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🌐</div>
            <div style={{ fontSize:'16px', fontWeight:700, color:W, marginBottom:'8px' }}>No products found</div>
            <div style={{ fontSize:'13px', color:MUTED }}>Try adjusting your filters</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:'20px' }}>
            {filtered.map(p => <ProductCard key={p.id} p={p} refCode={refCode} />)}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ marginTop:'60px', borderTop:`1px solid ${BORDER}`, padding:'24px 20px', background:SURF }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'20px', marginBottom:'20px' }}>
            <div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:GOLD, marginBottom:'8px' }}>Revenue — Builder's Own Product</div>
              <div style={{ fontSize:'11px', color:MUTED, lineHeight:1.8 }}>
                Direct sale: Builder keeps 90%<br/>
                Via affiliate: Builder keeps 70%<br/>
                Z2B platform: 10% always
              </div>
            </div>
            <div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:PINK, marginBottom:'8px' }}>Revenue — Partnership Product</div>
              <div style={{ fontSize:'11px', color:MUTED, lineHeight:1.8 }}>
                Influencer: 70% · Builder: 30%<br/>
                Via affiliate: each contributes 10%<br/>
                Z2B platform: 10% always
              </div>
            </div>
            <div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:CYAN, marginBottom:'8px' }}>Affiliate Earnings</div>
              <div style={{ fontSize:'11px', color:MUTED, lineHeight:1.8 }}>
                20% of every sale you refer<br/>
                Paid to Z2B wallet<br/>
                Withdraw anytime · No minimum
              </div>
            </div>
            <div>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:900, color:VIO2, marginBottom:'8px' }}>Who Can List</div>
              <div style={{ fontSize:'11px', color:MUTED, lineHeight:1.8 }}>
                Starter Pack and above<br/>
                Products built with 4M tools<br/>
                <Link href="/ai-income/choose-plan" style={{ color:GOLD, textDecoration:'none' }}>Get Starter Pack →</Link>
              </div>
            </div>
          </div>
          <div style={{ textAlign:'center', fontSize:'11px', color:MUTED, paddingTop:'16px', borderTop:`1px solid ${BORDER}` }}>
            ⚡ Z2B Marketplace — Powered by Z2B Legacy Builders · Marketplace sales do not cascade to upline
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#050A18', display:'flex', alignItems:'center', justifyContent:'center', color:'#F59E0B', fontFamily:'Georgia,serif', flexDirection:'column', gap:'12px' }}>
        <div style={{ fontSize:'48px' }}>⚡</div>
        <div>Loading Z2B Marketplace...</div>
      </div>
    }>
      <MarketplaceInner />
    </Suspense>
  )
}
