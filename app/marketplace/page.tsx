'use client'
// FILE: app/marketplace/page.tsx
// Z2B Marketplace — Builder sets price · Z2B takes 5% only

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG   = '#0D0820'
const GOLD = '#D4AF37'
const W    = '#F0EEF8'
const ROCKET = '#FF6B35'

const CATEGORIES = ['All','Education','Income','Health','Career','Sports','Business','Faith','Finance','Legal','Relationships','Recreation']

const CAT_COLORS: Record<string,string> = {
  Education:'#A78BFA', Income:'#6EE7B7', Career:'#38BDF8',
  Health:'#F472B6', Sports:'#FF6B35', Business:GOLD,
  Faith:'#FCD34D', Finance:'#34D399', Legal:'#FB923C',
  Relationships:'#F9A8D4', Recreation:'#4ADE80',
}

function calcSplit(price: number) {
  return {
    z2b:    Math.round(price * 0.05),
    seller: Math.round(price * 0.95),
  }
}

type Product = {
  id: string
  title: string
  subtitle?: string
  description?: string
  category?: string
  pain_point?: string
  target_market?: string
  language?: string
  product_type?: string
  retail_price: number
  z2b_commission: number
  seller_earnings: number
  builder_name?: string
  builder_tier?: string
  sales_count?: number
  is_proven_seller?: boolean
  listed_at?: string
}

