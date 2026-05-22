'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const LEGACY_PRODUCTS = [
  {
    category: 'Book Ecosystem',
    icon: '📖',
    items: [
      { id: 'flipbook', name: 'Zero2Billionaires Flipbook', price: 200, commission: 10, tag: 'R200', desc: 'Interactive digital flipbook — full book access. Includes first 3 features of 4M Manual Engine.', url: '/marketplace/product/book-ecosystem' },
      { id: 'book-system', name: 'Z2B Book System', price: 700, commission: 10, tag: 'R700', desc: 'Full book + ALL 7 features of 4M Manual Engine + Audio Reader + Workbook + Coach Manlaw AI.', url: '/marketplace/product/book-ecosystem' },
    ]
  },
  {
    category: '4M Machine',
    icon: '⚡',
    items: [
      { id: '4m-bronze', name: '4M Manual Power FULL — Bronze', price: 2500, commission: 10, tag: 'R2,500', desc: 'Once-off. AI Offer Generator, Customer Finder, Post Generator, Reply System, Closing Assistant, Daily R300/Day Engine. 5 Digital Products. R200/referral income. 1 PWA App built.', url: '/pricing' },
      { id: '4m-copper', name: '4M Manual Power FULL — Copper', price: 7000, commission: 10, tag: 'R5,000', desc: 'Once-off. Everything in Bronze + 10 Bonus Products, 2 PWA Apps Built, Household Expenses Programme, Full Sales Funnel.', url: '/pricing' },
      { id: '4m-silver', name: '4M Automatic Power — Silver', price: 12000, commission: 10, tag: 'R12,000', desc: 'Once-off. Product Multiplication Engine, 1-Click Launch Pack, 5-Day Follow-Up Sequences, 15 Bonus Products, 2 PWA Apps. Full AI automation begins.', url: '/pricing' },
      { id: '4m-gold', name: '4M Electric Power — Gold', price: 24000, commission: 10, tag: 'R24,000', desc: 'Once-off. AI Video Avatar, Full Automation Blueprints, daily sequences, 20 Bonus Products, 5 PWA Apps Built, 1-on-1 Coaching, Weekend Bootcamp, Gold Pool Profit Sharing.', url: '/pricing' },
      { id: '4m-platinum', name: '4M Electric Power MAX — Platinum', price: 70000, commission: 10, tag: 'R50,000', desc: 'Once-off. All systems active. 7 PWA Apps Built, Distribution License, CEO Mastermind, Platinum Pool Profit Sharing, 3 months 1-on-1 Coaching.', url: '/pricing' },
    ]
  },
  {
    category: 'Rocket Mode',
    icon: '🚀',
    items: [
      { id: 'silver-rocket', name: 'Silver Rocket Mode', price: 17000, commission: 10, tag: 'R17,000', desc: 'Once-off. AI creates 12 products/month. Global market research, AI website builder, full launch kit for WhatsApp, Facebook, TikTok. Keep 90% of sales.', url: '/pricing' },
      { id: 'gold-rocket', name: 'Gold Rocket Mode', price: 35000, commission: 10, tag: 'R35,000', desc: 'Once-off. 30 AI products/month. Live global research, demographic targeting, Google & Facebook Ads copy, 4-week content calendar per product.', url: '/pricing' },
      { id: 'platinum-rocket', name: 'Platinum Rocket Mode', price: 70000, commission: 10, tag: 'R70,000', desc: 'Once-off. UNLIMITED AI products. Own branded marketplace, Distribution Rights, SEO + Ads + TikTok + Email promotion strategy. 4 Income Rivers · 9 compensation streams.', url: '/pricing' },
    ]
  },
  {
    category: 'BFM Monthly',
    icon: '📅',
    items: [
      { id: 'starter-bfm', name: 'Starter BFM', price: 850, commission: 10, tag: 'R850/mo', desc: 'Brand Fee Monthly after Starter Pack. Keeps all Manual Power + Coach Manlaw + Workshop access active.', url: '/pricing' },
      { id: 'bronze-bfm', name: 'Bronze BFM', price: 1050, commission: 10, tag: 'R1,050/mo', desc: 'Keeps all Bronze benefits, AI tools and R200/referral income active.', url: '/pricing' },
      { id: 'copper-bfm', name: 'Copper BFM', price: 1300, commission: 10, tag: 'R1,300/mo', desc: 'Keeps all Copper benefits and 2 PWA Apps active.', url: '/pricing' },
      { id: 'silver-bfm', name: 'Silver BFM', price: 2000, commission: 10, tag: 'R2,000/mo', desc: 'Keeps Automatic Power and all Silver automation active.', url: '/pricing' },
      { id: 'gold-bfm', name: 'Gold BFM', price: 3200, commission: 10, tag: 'R3,200/mo', desc: 'Keeps Electric Power, AI Video Avatar and Gold Pool Profit Sharing active.', url: '/pricing' },
      { id: 'platinum-bfm', name: 'Platinum BFM', price: 5800, commission: 10, tag: 'R5,800/mo', desc: 'Keeps all Platinum benefits, Distribution License and CEO Mastermind active.', url: '/pricing' },
    ]
  },
  {
    category: 'AI Tools & Apps',
    icon: '🤖',
    items: [
      { id: 'coach-manlaw', name: 'Coach Manlaw AI', price: 0, commission: 0, tag: 'Starter+', desc: 'AI business coach powered by Z2B methodology. 3 chats/session on Starter. Unlimited from Bronze.', url: '/ai-coach' },
      { id: 'workshop', name: 'Entrepreneurial Consumer Workshop', price: 0, commission: 0, tag: 'Starter+', desc: 'All 99 Workshop Sessions unlocked with Starter Pack and above.', url: '/workshop' },
      { id: 'benown', name: 'BeNown — Social Media Automation', price: 0, commission: 0, tag: 'Bronze+', desc: 'Post to Instagram, TikTok, Facebook, X, LinkedIn, YouTube Shorts. Mood selector, advanced targeting, real-time analytics.', url: '/benown' },
      { id: 'caption-pro', name: 'CaptionPro', price: 0, commission: 0, tag: 'Bronze+', desc: 'AI video captions in 50+ languages. Translation in 130+ languages including African languages.', url: '/caption-pro' },
      { id: 'content-studio', name: 'Content Studio+', price: 0, commission: 0, tag: 'Silver+', desc: 'Full AI content creation — text, images, captions and video scripts for all your social media platforms.', url: '/content-studio' },
      { id: 'groundbreaker', name: 'GroundBreaker Dashboard', price: 0, commission: 0, tag: 'Bronze+', desc: 'Your referral and prospecting dashboard. Track who you referred, their status and your earnings.', url: '/dashboard' },
      { id: 'tablebuilder', name: 'TableBuilder Dashboard', price: 0, commission: 0, tag: 'Copper+', desc: 'Team performance dashboard. Track your downline across multiple generations.', url: '/dashboard' },
      { id: 'vision-board', name: 'Vision Board', price: 0, commission: 0, tag: 'Bronze+', desc: 'Full vision board builder. Set your goals, milestones and life vision. Save and download.', url: '/vision-board' },
      { id: 'sales-funnel', name: 'My Sales Funnel', price: 0, commission: 0, tag: 'Bronze+', desc: 'View your sales funnel. Full access from Copper and above.', url: '/funnel' },
      { id: 'whatsapp-launcher', name: 'WhatsApp Launcher', price: 0, commission: 0, tag: 'Silver+', desc: 'Automated WhatsApp prospecting and follow-up sequences for your prospects.', url: '/whatsapp-launcher' },
      { id: 'nurture-engine', name: '9-Day Nurture Engine', price: 0, commission: 0, tag: 'Copper+', desc: 'Automated 9-day email and message follow-up sequence for new prospects.', url: '/nurture' },
      { id: 'content-calendar', name: 'Content Calendar', price: 0, commission: 0, tag: 'Silver+', desc: 'Plan and schedule your content across all platforms. 30-day view with AI suggestions.', url: '/content-calendar' },
      { id: 'prospect-notifications', name: 'Prospect Notifications', price: 0, commission: 0, tag: 'Silver+', desc: 'Real-time notifications when prospects engage with your content or referral links.', url: '/notifications' },
    ]
  },
  {
    category: 'Digital Services',
    icon: '🛠️',
    items: [
      { id: 'book-eco-service', name: 'Book Ecosystem Service', price: 7500, commission: 20, tag: 'From R7,500', desc: 'I turn Authors into Brands — complete digital book ecosystem. Flipbook, PDF, Audio Reader, AI Coach, Monetisation System and more.', url: '/marketplace/product/book-ecosystem' },
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

      {/* HEADER */}
      <div className="px-5 py-3 border-b border-[#5a4510]/30 flex items-center justify-between"
        style={{ background: '#080608' }}>
        <div>
          <div className="text-sm font-bold"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px', color: '#f0c040' }}>
            ZERO2BILLIONAIRES
          </div>
          <div className="text-[10px] tracking-widest text-[#5a4510]"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            LEGACY BUILDERS · PRODUCTS & SERVICES
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/marketplace"
            className="text-[10px] px-3 py-1.5 border border-[#5a4510]/40 text-[#5a4510] hover:text-[#c9a227] transition-all rounded-sm"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            MARKETPLACE
          </Link>
          <Link href="/dashboard"
            className="text-[10px] px-3 py-1.5 border border-[#5a4510]/40 text-[#5a4510] hover:text-[#c9a227] transition-all rounded-sm"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            DASHBOARD
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div className="px-6 py-8 text-center"
        style={{ background: 'linear-gradient(160deg,#080608 0%,#1a0d35 50%,#080608 100%)', borderBottom: '3px solid #c9a227' }}>
        <div className="text-[11px] tracking-[5px] text-[#5a4510] mb-3 uppercase"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
          Legacy Builders · Earn by Sharing
        </div>
        <h1 className="text-3xl text-white mb-1"
          style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
          Our Products & Services
        </h1>
        <p className="text-[#e8d48b] text-sm italic max-w-md mx-auto mb-5"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Copy your referral link for any product. Share it. Earn 10–20% commission on every sale.
        </p>

        {myCode ? (
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-sm"
            style={{ background: 'rgba(45,27,105,0.3)', border: '1px solid rgba(201,162,39,0.3)' }}>
            <span className="text-[10px] tracking-[3px] text-[#5a4510]"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}>YOUR CODE</span>
            <span className="text-[#f0c040] font-bold"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>{myCode}</span>
          </div>
        ) : (
          <div className="flex gap-3 justify-center">
            <Link href="/marketplace/join"
              className="px-6 py-2.5 rounded-sm text-xs font-bold tracking-widest"
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px', background: 'linear-gradient(135deg,#c9a227,#f0c040)', color: '#080608' }}>
              JOIN FREE AS AFFILIATE TO GET YOUR LINK
            </Link>
          </div>
        )}
      </div>

      {/* CATEGORY TABS */}
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

      {/* PRODUCTS */}
      <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        {filtered.map(group => (
          <div key={group.category}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-lg">{group.icon}</span>
              <div className="text-[10px] tracking-[3px] text-[#5a4510]"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                {group.category.toUpperCase()}
              </div>
              <div className="flex-1 h-px"
                style={{ background: 'linear-gradient(90deg,rgba(201,162,39,0.2),transparent)' }} />
            </div>

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
                            fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px',
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

                    {myCode && product.commission > 0 ? (
                      <button onClick={() => copyLink(product.id, product.url)}
                        className="flex-shrink-0 px-3 py-2 rounded-sm text-[10px] font-bold tracking-widest transition-all"
                        style={{
                          fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px',
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
                        MEMBERS ONLY
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
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
