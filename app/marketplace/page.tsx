'use client'

// app/marketplace/page.tsx
// FIXED: Categories visible on load, not hidden behind search

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Product = {
  id: string
  title: string
  slug: string
  description: string
  category: string
  product_type: string
  price: number
  currency: string
  seller_name: string
  status: string
  featured: boolean
  tags: string[]
}

const CATEGORIES = [
  { id: 'all',              label: 'All Products',        icon: '🛍️' },
  { id: 'Digital Services', label: 'Digital Services',    icon: '⚙️' },
  { id: 'Digital Products', label: 'Digital Products',    icon: '📦' },
  { id: 'Tools & Apps',     label: 'Tools & Apps',        icon: '🛠️' },
  { id: 'Courses',          label: 'Courses & Training',  icon: '🎓' },
  { id: 'Templates',        label: 'Templates',           icon: '📋' },
]

function MarketplaceContent() {
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refCode, setRefCode] = useState<string | null>(null)

  // Capture referral code from URL
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setRefCode(ref)
      // Store in cookie for checkout
      document.cookie = `z2b_ref=${ref}; path=/; max-age=2592000`
    }
  }, [])

  // Load products from Supabase
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('marketplace_products')
        .select('*')
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      // If no DB products yet, show the book ecosystem service as a static card
      const staticProducts: Product[] = [
        {
          id: 'static-book-ecosystem',
          title: 'Book Ecosystem Services — I Turn Authors into Brands',
          slug: 'book-ecosystem',
          description: 'A complete digital ecosystem around your book — Interactive Flipbook, PDF eBook, Audio Reader, AI Book Coach, Monetisation System and more.',
          category: 'Digital Services',
          product_type: 'service',
          price: 7500,
          currency: 'ZAR',
          seller_name: 'Rev Mokoro Manana',
          status: 'active',
          featured: true,
          tags: ['book', 'author', 'digital', 'ecosystem'],
        },
      ]

      const allProducts = [...(data || []), ...(data?.length ? [] : staticProducts)]
      setProducts(allProducts)
      setFiltered(allProducts)
      setLoading(false)
    }
    load()
  }, [])

  // Filter whenever category or search changes
  useEffect(() => {
    let result = products
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      )
    }
    setFiltered(result)
  }, [activeCategory, search, products])

  const buildProductUrl = (slug: string) => {
    const base = `/marketplace/product/${slug}`
    return refCode ? `${base}?ref=${refCode}` : base
  }

  return (
    <div className="min-h-screen bg-[#080608] text-white">

      {/* ── HEADER ── */}
      <div
        className="px-6 py-10 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #080608 0%, #1a0d35 50%, #080608 100%)',
          borderBottom: '3px solid #c9a227',
        }}
      >
        <div
          className="absolute right-6 top-4 pointer-events-none select-none"
          style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '8rem', color: 'rgba(255,255,255,0.025)', lineHeight: 1 }}
        >
          Z2B
        </div>
        <div
          className="text-[11px] tracking-[5px] text-[#5a4510] mb-3 uppercase"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          Zero2Billionaires · Marketplace
        </div>
        <h1
          className="text-3xl md:text-4xl text-white mb-2"
          style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}
        >
          Digital Products & Services
        </h1>
        <p
          className="text-[#e8d48b] text-sm italic max-w-md mx-auto"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Built by Z2B Legacy Builders. Earn 20% commission as an affiliate on every sale.
        </p>

        {/* Search */}
        <div className="mt-6 max-w-md mx-auto relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-3 rounded-sm text-sm bg-white/[0.06] border border-[#5a4510]/40 text-white placeholder-[rgba(255,255,255,0.25)] focus:outline-none focus:border-[#c9a227]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.3)] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── CATEGORIES — ALWAYS VISIBLE ── */}
      <div className="px-4 py-5 border-b border-[#5a4510]/20">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-sm text-xs transition-all"
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                letterSpacing: '2px',
                background: activeCategory === cat.id
                  ? 'linear-gradient(135deg,#2d1b69,#3d2285)'
                  : 'rgba(255,255,255,0.03)',
                color: activeCategory === cat.id ? '#f0c040' : 'rgba(255,255,255,0.4)',
                border: activeCategory === cat.id
                  ? '1px solid #c9a227'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-sm"
                style={{
                  background: activeCategory === cat.id ? 'rgba(201,162,39,0.2)' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === cat.id ? '#f0c040' : 'rgba(255,255,255,0.25)',
                }}
              >
                {cat.id === 'all'
                  ? products.length
                  : products.filter(p => p.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS GRID ── */}
      <div className="px-4 py-8 max-w-5xl mx-auto">

        {loading ? (
          <div className="text-center py-20">
            <div className="text-2xl mb-3 animate-pulse">⚡</div>
            <div
              className="text-xs tracking-widest text-[#5a4510]"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              LOADING PRODUCTS…
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-3xl mb-3">🔍</div>
            <div className="text-[rgba(255,255,255,0.4)] text-sm">No products found</div>
            <button
              onClick={() => { setSearch(''); setActiveCategory('all') }}
              className="mt-4 text-xs text-[#c9a227] underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(product => (
              <Link
                key={product.id}
                href={buildProductUrl(product.slug)}
                className="block group"
              >
                <div
                  className="rounded-lg overflow-hidden transition-all duration-200 group-hover:scale-[1.02] h-full flex flex-col"
                  style={{
                    border: product.featured
                      ? '1px solid rgba(201,162,39,0.5)'
                      : '1px solid rgba(255,255,255,0.07)',
                    background: '#0f0d18',
                    boxShadow: product.featured ? '0 0 20px rgba(201,162,39,0.06)' : 'none',
                  }}
                >
                  {/* Card header */}
                  <div
                    className="px-5 py-4 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg,#2d1b69 0%,#1a0d35 70%,#080608 100%)',
                      borderBottom: '1px solid rgba(201,162,39,0.2)',
                    }}
                  >
                    {product.featured && (
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{ background: 'linear-gradient(90deg,#c9a227,#f0c040,#c9a227)' }}
                      />
                    )}
                    <div
                      className="text-[9px] tracking-[3px] text-[#5a4510] mb-1.5 uppercase"
                      style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                    >
                      {product.category}
                      {product.featured && (
                        <span className="ml-2 text-[#f0c040]">★ FEATURED</span>
                      )}
                    </div>
                    <div
                      className="text-sm text-white leading-tight font-bold"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {product.title}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-5 py-4 flex flex-col flex-1">
                    <p className="text-xs text-[rgba(255,255,255,0.5)] leading-relaxed mb-4 flex-1 line-clamp-3">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <div
                          className="text-xl text-[#f0c040]"
                          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                        >
                          {product.price === 0 ? 'CUSTOM' : `R${product.price.toLocaleString()}`}
                        </div>
                        <div className="text-[10px] text-[rgba(255,255,255,0.25)]">
                          {product.seller_name}
                        </div>
                      </div>
                      <div
                        className="text-[10px] tracking-widest px-3 py-2 rounded-sm transition-all group-hover:bg-[#c9a227] group-hover:text-[#080608]"
                        style={{
                          fontFamily: 'Bebas Neue, sans-serif',
                          background: 'rgba(201,162,39,0.1)',
                          border: '1px solid rgba(201,162,39,0.3)',
                          color: '#c9a227',
                        }}
                      >
                        VIEW →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── AFFILIATE FOOTER ── */}
      <div
        className="px-6 py-5 text-center border-t border-[#5a4510]/20"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      >
        <div
          className="text-[10px] tracking-[4px] text-[#5a4510] mb-1"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          Z2B MARKETPLACE · EARN 20% ON EVERY SALE YOU REFER
        </div>
        <div className="text-xs text-[rgba(255,255,255,0.25)]">
          Log in to get your personal referral link and start earning
        </div>
      </div>

    </div>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080608] flex items-center justify-center">
        <div className="text-2xl animate-pulse">⚡</div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  )
}