function MarketplaceInner() {
  const [products,  setProducts]  = useState<Product[]>([])
  const [loading,   setLoading]   = useState(true)
  const [category,  setCategory]  = useState('All')
  const [search,    setSearch]    = useState('')
  const [user,      setUser]      = useState<any>(null)
  const [builderTier, setBuilderTier] = useState('free')
  const [buying,    setBuying]    = useState<string|null>(null)
  const [payMethod, setPayMethod] = useState<'yoco'|'eft'|'bank'|null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product|null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setUser(u)
      if (u) {
        const { data: prof } = await supabase.from('profiles').select('paid_tier').eq('id', u.id).single()
        setBuilderTier(prof?.paid_tier || 'free')
      }
    })

    supabase.from('rocket_products')
      .select('*')
      .eq('status', 'listed')
      .order('is_proven_seller', { ascending: false })
      .order('sales_count', { ascending: false })
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [])

  const filtered = products.filter(p => {
    const matchCat = category === 'All' || p.category === category
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.pain_point || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const card = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '16px',
  }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>

      {/* Nav */}
      <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/" style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← Home</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'14px', fontWeight:700, color:GOLD }}>Z2B Marketplace</span>
        {user && (
          <Link href="/ai-income/rocket" style={{ marginLeft:'auto', padding:'6px 14px', background:`${ROCKET}18`, border:`1px solid ${ROCKET}40`, borderRadius:'20px', fontSize:'11px', fontWeight:700, color:ROCKET, textDecoration:'none' }}>
            🚀 Rocket Mode →
          </Link>
        )}
      </div>

      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'24px 16px 60px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:W, margin:'0 0 6px' }}>
            Z2B Digital Marketplace
          </h1>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', margin:'0 0 4px' }}>
            AI-created expert digital products · Ready to buy and use
          </p>
          <div style={{ fontSize:'12px', color:GOLD }}>
            Builder keeps 95% · Z2B takes 5% only
          </div>
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search products, topics, pain points..."
          style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', color:W, fontSize:'13px', outline:'none', fontFamily:'Georgia,serif', marginBottom:'12px', boxSizing:'border-box' }}
        />

        {/* Category filter */}
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'20px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ padding:'6px 12px', borderRadius:'20px', border:`1px solid ${category===cat ? (CAT_COLORS[cat]||GOLD) : 'rgba(255,255,255,0.1)'}`,
                background: category===cat ? `${CAT_COLORS[cat]||GOLD}18` : 'transparent',
                color: category===cat ? (CAT_COLORS[cat]||GOLD) : 'rgba(255,255,255,0.5)',
                fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.4)' }}>Loading marketplace...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px' }}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>🚀</div>
            <div style={{ fontSize:'16px', fontWeight:700, color:W, marginBottom:'8px' }}>No products yet</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', marginBottom:'16px' }}>
              Rocket Mode products will appear here when builders start publishing.
            </div>
            <Link href="/ai-income/rocket" style={{ display:'inline-block', padding:'10px 24px', background:`linear-gradient(135deg,${ROCKET},#E55A2B)`, borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'13px', textDecoration:'none' }}>
              🚀 Create Your First Product →
            </Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {filtered.map(p => {
              const split = calcSplit(p.retail_price)
              const catColor = CAT_COLORS[p.category||''] || GOLD
              return (
                <div key={p.id} style={{ ...card, border:`1px solid ${catColor}25` }}>
                  {/* Header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                    <div style={{ flex:1 }}>
                      {p.is_proven_seller && (
                        <div style={{ fontSize:'10px', fontWeight:700, color:'#6EE7B7', marginBottom:'4px' }}>⭐ PROVEN SELLER</div>
                      )}
                      <div style={{ fontSize:'15px', fontWeight:700, color:W, marginBottom:'2px' }}>{p.title}</div>
                      {p.subtitle && <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>{p.subtitle}</div>}
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0, marginLeft:'12px' }}>
                      <div style={{ fontSize:'20px', fontWeight:900, color:GOLD }}>R{p.retail_price.toLocaleString()}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>once-off</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
                    {p.category && (
                      <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', background:`${catColor}15`, borderRadius:'10px', color:catColor }}>{p.category}</span>
                    )}
                    {p.product_type && (
                      <span style={{ fontSize:'10px', padding:'2px 8px', background:'rgba(255,255,255,0.06)', borderRadius:'10px', color:'rgba(255,255,255,0.5)', textTransform:'capitalize' }}>{p.product_type.replace('_',' ')}</span>
                    )}
                    {p.target_market && (
                      <span style={{ fontSize:'10px', padding:'2px 8px', background:'rgba(255,255,255,0.06)', borderRadius:'10px', color:'rgba(255,255,255,0.5)' }}>📍 {p.target_market}</span>
                    )}
                    {p.language && p.language !== 'en' && (
                      <span style={{ fontSize:'10px', padding:'2px 8px', background:'rgba(255,255,255,0.06)', borderRadius:'10px', color:'rgba(255,255,255,0.5)' }}>🌍 {p.language}</span>
                    )}
                  </div>

                  {/* Description */}
                  {p.description && (
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:'10px' }}>
                      {p.description.slice(0, 120)}{p.description.length > 120 ? '...' : ''}
                    </div>
                  )}

                  {/* Stats */}
                  <div style={{ display:'flex', gap:'12px', marginBottom:'12px' }}>
                    <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>By {p.builder_name || 'Z2B Builder'}</span>
                    {(p.sales_count || 0) > 0 && (
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>· {p.sales_count} sold</span>
                    )}
                  </div>

                  {/* Buy button */}
                  <button
                    onClick={() => { setSelectedProduct(p); setBuying(p.id); setPayMethod(null) }}
                    style={{ width:'100%', padding:'11px', background:`linear-gradient(135deg,${GOLD},#B8860B)`, border:'none', borderRadius:'10px', color:'#1E1245', fontWeight:900, fontSize:'13px', cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                    Buy Now — R{p.retail_price.toLocaleString()} →
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Payment Modal */}
        {buying && selectedProduct && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:9999, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:'20px' }}>
            <div style={{ background:'linear-gradient(160deg,#1E1245,#0D0820)', border:`1px solid ${GOLD}40`, borderRadius:'20px 20px 0 0', padding:'24px', width:'100%', maxWidth:'480px' }}>

              {/* Close */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <div>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'16px', fontWeight:900, color:W }}>{selectedProduct.title}</div>
                  <div style={{ fontSize:'22px', fontWeight:900, color:GOLD }}>R{selectedProduct.retail_price.toLocaleString()}</div>
                </div>
                <button onClick={() => { setBuying(null); setSelectedProduct(null); setPayMethod(null) }}
                  style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:'32px', height:'32px', color:'#fff', fontSize:'18px', cursor:'pointer' }}>×</button>
              </div>

              {/* Method selector */}
              {!payMethod && (
                <div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'10px' }}>Choose payment method:</div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={() => setPayMethod('yoco')}
                      style={{ flex:1, padding:'12px', borderRadius:'10px', border:'1px solid rgba(124,58,237,0.4)', background:'rgba(124,58,237,0.08)', color:'#C4B5FD', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                      💳<br/>Yoco<br/><span style={{fontWeight:400,fontSize:'10px'}}>Card online</span>
                    </button>
                    <button onClick={() => setPayMethod('eft')}
                      style={{ flex:1, padding:'12px', borderRadius:'10px', border:'1px solid rgba(8,145,178,0.4)', background:'rgba(8,145,178,0.08)', color:'#38BDF8', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                      🏦<br/>EFT<br/><span style={{fontWeight:400,fontSize:'10px'}}>Bank transfer</span>
                    </button>
                    <button onClick={() => setPayMethod('bank')}
                      style={{ flex:1, padding:'12px', borderRadius:'10px', border:`1px solid ${GOLD}40`, background:`${GOLD}08`, color:GOLD, fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                      💵<br/>Deposit<br/><span style={{fontWeight:400,fontSize:'10px'}}>Cash deposit</span>
                    </button>
                  </div>
                </div>
              )}

              {/* EFT / Bank details */}
              {(payMethod === 'eft' || payMethod === 'bank') && (
                <div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#38BDF8', marginBottom:'12px' }}>
                    {payMethod === 'eft' ? '🏦 EFT Internet Banking' : '💵 Cash / Bank Deposit'}
                  </div>
                  {[
                    { label:'Bank',           value:'Nedbank' },
                    { label:'Account Holder', value:'Zero2Billionaires Amavuladlela Pty Ltd' },
                    { label:'Account Number', value:'1318257727' },
                    { label:'Branch Code',    value:'198765' },
                    { label:'Amount',         value:`R${selectedProduct.retail_price.toLocaleString()}` },
                    { label:'Reference',      value:'Your Full Name' },
                  ].map(row => (
                    <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{row.label}</span>
                      <span style={{ fontSize:'12px', fontWeight:700, color:W }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginTop:'10px' }}>
                    📱 Send proof to WhatsApp: <strong style={{color:'#6EE7B7'}}>0774901639</strong>
                  </div>
                  <button onClick={() => { setBuying(null); setSelectedProduct(null); setPayMethod(null) }}
                    style={{ width:'100%', marginTop:'12px', padding:'12px', background:'linear-gradient(135deg,#059669,#047857)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                    ✅ I Have Paid — Close
                  </button>
                </div>
              )}

              {/* Yoco */}
              {payMethod === 'yoco' && (
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'16px', lineHeight:1.7 }}>
                    Secure card payment via Yoco.<br/>Visa · Mastercard · Amex accepted.
                  </p>
                  <button
                    onClick={async () => {
                      if (!user) { window.location.href = '/login?redirect=/marketplace'; return }
                      const res = await fetch('/api/yoco', {
                        method:'POST', headers:{'Content-Type':'application/json'},
                        body: JSON.stringify({ amount: selectedProduct.retail_price * 100, currency:'ZAR', productId: selectedProduct.id, userId: user?.id })
                      })
                      const data = await res.json()
                      if (data.redirectUrl) window.location.href = data.redirectUrl
                    }}
                    style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#7C3AED,#4C1D95)', border:'none', borderRadius:'12px', color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                    💳 Pay R{selectedProduct.retail_price.toLocaleString()} with Yoco →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Seller CTA */}
        <div style={{ marginTop:'32px', textAlign:'center', background:'rgba(255,107,53,0.06)', border:`1px solid ${ROCKET}30`, borderRadius:'16px', padding:'20px' }}>
          <div style={{ fontSize:'16px', fontWeight:900, color:W, fontFamily:'Cinzel,Georgia,serif', marginBottom:'6px' }}>
            Want to sell on the Marketplace?
          </div>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'14px', lineHeight:1.7 }}>
            Use Rocket Mode to create AI-powered digital products.<br/>
            Set your own price. Keep 95%. Z2B takes only 5%.
          </p>
          <Link href="/ai-income/rocket" style={{ display:'inline-block', padding:'10px 28px', background:`linear-gradient(135deg,${ROCKET},#E55A2B)`, borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'13px', textDecoration:'none', fontFamily:'Cinzel,Georgia,serif' }}>
            🚀 Start Rocket Mode →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37', fontFamily:'Georgia,serif' }}>Loading marketplace...</div>}>
      <MarketplaceInner />
    </Suspense>
  )
}
