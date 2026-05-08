'use client'

// app/earn/page.tsx
// Short URL: app.z2blegacybuilders.co.za/earn
// Legacy Builders Products & Services — FAM members share links from here

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const LEGACY_PRODUCTS = [
  // ── BOOK ECOSYSTEM ──────────────────────────────────────────
  {
    category: 'Book Ecosystem',
    icon: '📖',
    items: [
      { id: 'flipbook', name: 'Zero2Billionaires Flipbook', price: 200, commission: 10, tag: 'R200', desc: 'Interactive digital book preview — 17 chapters', url: '/marketplace/product/book-ecosystem' },
      { id: 'book-system', name: 'Z2B Book System', price: 500, commission: 10, tag: 'R500', desc: 'Full book + 4M Starter Pack + Audio Reader + Workbook', url: '/marketplace/product/book-ecosystem' },
    ]
  },
  // ── 4M MACHINE ─────────────────────────────────────────────
  {
    category: '4M Machine',
    icon: '⚡',
    items: [
      { id: '4m-flipbook', name: '4M Manual — 3 Features (Flipbook)', price: 200, commission: 10, tag: 'R200', desc: 'R200 Flipbook buyers get access to the first 3 features of the 4M Manual Engine as part of their Flipbook package.', url: '/pricing' },
      { id: '4m-starter', name: '4M Manual — Starter Pack (Full)', price: 500, commission: 10, tag: 'R500', desc: 'R500 Book System — ALL 7 Manual Power features unlocked. Coach Manlaw AI + all 99 Workshop Sessions + 1 PWA App built for you.', url: '/pricing' },
      { id: '4m-bronze', name: '4M Manual Power FULL — Bronze', price: 2500, commission: 10, tag: 'R2,500', desc: 'Bronze once-off. AI Offer Generator, Customer Finder, Post Generator, Reply System, Closing Assistant, Daily R300/Day Engine. 5 Digital Products. R200/referral.', url: '/pricing' },
      { id: '4m-copper', name: '4M Manual Power FULL — Copper', price: 5000, commission: 10, tag: 'R5,000', desc: 'Copper once-off. Everything in Bronze + 10 Bonus Products, 2 PWA Apps Built for You, Household Expenses Programme, Full Sales Funnel.', url: '/pricing' },
      { id: '4m-silver', name: '4M Automatic Power — Silver', price: 12000, commission: 10, tag: 'R12,000', desc: 'Silver once-off. Product Multiplication Engine, 1-Click Launch Pack, 5-Day Follow-Up Sequences, 15 Bonus Products, 2 PWA Apps, Full AI automation.', url: '/pricing' },
      { id: '4m-gold', name: '4M Electric Power — Gold', price: 24000, commission: 10, tag: 'R24,000', desc: 'Gold once-off. AI Video Avatar, Full Automation Blueprints, 20 Bonus Products, 5 PWA Apps Built, 1-on-1 Coaching, Weekend Bootcamp, Gold Pool Profit Sharing.', url: '/pricing' },
      { id: '4m-platinum', name: '4M Electric Power MAX — Platinum', price: 50000, commission: 10, tag: 'R50,000', desc: 'Platinum once-off. All systems active, 7 PWA Apps Built, Distribution License, CEO Mastermind, Platinum Pool Profit Sharing, 3 months 1-on-1 Coaching.', url: '/pricing' },
    ]
  },
  // ── MEMBERSHIP ─────────────────────────────────────────────
  {
    category: 'Membership Tiers',
    icon: '👑',
    items: [
      { id: 'starter-bfm', name: 'Starter BFM', price: 850, commission: 10, tag: 'R850/mo', desc: 'BFM after 60 days on Starter Pack. Keeps your 4M Manual Full access and all Starter benefits active.', url: '/pricing' },
      { id: 'bronze-bfm', name: 'Bronze BFM', price: 1050, commission: 10, tag: 'R1,050/mo', desc: 'BFM after Bronze once-off. Keeps all Bronze benefits, AI tools and referral income active.', url: '/pricing' },
      { id: 'copper-bfm', name: 'Copper BFM', price: 1300, commission: 10, tag: 'R1,300/mo', desc: 'BFM after Copper once-off. Keeps all Copper benefits and 2 PWA Apps active.', url: '/pricing' },
      { id: 'silver-bfm', name: 'Silver BFM', price: 2000, commission: 10, tag: 'R2,000/mo', desc: 'BFM after Silver once-off. Keeps Automatic Power and all Silver automation active.', url: '/pricing' },
      { id: 'gold-bfm', name: 'Gold BFM', price: 3200, commission: 10, tag: 'R3,200/mo', desc: 'BFM after Gold once-off. Keeps Electric Power, AI Video Avatar and Gold Pool Profit Sharing active.', url: '/pricing' },
      { id: 'platinum-bfm', name: 'Platinum BFM', price: 5800, commission: 10, tag: 'R5,800/mo', desc: 'BFM after Platinum once-off. Keeps all Platinum benefits, Distribution License and CEO Mastermind active.', url: '/pricing' },
    ]
  },
  // ── WORKSHOPS ──────────────────────────────────────────────
  {
    category: 'Workshops & Training',
    icon: '🎓',
    items: [
      { id: 'workshop-free', name: 'Entrepreneurial Consumer Workshop', price: 0, commission: 0, tag: 'FREE', desc: 'Free sessions — first 3 available to all members', url: '/workshop' },
      { id: 'workshop-full', name: 'Full Workshop Access', price: 480, commission: 10, tag: 'With Bronze+', desc: 'All 99 sessions — complete entrepreneurial journey', url: '/pricing' },
    ]
  },
  // ── DIGITAL SERVICES ───────────────────────────────────────
  {
    category: 'Digital Services',
    icon: '🛠️',
    items: [
      { id: 'book-eco-service', name: 'Book Ecosystem Service', price: 7500, commission: 20, tag: 'From R7,500', desc: 'I turn Authors into Brands — full digital book ecosystem', url: '/marketplace/product/book-ecosystem' },
    ]
  },
  // ── AI TOOLS ───────────────────────────────────────────────
  {
    category: 'AI Tools & Apps',
    icon: '🤖',
    items: [
      { id: 'coach-manlaw', name: 'Coach Manlaw AI', price: 0, commission: 0, tag: 'Members Only', desc: 'Your AI business coach — powered by Z2B methodology', url: '/ai-coach' },
      { id: 'caption-pro', name: 'CaptionPro', price: 0, commission: 0, tag: 'Members Only', desc: 'Multilingual caption generator with African languages', url: '/caption-pro' },
      { id: 'benown', name: 'BeNown Social Automation', price: 0, commission: 0, tag: 'Members Only', desc: 'Social media automation for content creators', url: '/benown' },
    ]
  },
]

