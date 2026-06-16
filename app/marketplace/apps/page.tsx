'use client'

// ============================================================
// app/marketplace/apps/page.tsx
// Amavulandlela Marketplace Listing
// One product. Three tiers. Member + Non-member pricing.
// Affiliate commission tracked via referral_code
// Zero2Billionaires Amavulandlela Pty Ltd
// ============================================================

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

type Tier  = 'fam'|'starter'|'bronze'|'copper'|'silver'|'gold'|'platinum'|null
type Plan  = 'solo'|'multi'|'white_label'

interface Profile {
  paid_tier: Tier
  full_name: string|null
  referral_code: string|null
}

const TIER_ORDER: Record<string,number> = {
  fam:0, starter:1, bronze:2, copper:3, silver:4, gold:5, platinum:6
}
const tierGte = (t: Tier, req: string) => t ? (TIER_ORDER[t]??0) >= (TIER_ORDER[req]??99) : false

const PLANS = [
  {
    plan: 'solo' as Plan,
    name: 'Pathfinder Solo',
    icon: '🌱',
    brands: '1 Brand',
    member_price: 199,
    pioneer_price: 499,
    features: [
      'AI caption generation for your brand',
      'Facebook, Instagram & TikTok captions',
      'All 6 content types',
      'Post Queue (saves to your account)',
      'Buffer scheduling guide',
      '7-day content calendar',
    ],
    best_for: 'Own business or 1 NWM company',
    color: '#22c55e',
  },
  {
    plan: 'multi' as Plan,
    name: 'Pathfinder Multi',
    icon: '🌿',
    brands: '10 Brands',
    member_price: 399,
    pioneer_price: 999,
    features: [
      'Everything in Solo',
      'Up to 10 brands / businesses',
      'Switch between brands instantly',
      'Separate caption queues per brand',
      'Ideal for NWM + own business',
      'Influencer multi-account support',
    ],
    best_for: 'Multiple income streams or businesses',
    color: '#D4AF37',
    popular: true,
  },
  {
    plan: 'white_label' as Plan,
    name: 'Pathfinder White Label',
    icon: '👑',
    brands: 'Unlimited Brands',
    member_price: 799,
    pioneer_price: 2500,
    features: [
      'Everything in Multi',
      'Unlimited brands',
      'Full white label — YOUR brand name',
      'Z2B branding completely removed',
      'Your logo & colour scheme',
      'Agency — manage client brands',
      'Resell to your own clients',
    ],
    best_for: 'Agencies, coaches, and power users',
    color: '#9b59b6',
  },
]

