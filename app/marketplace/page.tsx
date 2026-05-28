'use client'
// ============================================================
// Z2B — CENTRALIZED MARKETPLACE (SPRINT 19 — UPDATED)
// File: app/marketplace/page.tsx
// Changes: eBook anchor card pinned in Z2B_FEATURED
//          Commission split: 75% seller / 20% affiliate / 5% Z2B
//          refCode flows through all payment methods
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams }     from 'next/navigation'
import { supabase }                       from '@/lib/supabase'
import Link                               from 'next/link'

const BG    = '#050A18'
const SURF  = '#0D1629'
const GOLD  = '#D4AF37'
const CYAN  = '#06B6D4'
const VIO   = '#8B5CF6'
const W     = '#F0F9FF'
const MUTED = '#64748B'
const GREEN = '#10B981'
const PURP  = '#2d1b69'

// ── BOOK COVER ───────────────────────────────────────────────
const BOOK_COVER = 'https://udfjauogxptlkfrmdtsg.supabase.co/storage/v1/object/public/public-assets/book-cover.jpg'

// ── CATEGORIES ───────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',         label: 'All Products',            icon: '🏪' },
  { id: 'z2b',         label: 'Z2B Featured',            icon: '⭐' },
  { id: 'ebook',       label: 'eBooks & Guides',         icon: '📚' },
  { id: 'toolkit',     label: 'Toolkits & Templates',    icon: '🧰' },
  { id: 'course',      label: 'Courses & Masterclasses', icon: '🎓' },
  { id: 'framework',   label: 'Frameworks & Protocols',  icon: '📋' },
  { id: 'printable',   label: 'Printables & Planners',   icon: '🖨️' },
  { id: 'audio_video', label: 'Audio & Video',           icon: '🎵' },
  { id: 'software',    label: 'Software & Tools',        icon: '💻' },
  { id: 'community',   label: 'Communities',             icon: '👥' },
]

// ── Z2B FEATURED PRODUCTS (pinned cards) ─────────────────────
// ⭐ eBook is ANCHOR — always first
const Z2B_FEATURED = [
  {
    id:          'z2b-ebook',
    category:    'ebook',
    isEbook:     true,                          // triggers floating book cover render
    badge:       'ANCHOR EBOOK',
    title:       'Zero2Billionaires',
    subtitle:    'From Salary Struggles to Digital Freedom',
    desc:        'The foundational Kingdom business book. Learn the 4 Legs of the Billionaire Table, the 4M Machine Power System and how to build digital income streams rooted in Genesis 1:28.',
    price:       200,
    cta:         'Get the eBook — R200 →',
    productId:   'zero2billionaires-ebook',
    sellerRef:   'REVMOK2B',                    // 75% always goes to Rev as product owner
    color:       GOLD,
    bg:          'rgba(212,175,55,0.06)',
    border:      'rgba(212,175,55,0.3)',
  },
  {
    id:          'z2b-book-services',
    category:    'z2b',
    isEbook:     false,
    icon:        '📖',
    badge:       'Z2B SERVICE',
    title:       'Digital Book Services',
    subtitle:    'I Turn Authors Into Brands',
    desc:        'Done-for-you digital book creation, publishing and distribution. Your knowledge becomes a professional digital product that sells on global marketplaces.',
    price:       null,
    cta:         'Get a Quote →',
    href:        'mailto:books@z2blegacybuilders.co.za',
    color:       VIO,
    bg:          'rgba(139,92,246,0.08)',
    border:      'rgba(139,92,246,0.3)',
  },
  {
    id:          'z2b-4m-machine',
    category:    'z2b',
    isEbook:     false,
    icon:        '⚙️',
    badge:       'Z2B PLATFORM',
    title:       'The 4M Machine',
    subtitle:    'Build. Sell. Earn. Repeat.',
    desc:        'AI-powered digital product factory. From idea to marketplace in one session. Build eBooks, toolkits, templates and more — then sell on 5 platforms automatically.',
    price:       700,
    cta:         'Start Building →',
    href:        '/ai-income/choose-plan',
    color:       GOLD,
    bg:          'rgba(212,175,55,0.08)',
    border:      'rgba(212,175,55,0.3)',
  },
]

// ── TYPES ─────────────────────────────────────────────────────
interface Product {
  id:           string
  title:        string
  name:         string
  description:  string
  price:        number
  retail_price: number
  price_once:   number
  format:       string
  status:       string
  seller_id:    string
  seller_name:  string
  sales_count:  number
  session_id:   string
  listed_at:    string
  builder_id:   string
  affiliate_enabled: boolean
  product_type?: string
  features?:     string[]
  cover_url?:    string
  icon?:         string
}

