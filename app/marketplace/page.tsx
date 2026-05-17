'use client'
// ============================================================
// Z2B — CENTRALIZED MARKETPLACE (SPRINT 19)
// File: app/marketplace/page.tsx
// One marketplace. All products. Structured categories.
// Payment: Yoco · PayFast · EFT · ATM
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
const Z2B_FEATURED = [
  {
    id:       'z2b-book-services',
    category: 'z2b',
    icon:     '📖',
    badge:    'Z2B SERVICE',
    title:    'Digital Book Services',
    subtitle: 'I Turn Authors Into Brands',
    desc:     'Done-for-you digital book creation, publishing and distribution. Your knowledge becomes a professional digital product that sells on global marketplaces.',
    price:    null,
    cta:      'Get a Quote →',
    href:     'mailto:books@z2blegacybuilders.co.za',
    color:    VIO,
    bg:       'rgba(139,92,246,0.08)',
    border:   'rgba(139,92,246,0.3)',
  },
  {
    id:       'z2b-4m-machine',
    category: 'z2b',
    icon:     '⚙️',
    badge:    'Z2B PLATFORM',
    title:    'The 4M Machine',
    subtitle: 'Build. Sell. Earn. Repeat.',
    desc:     'AI-powered digital product factory. From idea to marketplace in one session. Build eBooks, toolkits, templates and more — then sell on 5 platforms automatically.',
    price:    700,
    cta:      'Start Building →',
    href:     '/ai-income/choose-plan',
    color:    GOLD,
    bg:       'rgba(212,175,55,0.08)',
    border:   'rgba(212,175,55,0.3)',
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
}

interface PaymentModal {
  product: Product
  open:    boolean
}

// ── PAYMENT MODAL ─────────────────────────────────────────────
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

        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W, marginBottom: '4px' }}>
              {product.title ?? product.name}
            </div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '22px', fontWeight: 900, color: GOLD }}>
              R{price.toLocaleString()}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '20px', padding: '4px' }}>✕</button>
        </div>

        {/* Manual EFT / ATM details */}
        {eftRef ? (
          <div style={{ padding: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: CYAN, marginBottom: '12px' }}>
                {method === 'atm' ? '🏧 ATM Deposit Details' : '🏦 EFT Details'}
              </div>
              {[
                ['Bank',           'First National Bank (FNB)'],
                ['Account Name',   'Z2B Legacy Builders'],
                ['Account Number', '62XXXXXXXXX'],
                ['Branch Code',    '250655'],
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
            <button onClick={onClose}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: GOLD, color: '#050A18', fontWeight: 900, fontSize: '14px', fontFamily: 'Cinzel,Georgia,serif' }}>
              Done — I will send proof →
            </button>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            {/* Method selection */}
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
  const [userId,     setUserId]     = useState<string | null>(null)
  const [userEmail,  setUserEmail]  = useState('')
  const [refSaved,   setRefSaved]   = useState(false)

  useEffect(() => {
    loadProducts()
    checkUser()
    if (refCode) saveRefCode(refCode)
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) { setUserId(user.id); setUserEmail(user.email ?? '') }
  }

  async function saveRefCode(code: string) {
    if (refSaved) return
    setRefSaved(true)
    try {
      sessionStorage.setItem('z2b_ref', code)
    } catch (_) {}
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
      ebook:       'ebook', guide: 'ebook', book: 'ebook',
      toolkit:     'toolkit', template: 'toolkit', workbook: 'toolkit', checklist: 'toolkit',
      course:      'course', masterclass: 'course', workshop: 'course',
      framework:   'framework', protocol: 'framework',
      printable:   'printable', planner: 'printable',
      audio:       'audio_video', video: 'audio_video', podcast: 'audio_video',
      software:    'software', tool: 'software', app: 'software',
      community:   'community',
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

  const showFeatured = category === 'all' || category === 'z2b'

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* Nav */}
      <nav style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <Link href="/" style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: GOLD, textDecoration: 'none' }}>Z2B</Link>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ flex: 1, maxWidth: '320px', padding: '8px 14px', borderRadius: '20px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: W, fontSize: '13px', fontFamily: 'Georgia,serif', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {userId ? (
              <Link href="/ai-income" style={{ padding: '7px 16px', borderRadius: '8px', background: GOLD, color: '#050A18', fontSize: '12px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif', whiteSpace: 'nowrap' }}>
                Build a Product →
              </Link>
            ) : (
              <Link href="/register" style={{ padding: '7px 16px', borderRadius: '8px', background: GOLD, color: '#050A18', fontSize: '12px', fontWeight: 900, textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                Join Free →
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
        <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content', maxWidth: '1100px', margin: '0 auto' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              style={{ padding: '7px 14px', borderRadius: '20px', border: '1px solid ' + (category === cat.id ? GOLD : 'rgba(255,255,255,0.1)'), background: category === cat.id ? 'rgba(212,175,55,0.12)' : 'transparent', color: category === cat.id ? GOLD : MUTED, fontSize: '12px', cursor: 'pointer', fontFamily: 'Georgia,serif', fontWeight: category === cat.id ? 700 : 400, whiteSpace: 'nowrap' }}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Z2B Featured Cards — always pinned at top */}
        {showFeatured && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', color: MUTED, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '14px' }}>⭐ Z2B Featured</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {Z2B_FEATURED.map(feat => (
                <div key={feat.id} style={{ borderRadius: '18px', border: '1px solid ' + feat.border, background: feat.bg, padding: '22px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: feat.color + '20', color: feat.color, border: '1px solid ' + feat.border }}>
                    {feat.badge}
                  </div>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>{feat.icon}</div>
                  <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: W, marginBottom: '4px' }}>{feat.title}</div>
                  <div style={{ fontSize: '13px', color: feat.color, marginBottom: '10px', fontWeight: 700 }}>{feat.subtitle}</div>
                  <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.8, marginBottom: '16px' }}>{feat.desc}</div>
                  {feat.price && (
                    <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: feat.color, marginBottom: '14px' }}>
                      From R{feat.price.toLocaleString()}
                    </div>
                  )}
                  <Link href={feat.href}
                    style={{ display: 'inline-block', padding: '10px 22px', borderRadius: '10px', background: feat.color, color: '#050A18', fontWeight: 900, fontSize: '13px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                    {feat.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products grid */}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {filtered.map(product => {
                const price = getPrice(product)
                return (
                  <div key={product.id} style={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Product card header */}
                    <div style={{ padding: '16px 16px 10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', color: GOLD, background: 'rgba(212,175,55,0.1)', padding: '3px 8px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {product.format ?? 'ebook'}
                        </span>
                        {(product.sales_count ?? 0) > 0 && (
                          <span style={{ fontSize: '10px', color: GREEN }}>🔥 {product.sales_count} sold</span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W, marginBottom: '6px', lineHeight: 1.3 }}>
                        {product.title ?? product.name}
                      </div>
                      <div style={{ fontSize: '11px', color: MUTED, lineHeight: 1.7, marginBottom: '10px' }}>
                        {(product.description ?? '').slice(0, 100)}{product.description?.length > 100 ? '...' : ''}
                      </div>
                      {product.seller_name && (
                        <div style={{ fontSize: '10px', color: MUTED }}>by {product.seller_name}</div>
                      )}
                    </div>
                    {/* Price + CTA */}
                    <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '20px', fontWeight: 900, color: GOLD }}>
                        R{price.toLocaleString()}
                      </div>
                      {userId ? (
                        <button onClick={() => setPayment({ product })}
                          style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '12px', fontFamily: 'Cinzel,Georgia,serif' }}>
                          Get This →
                        </button>
                      ) : (
                        <Link href={`/login?redirect=/marketplace`}
                          style={{ padding: '8px 18px', borderRadius: '10px', background: 'rgba(212,175,55,0.1)', color: GOLD, fontSize: '12px', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(212,175,55,0.3)' }}>
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

      {/* Payment modal */}
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
