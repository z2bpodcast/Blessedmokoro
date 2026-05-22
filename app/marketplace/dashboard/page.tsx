'use client'

// app/marketplace/dashboard/page.tsx
// Marketplace Member Dashboard
// Shows: wallet, affiliate links, products to promote, NWM opportunity

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Profile = {
  id: string
  full_name: string
  email: string
  referral_code: string
  paid_tier: string | null
  joined_via: string | null
}

type Commission = {
  id: string
  product_slug: string
  sale_amount: number
  commission_amt: number
  status: string
  created_at: string
}

type Click = {
  id: string
  product: string
  clicked_at: string
}

const PRODUCTS = [
  {
    slug: 'book-ecosystem',
    title: 'Book Ecosystem Services',
    category: 'Digital Services',
    price: 7500,
    commission: 20,
    description: 'Turn Authors into Brands — complete digital ecosystem for book authors.',
    icon: '📖',
  },
]

export default function MarketplaceDashboardPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [clicks, setClicks] = useState<Click[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'wallet' | 'products' | 'opportunity'>('wallet')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/marketplace/dashboard'); return }

      const { data: prof } = await supabase
        .from('profiles')
        .select('id, full_name, email, referral_code, paid_tier, joined_via')
        .eq('id', user.id)
        .single()

      if (prof) setProfile(prof)

      // Load commissions
      const { data: comms } = await supabase
        .from('marketplace_commissions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setCommissions(comms || [])

      // Load clicks
      const { data: clks } = await supabase
        .from('referral_clicks')
        .select('id, product, clicked_at')
        .eq('referrer_id', user.id)
        .order('clicked_at', { ascending: false })
        .limit(20)

      setClicks(clks || [])
      setLoading(false)
    }
    load()
  }, [])

  const copyLink = (slug: string) => {
    const link = `https://marketplace.z2blegacybuilders.co.za/${slug}?ref=${profile?.referral_code}`
    navigator.clipboard.writeText(link)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2500)
  }

  const totalEarned = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.commission_amt, 0)

  const pendingEarned = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.commission_amt, 0)

  const totalClicks = clicks.length
  const totalSales = commissions.length

  if (loading) return (
    <div className="min-h-screen bg-[#080608] flex items-center justify-center">
      <div className="text-2xl animate-pulse">⚡</div>
    </div>
  )

  const isFam = !profile?.paid_tier || profile?.paid_tier === 'fam'

  return (
    <div className="min-h-screen bg-[#080608] text-white">

      {/* ── TOP BAR ── */}
      <div className="px-5 py-3 border-b border-[#5a4510]/30 flex items-center justify-between"
        style={{ background: '#080608' }}>
        <div>
          <div className="text-sm font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px', color: '#f0c040' }}>
            ZERO2BILLIONAIRES
          </div>
          <div className="text-[10px] tracking-widest text-[#5a4510]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            MARKETPLACE · AFFILIATE DASHBOARD
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-white font-medium">{profile?.full_name}</div>
            <div className="text-[10px] text-[#5a4510] uppercase tracking-wide"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {isFam ? 'Free Affiliate' : profile?.paid_tier?.toUpperCase()}
            </div>
          </div>
          <Link href="/marketplace"
            className="text-[10px] px-3 py-1.5 border border-[#5a4510]/40 text-[#5a4510] hover:text-[#c9a227] hover:border-[#c9a227] transition-all rounded-sm"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            SHOP
          </Link>
        </div>
      </div>

      {/* ── REFERRAL CODE BANNER ── */}
      <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
        style={{ background: 'linear-gradient(90deg,#2d1b69,#1a0d35)', borderBottom: '1px solid rgba(201,162,39,0.2)' }}>
        <div>
          <div className="text-[10px] tracking-[3px] text-[#5a4510] mb-0.5" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            YOUR REFERRAL CODE — SAME CODE. EVERYWHERE.
          </div>
          <div className="text-xl text-[#f0c040]" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '4px' }}>
            {profile?.referral_code}
          </div>
        </div>
        <Link href="/my-earnings"
          className="text-[10px] px-4 py-2 border border-[#c9a227]/40 text-[#c9a227] rounded-sm transition-all hover:bg-[#c9a227]/10"
          style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
          FULL EARNINGS DASHBOARD →
        </Link>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-4 gap-px bg-[#5a4510]/20 border-b border-[#5a4510]/20">
        {[
          { label: 'TOTAL EARNED', value: `R${totalEarned.toLocaleString()}`, color: '#f0c040' },
          { label: 'PENDING', value: `R${pendingEarned.toLocaleString()}`, color: '#c9a227' },
          { label: 'LINK CLICKS', value: totalClicks, color: 'rgba(255,255,255,0.6)' },
          { label: 'SALES', value: totalSales, color: 'rgba(255,255,255,0.6)' },
        ].map((stat, i) => (
          <div key={i} className="py-4 text-center" style={{ background: '#0a0810' }}>
            <div className="text-xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif', color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[9px] tracking-widest text-[#5a4510]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="flex border-b border-[#5a4510]/20">
        {([
          { id: 'wallet', label: '💰 My Wallet', },
          { id: 'products', label: '🛍️ Products to Share' },
          { id: 'opportunity', label: '🚀 Earn More' },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 text-xs transition-all"
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              letterSpacing: '2px',
              borderBottom: activeTab === tab.id ? '2px solid #f0c040' : '2px solid transparent',
              color: activeTab === tab.id ? '#f0c040' : 'rgba(255,255,255,0.35)',
              background: activeTab === tab.id ? 'rgba(201,162,39,0.05)' : 'transparent',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-6 max-w-3xl mx-auto">

        {/* ── TAB: WALLET ── */}
        {activeTab === 'wallet' && (
          <div className="space-y-4">

            {/* Wallet card */}
            <div className="rounded-lg overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#2d1b69,#1a0d35)', border: '1px solid rgba(201,162,39,0.3)' }}>
              <div className="p-5 border-b border-[#c9a227]/20">
                <div className="text-[10px] tracking-[3px] text-[#5a4510] mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  AFFILIATE WALLET
                </div>
                <div className="text-4xl text-[#f0c040]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  R{totalEarned.toLocaleString()}
                </div>
                <div className="text-xs text-[rgba(255,255,255,0.4)] mt-1">
                  + R{pendingEarned.toLocaleString()} pending · 20% commission on every sale
                </div>
              </div>
              <div className="p-4 flex gap-3">
                <Link href="/my-earnings"
                  className="flex-1 py-2.5 text-center text-xs rounded-sm transition-all"
                  style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px', background: 'linear-gradient(135deg,#c9a227,#f0c040)', color: '#080608' }}>
                  VIEW FULL EARNINGS
                </Link>
              </div>
            </div>

            {/* Recent commissions */}
            <div>
              <div className="text-[10px] tracking-[3px] text-[#5a4510] mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                RECENT COMMISSIONS
              </div>
              {commissions.length === 0 ? (
                <div className="text-center py-10 text-[rgba(255,255,255,0.25)] text-sm italic">
                  No commissions yet — start sharing your links below
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {commissions.map(c => (
                    <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-sm"
                      style={{ background: '#0f0d18', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <div className="text-xs text-white font-medium">{c.product_slug}</div>
                        <div className="text-[10px] text-[rgba(255,255,255,0.35)]">
                          {new Date(c.created_at).toLocaleDateString('en-ZA')} · Sale: R{c.sale_amount.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#f0c040] font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                          +R{c.commission_amt}
                        </div>
                        <div className={`text-[9px] tracking-wide ${c.status === 'paid' ? 'text-green-400' : 'text-[#c9a227]'}`}
                          style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                          {c.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: PRODUCTS ── */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <p className="text-xs text-[rgba(255,255,255,0.4)] italic mb-2"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Pick any product below. Copy your personal link. Share it. Earn 20% on every sale.
            </p>

            {PRODUCTS.map(product => (
              <div key={product.slug} className="rounded-lg overflow-hidden"
                style={{ border: '1px solid rgba(201,162,39,0.25)', background: '#0f0d18' }}>

                {/* Product header */}
                <div className="px-5 py-4"
                  style={{ background: 'linear-gradient(135deg,#2d1b69,#1a0d35)', borderBottom: '1px solid rgba(201,162,39,0.2)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{product.icon}</span>
                    <div className="flex-1">
                      <div className="text-[9px] tracking-[3px] text-[#5a4510]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        {product.category}
                      </div>
                      <div className="text-sm text-white font-bold">{product.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg text-[#f0c040]" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        R{product.price.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-green-400" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        YOU EARN {product.commission}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product body */}
                <div className="px-5 py-4">
                  <p className="text-xs text-[rgba(255,255,255,0.5)] mb-4 leading-relaxed">{product.description}</p>

                  {/* Your affiliate link */}
                  <div className="px-3 py-2.5 rounded-sm mb-3 text-xs text-[rgba(255,255,255,0.4)] break-all"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    marketplace.z2blegacybuilders.co.za/{product.slug}?ref={profile?.referral_code}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => copyLink(product.slug)}
                      className="flex-1 py-2.5 rounded-sm text-xs font-bold tracking-widest transition-all"
                      style={{
                        fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px',
                        background: copied === product.slug ? 'linear-gradient(135deg,#1a7a30,#25a244)' : 'linear-gradient(135deg,#c9a227,#f0c040)',
                        color: '#080608',
                      }}>
                      {copied === product.slug ? '✓ COPIED' : 'COPY MY LINK'}
                    </button>
                    <Link href={`/marketplace/product/${product.slug}`}
                      className="px-4 py-2.5 rounded-sm text-xs tracking-widest border border-[#5a4510]/40 text-[#c9a227] hover:border-[#c9a227] transition-all"
                      style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      VIEW
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* More products coming */}
            <div className="text-center py-8 rounded-lg"
              style={{ border: '1px dashed rgba(201,162,39,0.15)', background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-xs text-[rgba(255,255,255,0.25)]">More products coming as Z2B builders list their digital products</div>
            </div>
          </div>
        )}

        {/* ── TAB: OPPORTUNITY (NWM) ── */}
        {activeTab === 'opportunity' && (
          <div className="space-y-5">

            {/* Upgrade from affiliate to full member */}
            {isFam && (
              <div className="rounded-lg overflow-hidden"
                style={{ border: '1px solid #f0c040', background: 'linear-gradient(135deg,#1a0d35,#080608)' }}>
                <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#c9a227,#f0c040,#c9a227)' }} />
                <div className="p-6">
                  <div className="text-[10px] tracking-[4px] text-[#5a4510] mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    YOU ARE A FREE AFFILIATE — EARN 20% ON MARKETPLACE SALES
                  </div>
                  <div className="text-2xl text-white mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                    Upgrade to a Full Z2B Member
                  </div>
                  <p className="text-sm text-[rgba(255,255,255,0.6)] italic leading-relaxed mb-5"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    As a Z2B member you do not just earn affiliate commissions. You build a network, earn from your team's sales,
                    access the full 4M Machine, and qualify for all 4 Income Rivers and 9 compensation streams.
                  </p>

                  {/* Income comparison */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-4 rounded-sm text-center"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="text-[9px] tracking-widest text-[rgba(255,255,255,0.3)] mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        FREE AFFILIATE
                      </div>
                      <div className="text-xl text-[rgba(255,255,255,0.5)] mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        20% MKT
                      </div>
                      <div className="text-[10px] text-[rgba(255,255,255,0.3)]">10% Legacy Builders</div>
                      <div className="text-[10px] text-[rgba(255,255,255,0.3)]">No 4M Machine access</div>
                      <div className="text-[10px] text-[rgba(255,255,255,0.3)]">No PWA Apps built</div>
                    </div>
                    <div className="p-4 rounded-sm text-center"
                      style={{ background: 'rgba(45,27,105,0.25)', border: '1px solid #c9a227' }}>
                      <div className="text-[9px] tracking-widest text-[#f0c040] mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        Z2B MEMBER
                      </div>
                      <div className="text-xl text-[#f0c040] mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        9 STREAMS
                      </div>
                      <div className="text-[10px] text-[rgba(255,255,255,0.6)]">4M Machine FULL</div>
                      <div className="text-[10px] text-[rgba(255,255,255,0.6)]">PWA Apps Built for You</div>
                      <div className="text-[10px] text-[rgba(255,255,255,0.6)]">R200/referral + Pools</div>
                    </div>
                  </div>

                  <Link href="https://app.z2blegacybuilders.co.za/pricing"
                    className="block w-full py-3.5 text-center rounded-sm font-bold tracking-widest text-sm"
                    style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '4px', background: 'linear-gradient(135deg,#c9a227,#f0c040)', color: '#080608' }}>
                    🚀 VIEW ALL PACKAGES — FROM R700
                  </Link>
                </div>
              </div>
            )}

            {/* NWM Opportunity explainer */}
            <div className="rounded-lg p-5"
              style={{ background: '#0f0d18', border: '1px solid rgba(201,162,39,0.15)' }}>
              <div className="text-[10px] tracking-[3px] text-[#5a4510] mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                HOW THE Z2B NETWORK WORKS
              </div>
              <div className="space-y-4">
                {[
                  {
                    step: '01', title: 'Starter Pack — R700 once-off',
                    desc: 'Unlocks 4M Manual Power FULL (7 features), Coach Manlaw AI unlimited, all 99 Workshop Sessions, 5 Digital Products, 1 PWA App built for you. R850/month BFM after 60 days.'
                  },
                  {
                    step: '02', title: 'Bronze — R2,500 · Copper — R5,000',
                    desc: 'Bronze: AI Offer Generator, Customer Finder, Post Generator, Reply System, Closing Assistant, Daily R300/Day Engine + R200/referral income. Copper adds 10 Bonus Products, 2 PWA Apps, Full Sales Funnel.'
                  },
                  {
                    step: '03', title: 'Silver — R12,000 · Gold — R24,000',
                    desc: 'Silver: Automatic Power — Product Multiplication Engine, 1-Click Launch Pack, AI automation. Gold: Electric Power FULL — AI Video Avatar, daily automated sequences, 5 PWA Apps, 1-on-1 Coaching, Gold Pool Profit Sharing.'
                  },
                  {
                    step: '04', title: 'Platinum — R50,000',
                    desc: 'The ultimate tier. Electric Power MAX, 7 PWA Apps built, Distribution License, CEO Mastermind Access, Platinum Pool Profit Sharing, 3 months 1-on-1 Coaching, Weekend Bootcamp.'
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-2xl text-[#2d1b69] font-black flex-shrink-0 w-8"
                      style={{ fontFamily: 'Bebas Neue, sans-serif' }}>{item.step}</div>
                    <div>
                      <div className="text-xs text-[#f0c040] font-bold mb-1">{item.title}</div>
                      <div className="text-xs text-[rgba(255,255,255,0.5)] leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.05]">
                <Link href="https://app.z2blegacybuilders.co.za/pricing"
                  className="block w-full py-3 text-center rounded-sm text-xs font-bold tracking-widest border border-[#c9a227]/40 text-[#c9a227] hover:bg-[#c9a227]/10 transition-all"
                  style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
                  SEE ALL MEMBERSHIP PLANS & EARNINGS →
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