// ── EBOOK PAYMENT MODAL ───────────────────────────────────────
// Handles the Zero2Billionaires eBook with full commission split
function EbookModal({
  onClose,
  refCode,
  buyerEmail: initEmail,
}: {
  onClose:    () => void
  refCode:    string
  buyerEmail: string
}) {
  const PRICE       = 200
  const PRODUCT_ID  = 'zero2billionaires-ebook'
  const SELLER_REF  = 'REVMOK2B'

  const [method,     setMethod]     = useState<'yoco' | 'eft' | 'atm'>('yoco')
  const [buyerName,  setBuyerName]  = useState('')
  const [buyerEmail, setBuyerEmail] = useState(initEmail)
  const [loading,    setLoading]    = useState(false)
  const [eftRef,     setEftRef]     = useState('')
  const [copied,     setCopied]     = useState<string | null>(null)

  const canPay = buyerName.trim() && buyerEmail.trim()
  const ref    = eftRef || ('Z2B-EBOOK-' + Date.now().toString().slice(-8))

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // Record commission split in Supabase
  async function recordCommission(method: string, status: 'paid' | 'pending') {
    const affiliateCommission = PRICE * 0.20   // 20% to affiliate
    const sellerShare         = PRICE * 0.75   // 75% to Rev (product owner)
    const platformShare       = PRICE * 0.05   // 5%  to Z2B

    // Record the sale
    await supabase.from('marketplace_sales').insert({
      product_id:        PRODUCT_ID,
      product_name:      'Zero2Billionaires eBook',
      amount:            PRICE,
      seller_ref:        SELLER_REF,
      seller_share:      sellerShare,
      affiliate_ref:     refCode || null,
      commission_amount: refCode ? affiliateCommission : 0,
      commission_rate:   0.20,
      platform_share:    platformShare,
      payment_method:    method,
      buyer_email:       buyerEmail,
      buyer_name:        buyerName,
      status,
      created_at:        new Date().toISOString(),
    })

    // Credit affiliate — 20% flat, no upline
    if (refCode && status !== 'pending') {
      await supabase.from('affiliate_commissions').insert({
        ref_code:          refCode,
        product_id:        PRODUCT_ID,
        commission_amount: affiliateCommission,
        payment_method:    method,
        buyer_email:       buyerEmail,
        status:            'approved',
        created_at:        new Date().toISOString(),
      })
    } else if (refCode && status === 'pending') {
      // Pending until admin confirms EFT/ATM
      await supabase.from('affiliate_commissions').insert({
        ref_code:          refCode,
        product_id:        PRODUCT_ID,
        commission_amount: affiliateCommission,
        payment_method:    method,
        buyer_email:       buyerEmail,
        status:            'pending',
        created_at:        new Date().toISOString(),
      })
    }
  }

  async function handleYoco() {
    if (!canPay || loading) return
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token ?? ''

      const res  = await fetch('/api/marketplace/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body:    JSON.stringify({
          productId:   PRODUCT_ID,
          amount:      PRICE,
          provider:    'yoco',
          buyerEmail,
          buyerName,
          refCode:     refCode || null,
          sellerRef:   SELLER_REF,
          // Commission metadata passed through to webhook
          commissions: {
            seller:    { ref: SELLER_REF,  amount: PRICE * 0.75, rate: 0.75 },
            affiliate: { ref: refCode,     amount: PRICE * 0.20, rate: 0.20 },
            platform:  { amount: PRICE * 0.05, rate: 0.05 },
          },
        }),
      })
      const data = await res.json()
      if (data.redirectUrl)  window.location.href = data.redirectUrl
      else if (data.checkoutUrl) window.location.href = data.checkoutUrl
      else { alert('Could not initiate payment. Please try again.'); setLoading(false) }
    } catch {
      alert('Network error. Please try again.')
      setLoading(false)
    }
  }

  async function handleManual(payMethod: 'eft' | 'atm') {
    if (!canPay) return
    const newRef = 'Z2B-EBOOK-' + Date.now().toString().slice(-8)
    setEftRef(newRef)
    await recordCommission(payMethod, 'pending')
  }

  const METHODS = [
    { id: 'yoco', icon: '💳', label: 'Card Payment via Yoco', desc: 'Visa · Mastercard — instant confirmation' },
    { id: 'eft',  icon: '🏦', label: 'EFT / Bank Transfer',   desc: 'Direct transfer — confirmed within 24hrs'  },
    { id: 'atm',  icon: '🏧', label: 'Nedbank ATM Deposit',   desc: 'Cash deposit at any Nedbank ATM'           },
  ]

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.82)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(10px)' }}>
      <div style={{ width:'100%', maxWidth:'460px', background:SURF, borderRadius:'20px', border:'1px solid rgba(212,175,55,0.25)', borderTop:'3px solid '+GOLD, overflow:'hidden', maxHeight:'90vh', overflowY:'auto' }}>

        {/* Header with floating book */}
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', gap:'16px', alignItems:'center', background:'linear-gradient(135deg,rgba(45,27,105,0.4) 0%,rgba(13,22,41,0.8) 100%)', position:'relative' }}>
          {/* Floating book cover */}
          <div style={{ flexShrink:0, width:72, filter:'drop-shadow(0 12px 24px rgba(212,175,55,0.3))', animation:'ebFloat 4s ease-in-out infinite' }}>
            <img src={BOOK_COVER} alt="Zero2Billionaires" style={{ width:'100%', borderRadius:4, display:'block' }} />
          </div>
          <style>{`@keyframes ebFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px)}}`}</style>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:9, letterSpacing:4, color:GOLD, fontFamily:'Georgia,serif', marginBottom:4 }}>ANCHOR EBOOK</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:16, fontWeight:900, color:W, marginBottom:2 }}>Zero2Billionaires</div>
            <div style={{ fontSize:11, color:'rgba(212,175,55,0.6)', fontStyle:'italic', marginBottom:6 }}>From Salary Struggles to Digital Freedom</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:24, fontWeight:900, color:GOLD }}>R200</div>
          </div>
          <button onClick={onClose} style={{ position:'absolute', top:12, right:14, background:'transparent', border:'none', color:MUTED, cursor:'pointer', fontSize:18 }}>✕</button>
        </div>

        {/* Affiliate badge */}
        {refCode && (
          <div style={{ padding:'8px 20px', background:'rgba(212,175,55,0.06)', borderBottom:'1px solid rgba(212,175,55,0.1)', fontSize:10, color:GOLD, letterSpacing:3, fontFamily:'Georgia,serif' }}>
            ◆ REFERRED BY {refCode} · AFFILIATE EARNS R{(200*0.20).toFixed(0)} COMMISSION
          </div>
        )}

        {/* EFT / ATM bank details shown after confirming */}
        {eftRef ? (
          <div style={{ padding:'20px' }}>
            <div style={{ padding:'16px', borderRadius:'12px', background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.25)', marginBottom:'16px' }}>
              <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, fontWeight:900, color:CYAN, marginBottom:12 }}>
                {method === 'atm' ? '🏧 Nedbank ATM Deposit Details' : '🏦 EFT Bank Details'}
              </div>
              {[
                { k:'Bank',           v:'Nedbank',                            id:'k1'          },
                { k:'Account Name',   v:'Zero2billionaires Amavulandlela',    id:'k2'          },
                { k:'Account Number', v:'1318257727',                         id:'k3', hl:true },
                { k:'Branch Code',    v:'198765',                             id:'k4'          },
                { k:'Amount',         v:'R200.00',                            id:'k5', hl:true },
                { k:'Reference',      v:eftRef,                               id:'k6', hl:true },
              ].map(({ k, v, id, hl }) => (
                <div key={id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6, fontSize:12 }}>
                  <span style={{ color:MUTED }}>{k}:</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ color: hl ? GOLD : W, fontWeight: hl ? 900 : 400 }}>{v}</span>
                    <button onClick={() => copyText(v, id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:10, color:'rgba(212,175,55,0.45)', fontFamily:'Georgia,serif' }}>
                      {copied === id ? '✓' : 'COPY'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:12, color:MUTED, lineHeight:1.8, marginBottom:16 }}>
              {method === 'atm'
                ? `📍 Go to any Nedbank ATM → Deposits → Account number above → R200 cash → use reference ${eftRef}.`
                : `⚠️ Use reference ${eftRef} so we can match your payment.`
              } Your eBook will be delivered to <span style={{ color:W }}>{buyerEmail}</span> within 24 hours of confirmation.
            </div>
            <button onClick={onClose} style={{ width:'100%', padding:12, borderRadius:10, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:14, fontFamily:'Cinzel,Georgia,serif' }}>
              Done — I have made the payment →
            </button>
          </div>

        ) : (
          <div style={{ padding:'20px' }}>
            {/* Buyer details */}
            <div style={{ fontSize:10, color:MUTED, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>Your Details</div>
            <input
              placeholder="Full name"
              value={buyerName}
              onChange={e => setBuyerName(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:W, fontSize:13, fontFamily:'Georgia,serif', outline:'none', marginBottom:8 }}
            />
            <input
              type="email"
              placeholder="Email address"
              value={buyerEmail}
              onChange={e => setBuyerEmail(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:W, fontSize:13, fontFamily:'Georgia,serif', outline:'none', marginBottom:16 }}
            />

            {/* Method selection */}
            <div style={{ fontSize:10, color:MUTED, letterSpacing:3, textTransform:'uppercase', marginBottom:10 }}>Choose Payment Method</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
              {METHODS.map(m => (
                <div key={m.id} onClick={() => setMethod(m.id as any)}
                  style={{ padding:'12px 14px', borderRadius:10, border:'2px solid '+(method===m.id ? GOLD : 'rgba(255,255,255,0.08)'), background:method===m.id ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)', cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:20 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:method===m.id ? GOLD : W }}>{m.label}</div>
                    <div style={{ fontSize:11, color:MUTED }}>{m.desc}</div>
                  </div>
                  <div style={{ marginLeft:'auto', fontSize:9, letterSpacing:2, padding:'3px 7px', borderRadius:4, border:'1px solid', ...(m.id==='yoco' ? { color:'#6ee7b7', borderColor:'rgba(5,150,105,0.35)', background:'rgba(5,150,105,0.1)' } : m.id==='atm' ? { color:'#93c5fd', borderColor:'rgba(59,130,246,0.35)', background:'rgba(59,130,246,0.1)' } : { color:'#fcd34d', borderColor:'rgba(217,119,6,0.35)', background:'rgba(217,119,6,0.1)' }) }}>
                    {m.id==='yoco' ? 'INSTANT' : m.id==='atm' ? 'SAME DAY' : '24 HRS'}
                  </div>
                </div>
              ))}
            </div>

            {/* Pay button */}
            {method === 'yoco' ? (
              <button onClick={handleYoco} disabled={!canPay || loading}
                style={{ width:'100%', padding:14, borderRadius:12, border:'none', cursor: (!canPay||loading) ? 'not-allowed' : 'pointer', background: (!canPay||loading) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#D4AF37,#B8860B)', color: (!canPay||loading) ? MUTED : '#050A18', fontWeight:900, fontSize:15, fontFamily:'Cinzel,Georgia,serif', opacity: !canPay ? 0.5 : 1 }}>
                {loading ? 'Redirecting to Yoco...' : 'Pay R200 via Card →'}
              </button>
            ) : (
              <button onClick={() => handleManual(method as 'eft'|'atm')} disabled={!canPay}
                style={{ width:'100%', padding:14, borderRadius:12, border:'none', cursor: !canPay ? 'not-allowed' : 'pointer', background: !canPay ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#D4AF37,#B8860B)', color: !canPay ? MUTED : '#050A18', fontWeight:900, fontSize:15, fontFamily:'Cinzel,Georgia,serif', opacity: !canPay ? 0.5 : 1 }}>
                {method==='atm' ? 'Show ATM Deposit Details →' : 'Show EFT Bank Details →'}
              </button>
            )}

            {!canPay && (
              <div style={{ textAlign:'center', fontSize:11, color:'rgba(212,175,55,0.38)', fontStyle:'italic', marginTop:8 }}>
                Enter your name and email to unlock payment
              </div>
            )}

            <div style={{ textAlign:'center', fontSize:11, color:MUTED, marginTop:10 }}>
              🔒 Secure checkout · Kingdom backed · Instant delivery
            </div>

            {/* Commission split info */}
            <div style={{ marginTop:14, padding:'10px 12px', borderRadius:8, background:'rgba(212,175,55,0.04)', border:'1px solid rgba(212,175,55,0.1)', fontSize:10, color:MUTED, lineHeight:1.8 }}>
              💰 <span style={{ color:GOLD }}>Commission:</span> Seller 75% · {refCode ? `Affiliate (${refCode}) 20%` : 'Affiliate 20% (share your link to earn)'} · Z2B 5%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── EXISTING PAYMENT MODAL (unchanged — for Supabase products) ──
function PaymentModal({ product, onClose, buyerEmail }: { product: Product; onClose: () => void; buyerEmail: string }) {
  const [method,   setMethod]   = useState<'yoco' | 'payfast' | 'eft' | 'atm'>('yoco')
  const [loading,  setLoading]  = useState(false)
  const [eftRef,   setEftRef]   = useState('')
  const price = product.retail_price ?? product.price_once ?? product.price ?? 299

  const METHODS = [
    { id: 'yoco',    icon: '💳', label: 'Card Payment',    desc: 'Visa · Mastercard via Yoco — instant' },
    { id: 'payfast', icon: '⚡', label: 'Instant EFT',     desc: 'All major SA banks — instant' },
    { id: 'eft',     icon: '🏦', label: 'Manual EFT',      desc: 'Bank transfer — 2 hour activation' },
    { id: 'atm',     icon: '🏧', label: 'ATM Deposit',     desc: 'Deposit at any ATM — same day' },
  ]

  async function handlePay() {
    setLoading(true)
    if (method === 'eft' || method === 'atm') {
      setEftRef('Z2B-MP-' + Date.now().toString().slice(-8))
      setLoading(false)
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token ?? ''
    if (method === 'yoco') {
      const res  = await fetch('/api/marketplace/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body:    JSON.stringify({ productId: product.id, amount: price, provider: 'yoco', buyerEmail }),
      })
      const data = await res.json()
      if (data.redirectUrl) window.location.href = data.redirectUrl
      else if (data.checkoutUrl) window.location.href = data.checkoutUrl
    }
    if (method === 'payfast') {
      const res  = await fetch('/api/marketplace/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body:    JSON.stringify({ productId: product.id, amount: price, provider: 'payfast', buyerEmail }),
      })
      const data = await res.json()
      if (data.redirectUrl) window.location.href = data.redirectUrl
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: SURF, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W, marginBottom: '4px' }}>{product.title ?? product.name}</div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '22px', fontWeight: 900, color: GOLD }}>R{price.toLocaleString()}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '20px', padding: '4px' }}>✕</button>
        </div>
        {eftRef ? (
          <div style={{ padding: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: CYAN, marginBottom: '12px' }}>
                {method === 'atm' ? '🏧 ATM Deposit Details' : '🏦 EFT Details'}
              </div>
              {[
                ['Bank',           'Nedbank'],
                ['Account Name',   'Zero2billionaires Amavulandlela'],
                ['Account Number', '1318257727'],
                ['Branch Code',    '198765'],
                ['Amount',         `R${price.toLocaleString()}`],
                ['Reference',      eftRef],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: MUTED }}>{k}:</span>
                  <span style={{ color: k === 'Reference' ? GOLD : W, fontWeight: k === 'Reference' ? 900 : 400 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.8, marginBottom: '16px' }}>
              Email proof of payment to <span style={{ color: GOLD }}>payments@z2blegacybuilders.co.za</span> with your reference. Download link sent within 2 hours.
            </div>
            <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '14px', fontFamily: 'Cinzel,Georgia,serif' }}>
              Done — I will send proof →
            </button>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '11px', color: MUTED, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Choose Payment Method</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {METHODS.map(m => (
                <div key={m.id} onClick={() => setMethod(m.id as any)}
                  style={{ padding: '12px 14px', borderRadius: '10px', border: '2px solid ' + (method === m.id ? GOLD : 'rgba(255,255,255,0.08)'), background: method === m.id ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{m.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: method === m.id ? GOLD : W }}>{m.label}</div>
                    <div style={{ fontSize: '11px', color: MUTED }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handlePay} disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'default' : 'pointer', background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#D4AF37,#B8860B)', color: loading ? MUTED : '#050A18', fontWeight: 900, fontSize: '15px', fontFamily: 'Cinzel,Georgia,serif' }}>
              {loading ? 'Processing...' : `Pay R${price.toLocaleString()} →`}
            </button>
            <div style={{ textAlign: 'center', fontSize: '11px', color: MUTED, marginTop: '10px' }}>
              🔒 Secure payment · Download link sent immediately after payment
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────
function MarketplaceInner() {
  const router      = useRouter()
  const params      = useSearchParams()
  const refCode     = params.get('ref') ?? ''

  const [products,   setProducts]   = useState<Product[]>([])
  const [loading,    setLoading]    = useState(true)
  const [category,   setCategory]   = useState('all')
  const [search,     setSearch]     = useState('')
  const [payment,    setPayment]    = useState<{ product: Product } | null>(null)
  const [ebookOpen,  setEbookOpen]  = useState(false)   // ← eBook modal
  const [userId,     setUserId]     = useState<string | null>(null)
  const [userEmail,  setUserEmail]  = useState('')
  const [refSaved,   setRefSaved]   = useState(false)

  useEffect(() => {
    loadProducts()
    checkUser()
    if (refCode) saveRefCode(refCode)
    // Auto-open success state if returning from Yoco
    if (params.get('payment') === 'success' && params.get('product') === 'zero2billionaires-ebook') {
      setEbookOpen(true)
    }
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) { setUserId(user.id); setUserEmail(user.email ?? '') }
  }

  async function saveRefCode(code: string) {
    if (refSaved) return
    setRefSaved(true)
    try { sessionStorage.setItem('z2b_ref', code) } catch (_) {}
  }

  async function loadProducts() {
    setLoading(true)
    const { data } = await (supabase.from as any)('marketplace_products')
      .select('id, title, name, description, retail_price, price_once, price, format, status, seller_id, seller_name, builder_id, sales_count, listed_at, affiliate_enabled')
      .eq('status', 'listed')
      .eq('is_active', true)
      .order('listed_at', { ascending: false })
      .limit(100) as { data: Product[] | null }
    setProducts(data ?? [])
    setLoading(false)
  }

  function getPrice(p: Product): number {
    return p.retail_price ?? p.price_once ?? p.price ?? 299
  }

  function getCategoryFromFormat(format: string): string {
    const map: Record<string, string> = {
      ebook:'ebook', guide:'ebook', book:'ebook',
      toolkit:'toolkit', template:'toolkit', workbook:'toolkit', checklist:'toolkit',
      course:'course', masterclass:'course', workshop:'course',
      framework:'framework', protocol:'framework',
      printable:'printable', planner:'printable',
      audio:'audio_video', video:'audio_video', podcast:'audio_video',
      software:'software', tool:'software', app:'software',
      community:'community',
    }
    return map[format?.toLowerCase()] ?? 'ebook'
  }

  const filtered = products.filter(p => {
    const matchCat    = category === 'all' || getCategoryFromFormat(p.format) === category
    const searchTerm  = search.toLowerCase()
    const matchSearch = !search ||
      (p.title ?? p.name ?? '').toLowerCase().includes(searchTerm) ||
      (p.description ?? '').toLowerCase().includes(searchTerm)
    return matchCat && matchSearch
  })

  const showFeatured = category === 'all' || category === 'z2b' || category === 'ebook'

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: GOLD, textDecoration: 'none' }}>Z2B</Link>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ flex: 1, minWidth: '120px', maxWidth: '320px', padding: '8px 14px', borderRadius: '20px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '13px', fontFamily: 'Georgia,serif', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {userId ? (
              <Link href="/ai-income" style={{ padding: '7px 16px', borderRadius: '8px', background: GOLD, color: '#050A18', fontSize: '12px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif', whiteSpace: 'nowrap' }}>
                Free Affiliate Marketing — 20% Commission →
              </Link>
            ) : (
              <Link href="/register" style={{ padding: '7px 16px', borderRadius: '8px', background: GOLD, color: '#050A18', fontSize: '12px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                Free Affiliate Marketing — 20% Commission →
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, rgba(212,175,55,0.06) 0%, transparent 100%)', padding: '36px 20px 24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '11px', color: GOLD, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px' }}>Zero 2 Billionaires</div>
        <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, color: W, marginBottom: '8px' }}>The Z2B Marketplace</h1>
        <p style={{ fontSize: '13px', color: MUTED, maxWidth: '480px', margin: '0 auto' }}>
          Digital products built by real people. Toolkits, eBooks, courses, templates and more — all created with the 4M Machine.
        </p>
      </div>

      {/* Category tabs */}
      <div style={{ overflowX: 'auto', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: SURF }}>
        <div style={{ display: 'flex', gap: '6px', minWidth: 'max-content', maxWidth: '1100px', margin: '0 auto', paddingBottom: '4px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              style={{ padding: '7px 14px', borderRadius: '20px', border: '1px solid ' + (category === cat.id ? GOLD : 'rgba(255,255,255,0.1)'), background: category === cat.id ? 'rgba(212,175,55,0.12)' : 'transparent', color: category === cat.id ? GOLD : MUTED, fontSize: '12px', cursor: 'pointer', fontFamily: 'Georgia,serif', fontWeight: category === cat.id ? 700 : 400, whiteSpace: 'nowrap' }}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 12px 60px' }}>

        {/* ── Z2B FEATURED — eBook ANCHOR always first ── */}
        {showFeatured && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', color: MUTED, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '14px' }}>⭐ Z2B Featured</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '12px' }}>
              {Z2B_FEATURED.map(feat => {

                // ── EBOOK ANCHOR CARD ──────────────────────────
                if (feat.isEbook) return (
                  <div key={feat.id} style={{ borderRadius:18, border:'1px solid '+feat.border, background:feat.bg, overflow:'hidden', display:'flex', flexDirection:'column', gridColumn: 'span 1' }}>
                    {/* Gold top bar */}
                    <div style={{ height:3, background:'linear-gradient(90deg,'+GOLD+',#f0c040,'+GOLD+')' }} />
                    <div style={{ padding:'22px', display:'flex', gap:'24px', alignItems:'center', flexWrap:'wrap' }}>
                      {/* Floating book */}
                      <div style={{ flexShrink:0, width:110, filter:'drop-shadow(0 20px 40px rgba(212,175,55,0.25))', animation:'ftFloat 6s ease-in-out infinite' }}>
                        <img src={BOOK_COVER} alt="Zero2Billionaires" style={{ width:'100%', borderRadius:4, display:'block' }} />
                      </div>
                      <style>{`@keyframes ftFloat{0%,100%{transform:translateY(0px) rotate(-1deg)}50%{transform:translateY(-10px) rotate(1deg)}}`}</style>
                      <div style={{ flex:1, minWidth:200 }}>
                        <div style={{ display:'inline-block', fontSize:9, fontWeight:700, padding:'3px 10px', borderRadius:20, background:GOLD+'20', color:GOLD, border:'1px solid '+feat.border, marginBottom:10 }}>
                          ⭐ {feat.badge}
                        </div>
                        <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:22, fontWeight:900, color:W, marginBottom:2 }}>{feat.title}</div>
                        <div style={{ fontSize:13, color:GOLD, marginBottom:10, fontStyle:'italic' }}>{feat.subtitle}</div>
                        <div style={{ fontSize:12, color:MUTED, lineHeight:1.8, marginBottom:14 }}>{feat.desc}</div>
                        {refCode && (
                          <div style={{ fontSize:10, color:GOLD, letterSpacing:3, marginBottom:12 }}>
                            ◆ REFERRED BY {refCode} · AFFILIATE EARNS R{(200*0.20).toFixed(0)} ON THIS SALE
                          </div>
                        )}
                        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:28, fontWeight:900, color:GOLD }}>R200</div>
                          <button
                            onClick={() => setEbookOpen(true)}
                            style={{ padding:'11px 26px', borderRadius:10, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:14, fontFamily:'Cinzel,Georgia,serif' }}>
                            {feat.cta}
                          </button>
                          <div style={{ fontSize:10, color:MUTED }}>🔒 Yoco · EFT · Nedbank ATM</div>
                        </div>
                        <div style={{ marginTop:12, fontSize:10, color:MUTED }}>
                          💰 Affiliates earn 20% (R40) per sale · Seller 75% · Z2B 5%
                        </div>
                      </div>
                    </div>
                  </div>
                )

                // ── STANDARD FEATURED CARD ─────────────────────
                return (
                  <div key={feat.id} style={{ borderRadius: '18px', border: '1px solid ' + feat.border, background: feat.bg, padding: '22px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: feat.color + '20', color: feat.color, border: '1px solid ' + feat.border, marginBottom: '12px' }}>
                      {feat.badge}
                    </div>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>{(feat as any).icon}</div>
                    <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: W, marginBottom: '4px' }}>{feat.title}</div>
                    <div style={{ fontSize: '13px', color: feat.color, marginBottom: '10px', fontWeight: 700 }}>{feat.subtitle}</div>
                    <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.8, marginBottom: '16px' }}>{feat.desc}</div>
                    {feat.price && (
                      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: feat.color, marginBottom: '14px' }}>
                        From R{feat.price.toLocaleString()}
                      </div>
                    )}
                    <Link href={(feat as any).href}
                      style={{ display: 'inline-block', padding: '10px 22px', borderRadius: '10px', background: feat.color, color: '#050A18', fontWeight: 900, fontSize: '13px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                      {feat.cta}
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Products grid — unchanged */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ color: MUTED, fontSize: '13px' }}>Loading products...</div>
          </div>
        ) : filtered.length === 0 && !showFeatured ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: MUTED }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <div style={{ fontSize: '16px', color: W, marginBottom: '8px' }}>No products in this category yet</div>
            <div style={{ fontSize: '13px', marginBottom: '24px' }}>Be the first to build and list a product here.</div>
            <Link href="/ai-income" style={{ padding: '12px 28px', borderRadius: '12px', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '14px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
              Build With 4M Machine →
            </Link>
          </div>
        ) : (
          <>
            {filtered.length > 0 && (
              <div style={{ fontSize: '12px', color: MUTED, marginBottom: '14px' }}>
                {filtered.length} product{filtered.length !== 1 ? 's' : ''} {search ? `matching "${search}"` : `in ${CATEGORIES.find(c => c.id === category)?.label ?? 'all categories'}`}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '12px' }}>
              {filtered.map(product => {
                const price = getPrice(product)
                const is4M  = product.product_type === 'z2b_product' || !product.product_type
                const affiliateAmt = Math.round(price * 0.20)
                const features = Array.isArray(product.features) ? product.features : []
                return (
                  <div key={product.id} style={{ borderRadius:'16px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)', overflow:'hidden', display:'flex', flexDirection:'column', transition:'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.border='1px solid rgba(212,175,55,0.35)')}
                    onMouseLeave={e => (e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)')}>

                    {/* Cover Image */}
                    {product.cover_url ? (
                      <div style={{ width:'100%', height:180, overflow:'hidden', position:'relative' }}>
                        <img src={product.cover_url} alt={product.title ?? product.name}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 50%, rgba(5,10,24,0.95) 100%)' }} />
                        {is4M && (
                          <div style={{ position:'absolute', top:10, left:10, background:'rgba(212,175,55,0.9)', color:'#050A18', fontSize:9, fontWeight:900, padding:'3px 8px', borderRadius:6, letterSpacing:1, textTransform:'uppercase', fontFamily:'Cinzel,Georgia,serif' }}>
                            4M Digital Product
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ width:'100%', height:140, background:'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(139,92,246,0.08))', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize:40, marginBottom:8 }}>{product.icon ?? '📦'}</div>
                        <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:GOLD, opacity:0.7 }}>{product.format ?? 'digital product'}</div>
                        {is4M && (
                          <div style={{ position:'absolute', top:10, left:10, background:'rgba(212,175,55,0.15)', border:'1px solid rgba(212,175,55,0.3)', color:GOLD, fontSize:9, fontWeight:900, padding:'3px 8px', borderRadius:6, letterSpacing:1, textTransform:'uppercase', fontFamily:'Cinzel,Georgia,serif' }}>
                            4M Digital Product
                          </div>
                        )}
                        {(product.sales_count ?? 0) > 0 && (
                          <div style={{ position:'absolute', top:10, right:10, fontSize:10, color:GREEN, background:'rgba(16,185,129,0.1)', padding:'3px 8px', borderRadius:6 }}>🔥 {product.sales_count} sold</div>
                        )}
                      </div>
                    )}

                    <div style={{ padding:'16px 16px 10px', flex:1 }}>

                      {/* Format badge */}
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                        <span style={{ fontSize:9, color:GOLD, background:'rgba(212,175,55,0.1)', padding:'3px 8px', borderRadius:8, textTransform:'uppercase', letterSpacing:1 }}>
                          {product.format ?? 'ebook'}
                        </span>
                        {is4M && (
                          <>
                            <span style={{ fontSize:9, color:'#06B6D4', background:'rgba(6,182,212,0.1)', padding:'3px 8px', borderRadius:8 }}>🎧 Audio Reader</span>
                            <span style={{ fontSize:9, color:'#8B5CF6', background:'rgba(139,92,246,0.1)', padding:'3px 8px', borderRadius:8 }}>✍️ Workbook</span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'15px', fontWeight:900, color:W, marginBottom:'8px', lineHeight:1.3 }}>
                        {product.title ?? product.name}
                      </div>

                      {/* Description */}
                      <div style={{ fontSize:'12px', color:MUTED, lineHeight:1.7, marginBottom:'10px', position:'relative' }}
                        onMouseEnter={e => { const t = e.currentTarget.querySelector('.full-desc') as HTMLElement; if(t) t.style.display='block' }}
                        onMouseLeave={e => { const t = e.currentTarget.querySelector('.full-desc') as HTMLElement; if(t) t.style.display='none' }}>
                        {(product.description ?? '').slice(0, 120)}{(product.description?.length ?? 0) > 120 ? '...' : ''}
                        <div className="full-desc" style={{ display:'none', position:'absolute', top:'100%', left:0, right:0, zIndex:50, background:'#0D1629', border:'1px solid rgba(212,175,55,0.3)', borderRadius:10, padding:'14px', fontSize:12, color:'rgba(240,249,255,0.85)', lineHeight:1.8, maxHeight:200, overflowY:'auto', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
                          {product.description ?? ''}
                        </div>
                      </div>

                      {/* Value enhancements */}
                      {is4M && (
                        <div style={{ marginBottom:10 }}>
                          <div style={{ fontSize:9, color:GOLD, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>What's included</div>
                          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                            {['📖 Interactive Reader','🎧 Audio Player','✍️ Workbook','📋 Checklist','📊 Templates'].map((v,i) => (
                              <span key={i} style={{ fontSize:9, color:'rgba(240,249,255,0.6)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', padding:'2px 7px', borderRadius:6 }}>{v}</span>
                            ))}
                            {features.slice(0,2).map((f: string, i: number) => (
                              <span key={'f'+i} style={{ fontSize:9, color:'rgba(240,249,255,0.6)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', padding:'2px 7px', borderRadius:6 }}>✅ {f.slice(0,20)}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Seller */}
                      {product.seller_name && (
                        <div style={{ fontSize:'10px', color:MUTED, marginBottom:4 }}>by {product.seller_name}</div>
                      )}
                    </div>

                    {/* Affiliate invite */}
                    <div style={{ padding:'8px 16px', background:'rgba(16,185,129,0.05)', borderTop:'1px solid rgba(16,185,129,0.1)', fontSize:10, color:'rgba(16,185,129,0.8)' }}>
                      💰 Buy and/or Recommend this & earn <strong style={{ color:GREEN }}>R{affiliateAmt}</strong> per sale — 20% affiliate commission
                    <a href="/ai-income/choose-plan" style={{ marginLeft:8, fontSize:9, padding:'2px 8px', borderRadius:6, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#10B981', textDecoration:'none', fontWeight:700, whiteSpace:'nowrap' }}>Join Free →</a>
                    </div>

                    {/* Price & CTA */}
                    <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'20px', fontWeight:900, color:GOLD }}>
                        R{price.toLocaleString()}
                      </div>
                      {userId ? (
                        <button onClick={() => setPayment({ product })}
                          style={{ padding:'8px 18px', borderRadius:'10px', border:'none', cursor:'pointer', background:'linear-gradient(135deg,#D4AF37,#B8860B)', color:'#050A18', fontWeight:900, fontSize:'12px', fontFamily:'Cinzel,Georgia,serif' }}>
                          Get This →
                        </button>
                      ) : (
                        <Link href={`/login?redirect=/marketplace`}
                          style={{ padding:'8px 18px', borderRadius:'10px', background:'rgba(212,175,55,0.1)', color:GOLD, fontSize:'12px', fontWeight:700, textDecoration:'none', border:'1px solid rgba(212,175,55,0.3)' }}>
                          Login to Buy
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Builder CTA */}
        <div style={{ marginTop: '48px', padding: '32px', borderRadius: '20px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, color: W, marginBottom: '8px' }}>
            Have knowledge to share?
          </div>
          <div style={{ fontSize: '13px', color: MUTED, marginBottom: '20px' }}>
            Build your own digital product with the 4M Machine and list it here. From R700.
          </div>
          <Link href="/ai-income/choose-plan"
            style={{ display: 'inline-block', padding: '13px 32px', borderRadius: '12px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '15px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
            Start Building →
          </Link>
        </div>
      </div>

      {/* eBook modal */}
      {ebookOpen && (
        <EbookModal
          onClose={() => setEbookOpen(false)}
          refCode={refCode}
          buyerEmail={userEmail}
        />
      )}

      {/* Standard product payment modal */}
      {payment && (
        <PaymentModal product={payment.product} buyerEmail={userEmail} onClose={() => setPayment(null)} />
      )}
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#050A18',display:'flex',alignItems:'center',justifyContent:'center',color:'#D4AF37',fontFamily:'Georgia,serif',fontSize:'16px' }}>Loading marketplace...</div>}>
      <MarketplaceInner />
    </Suspense>
  )
}