function EarnPageContent() {
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const refCode = searchParams.get('ref') || ''

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('full_name, referral_code, paid_tier')
          .eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })
  }, [])

  const myCode = profile?.referral_code || refCode

  const buildLink = (productUrl: string) => {
    const base = 'https://app.z2blegacybuilders.co.za'
    return myCode ? `${base}${productUrl}?ref=${myCode}` : `${base}${productUrl}`
  }

  const copyLink = (productId: string, productUrl: string) => {
    navigator.clipboard.writeText(buildLink(productUrl))
    setCopied(productId)
    setTimeout(() => setCopied(null), 2500)
  }

  const categories = ['all', ...LEGACY_PRODUCTS.map(p => p.category)]
  const filtered = activeCategory === 'all'
    ? LEGACY_PRODUCTS
    : LEGACY_PRODUCTS.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-[#080608] text-white">

      {/* ── HEADER ── */}
      <div className="px-5 py-3 border-b border-[#5a4510]/30 flex items-center justify-between"
        style={{ background: '#080608' }}>
        <div>
          <div className="text-sm font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px', color: '#f0c040' }}>
            ZERO2BILLIONAIRES
          </div>
          <div className="text-[10px] tracking-widest text-[#5a4510]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            LEGACY BUILDERS · PRODUCTS & SERVICES
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/marketplace" className="text-[10px] px-3 py-1.5 border border-[#5a4510]/40 text-[#5a4510] hover:text-[#c9a227] transition-all rounded-sm"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            MARKETPLACE
          </Link>
          <Link href="/dashboard" className="text-[10px] px-3 py-1.5 border border-[#5a4510]/40 text-[#5a4510] hover:text-[#c9a227] transition-all rounded-sm"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            DASHBOARD
          </Link>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="px-6 py-8 text-center"
        style={{ background: 'linear-gradient(160deg,#080608 0%,#1a0d35 50%,#080608 100%)', borderBottom: '3px solid #c9a227' }}>
        <div className="text-[11px] tracking-[5px] text-[#5a4510] mb-3 uppercase"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          Legacy Builders · Earn by Sharing
        </div>
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
          Our Products & Services
        </h1>
        <p className="text-[#e8d48b] text-sm italic max-w-md mx-auto mb-5"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Copy your referral link for any product below. Share it. Earn 10% commission on every sale.
        </p>

        {/* Referral code display */}
        {myCode ? (
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-sm"
            style={{ background: 'rgba(45,27,105,0.3)', border: '1px solid rgba(201,162,39,0.3)' }}>
            <span className="text-[10px] tracking-[3px] text-[#5a4510]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              YOUR CODE
            </span>
            <span className="text-[#f0c040] font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
              {myCode}
            </span>
          </div>
        ) : (
          <div className="flex gap-3 justify-center">
            <Link href="/marketplace/join"
              className="px-6 py-2.5 rounded-sm text-xs font-bold tracking-widest"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px', background: 'linear-gradient(135deg,#c9a227,#f0c040)', color: '#080608' }}>
              JOIN FREE TO GET YOUR LINK
            </Link>
          </div>
        )}
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="px-4 py-3 border-b border-[#5a4510]/20 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 rounded-sm text-[10px] transition-all whitespace-nowrap"
              style={{
                fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px',
                background: activeCategory === cat ? 'linear-gradient(135deg,#2d1b69,#3d2285)' : 'rgba(255,255,255,0.03)',
                color: activeCategory === cat ? '#f0c040' : 'rgba(255,255,255,0.35)',
                border: activeCategory === cat ? '1px solid #c9a227' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {cat === 'all' ? '🛍️ ALL' : cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS ── */}
      <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        {filtered.map(group => (
          <div key={group.category}>
            {/* Group header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-lg">{group.icon}</span>
              <div className="text-[10px] tracking-[3px] text-[#5a4510]"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                {group.category.toUpperCase()}
              </div>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(201,162,39,0.2),transparent)' }} />
            </div>

            {/* Product cards */}
            <div className="space-y-2">
              {group.items.map(product => (
                <div key={product.id} className="rounded-sm overflow-hidden"
                  style={{ background: '#0f0d18', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm text-white font-medium">{product.name}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-sm"
                          style={{
                            fontFamily: 'Bebas Neue, sans-serif',
                            letterSpacing: '1px',
                            background: product.price === 0 ? 'rgba(42,122,58,0.2)' : 'rgba(201,162,39,0.1)',
                            color: product.price === 0 ? '#4ade80' : '#f0c040',
                            border: product.price === 0 ? '1px solid rgba(42,122,58,0.3)' : '1px solid rgba(201,162,39,0.2)',
                          }}>
                          {product.tag}
                        </span>
                        {product.commission > 0 && (
                          <span className="text-[9px] text-green-400"
                            style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                            YOU EARN {product.commission}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[rgba(255,255,255,0.4)]">{product.desc}</div>
                    </div>

                    {/* Copy button */}
                    {myCode && product.commission > 0 ? (
                      <button
                        onClick={() => copyLink(product.id, product.url)}
                        className="flex-shrink-0 px-3 py-2 rounded-sm text-[10px] font-bold tracking-widest transition-all"
                        style={{
                          fontFamily: 'Bebas Neue, sans-serif',
                          letterSpacing: '2px',
                          background: copied === product.id
                            ? 'linear-gradient(135deg,#1a7a30,#25a244)'
                            : 'linear-gradient(135deg,#c9a227,#f0c040)',
                          color: '#080608',
                        }}>
                        {copied === product.id ? '✓ COPIED' : 'COPY LINK'}
                      </button>
                    ) : product.commission > 0 ? (
                      <Link href="/marketplace/join"
                        className="flex-shrink-0 px-3 py-2 rounded-sm text-[10px] font-bold tracking-widest border border-[#5a4510]/40 text-[#5a4510]"
                        style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                        JOIN TO SHARE
                      </Link>
                    ) : (
                      <span className="flex-shrink-0 text-[10px] text-[rgba(255,255,255,0.2)] px-3 py-2"
                        style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        FREE
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div className="px-6 py-5 text-center border-t border-[#5a4510]/20"
        style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="text-[10px] tracking-[3px] text-[#5a4510]"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          ZERO2BILLIONAIRES AMAVULANDLELA PTY LTD · APP.Z2BLEGACYBUILDERS.CO.ZA
        </div>
      </div>

    </div>
  )
}

export default function EarnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080608] flex items-center justify-center">
        <div className="text-2xl animate-pulse">⚡</div>
      </div>
    }>
      <EarnPageContent />
    </Suspense>
  )
}