export default function MarketplaceAppsPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
  const referralCode = searchParams.get('ref') || ''

  const [profile, setProfile]             = useState<Profile|null>(null)
  const [loading, setLoading]             = useState(true)
  const [isMember, setIsMember]           = useState(false)
  const [selectedPlan, setSelectedPlan]   = useState<Plan|null>(null)
  const [initiating, setInitiating]       = useState(false)
  const [whiteLabelBrand, setWhiteLabelBrand] = useState('')
  const [guestEmail, setGuestEmail]       = useState('')
  const [showSuccess, setShowSuccess]     = useState(searchParams.get('ava') === 'success')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles').select('paid_tier,full_name,referral_code').eq('id', user.id).single()
        setProfile(data)
        setIsMember(!!data?.paid_tier && data.paid_tier !== 'fam')
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const initiateBilling = async (plan: Plan) => {
    setInitiating(true)

    const res = await fetch('/api/amavulandlela/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan,
        customer_type: isMember ? 'member' : 'non_member',
        referral_code: referralCode,
        white_label_brand: plan === 'white_label' ? whiteLabelBrand : undefined,
        email: guestEmail || undefined,
      }),
    })

    const data = await res.json()
    if (data.payfast_url && data.payment_data) {
      // Build and submit PayFast form
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.payfast_url
      Object.entries(data.payment_data as Record<string,string>).forEach(([k, v]) => {
        const input = document.createElement('input')
        input.type = 'hidden'; input.name = k; input.value = v
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
    } else {
      alert('Could not initiate payment. Please try again.')
    }
    setInitiating(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-[#D4AF37] animate-pulse font-bold">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">

      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a0d35] via-[#0d0520] to-[#0a0a1a] border-b border-[#9b59b6]/30 px-4 py-10 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9b59b6] to-[#8e44ad] flex items-center justify-center text-2xl mx-auto mb-4">🌍</div>
          <h1 className="text-2xl font-black text-white mb-2">Amavulandlela</h1>
          <p className="text-sm text-[#9b59b6] font-bold tracking-wider uppercase mb-4">Market Everything You Build</p>
          <p className="text-sm text-[#7a6a90] leading-relaxed max-w-lg mx-auto">
            AI-powered social media captions for your own business, NWM company, influencer brand, or ministry.
            Facebook, Instagram & TikTok — automated.
          </p>
          {referralCode && (
            <div className="mt-4 inline-block bg-[#9b59b6]/20 border border-[#9b59b6]/40 text-[#c084fc] text-xs font-bold px-4 py-2 rounded-full">
              🎁 Referred by a Z2B Pathfinder — you're in the right place
            </div>
          )}
        </div>
      </div>

      {/* Success banner */}
      {showSuccess && (
        <div className="bg-green-900/30 border-b border-green-500/40 px-4 py-4 text-center">
          <div className="text-sm font-bold text-green-400">✅ Payment successful! Your Amavulandlela subscription is now active.</div>
          <button onClick={() => router.push('/social-command')} className="mt-2 text-xs text-green-300 underline">Go to Social Command →</button>
        </div>
      )}

      {/* Pricing toggle */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {isMember && (
          <div className="bg-[#0d1628] border border-[#D4AF37]/30 rounded-xl p-4 text-center mb-6">
            <div className="text-xs font-bold text-[#D4AF37] mb-1">🏛️ Z2B Member Pricing Applied</div>
            <div className="text-xs text-[#7a9cc6]">You're seeing your exclusive Pathfinder rates — up to 68% below Pioneer pricing.</div>
          </div>
        )}

        {!isMember && (
          <div className="bg-[#111827] border border-[#1a3a6e] rounded-xl p-4 text-center mb-6">
            <div className="text-xs font-bold text-white mb-1">Not a Z2B member?</div>
            <div className="text-xs text-[#7a9cc6] mb-3">Z2B members get up to 68% off. <button onClick={() => router.push('/signup')} className="text-[#D4AF37] underline font-bold">Join free as a FAM →</button></div>
            <div className="text-xs text-[#4a5a7e]">FAM members also earn 20% commission on every Amavulandlela referral they make.</div>
          </div>
        )}

        {/* Plan cards */}
        <div className="space-y-4">
          {PLANS.map(p => {
            const price = isMember ? p.member_price : p.pioneer_price
            const isSelected = selectedPlan === p.plan
            return (
              <div key={p.plan}
                className={`rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-['+p.color+']' : 'border-[#1a3a6e]'} bg-[#111827]`}
                style={{ borderColor: isSelected ? p.color : '#1a3a6e' }}
                onClick={() => setSelectedPlan(isSelected ? null : p.plan)}>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{p.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">{p.name}</span>
                          {p.popular && <span className="text-xs font-bold px-2 py-0.5 rounded-full text-black" style={{ background: p.color }}>POPULAR</span>}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: p.color }}>{p.brands}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-black" style={{ color: p.color }}>R{price}</div>
                      <div className="text-xs text-[#4a5a7e]">/month</div>
                      {!isMember && (
                        <div className="text-xs text-[#4a5a7e] mt-0.5 line-through">R{p.pioneer_price}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-[#7a6a90] italic mb-4">Best for: {p.best_for}</div>

                  <div className="grid grid-cols-2 gap-2">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span style={{ color: p.color }} className="text-xs mt-0.5 flex-shrink-0">✓</span>
                        <span className="text-xs text-[#aaa] leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expanded — White label brand name input + checkout */}
                {isSelected && (
                  <div className="px-5 pb-5 border-t border-[#1a3a6e] pt-4 space-y-3">
                    {p.plan === 'white_label' && (
                      <div>
                        <div className="text-xs text-[#7a9cc6] font-bold mb-1.5">Your Brand Name (replaces all Z2B branding)</div>
                        <input value={whiteLabelBrand} onChange={e => setWhiteLabelBrand(e.target.value)}
                          placeholder="e.g. Thabo Marketing Solutions"
                          className="w-full bg-[#0d1628] border border-[#2a3a5e] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#3a4a6e] focus:outline-none focus:border-[#9b59b6] transition-colors" />
                      </div>
                    )}
                    {!isMember && (
                      <div>
                        <div className="text-xs text-[#7a9cc6] font-bold mb-1.5">Your Email Address</div>
                        <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                          placeholder="you@email.com"
                          type="email"
                          className="w-full bg-[#0d1628] border border-[#2a3a5e] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#3a4a6e] focus:outline-none focus:border-[#9b59b6] transition-colors" />
                      </div>
                    )}
                    <button
                      onClick={() => initiateBilling(p.plan)}
                      disabled={initiating || (p.plan === 'white_label' && !whiteLabelBrand.trim()) || (!isMember && !guestEmail.trim())}
                      className="w-full py-3.5 rounded-xl font-extrabold text-sm tracking-wide transition-all disabled:opacity-40 text-white"
                      style={{ background: initiating ? '#1a1a2e' : `linear-gradient(135deg, ${p.color}, ${p.color}cc)` }}>
                      {initiating ? 'Redirecting to PayFast...' : `Subscribe — R${price}/month via PayFast`}
                    </button>
                    <div className="text-center text-xs text-[#4a5a7e]">
                      3-day grace period if payment fails · Cancel anytime
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Commission / affiliate note */}
        <div className="mt-8 bg-[#0d1f0d] border border-green-900/40 rounded-xl p-5">
          <div className="text-sm font-bold text-green-400 mb-2">💰 Earn 20% Recurring Commission</div>
          <p className="text-xs text-[#7a9cc6] leading-relaxed mb-3">
            Share Amavulandlela with your network. Every subscription they take earns you 20% every month — for as long as they stay subscribed.
          </p>
          <p className="text-xs text-[#4a5a7e]">
            FAM members, Starter, Bronze+ — everyone can refer. Your referral link is in your Z2B dashboard.
          </p>
          {!profile?.referral_code && (
            <button onClick={() => router.push('/signup')}
              className="mt-3 text-xs font-bold text-green-400 border border-green-900/40 px-4 py-2 rounded-lg hover:bg-green-900/20 transition-colors">
              Get your free referral link →
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-[#1a2a4a] tracking-widest uppercase border-t border-[#0d1628]">
        Powered by Zero2Billionaires Amavulandlela Pty Ltd
      </div>
    </div>
  )
}
