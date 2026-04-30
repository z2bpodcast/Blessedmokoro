'use client'
// FILE: app/marketplace/product/[slug]/page.tsx
// Public product page — handles purchase + affiliate attribution

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BG   = '#0D0820'
const GOLD = '#D4AF37'
const W    = '#F0EEF8'
const PINK = '#EC4899'
const PURP = '#7C3AED'

function RevenueInfo({ price, isPartnership }: { price: number; isPartnership: boolean }) {
  const z2b = Math.round(price * 0.10)
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', padding:'12px', marginTop:'12px', fontSize:'11px', color:'rgba(255,255,255,0.4)', lineHeight:1.8 }}>
      <div style={{ fontWeight:700, color:'rgba(255,255,255,0.6)', marginBottom:'4px' }}>Revenue transparency:</div>
      {isPartnership ? (
        <>Z2B platform fee: R{z2b} (10%) · Influencer: 70% · Builder: 30%<br/>Affiliates earn 20% when they drive a sale</>
      ) : (
        <>Z2B platform fee: R{z2b} (10%) · Builder keeps: R{Math.round(price*0.90)} (90%)<br/>Affiliates earn 20% (R{Math.round(price*0.20)}) when they drive a sale</>
      )}
    </div>
  )
}

function ProductInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug    = params?.slug as string
  const refCode = searchParams.get('ref') || (typeof window !== 'undefined' ? localStorage.getItem('z2b_affiliate_ref') || '' : '')

  const [product,   setProduct]   = useState<any>(null)
  const [loading,   setLoading]   = useState(true)
  const [user,      setUser]      = useState<any>(null)
  const [affLink,   setAffLink]   = useState('')
  const [copied,    setCopied]    = useState(false)
  const [buying,    setBuying]    = useState(false)
  const [affCode,   setAffCode]   = useState(refCode)

  useEffect(() => {
    if (refCode) localStorage.setItem('z2b_affiliate_ref', refCode.toUpperCase())

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        // Get or create affiliate account for this builder
        const { data: aff } = await supabase
          .from('marketplace_affiliates')
          .select('affiliate_code')
          .eq('user_id', user.id)
          .single()
        if (aff) setAffCode(aff.affiliate_code)
      }
    })

    supabase.from('marketplace_products')
      .select('*, profiles!builder_id(full_name), influencer_partnerships(influencer_handle, platform)')
      .eq('slug', slug)
      .eq('status', 'listed')
      .single()
      .then(({ data }) => {
        setProduct(data)
        setLoading(false)
        if (data && affCode) {
          setAffLink(`https://marketplace.z2blegacybuilders.co.za/p/${slug}?ref=${affCode}`)
        }
      })
  }, [slug])

  useEffect(() => {
    if (product && affCode) {
      setAffLink(`https://marketplace.z2blegacybuilders.co.za/p/${slug}?ref=${affCode}`)
    }
  }, [product, affCode])

  const copyLink = () => {
    navigator.clipboard.writeText(affLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBuy = async () => {
    if (!user) { window.location.href = `/login?redirect=/marketplace/product/${slug}` ; return }
    setBuying(true)
    // Pass affiliate ref to payment
    const ref = refCode || affCode
    window.location.href = `/pay?product=${product.id}&ref=${ref}&price=${product.retail_price}&title=${encodeURIComponent(product.title)}`
  }

  if (loading) return <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, fontFamily:'Georgia,serif' }}>Loading...</div>
  if (!product) return <div style={{ minHeight:'100vh', background:BG, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.5)', fontFamily:'Georgia,serif' }}>Product not found · <Link href="/marketplace" style={{ color:GOLD, marginLeft:'6px' }}>Back to Marketplace</Link></div>

  const price        = Math.round(product.retail_price / 100)
  const isPartnership = !!product.partnership_id
  const currency     = product.currency === 'USD' ? '$' : product.currency === 'GBP' ? '£' : product.currency === 'NGN' ? '₦' : 'R'

  const formatLabel: Record<string,string> = { ebook:'📖 eBook', guide:'🗺️ Guide', course:'🎓 Course', template:'📋 Template', checklist:'✅ Checklist', toolkit:'🧰 Toolkit', masterclass:'🏆 Masterclass', swipe_file:'📂 Swipe File', planner:'📅 Planner', workbook:'📓 Workbook', software:'💻 Interactive Tool', mini_course:'⚡ Mini-Course' }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:W, fontFamily:'Georgia,serif' }}>
      {/* Nav */}
      <div style={{ padding:'10px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:'10px' }}>
        <Link href="/marketplace" style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', textDecoration:'none' }}>← Marketplace</Link>
        <span style={{ color:'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'13px', fontWeight:700, color:GOLD }}>🏪 Z2B Marketplace</span>
      </div>

      {refCode && (
        <div style={{ background:`${GOLD}12`, borderBottom:`1px solid ${GOLD}25`, padding:'8px 20px', fontSize:'11px', color:GOLD, textAlign:'center' }}>
          🔗 You arrived via an affiliate link · The affiliate earns 20% if you purchase
        </div>
      )}

      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'24px 16px 60px' }}>

        {/* Product header */}
        <div style={{ background:`linear-gradient(160deg,${PURP}15,${GOLD}08)`, border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', overflow:'hidden', marginBottom:'20px' }}>
          {/* Hero image / placeholder */}
          <div style={{ height:'200px', background:`linear-gradient(135deg,${PURP}30,${GOLD}15)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            {product.placeholder_used || !product.approved_photos?.length ? (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'64px', marginBottom:'8px' }}>{formatLabel[product.format]?.split(' ')[0] || '📦'}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>Product preview</div>
              </div>
            ) : (
              <img src={product.approved_photos[0]} alt={product.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            )}
            {isPartnership && (
              <div style={{ position:'absolute', top:'12px', right:'12px', padding:'4px 10px', background:'rgba(236,72,153,0.9)', borderRadius:'20px', fontSize:'11px', fontWeight:700 }}>
                🤝 Builder × Influencer Partnership
              </div>
            )}
          </div>

          <div style={{ padding:'20px' }}>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'6px' }}>{formatLabel[product.format] || product.format}</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'22px', fontWeight:900, color:W, marginBottom:'6px', lineHeight:1.3 }}>{product.title}</div>
            {product.subtitle && <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', marginBottom:'10px' }}>{product.subtitle}</div>}

            <div style={{ display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap', marginBottom:'14px' }}>
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)' }}>by {product.profiles?.full_name || 'Z2B Builder'}</span>
              {product.influencer_partnerships?.influencer_handle && (
                <span style={{ fontSize:'12px', color:'#F9A8D4' }}>🤝 @{product.influencer_partnerships.influencer_handle}</span>
              )}
              {product.target_market && <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>📍 {product.target_market}</span>}
              {product.sales_count > 0 && <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>✅ {product.sales_count} purchased</span>}
            </div>

            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.6)', lineHeight:1.8, marginBottom:'16px' }}>{product.description}</div>

            {/* Price + Buy */}
            <div style={{ display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ fontSize:'32px', fontWeight:900, color:GOLD }}>{currency}{price}</div>
              <button onClick={handleBuy} disabled={buying}
                style={{ flex:1, padding:'14px 20px', borderRadius:'12px', border:'none', background:`linear-gradient(135deg,${GOLD},#B8860B)`, color:'#1E1245', fontWeight:900, fontSize:'15px', cursor:buying?'wait':'pointer', fontFamily:'Cinzel,Georgia,serif' }}>
                {buying ? 'Redirecting...' : `Buy Now — ${currency}${price} →`}
              </button>
            </div>

            <RevenueInfo price={product.retail_price} isPartnership={isPartnership} />
          </div>
        </div>

        {/* Affiliate section — earn 20% by sharing */}
        <div style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'16px', padding:'18px', marginBottom:'20px' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:'#A78BFA', marginBottom:'4px' }}>
            💰 Earn 20% by Sharing This Product
          </div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:'12px' }}>
            Share your affiliate link. Every time someone buys through your link, you earn {currency}{Math.round(product.retail_price / 100 * 0.20)} (20% of {currency}{price}).
            Paid to your Z2B wallet. Withdraw anytime.
          </div>

          {affCode ? (
            <div>
              <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:W, marginBottom:'8px', wordBreak:'break-all' }}>
                {affLink || `https://marketplace.z2blegacybuilders.co.za/p/${slug}?ref=${affCode}`}
              </div>
              <button onClick={copyLink}
                style={{ padding:'9px 20px', background:`${PURP}30`, border:`1px solid ${PURP}50`, borderRadius:'10px', color:'#A78BFA', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                {copied ? '✅ Copied!' : '📋 Copy Affiliate Link'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>
                {user ? 'Setting up your affiliate link...' : 'Get your affiliate link:'}
              </div>
              {!user && (
                <div style={{ display:'flex', gap:'8px' }}>
                  <Link href="/login?redirect=/marketplace/product/${slug}" style={{ padding:'9px 16px', background:`${PURP}30`, border:`1px solid ${PURP}50`, borderRadius:'10px', color:'#A78BFA', fontWeight:700, fontSize:'12px', textDecoration:'none' }}>
                    Sign In (Z2B Member)
                  </Link>
                  <Link href="/marketplace/become-affiliate" style={{ padding:'9px 16px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', color:'rgba(255,255,255,0.6)', fontWeight:700, fontSize:'12px', textDecoration:'none' }}>
                    Join as Affiliate (Free)
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* After purchase — become affiliate prompt */}
        <div style={{ background:'rgba(212,175,55,0.06)', border:`1px solid ${GOLD}20`, borderRadius:'12px', padding:'14px', fontSize:'12px', color:'rgba(255,255,255,0.6)', lineHeight:1.8 }}>
          <strong style={{ color:GOLD }}>After you buy:</strong> You will receive your own affiliate link. Share it with anyone — earn 20% on every sale you generate. No limit on earnings.
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0D0820', display:'flex', alignItems:'center', justifyContent:'center', color:'#D4AF37' }}>Loading...</div>}>
      <ProductInner />
    </Suspense>
  )
}
