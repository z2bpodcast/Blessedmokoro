'use client'
// ============================================================
// Z2B 4M V3 — PUBLIC MARKETPLACE PAGE
// File: app/marketplace/page.tsx
// Laws: Public-facing · 4 navigation buttons · Mobile-first
//       Products from gear_sessions.marketplace_id
//       Buttons: Home · Login to Marketplace · Register as Affiliate · Dashboard (auth)
// ============================================================

import { useState, useEffect, Suspense } from 'react'
import { useRouter }                      from 'next/navigation'
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

interface MarketplaceProduct {
  id:          string
  title:       string
  description: string
  price:       number
  format:      string
  keywords:    string | string[]
  seller_id:   string
  created_at:  string
  session_id?: string
  // joined from profiles
  seller_name?: string
}

const FORMAT_EMOJIS: Record<string, string> = {
  ebook: '📖', course: '🎓', template: '📋', checklist: '✅',
  workbook: '📓', toolkit: '🧰', masterclass: '🏆', guide: '🗺️',
  planner: '📅', swipe_file: '📂',
}

function ProductCard({ product, isLoggedIn }: { product: MarketplaceProduct; isLoggedIn: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const emoji  = FORMAT_EMOJIS[product.format?.toLowerCase() ?? ''] ?? '📦'
  const descParagraph = product.description?.split('\n\n')[0] ?? product.description ?? ''
  const keywords: string[] = typeof product.keywords === 'string'
    ? (() => { try { return JSON.parse(product.keywords) } catch { return [product.keywords] } })()
    : (product.keywords ?? [])

  return (
    <div style={{
      borderRadius: '18px', overflow: 'hidden',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      transition: 'all 0.2s', marginBottom: '12px',
    }}>
      {/* Card header */}
      <div style={{ padding: '18px 18px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '28px' }}>{emoji}</div>
            <div style={{ fontSize: '10px', color: MUTED, background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '8px', textTransform: 'capitalize' }}>
              {product.format ?? 'Digital Product'}
            </div>
          </div>
          <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '18px', fontWeight: 900, color: GOLD }}>
            R{(product.retail_price ?? product.price_once ?? 299 ?? 0).toLocaleString()}
          </div>
        </div>

        <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '15px', fontWeight: 900, color: W, marginBottom: '8px', lineHeight: 1.3 }}>
          {product.title ?? product.name}
        </div>

        <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.7, marginBottom: '10px' }}>
          {expanded ? (product.description ?? '') : descParagraph.slice(0, 140) + (descParagraph.length > 140 ? '...' : '')}
        </div>

        {descParagraph.length > 140 && (
          <button onClick={() => setExpanded(p => !p)}
            style={{ fontSize: '11px', color: CYAN, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Georgia,serif' }}>
            {expanded ? 'Show less ↑' : 'Read more ↓'}
          </button>
        )}

        {/* Keywords */}
        {keywords.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
            {keywords.slice(0, 4).map((k: string, i: number) => (
              <span key={i} style={{ fontSize: '10px', color: VIO, background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: '8px' }}>
                {k}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 18px 18px' }}>
        {isLoggedIn ? (
          // MEDIUM #7: PayFast checkout — wired in Sprint 11
          <button
            onClick={() => alert('Payment integration coming soon. Contact us to purchase this product.')}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '13px', fontFamily: 'Cinzel,Georgia,serif' }}>
            Get This Product — R{(product.retail_price ?? product.price_once ?? 299 ?? 0).toLocaleString()}
          </button>
        ) : (
          <Link href="/login?redirect=/marketplace"
            style={{ display: 'block', padding: '12px', borderRadius: '12px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: GOLD, fontWeight: 700, fontSize: '13px', textAlign: 'center', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
            Login to Purchase →
          </Link>
        )}
      </div>
    </div>
  )
}

function MarketplaceInner() {
  const router = useRouter()
  const [products,   setProducts]   = useState<MarketplaceProduct[]>([])
  const [loading,    setLoading]    = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [search,     setSearch]     = useState('')
  const [formatFilter, setFormat]   = useState('all')
  const [sortBy,     setSortBy]     = useState<'newest'|'price_low'|'price_high'>('newest')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
    loadProducts()
  }, [])

  const [loadError, setLoadError] = useState(false)

  async function loadProducts() {
    setLoading(true)
    setLoadError(false)
    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select('id, name, title, tagline, description, retail_price, price_once, format, status, seller_id, seller_name, builder_id, listed_at, session_id, sales_count, affiliate_enabled')
        .eq('status', 'listed')
        .order('created_at', { ascending: false })
        .limit(50) as { data: MarketplaceProduct[] | null; error: unknown }

      if (error) { setLoadError(true) }
      else { setProducts(data ?? []) }
    } catch (_) { setLoadError(true) }
    setLoading(false)
  }

  // Filter + sort
  const formats    = ['all', ...Array.from(new Set(products.map(p => p.format).filter(Boolean)))]
  const filtered   = products
    .filter(p => {
      const matchSearch = !search || (p.title ?? p.name ?? "").toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
      const matchFormat = formatFilter === 'all' || p.format === formatFilter
      return matchSearch && matchFormat
    })
    .sort((a, b) => {
      if (sortBy === 'price_low')  return (a.price ?? 0) - (b.price ?? 0)
      if (sortBy === 'price_high') return (b.price ?? 0) - (a.price ?? 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div style={{ minHeight: '100vh', background: BG, color: W, fontFamily: 'Georgia,serif' }}>

      {/* NAV — 4 required buttons */}
      <nav style={{ padding: '12px 20px', background: SURF, borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          {/* Left: Home */}
          <Link href="/"
            style={{ fontSize: '12px', color: MUTED, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ← Home
          </Link>

          {/* Logo */}
          <span style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '13px', fontWeight: 900, color: GOLD }}>
            🏪 Z2B Marketplace
          </span>

          {/* Right: action buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {!isLoggedIn ? (
              <>
                <Link href="/login?redirect=/marketplace"
                  style={{ fontSize: '11px', color: GOLD, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
                  Login
                </Link>
                <Link href="/register?ref=affiliate"
                  style={{ fontSize: '11px', color: VIO, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
                  Affiliate
                </Link>
              </>
            ) : (
              <Link href="/dashboard"
                style={{ fontSize: '11px', color: GOLD, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
                Dashboard →
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(180deg,rgba(212,175,55,0.08) 0%,transparent 100%)', padding: '40px 20px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', color: GOLD, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
            Quality-Approved Digital Products
          </div>
          <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, color: W, margin: '0 0 12px' }}>
            The Z2B Marketplace
          </h1>
          <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.8, margin: '0 0 20px' }}>
            Every product here was built by an Entrepreneurial Consumer using the 4M Machine — quality-reviewed, implementation-ready, and priced for the African market.
          </p>

          {/* CTA for non-members */}
          {!isLoggedIn && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?redirect=/marketplace"
                style={{ padding: '11px 24px', borderRadius: '12px', background: 'linear-gradient(135deg,#D4AF37,#B8860B)', color: '#050A18', fontWeight: 900, fontSize: '13px', textDecoration: 'none', fontFamily: 'Cinzel,Georgia,serif' }}>
                Login to Marketplace →
              </Link>
              <Link href="/register?ref=affiliate"
                style={{ padding: '11px 24px', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.4)', color: VIO, fontSize: '13px', textDecoration: 'none', fontWeight: 700 }}>
                Register as Affiliate →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ padding: '0 20px 16px', maxWidth: '720px', margin: '0 auto' }}>
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: W, fontSize: '13px', fontFamily: 'Georgia,serif', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Format filter */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
            {formats.slice(0, 6).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid ' + (formatFilter === f ? GOLD : 'rgba(255,255,255,0.1)'), background: formatFilter === f ? 'rgba(212,175,55,0.12)' : 'transparent', color: formatFilter === f ? GOLD : MUTED, fontSize: '11px', cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'Georgia,serif' }}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            style={{ padding: '5px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: MUTED, fontSize: '11px', cursor: 'pointer', outline: 'none', fontFamily: 'Georgia,serif' }}>
            <option value="newest">Newest</option>
            <option value="price_low">Price: Low → High</option>
            <option value="price_high">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* PRODUCTS */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 40px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: MUTED }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid ' + GOLD, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Loading products...
          </div>
        ) : loadError ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: MUTED }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
            <div style={{ fontSize: '14px', color: W, marginBottom: '8px' }}>Could not load products</div>
            <button onClick={loadProducts} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: GOLD, color: '#050A18', fontWeight: 700, cursor: 'pointer', fontSize: '12px', fontFamily: 'Georgia,serif' }}>
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: MUTED }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏪</div>
            <div style={{ fontSize: '15px', color: W, marginBottom: '8px' }}>
              {search || formatFilter !== 'all' ? 'No products match your search.' : 'No products yet.'}
            </div>
            <div style={{ fontSize: '13px' }}>
              {search ? 'Try different keywords.' : 'Products created via the 4M Machine appear here.'}
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '12px', color: MUTED, marginBottom: '14px' }}>
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} available
            </div>
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} isLoggedIn={isLoggedIn} />
            ))}
          </>
        )}
      </div>

      {/* FOOTER NAV */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px', background: SURF }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link href="/"    style={{ fontSize: '12px', color: MUTED, textDecoration: 'none' }}>← Back to Home</Link>
          <Link href="/login?redirect=/marketplace" style={{ fontSize: '12px', color: GOLD, textDecoration: 'none' }}>Login to Marketplace</Link>
          <Link href="/register?ref=affiliate" style={{ fontSize: '12px', color: VIO, textDecoration: 'none' }}>Register as Affiliate</Link>
          {isLoggedIn && <Link href="/dashboard" style={{ fontSize: '12px', color: CYAN, textDecoration: 'none' }}>Dashboard →</Link>}
        </div>
      </div>

    </div>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh',background:'#050A18',display:'flex',alignItems:'center',justifyContent:'center',color:'#D4AF37',fontFamily:'Georgia,serif' }}>Loading Marketplace...</div>}>
      <MarketplaceInner />
    </Suspense>
  )
}
