'use client'
// FILE: app/marketplace/list/page.tsx
// Builder lists a product — from 4M/Coach Manlaw or upload

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG   = '#0D0820'
const GOLD = '#D4AF37'
const W    = '#F0EEF8'
const PURP = '#7C3AED'

const CATEGORIES = ['Education','Health & Wellness','Business & Finance','Relationships','Career & Jobs','Parenting','Faith & Spirituality','Sports & Fitness','Food & Cooking','Technology','Legal & Admin','Beauty & Fashion','Recreation']
const FORMATS    = ['ebook','guide','course','template','checklist','toolkit','masterclass','swipe_file','planner','workbook','software','mini_course']
const CURRENCIES = ['ZAR','NGN','KES','GBP','USD','GHS']
const MARKETS    = ['Global','South Africa','Nigeria','Kenya','Ghana','United Kingdom','United States','Canada','Australia','India']

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
}

function ListInner() {
  const router = useRouter()
  const [user,      setUser]      = useState<any>(null)
  const [tier,      setTier]      = useState('free')
  const [loading,   setLoading]   = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [draftProducts, setDraftProducts] = useState<any[]>([])

  const [title,     setTitle]     = useState('')
  const [subtitle,  setSubtitle]  = useState('')
  const [desc,      setDesc]      = useState('')
  const [category,  setCategory]  = useState('Education')
  const [format,    setFormat]    = useState('ebook')
  const [price,     setPrice]     = useState('')
  const [currency,  setCurrency]  = useState('ZAR')
  const [market,    setMarket]    = useState('Global')
  const [content,   setContent]   = useState('')
  const [useExisting, setUseExisting] = useState<string|null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login?redirect=/marketplace/list'); return }
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('paid_tier').eq('id', user.id).single()
      setTier(prof?.paid_tier || 'free')

      // Load any 4M-created products not yet listed
      // In future: fetch from coach_manlaw_products table
    })
  }, [])

  const submit = async () => {
    if (!title.trim() || !price) return
    setLoading(true)

    const slug = slugify(title) + '-' + Math.random().toString(36).slice(2, 6)
    const priceInCents = Math.round(parseFloat(price) * 100)

    const { data, error } = await supabase.from('marketplace_products').insert({
      builder_id: user.id,
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      description: desc.trim(),
      category,
      format,
      retail_price: priceInCents,
      currency,
      target_market: market,
      content: content.trim() || null,
      slug,
      status: 'listed',
      listed_at: new Date().toISOString(),
      placeholder_used: true,
      photos_approved: false,
    }).select().single()

    if (error) { console.error(error); setLoading(false); return }

    // Auto-create affiliate account for this builder if not exists
    const { data: existingAff } = await supabase
      .from('marketplace_affiliates')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existingAff && user.email) {
      const code = Math.random().toString(36).slice(2, 10).toUpperCase()
      await supabase.from('marketplace_affiliates').insert({
        user_id: user.id,
        email: user.email,
        is_z2b_member: true,
        affiliate_code: code,
        status: 'active',
      })
    }

    setSaved(true)
    setLoading(false)
    setTimeout(() => router.push(`/marketplace/product/${slug}`), 1500)
  }

  const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', color:W, fontSize:'13px', fontFamily:'Georgia,serif', outline:'none', boxSizing:'border-box' }
  const Lbl = ({ children }: { children: string }) => <label style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'5px', letterSpacing:'1px', textTransform:'uppercase' }}>{children}</label>

  if (saved) return (
    <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px', color:W, fontFamily:'Georgia,serif' }}>
      <div style={{ fontSize:'48px' }}>🎉</div>
      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:GOLD }}>Product Listed!</div>
      <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>Redirecting to your product page...</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      {/* Nav */}
      <div style={{ padding:'10px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:'10px' }}>
        <Link href="/marketplace" style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← Marketplace</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:700, color:GOLD }}>List My Product</span>
      </div>

      <div style={{ maxWidth:'600px', margin:'0 auto', padding:'24px 16px 60px' }}>
        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:W, marginBottom:'4px' }}>List a Digital Product</div>
        <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', marginBottom:'20px', lineHeight:1.7 }}>
          Products created with the 4M Machine are eligible to list here. You earn 90% of every direct sale. Affiliates earn 20% (deducted from your 90%) when they drive a sale.
        </div>

        {/* Revenue reminder */}
        <div style={{ background:`${GOLD}08`, border:`1px solid ${GOLD}25`, borderRadius:'12px', padding:'14px', marginBottom:'20px', fontSize:'12px', color:'rgba(255,255,255,0.65)', lineHeight:1.8 }}>
          <strong style={{ color:GOLD }}>Your earnings per sale:</strong><br/>
          Direct sale: You keep 90% · Affiliate-driven sale: You keep 70% · Z2B takes 10% always<br/>
          <strong style={{ color:'rgba(255,255,255,0.4)' }}>Marketplace sales do not cascade to your upline.</strong>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'20px' }}>
          <div>
            <Lbl>Product title *</Lbl>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. How to Start a Food Business with R2,000" style={inp} />
          </div>
          <div>
            <Lbl>Subtitle / tagline</Lbl>
            <input value={subtitle} onChange={e=>setSubtitle(e.target.value)} placeholder="e.g. Step-by-step guide for township entrepreneurs" style={inp} />
          </div>
          <div>
            <Lbl>Description (what they get)</Lbl>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} placeholder="Describe what the buyer will receive and what transformation they will experience..." style={{ ...inp, resize:'none' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <div>
              <Lbl>Category</Lbl>
              <select value={category} onChange={e=>setCategory(e.target.value)} style={inp}>
                {CATEGORIES.map(c=><option key={c} style={{ background:'#1E1245' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <Lbl>Format</Lbl>
              <select value={format} onChange={e=>setFormat(e.target.value)} style={inp}>
                {FORMATS.map(f=><option key={f} value={f} style={{ background:'#1E1245' }}>{f.replace(/_/g,' ')}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
            <div>
              <Lbl>Price</Lbl>
              <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="199" type="number" style={inp} />
            </div>
            <div>
              <Lbl>Currency</Lbl>
              <select value={currency} onChange={e=>setCurrency(e.target.value)} style={inp}>
                {CURRENCIES.map(c=><option key={c} style={{ background:'#1E1245' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <Lbl>Target Market</Lbl>
              <select value={market} onChange={e=>setMarket(e.target.value)} style={inp}>
                {MARKETS.map(m=><option key={m} style={{ background:'#1E1245' }}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Lbl>Product content (paste from 4M / Coach Manlaw)</Lbl>
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={8}
              placeholder="Paste the full product content here — the ebook, guide, checklist, etc. Buyers receive this after payment." style={{ ...inp, resize:'none' }} />
          </div>
        </div>

        {/* Photo note */}
        <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'12px', marginBottom:'16px', fontSize:'11px', color:'rgba(255,255,255,0.55)', lineHeight:1.8 }}>
          📸 <strong style={{ color:'#FCA5A5' }}>Photos:</strong> Your product will show a placeholder icon until you upload approved photos. For influencer partnership products, photos can only be added after the influencer signs the digital agreement.
        </div>

        <button onClick={submit} disabled={loading || !title.trim() || !price}
          style={{ width:'100%', padding:'14px', borderRadius:'12px', border:'none', fontFamily:'Cinzel,Georgia,serif', fontWeight:900, fontSize:'14px', cursor: loading||!title.trim()||!price ? 'not-allowed' : 'pointer',
            background: loading||!title.trim()||!price ? 'rgba(255,255,255,0.08)' : `linear-gradient(135deg,${GOLD},#B8860B)`,
            color: loading||!title.trim()||!price ? 'rgba(255,255,255,0.3)' : '#1E1245' }}>
          {loading ? 'Listing your product...' : '🏪 List on Z2B Marketplace →'}
        </button>
      </div>
    </div>
  )
}

export default function ListProductPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37' }}>Loading...</div>}>
      <ListInner />
    </Suspense>
  )
}
